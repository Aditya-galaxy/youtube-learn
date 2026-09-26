import { ThinkingLevel, type Content } from "@google/genai";
import { z } from "zod/v4";
import {
  GenerationError,
  getGeminiClient,
  GENERATION_BACKEND,
  GENERATION_MODEL,
  MAX_OUTPUT_TOKENS,
} from "./client";

export interface UsageTotals {
  inputTokens: number;
  outputTokens: number;
  /** Gemini caches implicitly; this is what it reported as served from cache. */
  cacheReadInputTokens: number;
  thoughtTokens: number;
}

export interface ParseResult<T> {
  data: T;
  usage: UsageTotals;
  attempts: number;
}

/**
 * A semantic check the schema cannot express — a prerequisite cycle, an index
 * outside the candidate pool. Returning violations triggers one repair round.
 */
export type SemanticCheck<T> = (value: T) => string[];

const EMPTY_USAGE: UsageTotals = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadInputTokens: 0,
  thoughtTokens: 0,
};

const DECODING_CONSTRAINTS = [
  "pattern",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "format",
] as const;

/**
 * The schema the MODEL sees: shape, types and required fields only.
 *
 * Gemini compiles responseJsonSchema into constrained decoding, and the full
 * schema — slug regexes, length bounds, nested array limits — exceeds what it
 * will serve ("too many states"). So bounds are stripped here and folded into
 * each field's description as a hint, while the full zod schema still
 * validates every response server-side and feeds violations into the repair
 * turn. The model gets guidance; zod keeps the guarantees.
 */
function toModelSchema(schema: z.ZodType): Record<string, unknown> {
  const full = z.toJSONSchema(schema, {
    target: "draft-7",
    io: "input",
  }) as Record<string, unknown>;
  return relax(full) as Record<string, unknown>;
}

function relax(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(relax);
  if (!node || typeof node !== "object") return node;

  const obj = node as Record<string, unknown>;
  const hints: string[] = [];
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === "$schema") continue;
    if ((DECODING_CONSTRAINTS as readonly string[]).includes(key)) {
      if (key === "pattern") hints.push("kebab-case");
      else if (key === "minItems") hints.push(`at least ${value} items`);
      else if (key === "maxItems") hints.push(`at most ${value} items`);
      else if (key === "minLength") hints.push(`at least ${value} characters`);
      else if (key === "maxLength") hints.push(`at most ${value} characters`);
      else if (key === "minimum") hints.push(`minimum ${value}`);
      else if (key === "maximum") hints.push(`maximum ${value}`);
      continue;
    }
    out[key] = relax(value);
  }

  if (hints.length > 0) {
    const base =
      typeof out.description === "string" ? `${out.description} ` : "";
    out.description = `${base}(${hints.join(", ")})`;
  }
  return out;
}

function readUsage(
  total: UsageTotals,
  usage: Record<string, number | undefined> | undefined
): UsageTotals {
  return {
    inputTokens: total.inputTokens + (usage?.promptTokenCount ?? 0),
    outputTokens: total.outputTokens + (usage?.candidatesTokenCount ?? 0),
    cacheReadInputTokens:
      total.cacheReadInputTokens + (usage?.cachedContentTokenCount ?? 0),
    thoughtTokens: total.thoughtTokens + (usage?.thoughtsTokenCount ?? 0),
  };
}

/**
 * Gemini 3 models take a thinkingLevel; Gemini 2.x models reject it and take a
 * token budget instead (-1 = let the model decide). Sending the wrong one is a
 * hard 400, not a no-op.
 */
function thinkingConfigFor(model: string, level: ThinkingLevel) {
  return /^gemini-2\./.test(model)
    ? { thinkingBudget: -1 }
    : { thinkingLevel: level };
}

/**
 * The SDK throws with the raw upstream JSON as the message. Turn the cases a
 * caller can act on into sentences, and never let the raw body reach a client.
 */
function toGenerationError(error: unknown, stage: string): GenerationError {
  const raw = error instanceof Error ? error.message : String(error);
  const code = Number(raw.match(/"code":\s*(\d+)/)?.[1] ?? 0);

  if (code === 402) {
    return new GenerationError(
      `Gemini billing is exhausted for this project. Top up prepayment credits at https://ai.studio/projects, then retry.`,
      stage
    );
  }
  if (code === 404) {
    return new GenerationError(
      `Model "${GENERATION_MODEL}" is not available to this API key. Set GEMINI_MODEL to one the key can reach (GET /v1beta/models lists them).`,
      stage
    );
  }
  if (code === 429) {
    return new GenerationError(
      "Gemini is rate limiting this project. Retrying shortly.",
      stage,
      [],
      true
    );
  }
  // 500/503/504 are the backend being busy or slow, not the request being
  // wrong, so they are worth another attempt too.
  if (code === 500 || code === 503 || code === 504) {
    return new GenerationError(
      "The model backend is unavailable. Retrying shortly.",
      stage,
      [],
      true
    );
  }
  if (code === 401 || code === 403) {
    return new GenerationError(
      GENERATION_BACKEND === "vertex"
        ? "Vertex AI rejected the credentials. Run `gcloud auth application-default login` locally, or give the production service account roles/aiplatform.user."
        : "Gemini rejected the API key. Check it allows generativelanguage.googleapis.com.",
      stage
    );
  }

  console.error(`[ai] unexpected ${stage} failure:`, raw.slice(0, 400));
  return new GenerationError("The model request failed.", stage);
}

/** Backoff attempts for a rate limit or a busy backend, before giving up. */
const MAX_TRANSIENT_RETRIES = 3;

/**
 * Calls the model for structured output, and on a schema or semantic failure
 * retries exactly once with the specific violations quoted back.
 *
 * One repair, not a loop: if the model cannot satisfy a stated constraint on
 * the second try it is usually the constraint or the input that is wrong, and
 * further attempts just spend money.
 */
export async function parseWithRepair<T>(options: {
  stage: string;
  schema: z.ZodType<T>;
  system: string;
  userMessage: string;
  semanticCheck?: SemanticCheck<T>;
  thinkingLevel?: ThinkingLevel;
  maxOutputTokens?: number;
}): Promise<ParseResult<T>> {
  const {
    stage,
    schema,
    system,
    userMessage,
    semanticCheck,
    thinkingLevel = ThinkingLevel.HIGH,
    maxOutputTokens = MAX_OUTPUT_TOKENS,
  } = options;

  const ai = getGeminiClient();
  const responseJsonSchema = toModelSchema(schema);
  const contents: Content[] = [
    { role: "user", parts: [{ text: userMessage }] },
  ];

  let usage = EMPTY_USAGE;
  let lastViolations: string[] = [];
  let transientRetries = 0;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let response;
    try {
      response = await ai.models.generateContent({
        model: GENERATION_MODEL,
        contents,
        config: {
          // Static across every request, so Gemini's implicit cache can hit it.
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema,
          thinkingConfig: thinkingConfigFor(GENERATION_MODEL, thinkingLevel),
          maxOutputTokens,
        },
      });
    } catch (error) {
      const failure = toGenerationError(error, stage);
      // A rate limit usually clears in seconds, so absorb it here rather than
      // bouncing the whole step back to the job engine.
      if (failure.retryable && transientRetries < MAX_TRANSIENT_RETRIES) {
        transientRetries += 1;
        const waitMs = 2_000 * 2 ** (transientRetries - 1);
        console.warn(
          `[ai] ${stage}: ${failure.message} attempt ${transientRetries}/${MAX_TRANSIENT_RETRIES} in ${waitMs}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        attempt -= 1; // this attempt never reached the model
        continue;
      }
      throw failure;
    }

    usage = readUsage(
      usage,
      response.usageMetadata as Record<string, number | undefined> | undefined
    );

    const text = response.text;
    let candidate: unknown = null;
    let parseFailure: string | null = null;

    if (!text) {
      parseFailure =
        response.candidates?.[0]?.finishReason === "MAX_TOKENS"
          ? "The response was cut off before it was complete. Produce a smaller result."
          : "The model returned no content.";
    } else {
      try {
        candidate = JSON.parse(text);
      } catch {
        parseFailure = "The response was not valid JSON.";
      }
    }

    if (parseFailure === null) {
      const result = schema.safeParse(candidate);
      if (!result.success) {
        lastViolations = result.error.issues
          .slice(0, 6)
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
      } else {
        const violations = semanticCheck ? semanticCheck(result.data) : [];
        if (violations.length === 0) {
          return { data: result.data, usage, attempts: attempt };
        }
        lastViolations = violations;
      }
    } else {
      lastViolations = [parseFailure];
    }

    if (attempt === 2) break;

    // Repair turn: echo what came back, then state exactly what was wrong.
    contents.push(
      { role: "model", parts: [{ text: text ?? "" }] },
      {
        role: "user",
        parts: [
          {
            text: [
              "That response was not usable. Fix these problems and return the whole object again:",
              ...lastViolations.map((v) => `- ${v}`),
            ].join("\n"),
          },
        ],
      }
    );
  }

  console.error(
    `[ai] ${stage}: output still invalid after repair:`,
    lastViolations
  );
  throw new GenerationError(
    "Model output failed validation after a repair attempt.",
    stage,
    lastViolations
  );
}

import { ThinkingLevel, type Content } from "@google/genai";
import { z } from "zod/v4";
import {
  GenerationError,
  getGeminiClient,
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

/**
 * zod v4 emits JSON Schema natively, so no SDK-specific helper is needed.
 * `io: "input"` keeps defaults out of the required list, and unrepresentable
 * constructs fail loudly here rather than confusing the model at call time.
 */
function toJsonSchema(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, {
    target: "draft-7",
    io: "input",
  }) as Record<string, unknown>;
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
      "Gemini rate limit reached. Retry shortly.",
      stage
    );
  }
  if (code === 403) {
    return new GenerationError(
      "Gemini rejected the API key. Check it is unrestricted or allows generativelanguage.googleapis.com.",
      stage
    );
  }

  console.error(`[ai] unexpected ${stage} failure:`, raw.slice(0, 400));
  return new GenerationError("The model request failed.", stage);
}

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
  const responseJsonSchema = toJsonSchema(schema);
  const contents: Content[] = [
    { role: "user", parts: [{ text: userMessage }] },
  ];

  let usage = EMPTY_USAGE;
  let lastViolations: string[] = [];

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
          thinkingConfig: { thinkingLevel },
          maxOutputTokens,
        },
      });
    } catch (error) {
      throw toGenerationError(error, stage);
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

  throw new GenerationError(
    "Model output failed validation after a repair attempt.",
    stage,
    lastViolations
  );
}

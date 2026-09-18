import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod/v4";
import {
  GenerationError,
  getAnthropicClient,
  GENERATION_MODEL,
  MAX_TOKENS,
} from "./client";

export interface UsageTotals {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
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
  cacheCreationInputTokens: 0,
};

function addUsage(total: UsageTotals, usage: Anthropic.Usage): UsageTotals {
  return {
    inputTokens: total.inputTokens + (usage.input_tokens ?? 0),
    outputTokens: total.outputTokens + (usage.output_tokens ?? 0),
    cacheReadInputTokens:
      total.cacheReadInputTokens + (usage.cache_read_input_tokens ?? 0),
    cacheCreationInputTokens:
      total.cacheCreationInputTokens + (usage.cache_creation_input_tokens ?? 0),
  };
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
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  maxTokens?: number;
}): Promise<ParseResult<T>> {
  const {
    stage,
    schema,
    system,
    userMessage,
    semanticCheck,
    effort = "high",
    maxTokens = MAX_TOKENS,
  } = options;

  const client = getAnthropicClient();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  let usage = EMPTY_USAGE;
  let lastViolations: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await client.messages.parse({
      model: GENERATION_MODEL,
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      output_config: {
        effort,
        format: zodOutputFormat(schema as never),
      },
      // Static prefix first so it caches; everything per-request is in messages.
      system: [
        { type: "text", text: system, cache_control: { type: "ephemeral" } },
      ],
      messages,
    });

    usage = addUsage(usage, response.usage);

    if (response.stop_reason === "refusal") {
      throw new GenerationError("The model declined this request.", stage, [
        response.stop_details?.explanation ?? "refusal",
      ]);
    }

    const parsed = response.parsed_output as T | null;

    if (parsed === null || parsed === undefined) {
      lastViolations = [
        response.stop_reason === "max_tokens"
          ? "The response was cut off before it was complete. Produce a smaller syllabus."
          : "The response did not match the required schema.",
      ];
    } else {
      const violations = semanticCheck ? semanticCheck(parsed) : [];
      if (violations.length === 0) {
        return { data: parsed, usage, attempts: attempt };
      }
      lastViolations = violations;
    }

    if (attempt === 2) break;

    // Repair turn: echo what came back, then state exactly what was wrong.
    messages.push(
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: [
          "That response was not usable. Fix these problems and return the whole object again:",
          ...lastViolations.map((v) => `- ${v}`),
        ].join("\n"),
      }
    );
  }

  throw new GenerationError(
    `Model output failed validation after a repair attempt.`,
    stage,
    lastViolations
  );
}

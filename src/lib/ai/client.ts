import Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic client for curriculum generation.
 *
 * NOT guarded with the `server-only` package on purpose: this module is also
 * imported by scripts/generate-syllabus.ts, which runs under tsx outside Next,
 * and by a Pages Router API route — `server-only` throws in both. The real
 * protection is that ANTHROPIC_API_KEY has no NEXT_PUBLIC_ prefix, so Next
 * never inlines it into a client bundle.
 */

export const GENERATION_MODEL = "claude-opus-5";

/** Non-streaming ceiling that keeps responses inside the SDK's HTTP timeout. */
export const MAX_TOKENS = 16_000;

export class GenerationError extends Error {
  constructor(
    message: string,
    readonly stage: string,
    readonly violations: string[] = []
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

// Surface misconfiguration as one readable line, matching src/lib/auth.ts.
// Throwing at module scope would turn a missing key into an unexplained
// `next build` failure, since the build evaluates this module.
if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "[ai] ANTHROPIC_API_KEY is not set. Course generation will fail until it is. See .env.example."
  );
}

let client: Anthropic | null = null;

/** Lazily constructed so a missing key fails at call time, not import time. */
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new GenerationError(
      "ANTHROPIC_API_KEY is not configured on the server",
      "config"
    );
  }
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

import { GoogleGenAI } from "@google/genai";

/**
 * Gemini client for curriculum generation.
 *
 * NOT guarded with the `server-only` package on purpose: this module is also
 * imported by scripts under tsx and by a Pages Router API route, and that
 * package throws in both. The real protection is that GEMINI_API_KEY has no
 * NEXT_PUBLIC_ prefix, so Next never inlines it into a client bundle.
 */

/**
 * Overridable because Gemini ships new model ids often — the installed SDK
 * listed several generations newer than this code was written against. Check
 * `GET /v1beta/models` for what a given key can actually reach.
 */
export const GENERATION_MODEL = process.env.GEMINI_MODEL ?? "gemini-pro-latest";

export const MAX_OUTPUT_TOKENS = 16_000;

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
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "[ai] GEMINI_API_KEY is not set. Course generation will fail until it is. See .env.example."
  );
}

let client: GoogleGenAI | null = null;

/** Lazily constructed so a missing key fails at call time, not import time. */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GenerationError(
      "GEMINI_API_KEY is not configured on the server",
      "config"
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

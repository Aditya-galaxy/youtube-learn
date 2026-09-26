import { GoogleGenAI } from "@google/genai";

/**
 * Gemini client for curriculum generation, via either backend:
 *
 * - Vertex AI (GOOGLE_GENAI_USE_VERTEXAI=true): billed to the GCP project and
 *   authenticated with Application Default Credentials — `gcloud auth
 *   application-default login` locally, a service account in production. No
 *   API key: Vertex rejects unbound keys, and binding one to a service account
 *   can be blocked by org policy (it is on kronagent).
 * - Gemini Developer API (GEMINI_API_KEY): AI Studio keys, billed by AI Studio
 *   prepayment — which stops dead at 402 once credits run out.
 *
 * Env names are the SDK's own conventions, so the same config works with
 * anything else built on @google/genai.
 *
 * NOT guarded with the `server-only` package on purpose: scripts under tsx and
 * a Pages Router API route import this, and that package throws in both. None
 * of these variables has a NEXT_PUBLIC_ prefix, so Next never inlines them.
 */

const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";

export const GENERATION_BACKEND = useVertex ? "vertex" : "gemini-api";

/**
 * Defaults differ by backend because the catalogues differ: gemini-2.5-pro is
 * GA on Vertex but closed to new AI Studio users, and the *-latest aliases are
 * AI Studio only. Override with GEMINI_MODEL.
 */
export const GENERATION_MODEL =
  process.env.GEMINI_MODEL ||
  (useVertex ? "gemini-2.5-pro" : "gemini-pro-latest");

/**
 * Tutor dialogue runs on Flash, not Pro. A tutoring turn is short, frequent
 * and latency-sensitive — the opposite of curriculum generation — and Pro cost
 * roughly ten times as much per turn on the chattiest surface in the app.
 */
export const TUTOR_MODEL =
  process.env.TUTOR_MODEL ||
  (useVertex ? "gemini-2.5-flash" : "gemini-flash-latest");

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

function configProblem(): string | null {
  if (useVertex) {
    return process.env.GOOGLE_CLOUD_PROJECT
      ? null
      : "GOOGLE_GENAI_USE_VERTEXAI is set but GOOGLE_CLOUD_PROJECT is not.";
  }
  return process.env.GEMINI_API_KEY
    ? null
    : "Neither GEMINI_API_KEY nor GOOGLE_GENAI_USE_VERTEXAI is configured.";
}

// One readable line at startup, matching src/lib/auth.ts. Throwing at module
// scope would turn a missing variable into an unexplained `next build` failure.
const startupProblem = configProblem();
if (startupProblem) {
  console.error(
    `[ai] ${startupProblem} Course generation will fail until it is. See .env.example.`
  );
}

let client: GoogleGenAI | null = null;

/** Lazily constructed so misconfiguration fails at call time, not import time. */
export function getGeminiClient(): GoogleGenAI {
  const problem = configProblem();
  if (problem) throw new GenerationError(problem, "config");

  if (!client) {
    client = useVertex
      ? new GoogleGenAI({
          vertexai: true,
          project: process.env.GOOGLE_CLOUD_PROJECT,
          location: process.env.GOOGLE_CLOUD_LOCATION || "global",
        })
      : new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

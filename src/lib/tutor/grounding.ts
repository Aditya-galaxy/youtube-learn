import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getGeminiClient, TUTOR_MODEL } from "@/lib/ai/client";

/**
 * Grounding: one pass in which the model actually watches a lesson's video and
 * reports its structure, stored so every learner shares it.
 *
 * Without this the tutor teaches from a title and a one-line summary, which is
 * why it had to be forbidden from naming timestamps: anything it said about
 * the lecture's contents was invention. With it, the tutor can say what this
 * lecture covers and offer to jump to a section the model genuinely saw.
 *
 * Timestamps stay approximate on purpose. Asked twice, the model placed the
 * same explanation at 11:54 and at 15:32 — close enough to send someone to the
 * right part of a lecture, not close enough to quote as "at 11:54 he says X".
 * Section starts are offered as jumps; exact claims are not made.
 */

const GroundingSchema = z.object({
  sections: z
    .array(
      z.object({
        startSeconds: z.number().int().min(0),
        title: z.string().min(1).max(120),
        summary: z.string().min(1).max(400),
      })
    )
    .min(1)
    .max(60),
  keyConcepts: z
    .array(
      z.object({
        term: z.string().min(1).max(80),
        definition: z.string().min(1).max(400),
      })
    )
    .max(60),
});

export interface LessonGroundingData {
  sections: { startSeconds: number; title: string; summary: string }[];
  keyConcepts: { term: string; definition: string }[];
}

const PROMPT = `You are preparing teaching material by watching a recorded lecture.

Return JSON only:
{
  "sections": [{"startSeconds": <integer seconds from the START of the video>, "title": "...", "summary": "one or two sentences on what is taught here"}],
  "keyConcepts": [{"term": "...", "definition": "one sentence, as this lecture explains it"}]
}

Rules:
- Cover the whole lecture in order, 5 to 15 sections. The first section starts at 0.
- startSeconds is measured from the beginning of the video, not from any clip.
- Describe only what is actually taught in this recording. Do not add material from your own knowledge.
- Key concepts are the terms a learner must understand to follow this lecture.`;

/** Runs the video pass. Throws if the model or the response is unusable. */
export async function buildLessonGrounding(lesson: {
  id: string;
  videoId: string;
  durationSec: number;
}): Promise<{ data: LessonGroundingData; promptTokens: number }> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: TUTOR_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: `https://www.youtube.com/watch?v=${lesson.videoId}`,
              mimeType: "video/*",
            },
            // Low frame rate: the teaching structure comes from the audio, and
            // frames are only needed to catch slides and board work.
            videoMetadata: { fps: 0.1 },
          },
          { text: PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      // Without a declared schema the same prompt returned an object one run
      // and a bare array the next; constrained decoding removes that drift.
      responseJsonSchema: {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                startSeconds: { type: "integer" },
                title: { type: "string" },
                summary: { type: "string" },
              },
              required: ["startSeconds", "title", "summary"],
            },
          },
          keyConcepts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                term: { type: "string" },
                definition: { type: "string" },
              },
              required: ["term", "definition"],
            },
          },
        },
        required: ["sections", "keyConcepts"],
      },
    },
  });

  const parsed = GroundingSchema.parse(
    JSON.parse(response.text?.trim() || "{}")
  );

  // The model occasionally returns times past the end, or out of order. Drop
  // what cannot be true rather than storing a jump that lands nowhere.
  const limit = lesson.durationSec > 0 ? lesson.durationSec : Infinity;
  const sections = parsed.sections
    .filter((s) => s.startSeconds < limit)
    .sort((a, b) => a.startSeconds - b.startSeconds)
    .filter(
      (s, i, all) => i === 0 || s.startSeconds > all[i - 1].startSeconds + 5
    );

  if (sections.length === 0) throw new Error("No usable sections");

  return {
    // Capped rather than rejected: an over-long answer is still a good one,
    // and failing the whole pass over its length wastes the video call.
    data: {
      sections: sections.slice(0, 20),
      keyConcepts: parsed.keyConcepts.slice(0, 15),
    },
    promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
  };
}

export async function readGrounding(
  lessonId: string
): Promise<LessonGroundingData | null> {
  const row = await prisma.lessonGrounding.findUnique({ where: { lessonId } });
  if (!row) return null;
  return {
    sections: row.sections as LessonGroundingData["sections"],
    keyConcepts: row.keyConcepts as LessonGroundingData["keyConcepts"],
  };
}

/**
 * Builds and stores grounding for a lesson unless it already exists.
 *
 * Two learners opening the same lesson at once would otherwise each pay for a
 * video pass; the upsert makes the loser of that race harmless.
 */
export async function ensureGrounding(
  lessonId: string
): Promise<LessonGroundingData | null> {
  const existing = await readGrounding(lessonId);
  if (existing) return existing;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, videoId: true, durationSec: true },
  });
  if (!lesson?.videoId) return null;

  const { data, promptTokens } = await buildLessonGrounding(lesson);

  await prisma.lessonGrounding.upsert({
    where: { lessonId },
    create: {
      lessonId,
      videoId: lesson.videoId,
      model: TUTOR_MODEL,
      sections: data.sections,
      keyConcepts: data.keyConcepts,
      promptTokens,
    },
    update: {},
  });

  return data;
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** How the grounding is shown to the tutor in its prompt. */
export function describeGrounding(g: LessonGroundingData): string {
  return [
    "WHAT THIS LECTURE ACTUALLY COVERS (from watching the recording; times are approximate):",
    ...g.sections.map(
      (s) => `- ${mmss(s.startSeconds)} ${s.title}: ${s.summary}`
    ),
    g.keyConcepts.length > 0 &&
      `Concepts taught here: ${g.keyConcepts.map((c) => `${c.term} — ${c.definition}`).join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

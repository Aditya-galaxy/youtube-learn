import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getGeminiClient, TUTOR_MODEL } from "@/lib/ai/client";
import { parseChaptersFromDescription } from "@/lib/youtube/chapterParser";
import { hasSearchQuota, recordYouTubeUnits } from "@/lib/youtube/quota";

/**
 * Grounding: one pass in which the model actually watches a video and reports
 * its structure, stored so every learner shares it.
 *
 * Without this the tutor teaches from a title and a one-line summary, which is
 * why it had to be forbidden from naming timestamps: anything it said about
 * the lecture's contents was invention.
 *
 * Stored per video rather than per lesson. A generated course slices one long
 * lecture into many lessons, and one pass serves them all; each lesson reads
 * back only the sections inside its own segment.
 *
 * Timestamps stay approximate on purpose. Spot-checking the CS50 memory
 * lecture, "Memory Addresses and Pointers" at 23:44 was right, while the
 * 50:42 boundary was still on pointers and array indexing. Good enough to send
 * someone to the right part of a lecture; not good enough to quote.
 */

/**
 * Shape and types only.
 *
 * Size limits are applied by trimming below, never by rejecting: a pass costs
 * a video call, and throwing away a good outline because one summary ran long
 * or it listed 61 concepts wastes it. Twice during development a perfectly
 * usable answer was discarded for exactly that.
 */
const GroundingSchema = z.object({
  sections: z
    .array(
      z.object({
        startSeconds: z.number().int().min(0),
        title: z.string().min(1),
        summary: z.string().min(1),
      })
    )
    .min(1),
  keyConcepts: z.array(
    z.object({ term: z.string().min(1), definition: z.string().min(1) })
  ),
});

const clip = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

export interface GroundingSection {
  startSeconds: number;
  title: string;
  summary: string;
}

export interface LessonGroundingData {
  sections: GroundingSection[];
  keyConcepts: { term: string; definition: string }[];
}

const PROMPT = `You are preparing teaching material by watching a recorded lecture.

Return JSON only:
{
  "sections": [{"startSeconds": <integer seconds from the START of the video>, "title": "...", "summary": "one or two sentences on what is taught here"}],
  "keyConcepts": [{"term": "...", "definition": "one sentence, as this lecture explains it"}]
}

Rules:
- Cover the whole recording in order, from its beginning to its end. Use a section roughly every five to ten minutes, and do not stop early.
- startSeconds is measured from the beginning of the video, not from any clip.
- Describe only what is actually taught in this recording. Do not add material from your own knowledge.
- Key concepts are the terms a learner must understand to follow it.`;

const RESPONSE_SCHEMA = {
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
};

/**
 * The creator's own chapter markers, when the description carries them.
 *
 * These beat anything the model reports: they are exact, and the model's own
 * sense of elapsed time degrades badly on long videos. Grounding a 4.5-hour
 * course, its last section landed at 1:37 when the video runs 4:27, placing
 * "Inheritance" three minutes in.
 */
async function fetchVideoMeta(videoId: string): Promise<{
  chapters: { title: string; startSeconds: number }[];
  durationSec: number;
}> {
  const empty = { chapters: [], durationSec: 0 };
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return empty;

  try {
    if (!(await hasSearchQuota())) return empty;
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("id", videoId);
    url.searchParams.set("key", apiKey);
    const res = await fetch(url);
    await recordYouTubeUnits(1);
    if (!res.ok) return empty;

    const body = (await res.json()) as {
      items?: {
        snippet: { description: string };
        contentDetails: { duration: string };
      }[];
    };
    const item = body.items?.[0];
    if (!item) return empty;

    const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(
      item.contentDetails.duration
    );
    const total =
      Number(m?.[1] ?? 0) * 3600 +
      Number(m?.[2] ?? 0) * 60 +
      Number(m?.[3] ?? 0);

    return {
      durationSec: total,
      chapters: parseChaptersFromDescription(item.snippet.description, total)
        .filter((c) => c.startSeconds <= total)
        .map((c) => ({ title: c.title, startSeconds: c.startSeconds })),
    };
  } catch {
    return empty;
  }
}

/** Watches a video. Throws if the model or the response is unusable. */
export async function buildVideoGrounding(videoId: string): Promise<{
  data: LessonGroundingData;
  promptTokens: number;
}> {
  const ai = getGeminiClient();
  const { chapters, durationSec } = await fetchVideoMeta(videoId);
  const useChapters = chapters.length >= 3;

  const instruction = useChapters
    ? `${PROMPT}

The video's own chapter markers are below. Use them as the timeline: return one section per chapter, in this order, reusing each chapter's startSeconds and title exactly, and writing the summary yourself from what you watch.

${chapters.map((c) => `${c.startSeconds}s — ${c.title}`).join("\n")}`
    : PROMPT;

  const response = await ai.models.generateContent({
    model: TUTOR_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: `https://www.youtube.com/watch?v=${videoId}`,
              mimeType: "video/*",
            },
            // Low frame rate: the teaching structure comes from the audio, and
            // frames only need to catch slides and board work.
            videoMetadata: { fps: 0.1 },
          },
          { text: instruction },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      // Without a declared schema the same prompt returned an object one run
      // and a bare array the next; constrained decoding removes that drift.
      responseJsonSchema: RESPONSE_SCHEMA,
    },
  });

  const parsed = GroundingSchema.parse(
    JSON.parse(response.text?.trim() || "{}")
  );

  // With chapters, the creator's timeline wins: the model supplies wording,
  // and each summary is matched to the nearest chapter it was written for.
  const timeline = useChapters
    ? chapters.map((chapter) => {
        const match = parsed.sections.reduce((best, s) =>
          Math.abs(s.startSeconds - chapter.startSeconds) <
          Math.abs(best.startSeconds - chapter.startSeconds)
            ? s
            : best
        );
        return {
          startSeconds: chapter.startSeconds,
          title: chapter.title,
          summary: match?.summary ?? chapter.title,
        };
      })
    : parsed.sections;

  const sections = timeline
    .sort((a, b) => a.startSeconds - b.startSeconds)
    .filter(
      (s, i, all) => i === 0 || s.startSeconds > all[i - 1].startSeconds + 5
    )
    .slice(0, 40)
    .map((s) => ({
      startSeconds: s.startSeconds,
      title: clip(s.title, 120),
      summary: clip(s.summary, 400),
    }));

  if (sections.length === 0) throw new Error("No usable sections");

  // Without chapters there is nothing to anchor the model's sense of time, and
  // on long videos it drifts: an outline whose last section sits in the first
  // half of a recording is describing a timeline that does not exist. Better
  // no grounding than confident wrong timestamps.
  const last = sections[sections.length - 1].startSeconds;
  if (!useChapters && durationSec > 0 && last < durationSec * 0.5)
    throw new Error(
      `Timeline covers only ${Math.round((last / durationSec) * 100)}% of the video`
    );

  return {
    data: {
      sections,
      keyConcepts: parsed.keyConcepts.slice(0, 20).map((c) => ({
        term: clip(c.term, 80),
        definition: clip(c.definition, 400),
      })),
    },
    promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
  };
}

interface LessonWindow {
  videoId: string;
  startSeconds: number;
  endSeconds: number | null;
  durationSec: number;
}

async function lessonWindow(lessonId: string): Promise<LessonWindow | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      videoId: true,
      startSeconds: true,
      endSeconds: true,
      durationSec: true,
    },
  });
  return lesson?.videoId ? lesson : null;
}

/**
 * Narrows a whole video's outline to one lesson's segment.
 *
 * The section a lesson starts inside is kept even when it began earlier: a
 * chapter-sliced lesson usually opens mid-section, and dropping it would lose
 * the description of what the learner is watching first.
 */
function windowSections(
  sections: GroundingSection[],
  window: LessonWindow
): GroundingSection[] {
  const start = window.startSeconds || 0;
  const end =
    window.endSeconds ??
    (start > 0 && window.durationSec > 0
      ? start + window.durationSec
      : window.durationSec > 0
        ? window.durationSec
        : Infinity);

  const isSlice = start > 0 || window.endSeconds !== null;
  if (!isSlice) return sections;

  const inside = sections.filter(
    (s) => s.startSeconds >= start && s.startSeconds <= end
  );
  const opening = [...sections]
    .reverse()
    .find((s) => s.startSeconds < start && s.startSeconds + 0 <= end);

  return opening ? [opening, ...inside] : inside;
}

export async function readGrounding(
  lessonId: string
): Promise<LessonGroundingData | null> {
  const window = await lessonWindow(lessonId);
  if (!window) return null;

  const row = await prisma.videoGrounding.findUnique({
    where: { videoId: window.videoId },
  });
  if (!row) return null;

  const sections = windowSections(
    row.sections as unknown as GroundingSection[],
    window
  );
  if (sections.length === 0) return null;

  return {
    sections,
    keyConcepts:
      row.keyConcepts as unknown as LessonGroundingData["keyConcepts"],
  };
}

/**
 * Builds and stores grounding for a lesson's video unless it already exists.
 *
 * Two learners opening lessons from the same video at once would otherwise
 * each pay for a pass; the upsert makes the loser of that race harmless.
 */
export async function ensureGrounding(
  lessonId: string
): Promise<LessonGroundingData | null> {
  const existing = await readGrounding(lessonId);
  if (existing) return existing;

  const window = await lessonWindow(lessonId);
  if (!window) return null;

  const { data, promptTokens } = await buildVideoGrounding(window.videoId);

  await prisma.videoGrounding.upsert({
    where: { videoId: window.videoId },
    create: {
      videoId: window.videoId,
      model: TUTOR_MODEL,
      sections: data.sections as unknown as Prisma.InputJsonValue,
      keyConcepts: data.keyConcepts as unknown as Prisma.InputJsonValue,
      promptTokens,
    },
    update: {},
  });

  return readGrounding(lessonId);
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** How the grounding is shown to the tutor in its prompt. */
export function describeGrounding(g: LessonGroundingData): string {
  return [
    "WHAT THIS LECTURE ACTUALLY COVERS (from watching the recording; times are approximate):",
    // The raw second is included so a seek action can copy an exact value:
    // the classroom drops any jump whose seconds are not a section start.
    ...g.sections.map(
      (s) =>
        `- ${mmss(s.startSeconds)} (startSeconds ${s.startSeconds}) ${s.title}: ${s.summary}`
    ),
    g.keyConcepts.length > 0 &&
      `Concepts taught here: ${g.keyConcepts.map((c) => `${c.term} — ${c.definition}`).join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

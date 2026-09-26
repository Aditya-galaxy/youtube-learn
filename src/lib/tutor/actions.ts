import { z } from "zod";
import type { TutorLessonContext } from "@/lib/tutor/context";

/**
 * Things the tutor can do in the classroom, beyond talking.
 *
 * The model proposes one action per turn; the classroom performs it. Keeping
 * this a closed set means a reply can never steer the UI somewhere arbitrary:
 * an unknown or inapplicable action is dropped server-side before it reaches
 * the browser.
 */
export const TutorActionSchema = z.discriminatedUnion("type", [
  // Deliberately NOT an arbitrary "seek to 4:10": the tutor cannot watch the
  // video, so any timestamp it names is a guess, and a confident jump to the
  // wrong minute teaches the wrong thing. Replaying this lesson's own segment
  // is a position we actually know.
  z.object({
    type: z.literal("replaySegment"),
    label: z.string().max(80),
  }),
  z.object({
    type: z.literal("openTab"),
    tab: z.enum(["challenge", "quiz", "diagram", "resources", "notes"]),
    label: z.string().max(80),
  }),
  z.object({
    type: z.literal("markComplete"),
    label: z.string().max(80),
  }),
  z.object({
    type: z.literal("nextLesson"),
    label: z.string().max(80),
  }),
]);

export type TutorAction = z.infer<typeof TutorActionSchema>;

export const TutorReplySchema = z.object({
  reply: z.string().min(1).max(4_000),
  suggestions: z.array(z.string().max(120)).max(3).default([]),
  action: TutorActionSchema.nullish(),
});

/** Drops an action that does not apply where the learner currently is. */
export function sanitizeAction(
  action: TutorAction | null | undefined,
  ctx: TutorLessonContext
): TutorAction | null {
  if (!action) return null;

  if (action.type === "nextLesson" && !ctx.nextLessonTitle) return null;
  if (action.type === "markComplete" && ctx.isCompleted) return null;

  return action;
}

export const ACTION_INSTRUCTIONS = `ACTIONS
You may propose at most one action per reply, in the "action" field, or null when none helps.
- {"type":"replaySegment","label":"Replay this section"} — restart this lesson's video segment from its beginning.
You cannot see or hear the video, so you must never name a timestamp, claim what happens at a particular minute, or describe an analogy the instructor supposedly used. Tell the learner what to listen for instead.
- {"type":"openTab","tab":"challenge|quiz|diagram|resources|notes","label":"..."} — open a panel under the video.
- {"type":"markComplete","label":"..."} — offer to mark the lesson done, only once the learner has shown they understood it.
- {"type":"nextLesson","label":"..."} — move on, only when this lesson is genuinely finished.
The label is the button text the learner sees: short, plain and specific.`;

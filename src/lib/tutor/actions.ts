import { z } from "zod";
import type { TutorLessonContext } from "@/lib/tutor/context";
import type { LessonGroundingData } from "@/lib/tutor/grounding";

/**
 * Things the tutor can do in the classroom, beyond talking.
 *
 * The model proposes one action per turn; the classroom performs it. Keeping
 * this a closed set means a reply can never steer the UI somewhere arbitrary:
 * an unknown or inapplicable action is dropped server-side before it reaches
 * the browser.
 */
export const TutorActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("replaySegment"),
    label: z.string().max(80),
  }),
  // A jump is only allowed to a section start that came out of watching the
  // video, never to a timestamp composed mid-sentence: spot-checking the
  // grounding found boundaries drifting by minutes, and free-form guesses were
  // worse still. sanitizeAction drops anything not in the stored sections.
  z.object({
    type: z.literal("seek"),
    seconds: z.number().int().min(0).max(86_400),
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
  ctx: TutorLessonContext,
  grounding?: LessonGroundingData | null
): TutorAction | null {
  if (!action) return null;

  if (action.type === "seek") {
    const known = grounding?.sections.some(
      (s) => s.startSeconds === action.seconds
    );
    if (!known) return null;
  }

  if (action.type === "nextLesson" && !ctx.nextLessonTitle) return null;
  if (action.type === "markComplete" && ctx.isCompleted) return null;

  return action;
}

export const ACTION_INSTRUCTIONS = `ACTIONS
You may propose at most one action per reply, in the "action" field, or null when none helps.
- {"type":"replaySegment","label":"Replay this section"} — restart this lesson's video segment from its beginning.
- {"type":"seek","seconds":<int>,"label":"Jump to about 23:44 — Memory Addresses and Pointers"} — jump to a section of the lecture. Allowed ONLY when a lecture outline is given below, and ONLY using one of its exact startSeconds values. Any other timestamp is discarded.
Section times are approximate to within a couple of minutes, so offer them as "about", and never claim that a particular sentence or example occurs at a particular time.
- {"type":"openTab","tab":"challenge|quiz|diagram|resources|notes","label":"..."} — open a panel under the video.
- {"type":"markComplete","label":"..."} — offer to mark the lesson done, only once the learner has shown they understood it.
- {"type":"nextLesson","label":"..."} — move on, only when this lesson is genuinely finished.
The label is the button text the learner sees: short, plain and specific.`;

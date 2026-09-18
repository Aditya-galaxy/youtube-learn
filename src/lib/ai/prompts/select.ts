import type { SyllabusModule } from "../schemas";

export const SELECT_SYSTEM = `You match real YouTube videos to the lessons of a module that has already been planned.

You are given the module's objectives, its lesson intents (each with a mustTeach list), and a numbered list of candidate videos. Choose which candidate teaches each lesson.

Refer to candidates by their number. You cannot name a video any other way, and you must never write a video ID, URL or title in place of an index.

How to choose:
- Judge a candidate against that lesson's mustTeach items, not against general quality. A famous video that does not cover the required material is the wrong answer.
- Prefer SLICE_CHAPTERS when a long candidate marked "sliceable" covers several consecutive lessons of this module. One instructor with one notation and one running example across a module teaches better than four unrelated videos, so take it when it genuinely fits.
- When you slice, give chapterRange as the inclusive range of chapter indices for that lesson. Ranges for different lessons of the same video must not overlap.
- Use FULL_VIDEO when a candidate is about the right length for one lesson and covers it directly. Set chapterRange to null.
- A video may back at most one FULL_VIDEO lesson in this module.

If no candidate covers a lesson well, put its key in unmatchedLessonKeys and do not select anything for it. An honest gap is better than a video that does not teach the material — the gap is shown to the learner, a wrong video wastes their time and makes the course untrustworthy.`;

export function buildSelectUserMessage(input: {
  module: SyllabusModule;
  poolText: string;
  alreadyUsedVideoIds: string[];
}): string {
  const { module: mod, poolText, alreadyUsedVideoIds } = input;

  const lessons = mod.lessonIntents
    .map(
      (l) => `- ${l.key}: ${l.title}\n    must teach: ${l.mustTeach.join("; ")}`
    )
    .join("\n");

  const lines = [
    `<module key="${mod.key}">`,
    `<title>${mod.title}</title>`,
    `<objectives>${mod.objectives.join("; ")}</objectives>`,
    `<lessons>`,
    lessons,
    `</lessons>`,
    `</module>`,
    "",
    "<candidates>",
    poolText,
    "</candidates>",
  ];

  if (alreadyUsedVideoIds.length > 0) {
    lines.push(
      "",
      `<already_used_in_earlier_modules>${alreadyUsedVideoIds.length} video(s) are already used elsewhere in this course. Prefer variety unless a repeat is clearly the best teacher for this lesson.</already_used_in_earlier_modules>`
    );
  }

  return lines.join("\n");
}

/**
 * Schemas for every model call in the generation pipeline.
 *
 * These import `zod/v4`, not `zod`. The SDK's `zodOutputFormat` runs zod v4's
 * `toJSONSchema`, which reads `schema._zod` and throws on a v3 schema. zod
 * 3.25 ships v4 at this subpath, so this needs no dependency change — but it
 * does mean the AI layer speaks v4 while the existing API routes
 * (videos.ts, user-logs) still use the v3 entry point. Unify when convenient.
 */
import { z } from "zod/v4";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SkillLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);
export type SkillLevel = z.infer<typeof SkillLevelSchema>;

export const LessonIntentSchema = z.object({
  key: z
    .string()
    .regex(SLUG)
    .describe("Stable kebab-case identifier, unique within the module."),
  title: z.string().min(3).max(120),
  mustTeach: z
    .array(z.string().min(3).max(200))
    .min(1)
    .max(5)
    .describe("Concrete things this lesson has to cover."),
});

export const SyllabusModuleSchema = z.object({
  key: z
    .string()
    .regex(SLUG)
    .describe("Stable kebab-case identifier, unique within the course."),
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(400),
  objectives: z
    .array(z.string().min(5).max(200))
    .min(2)
    .max(5)
    .describe("What the learner can do after finishing this module."),
  prerequisiteKeys: z
    .array(z.string().regex(SLUG))
    .describe(
      "Keys of modules that must come before this one. Empty for entry points. Must not form a cycle."
    ),
  searchQueries: z
    .array(z.string().min(3).max(120))
    .min(1)
    .max(3)
    .describe(
      "Plain-language YouTube search queries likely to surface teaching videos for this module. No search operators."
    ),
  lessonIntents: z.array(LessonIntentSchema).min(2).max(6),
});

export const SyllabusSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(40).max(600),
  category: z.string().min(3).max(60),
  difficulty: SkillLevelSchema,
  estimatedHours: z.number().min(0.5).max(60),
  modules: z.array(SyllabusModuleSchema).min(3).max(8),
});

export type Syllabus = z.infer<typeof SyllabusSchema>;
export type SyllabusModule = z.infer<typeof SyllabusModuleSchema>;
export type LessonIntent = z.infer<typeof LessonIntentSchema>;

/**
 * Video selection. The model answers with an INDEX into a candidate pool the
 * server built, never a video id — there is no field here that accepts one, so
 * it cannot invent a video that does not exist.
 */
export const SelectionSchema = z.object({
  selections: z.array(
    z.object({
      moduleKey: z.string().regex(SLUG),
      lessonIntentKey: z.string().regex(SLUG),
      candidateIndex: z
        .number()
        .int()
        .min(0)
        .describe("Index into the numbered candidate list provided."),
      strategy: z.enum(["FULL_VIDEO", "SLICE_CHAPTERS"]),
      chapterRange: z
        .object({
          fromIndex: z.number().int().min(0),
          toIndex: z.number().int().min(0),
        })
        .nullable()
        .describe("Only for SLICE_CHAPTERS; null otherwise."),
      reason: z.string().min(5).max(300),
    })
  ),
  unmatchedLessonKeys: z
    .array(z.string().regex(SLUG))
    .describe(
      "Lesson intent keys no candidate covered well. Prefer honesty over a weak match."
    ),
});

export type Selection = z.infer<typeof SelectionSchema>;

/** Per-lesson supporting material. Exercises are deliberately out of scope. */
export const LessonContentSchema = z.object({
  lessons: z.array(
    z.object({
      lessonKey: z.string().regex(SLUG),
      notesMd: z
        .string()
        .min(100)
        .max(4000)
        .describe("Markdown study notes, 150-400 words. No headings above h3."),
      keyConcepts: z
        .array(
          z.object({
            term: z.string().min(2).max(80),
            definition: z.string().min(20).max(400),
          })
        )
        .min(2)
        .max(8),
      figures: z
        .array(
          z.object({
            title: z.string().min(3).max(120),
            caption: z.string().min(10).max(300),
            mermaid: z
              .string()
              .min(20)
              .max(2000)
              .describe(
                "Mermaid diagram source only — no fenced code block, no HTML, no click/script directives."
              ),
          })
        )
        .max(2),
    })
  ),
});

export type LessonContent = z.infer<typeof LessonContentSchema>;

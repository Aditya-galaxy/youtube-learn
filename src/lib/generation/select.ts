import { parseWithRepair, type UsageTotals } from "@/lib/ai/parse";
import {
  SelectionSchema,
  type Selection,
  type SyllabusModule,
} from "@/lib/ai/schemas";
import { SELECT_SYSTEM, buildSelectUserMessage } from "@/lib/ai/prompts/select";
import {
  formatPoolForPrompt,
  type ModulePool,
  type PoolCandidate,
} from "./retrieve";

export interface ModuleSelection {
  moduleKey: string;
  picks: Array<{
    lessonIntentKey: string;
    candidate: PoolCandidate;
    strategy: "FULL_VIDEO" | "SLICE_CHAPTERS";
    chapterRange: { fromIndex: number; toIndex: number } | null;
    reason: string;
  }>;
  unmatchedLessonKeys: string[];
  usage: UsageTotals;
}

/**
 * Stage C: pick a real video for each lesson intent.
 *
 * The model answers with indices into a pool the server built, so it is
 * structurally incapable of naming a video that does not exist. Everything
 * below validates that the indices it returned are usable — generate-then-
 * verify would instead cost a round trip per hallucination and fail silently.
 */
export async function selectVideosForModule(input: {
  module: SyllabusModule;
  pool: ModulePool;
  alreadyUsedVideoIds?: string[];
}): Promise<ModuleSelection> {
  const { module: mod, pool, alreadyUsedVideoIds = [] } = input;

  if (pool.candidates.length === 0) {
    return {
      moduleKey: mod.key,
      picks: [],
      unmatchedLessonKeys: mod.lessonIntents.map((l) => l.key),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadInputTokens: 0,
        cacheCreationInputTokens: 0,
      },
    };
  }

  const { data, usage } = await parseWithRepair({
    stage: "select",
    schema: SelectionSchema,
    system: SELECT_SYSTEM,
    userMessage: buildSelectUserMessage({
      module: mod,
      poolText: formatPoolForPrompt(pool),
      alreadyUsedVideoIds,
    }),
    semanticCheck: (value) => checkSelection(value, mod, pool),
  });

  const byIndex = new Map(pool.candidates.map((c) => [c.index, c]));
  const picks = data.selections
    .filter((s) => s.moduleKey === mod.key && byIndex.has(s.candidateIndex))
    .map((s) => ({
      lessonIntentKey: s.lessonIntentKey,
      candidate: byIndex.get(s.candidateIndex)!,
      strategy: s.strategy,
      chapterRange: s.chapterRange,
      reason: s.reason,
    }));

  return {
    moduleKey: mod.key,
    picks,
    unmatchedLessonKeys: data.unmatchedLessonKeys,
    usage,
  };
}

/** Everything the JSON schema cannot express about a valid selection. */
export function checkSelection(
  selection: Selection,
  mod: SyllabusModule,
  pool: ModulePool
): string[] {
  const violations: string[] = [];
  const maxIndex = pool.candidates.length - 1;
  const byIndex = new Map(pool.candidates.map((c) => [c.index, c]));
  const lessonKeys = new Set(mod.lessonIntents.map((l) => l.key));

  const claimed = new Set<string>();
  const fullVideoUses = new Map<string, number>();
  const slicesByVideo = new Map<string, Array<{ from: number; to: number }>>();

  for (const s of selection.selections) {
    if (s.moduleKey !== mod.key) {
      violations.push(
        `Selection references module "${s.moduleKey}", but this request is only about module "${mod.key}".`
      );
      continue;
    }

    if (!lessonKeys.has(s.lessonIntentKey)) {
      violations.push(
        `"${s.lessonIntentKey}" is not a lesson of module "${mod.key}".`
      );
      continue;
    }

    if (claimed.has(s.lessonIntentKey)) {
      violations.push(
        `Lesson "${s.lessonIntentKey}" was assigned more than once.`
      );
    }
    claimed.add(s.lessonIntentKey);

    if (s.candidateIndex > maxIndex) {
      violations.push(
        `Candidate index ${s.candidateIndex} does not exist. Valid indices are 0 to ${maxIndex}.`
      );
      continue;
    }

    const candidate = byIndex.get(s.candidateIndex)!;

    if (s.strategy === "SLICE_CHAPTERS") {
      if (!candidate.sliceable) {
        violations.push(
          `Candidate ${s.candidateIndex} has no usable chapters, so it cannot be sliced. Use FULL_VIDEO or choose another candidate.`
        );
        continue;
      }
      if (!s.chapterRange) {
        violations.push(
          `Lesson "${s.lessonIntentKey}" uses SLICE_CHAPTERS but gave no chapterRange.`
        );
        continue;
      }
      const { fromIndex, toIndex } = s.chapterRange;
      if (fromIndex > toIndex) {
        violations.push(
          `chapterRange for "${s.lessonIntentKey}" is backwards (${fromIndex} to ${toIndex}).`
        );
        continue;
      }
      if (toIndex > candidate.chapterCount - 1) {
        violations.push(
          `chapterRange for "${s.lessonIntentKey}" ends at chapter ${toIndex}, but candidate ${s.candidateIndex} only has ${candidate.chapterCount} chapters (0 to ${candidate.chapterCount - 1}).`
        );
        continue;
      }
      const existing = slicesByVideo.get(candidate.videoId) ?? [];
      const overlap = existing.find(
        (r) => fromIndex <= r.to && toIndex >= r.from
      );
      if (overlap) {
        violations.push(
          `Two lessons claim overlapping chapters of candidate ${s.candidateIndex} (${overlap.from}-${overlap.to} and ${fromIndex}-${toIndex}). Ranges must not overlap.`
        );
      }
      slicesByVideo.set(candidate.videoId, [
        ...existing,
        { from: fromIndex, to: toIndex },
      ]);
    } else {
      const uses = (fullVideoUses.get(candidate.videoId) ?? 0) + 1;
      fullVideoUses.set(candidate.videoId, uses);
      if (uses > 1) {
        violations.push(
          `Candidate ${s.candidateIndex} is used as a FULL_VIDEO for more than one lesson. Slice it into chapters instead, or pick a different candidate.`
        );
      }
    }
  }

  for (const key of selection.unmatchedLessonKeys) {
    if (!lessonKeys.has(key)) {
      violations.push(
        `unmatchedLessonKeys contains "${key}", which is not a lesson of module "${mod.key}".`
      );
    } else if (claimed.has(key)) {
      violations.push(
        `Lesson "${key}" is both selected and listed as unmatched. Choose one.`
      );
    }
  }

  const accounted = new Set([...claimed, ...selection.unmatchedLessonKeys]);
  for (const lesson of mod.lessonIntents) {
    if (!accounted.has(lesson.key)) {
      violations.push(
        `Lesson "${lesson.key}" was neither given a video nor listed in unmatchedLessonKeys. Every lesson must be accounted for.`
      );
    }
  }

  return violations;
}

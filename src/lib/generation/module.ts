import type { youtube_v3 } from "googleapis";
import type { SyllabusModule } from "@/lib/ai/schemas";
import type { UsageTotals } from "@/lib/ai/parse";
import type { Lesson } from "../../../types/course";
import { retrieveCandidatesForModule } from "./retrieve";
import { selectVideosForModule, type ModuleSelection } from "./select";
import { buildLesson } from "./slice";

export interface BuiltModule {
  key: string;
  title: string;
  lessons: Lesson[];
  /** Lesson-intent keys that ended with no usable video. Shown to the learner. */
  gaps: string[];
  picks: ModuleSelection["picks"];
  unitsSpent: number;
  usage: UsageTotals;
  gapFillRan: boolean;
}

function addUsage(a: UsageTotals, b: UsageTotals): UsageTotals {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadInputTokens: a.cacheReadInputTokens + b.cacheReadInputTokens,
    thoughtTokens: a.thoughtTokens + b.thoughtTokens,
  };
}

/**
 * Retrieve -> select -> slice for one module, with one gap-filling pass.
 *
 * Retrieval stops early once a pool is deep and sliceable, to stay inside the
 * quota budget. The cost of that showed up in the first live course: a module
 * stopped after its broad query and then could not fill "Span and Subspaces",
 * which its narrower, unrun query would have found. So when lessons come back
 * unmatched and queries remain unrun, run them and re-select for just the gaps.
 * One pass, never a loop — quota is spent only where there is a gap to fill.
 */
export async function buildModule(
  youtube: youtube_v3.Youtube,
  mod: SyllabusModule,
  alreadyUsedVideoIds: string[]
): Promise<BuiltModule> {
  const pool = await retrieveCandidatesForModule(youtube, mod);
  let unitsSpent = pool.unitsSpent;

  const first = await selectVideosForModule({
    module: mod,
    pool,
    alreadyUsedVideoIds,
  });
  let usage = first.usage;
  const picks = [...first.picks];
  let gaps = [...first.unmatchedLessonKeys];
  let gapFillRan = false;

  const unrun = mod.searchQueries.filter((q) => !pool.queriesUsed.includes(q));
  if (gaps.length > 0 && unrun.length > 0) {
    gapFillRan = true;
    const extra = await retrieveCandidatesForModule(youtube, {
      key: mod.key,
      searchQueries: unrun,
    });
    unitsSpent += extra.unitsSpent;

    const gapModule: SyllabusModule = {
      ...mod,
      lessonIntents: mod.lessonIntents.filter((l) => gaps.includes(l.key)),
    };
    const second = await selectVideosForModule({
      module: gapModule,
      pool: extra,
      alreadyUsedVideoIds: [
        ...alreadyUsedVideoIds,
        ...picks.map((p) => p.candidate.videoId),
      ],
      takenFullVideoIds: picks
        .filter((p) => p.strategy === "FULL_VIDEO")
        .map((p) => p.candidate.videoId),
    });
    usage = addUsage(usage, second.usage);
    picks.push(...second.picks);
    gaps = second.unmatchedLessonKeys;
  }

  // Keep the syllabus's lesson order, not the order selections came back in.
  const byIntent = new Map(picks.map((p) => [p.lessonIntentKey, p]));
  const lessons: Lesson[] = [];
  for (const intent of mod.lessonIntents) {
    const pick = byIntent.get(intent.key);
    if (!pick) continue;
    const lesson = buildLesson({
      moduleId: mod.key,
      candidate: pick.candidate,
      lessonTitle: intent.title,
      orderIndex: lessons.length + 1,
      strategy: pick.strategy,
      chapterRange: pick.chapterRange,
    });
    if (lesson) lessons.push(lesson);
    else if (!gaps.includes(intent.key)) gaps.push(intent.key);
  }

  return {
    key: mod.key,
    title: mod.title,
    lessons,
    gaps,
    picks,
    unitsSpent,
    usage,
    gapFillRan,
  };
}

import type { Lesson } from "../../../types/course";
import {
  parseChaptersFromDescription,
  type ParsedChapter,
} from "@/lib/youtube/chapterParser";
import type { PoolCandidate } from "./retrieve";

/**
 * Stage D: turn a selected candidate into playable lesson rows.
 *
 * Deterministic — no model involved. A FULL_VIDEO selection becomes one lesson
 * spanning the whole video; a SLICE_CHAPTERS selection becomes one lesson per
 * chapter range, with the real startSeconds/endSeconds that ClassroomPlayer
 * already honours via the embed's &start= / &end= parameters.
 */

export interface SliceInput {
  moduleId: string;
  candidate: PoolCandidate;
  lessonTitle: string;
  orderIndex: number;
  strategy: "FULL_VIDEO" | "SLICE_CHAPTERS";
  chapterRange?: { fromIndex: number; toIndex: number } | null;
}

export function buildLesson(input: SliceInput): Lesson | null {
  const { moduleId, candidate, lessonTitle, orderIndex, strategy } = input;

  if (strategy === "FULL_VIDEO") {
    return {
      id: `${moduleId}-l-${orderIndex}`,
      moduleId,
      title: lessonTitle,
      orderIndex,
      videoId: candidate.videoId,
      channelName: candidate.channelName,
      durationSec: candidate.durationSec,
      startSeconds: 0,
      summary: candidate.description.slice(0, 500),
      isCompleted: false,
    };
  }

  const chapters = parseChaptersFromDescription(
    candidate.description,
    candidate.durationSec
  );
  const range = input.chapterRange;
  if (!range || chapters.length === 0) return null;

  const from = Math.max(0, range.fromIndex);
  const to = Math.min(chapters.length - 1, range.toIndex);
  if (from > to) return null;

  const start = chapters[from].startSeconds;
  // endSeconds of the LAST chapter in the range, so a multi-chapter lesson
  // plays straight through rather than stopping at the first boundary.
  const end = chapters[to].endSeconds ?? candidate.durationSec;
  if (end <= start) return null;

  return {
    id: `${moduleId}-l-${orderIndex}`,
    moduleId,
    title: lessonTitle,
    orderIndex,
    videoId: candidate.videoId,
    channelName: candidate.channelName,
    durationSec: end - start,
    startSeconds: start,
    endSeconds: end,
    summary: chapters
      .slice(from, to + 1)
      .map((c) => c.title)
      .join(" · ")
      .slice(0, 500),
    isCompleted: false,
  };
}

/** Chapters of a candidate, for inspection and for sizing a chapterRange. */
export function chaptersOf(candidate: PoolCandidate): ParsedChapter[] {
  return parseChaptersFromDescription(
    candidate.description,
    candidate.durationSec
  );
}

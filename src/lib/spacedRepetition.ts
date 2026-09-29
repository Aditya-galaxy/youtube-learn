import type { Course, CourseEnrollment, Lesson } from "../../types/course";
import { resolveLessonPedagogy } from "./pedagogyEngine";

export interface SpacedReviewCard {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug?: string;
  lessonId: string;
  lessonTitle: string;
  videoId: string;
  timestampSeconds: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  repetitionLevel: number;
  nextDueTime: number;
  isDue: boolean;
}

export interface ReviewScheduleRecord {
  repetitionLevel: number;
  lastReviewedAt: number;
  nextDueTime: number;
  reviewCount: number;
  lapseCount: number;
}

export const LEITNER_INTERVAL_DAYS = [1, 3, 7, 14, 30];
const STORAGE_KEY = "ytlearn.spaced_repetition.schedules";

export function loadReviewSchedules(): Record<string, ReviewScheduleRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveReviewSchedules(
  records: Record<string, ReviewScheduleRecord>
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("[spaced-repetition] failed to save schedule:", error);
  }
}

export function recordCardReview(
  cardId: string,
  isCorrect: boolean
): ReviewScheduleRecord {
  const schedules = loadReviewSchedules();
  const existing = schedules[cardId] || {
    repetitionLevel: 0,
    lastReviewedAt: 0,
    nextDueTime: Date.now(),
    reviewCount: 0,
    lapseCount: 0,
  };

  const now = Date.now();
  let nextLevel = existing.repetitionLevel;
  let lapseCount = existing.lapseCount;

  if (isCorrect) {
    nextLevel = Math.min(nextLevel + 1, LEITNER_INTERVAL_DAYS.length - 1);
  } else {
    // Leitner penalty for lapsed recall: reset to level 0 (1 day interval)
    nextLevel = 0;
    lapseCount += 1;
  }

  const intervalDays = LEITNER_INTERVAL_DAYS[nextLevel] || 1;
  const nextDueTime = now + intervalDays * 24 * 60 * 60 * 1000;

  const updated: ReviewScheduleRecord = {
    repetitionLevel: nextLevel,
    lastReviewedAt: now,
    nextDueTime,
    reviewCount: existing.reviewCount + 1,
    lapseCount,
  };

  schedules[cardId] = updated;
  saveReviewSchedules(schedules);
  return updated;
}

/**
 * Builds the prioritized queue of retrieval cards due for review today.
 * Grounded in Ebbinghaus (1885) and the Spacing Effect (Bjork & Bjork, 2011).
 */
export function buildSpacedReviewQueue(
  courses: Course[],
  enrollments: Record<string, CourseEnrollment>
): {
  dueCards: SpacedReviewCard[];
  upcomingCount: number;
  masteredCount: number;
  averageRetentionPct: number;
} {
  const schedules = loadReviewSchedules();
  const now = Date.now();
  const cards: SpacedReviewCard[] = [];

  // 1. Scan completed lessons across enrolled courses
  Object.values(enrollments).forEach((enr) => {
    const course = courses.find((c) => c.id === enr.courseId);
    if (!course) return;

    course.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        if (!enr.completedLessonIds.includes(lesson.id)) return;

        const pedagogy = resolveLessonPedagogy(lesson, course, mod);
        const questions = pedagogy.checkpoints || [];

        questions.forEach((cp, idx) => {
          const cardId = `sr-${course.id}-${lesson.id}-${cp.id || idx}`;
          const record = schedules[cardId];

          const repLevel = record ? record.repetitionLevel : 0;
          const nextDueTime = record
            ? record.nextDueTime
            : enr.enrolledAt
              ? new Date(enr.enrolledAt).getTime()
              : now;

          const isDue = nextDueTime <= now;

          cards.push({
            id: cardId,
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            videoId: lesson.videoId,
            timestampSeconds: cp.timestampSeconds || lesson.startSeconds || 0,
            question: cp.question,
            options: cp.options,
            correctIndex: cp.correctIndex,
            explanation: cp.explanation,
            repetitionLevel: repLevel,
            nextDueTime,
            isDue,
          });
        });
      });
    });
  });

  // 2. If no completed lessons, provide high-yield diagnostic cards from curated courses
  if (cards.length === 0) {
    const sampleCourses = courses.slice(0, 2);
    sampleCourses.forEach((c) => {
      if (c.modules[0]?.lessons[0]) {
        const lesson = c.modules[0].lessons[0];
        const pedagogy = resolveLessonPedagogy(lesson, c, c.modules[0]);
        (pedagogy.checkpoints || []).forEach((cp, idx) => {
          const cardId = `sample-${c.id}-${lesson.id}-${idx}`;
          const record = schedules[cardId];
          const repLevel = record ? record.repetitionLevel : 0;
          const nextDueTime = record ? record.nextDueTime : now;

          cards.push({
            id: cardId,
            courseId: c.id,
            courseTitle: c.title,
            courseSlug: c.slug,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            videoId: lesson.videoId,
            timestampSeconds: cp.timestampSeconds || 0,
            question: cp.question,
            options: cp.options,
            correctIndex: cp.correctIndex,
            explanation: cp.explanation,
            repetitionLevel: repLevel,
            nextDueTime,
            isDue: nextDueTime <= now,
          });
        });
      }
    });
  }

  const dueCards = cards.filter((c) => c.isDue);
  const upcomingCount = cards.filter((c) => !c.isDue).length;
  const masteredCount = cards.filter((c) => c.repetitionLevel >= 3).length;

  // Compute estimated retention using Ebbinghaus exponential decay R = e^(-t/S)
  let totalRetention = 0;
  cards.forEach((c) => {
    const stabilityDays = LEITNER_INTERVAL_DAYS[c.repetitionLevel] || 1;
    const elapsedDays = Math.max(
      0,
      (now - (c.nextDueTime - stabilityDays * 24 * 60 * 60 * 1000)) /
        (24 * 60 * 60 * 1000)
    );
    // Retention decays exponentially with elapsed time relative to stability
    const r = Math.exp(-elapsedDays / (stabilityDays * 2));
    totalRetention += r;
  });

  const averageRetentionPct =
    cards.length > 0 ? Math.round((totalRetention / cards.length) * 100) : 85;

  return {
    dueCards,
    upcomingCount,
    masteredCount,
    averageRetentionPct,
  };
}

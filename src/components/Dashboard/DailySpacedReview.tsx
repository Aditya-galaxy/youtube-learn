"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  XCircle,
  RotateCw,
  Sparkles,
  ArrowRight,
  Play,
  TrendingUp,
  Award,
} from "lucide-react";
import type { Course, CourseEnrollment } from "../../../types/course";
import {
  buildSpacedReviewQueue,
  recordCardReview,
  LEITNER_INTERVAL_DAYS,
  type SpacedReviewCard,
} from "@/lib/spacedRepetition";

interface DailySpacedReviewProps {
  courses: Course[];
  enrollments: Record<string, CourseEnrollment>;
}

export const DailySpacedReview: React.FC<DailySpacedReviewProps> = ({
  courses,
  enrollments,
}) => {
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<SpacedReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);
  const [retentionPct, setRetentionPct] = useState(85);
  const [masteredCount, setMasteredCount] = useState(0);

  const refreshQueue = useCallback(() => {
    const queue = buildSpacedReviewQueue(courses, enrollments);
    setCards(queue.dueCards);
    setRetentionPct(queue.averageRetentionPct);
    setMasteredCount(queue.masteredCount);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [courses, enrollments]);

  useEffect(() => {
    setMounted(true);
    refreshQueue();
  }, [refreshQueue]);

  if (!mounted) {
    return null;
  }

  const currentCard = cards[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentCard) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentCard.correctIndex;
    recordCardReview(currentCard.id, isCorrect);
    setSessionCompletedCount((prev) => prev + 1);
  };

  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Refresh to see if more or all caught up
      refreshQueue();
    }
  };

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm transition-all sm:p-7">
      {/* Header bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Brain className="h-3.5 w-3.5" />
              Spaced Retrieval Engine
            </span>
            <span className="text-[11px] text-muted-foreground">
              Ebbinghaus Forgetting Curve &amp; Leitner System
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Daily 3-Minute Recall Workout
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Strengthen long-term synaptic connections before memory decays.
          </p>
        </div>

        {/* Dynamic Retention & Memory Metrics */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border bg-secondary/40 px-3.5 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Est. Retention
            </div>
            <p className="mt-0.5 font-display text-lg font-bold text-foreground">
              {retentionPct}%
            </p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 px-3.5 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Award className="h-3 w-3 text-amber-500" />
              Mastered
            </div>
            <p className="mt-0.5 font-display text-lg font-bold text-foreground">
              {masteredCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Review Area */}
      {cards.length > 0 && currentCard ? (
        <div className="mt-6">
          {/* Progress row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Card {currentIndex + 1} of {cards.length} due today
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded bg-secondary px-2 py-0.5 text-[11px]">
                Box {currentCard.repetitionLevel + 1} (Interval:{" "}
                {LEITNER_INTERVAL_DAYS[currentCard.repetitionLevel]}d)
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="max-w-[180px] truncate text-primary sm:max-w-xs font-medium">
                {currentCard.courseTitle}
              </span>
            </div>
          </div>

          {/* Prompt card */}
          <div className="mt-4 rounded-xl border border-border bg-background/80 p-5 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">
                Lesson
              </span>
              <span>{currentCard.lessonTitle}</span>
            </div>

            <p className="mt-3 text-base font-semibold leading-relaxed text-foreground">
              {currentCard.question}
            </p>

            {/* Answer Options */}
            <div className="mt-4 space-y-2.5">
              {currentCard.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentCard.correctIndex;

                let stateClasses =
                  "border-border bg-card hover:bg-secondary/60 hover:border-primary/40 text-foreground";
                let badge = null;

                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses =
                      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                    badge = (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    );
                  } else if (isSelected) {
                    stateClasses =
                      "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300";
                    badge = (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    );
                  } else {
                    stateClasses =
                      "border-border bg-card/50 text-muted-foreground opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm transition-all ${stateClasses}`}
                  >
                    <span>{option}</span>
                    {badge}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next action once answered */}
            {isAnswered && (
              <div className="mt-5 space-y-4 rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="text-xs leading-relaxed text-foreground">
                    <span className="font-semibold text-primary">
                      Explanation:{" "}
                    </span>
                    {currentCard.explanation}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  {/* Jump to lecture timestamp */}
                  <Link
                    href={`/learn/${currentCard.courseSlug || currentCard.courseId}?t=${currentCard.timestampSeconds}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Review concept in lecture video (
                    {Math.floor(currentCard.timestampSeconds / 60)}:
                    {(currentCard.timestampSeconds % 60)
                      .toString()
                      .padStart(2, "0")}
                    )
                  </Link>

                  {/* Next question */}
                  <button
                    type="button"
                    onClick={handleNextCard}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:opacity-90 active:scale-95"
                  >
                    <span>
                      {currentIndex + 1 < cards.length
                        ? "Next Question"
                        : "Complete Workout"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Caught up state */
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center sm:py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-display text-base font-bold text-foreground">
            You&apos;re All Caught Up on Reviews!
          </h3>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            No retrieval cards are currently due. Your long-term memory traces
            have been consolidated across your enrolled curriculum.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={refreshQueue}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-border"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Re-check Schedule
            </button>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:opacity-90"
            >
              Learn New Topics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

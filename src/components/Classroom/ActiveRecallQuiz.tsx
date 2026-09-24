"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react";
import type { LessonQuizQuestion } from "../../../types/course";

interface ActiveRecallQuizProps {
  questions: LessonQuizQuestion[];
  lessonTitle: string;
}

export const ActiveRecallQuiz: React.FC<ActiveRecallQuizProps> = ({
  questions,
  lessonTitle,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (submitted[questionIdx]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
    setSubmitted((prev) => ({ ...prev, [questionIdx]: true }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted({});
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(submitted).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header & Score Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-500 uppercase">
              ACTIVE RETRIEVAL LAB
            </span>
            <span className="text-xs text-muted-foreground">
              Cognitive Testing Effect
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-foreground">
            Knowledge Check: {lessonTitle}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Low-stakes self-testing reinforces neural memory pathways up to 3x
            more than passive video review.
          </p>
        </div>

        {answeredCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-center">
              <span className="text-xs text-muted-foreground">Score</span>
              <p className="font-display text-base font-bold text-foreground">
                {correctCount} / {totalQuestions}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const isSubmitted = submitted[qIdx];
          const selectedOption = selectedAnswers[qIdx];
          const isCorrect = selectedOption === q.correctIndex;

          return (
            <div
              key={q.id || qIdx}
              className="rounded-xl border border-border bg-card p-5 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                  {qIdx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    {q.question}
                  </h4>

                  <div className="mt-3 space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isThisSelected = selectedOption === optIdx;
                      const isThisCorrect = optIdx === q.correctIndex;

                      let buttonStyle =
                        "border-border bg-secondary/20 hover:bg-secondary/60 text-foreground";

                      if (isSubmitted) {
                        if (isThisCorrect) {
                          buttonStyle =
                            "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium";
                        } else if (isThisSelected && !isThisCorrect) {
                          buttonStyle =
                            "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                        } else {
                          buttonStyle =
                            "border-border/40 opacity-50 text-muted-foreground";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          disabled={isSubmitted}
                          className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs transition-colors ${buttonStyle}`}
                        >
                          <span>{option}</span>
                          {isSubmitted && isThisCorrect && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 ml-2" />
                          )}
                          {isSubmitted && isThisSelected && !isThisCorrect && (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-500 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {isSubmitted && (
                    <div
                      className={`mt-3 rounded-lg border p-3 text-xs ${
                        isCorrect
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <p className="font-semibold">
                        {isCorrect ? "✓ Correct!" : "Explanation:"}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

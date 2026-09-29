"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  Brain,
  Bot,
} from "lucide-react";
import type { LessonQuizQuestion } from "../../../types/course";
import { useTutorContext } from "@/Helper/TutorContext";

interface ActiveRecallQuizProps {
  questions: LessonQuizQuestion[];
  lessonTitle: string;
}

export const ActiveRecallQuiz: React.FC<ActiveRecallQuizProps> = ({
  questions,
  lessonTitle,
}) => {
  const { setIsOpen: setTutorOpen, askTutorWithPrompt } = useTutorContext();
  const [feynmanText, setFeynmanText] = useState("");
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

  const handleFeynmanSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!feynmanText.trim()) return;

    setTutorOpen(true);
    askTutorWithPrompt(
      `Feynman Metacognitive Calibration Audit for "${lessonTitle}":\n\n` +
        `Learner's Explanation (Attempting to teach without jargon):\n"${feynmanText.trim()}"\n\n` +
        `Please calibrate my mental model across 3 dimensions:\n` +
        `1. Causal Mechanism: Did I explain WHY it works, not just WHAT it is?\n` +
        `2. Jargon Check: Did I hide behind buzzwords without unpacking them?\n` +
        `3. Missing Invariants: What critical boundary condition or edge case did I miss?\n` +
        `Provide an overall rating ([🟢 Crystal Clear / 🟡 Partially Calibrated / 🔴 Surface Level]) and a targeted follow-up question.`
    );
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

      {/* Feynman Metacognitive Calibration Studio */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/15 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Brain className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Feynman Technique
                </span>
                <span className="text-xs text-muted-foreground">
                  Chi et al. Self-Explanation Effect
                </span>
              </div>
              <h4 className="mt-1 font-display text-sm sm:text-base font-bold text-foreground">
                Teach It Simply: Metacognitive Calibration
              </h4>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          The ultimate test of comprehension is explaining the core mechanism to
          a beginner without using jargon. Nova will audit your explanation for
          causal clarity, identify buzzwords, and diagnose hidden gaps.
        </p>

        <form onSubmit={handleFeynmanSubmit} className="mt-4 space-y-3">
          <textarea
            value={feynmanText}
            onChange={(e) => setFeynmanText(e.target.value)}
            placeholder={`In 2-4 sentences, explain how ${lessonTitle} works to someone who has never studied this before...`}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-card p-3.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              Tip: Avoid buzzwords. Focus on <em>cause and effect</em>.
            </span>

            <button
              type="submit"
              disabled={!feynmanText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Calibrate with Nova Tutor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

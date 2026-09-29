"use client";

import React, { useState } from "react";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Play,
  Bot,
  HelpCircle,
  X,
  Sparkles,
} from "lucide-react";
import type { InVideoCheckpoint } from "../../../types/course";
import { formatSecondsToTime } from "@/lib/youtube/chapterParser";

interface InVideoCheckpointModalProps {
  checkpoint: InVideoCheckpoint;
  lessonTitle: string;
  onContinue: () => void;
  onAskTutor: (prompt: string) => void;
  onSkip: () => void;
}

export const InVideoCheckpointModal: React.FC<InVideoCheckpointModalProps> = ({
  checkpoint,
  lessonTitle,
  onContinue,
  onAskTutor,
  onSkip,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(idx);
    setHasSubmitted(true);
  };

  const isCorrect = selectedIndex === checkpoint.correctIndex;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkpoint-title"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 transition-all duration-300 animate-in fade-in"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl transition-all duration-200 animate-in zoom-in-95">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Brain className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Retrieval Checkpoint
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  @{formatSecondsToTime(checkpoint.timestampSeconds)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Mayer Segmenting Effect & Active Recall
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Skip checkpoint and resume playback"
            aria-label="Skip checkpoint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question Area */}
        <div className="mt-4 space-y-3">
          <h4
            id="checkpoint-title"
            className="font-display text-sm sm:text-base font-bold text-foreground leading-snug"
          >
            {checkpoint.question}
          </h4>

          {/* Options */}
          <div className="space-y-2">
            {checkpoint.options.map((option, idx) => {
              const isSelected = selectedIndex === idx;
              const isTargetCorrect = idx === checkpoint.correctIndex;

              let cardStyle =
                "border-border bg-secondary/40 hover:border-primary/40 hover:bg-secondary";
              if (hasSubmitted) {
                if (isSelected) {
                  cardStyle = isCorrect
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-medium"
                    : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-300 font-medium";
                } else if (isTargetCorrect) {
                  cardStyle =
                    "border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300";
                } else {
                  cardStyle = "border-border/50 bg-secondary/20 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={hasSubmitted}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs sm:text-sm transition-all ${cardStyle}`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isSelected && hasSubmitted
                        ? isCorrect
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-background text-muted-foreground border border-border"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {hasSubmitted && isTargetCorrect && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  {hasSubmitted && isSelected && !isCorrect && (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Submit */}
          {hasSubmitted && (
            <div
              className={`rounded-xl border p-3.5 text-xs transition-all ${
                isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {isCorrect ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Spot on! Concept consolidated.</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Learning Opportunity:</span>
                  </>
                )}
              </div>
              <p className="mt-1 leading-relaxed text-foreground/80">
                {checkpoint.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <button
            onClick={() => {
              const selectedOptionText =
                selectedIndex !== null ? checkpoint.options[selectedIndex] : "";
              const prompt = `I just encountered this in-video checkpoint on "${lessonTitle}":\n\nQuestion: "${checkpoint.question}"\n${
                hasSubmitted ? `I selected: "${selectedOptionText}".\n` : ""
              }Can you guide me through the intuition behind why "${checkpoint.options[checkpoint.correctIndex]}" is correct?`;
              onAskTutor(prompt);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span>Ask Nova Tutor</span>
          </button>

          <button
            onClick={onContinue}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{hasSubmitted ? "Continue Lecture" : "Skip & Continue"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

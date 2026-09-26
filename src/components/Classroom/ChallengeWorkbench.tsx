"use client";

import React, { useState } from "react";
import {
  Code2,
  Play,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Loader2,
  Terminal,
} from "lucide-react";
import type { LessonChallenge } from "../../../types/course";

interface ChallengeWorkbenchProps {
  challenge: LessonChallenge;
  lessonTitle: string;
  /** The exercise came from a topic template, not from this lecture. */
  isGeneric?: boolean;
}

export const ChallengeWorkbench: React.FC<ChallengeWorkbenchProps> = ({
  challenge,
  lessonTitle,
  isGeneric = false,
}) => {
  const [code, setCode] = useState(challenge.starterCode);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);
  const [testingStatus, setTestingStatus] = useState<
    "idle" | "running" | "passed" | "failed"
  >("idle");
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // AI Evaluation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    score: number;
    verdict: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // There is no sandbox in the app, so nothing here executes the learner's
  // code. This is a local readiness check, and it says so rather than
  // printing invented pass marks, timings and memory figures.
  const handleRunTests = () => {
    setTestingStatus("running");
    setTestOutput("Checking your draft…");

    setTimeout(() => {
      const untouched =
        code.trim() === challenge.starterCode.trim() ||
        code.includes("// TODO");

      if (untouched) {
        setTestingStatus("failed");
        setTestOutput(
          `The starter template still has its TODO in place.\n\nWhat this check does: it only looks at whether you have written something yet — your code is not executed here.\n\nTarget behaviour: ${
            challenge.testCases[0]?.description || "see the objective above"
          }\nExpected output: ${
            challenge.testCases[0]?.expectedOutput || "see the objective above"
          }`
        );
      } else {
        setTestingStatus("passed");
        setTestOutput(
          `Your draft is ready to review.\n\nYour code is not executed here, so this is not a pass: run it in your own editor against the case below, then send it for review.\n\nTarget behaviour: ${
            challenge.testCases[0]?.description || "see the objective above"
          }\nExpected output: ${
            challenge.testCases[0]?.expectedOutput || "see the objective above"
          }`
        );
      }
    }, 300);
  };

  const handleRevealNextHint = () => {
    if (revealedHints < challenge.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  const handleAskAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/classroom/evaluate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeTitle: challenge.title,
          objective: challenge.objective,
          userCode: code,
          solutionCode: challenge.solutionCode,
          lessonTitle,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : res.status === 401
              ? "Sign in to have your code reviewed."
              : "Could not review your code just now. Please try again."
        );
      }
      const data = await res.json();
      setAiFeedback(data);
      setAiError(null);
    } catch (err) {
      // No invented score: an earlier version returned a flat 85 whenever the
      // reviewer was unreachable, grading work nothing had read.
      setAiFeedback(null);
      setAiError(
        err instanceof Error
          ? err.message
          : "Could not review your code just now. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Challenge Header & Objective */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                challenge.difficulty === "HARD"
                  ? "bg-rose-500/10 text-rose-500"
                  : challenge.difficulty === "MEDIUM"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {challenge.difficulty} Lab
            </span>
            <span className="text-xs text-muted-foreground">
              Learn-by-Building Exercise
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAskAi}
              disabled={aiLoading}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
            >
              {aiLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Ask AI Reviewer
            </button>
          </div>
        </div>

        <h3 className="mt-2 font-display text-lg font-bold text-foreground">
          {challenge.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {challenge.description}
        </p>

        <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-xs font-semibold text-foreground">
            🎯 Target Objective:
          </p>
          <p className="text-xs text-muted-foreground">{challenge.objective}</p>
        </div>
      </div>

      {/* Interactive Code / Problem Workbench */}
      <div className="overflow-hidden rounded-xl border border-border bg-black/90">
        <div className="flex items-center justify-between border-b border-border/40 bg-zinc-900 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              workbench.{challenge.language || "ts"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCode(challenge.starterCode)}
              className="rounded px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              Reset
            </button>
            <button
              onClick={handleRunTests}
              disabled={testingStatus === "running"}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {testingStatus === "running" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Check my draft
            </button>
          </div>
        </div>

        <textarea
          rows={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full bg-transparent p-4 font-mono text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />

        {/* Console / Test Output */}
        {testOutput && (
          <div className="border-t border-border/40 bg-zinc-950 p-4">
            <div className="flex items-center gap-2 pb-2 text-xs font-semibold text-zinc-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>Test Runner Output:</span>
            </div>
            <pre
              className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${
                testingStatus === "passed"
                  ? "text-emerald-400"
                  : testingStatus === "failed"
                    ? "text-rose-400"
                    : "text-zinc-300"
              }`}
            >
              {testOutput}
            </pre>
          </div>
        )}
      </div>

      {isGeneric && (
        <p className="text-xs text-muted-foreground">
          A general practice exercise for this topic area, not written from this
          specific lecture.
        </p>
      )}

      {aiError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-medium text-destructive">{aiError}</p>
        </div>
      )}

      {/* AI Feedback Panel */}
      {aiFeedback && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">
                AI Pedagogical Review
              </h4>
            </div>
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              Score: {aiFeedback.score}/100
            </span>
          </div>

          <p className="mt-2 text-xs font-medium text-foreground">
            {aiFeedback.verdict}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" /> What you did well
              </p>
              <ul className="mt-1 list-disc pl-4 text-[11px] text-muted-foreground space-y-0.5">
                {aiFeedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <XCircle className="h-3.5 w-3.5" /> How to refine
              </p>
              <ul className="mt-1 list-disc pl-4 text-[11px] text-muted-foreground space-y-0.5">
                {aiFeedback.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hints & Solutions (Scaffolded Learning) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">
              Scaffolded Hints ({revealedHints}/{challenge.hints.length})
            </span>
          </div>

          <button
            onClick={handleRevealNextHint}
            disabled={revealedHints >= challenge.hints.length}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-40"
          >
            {revealedHints >= challenge.hints.length
              ? "All hints unlocked"
              : "Need a hint?"}
          </button>
        </div>

        {revealedHints > 0 && (
          <div className="space-y-2">
            {challenge.hints.slice(0, revealedHints).map((hint, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-foreground"
              >
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Hint {idx + 1}
                </span>
                <span>{hint}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reference Solution Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowSolution((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>
              {showSolution
                ? "Hide Reference Solution"
                : "Reveal Reference Solution & Breakdown"}
            </span>
          </button>

          {showSolution && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border bg-secondary/50 px-4 py-2 text-xs font-semibold text-foreground">
                Authoritative Reference Implementation
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs text-foreground bg-zinc-950 text-zinc-100">
                {challenge.solutionCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

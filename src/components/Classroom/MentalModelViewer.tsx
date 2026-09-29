"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Network,
  Bot,
  Zap,
} from "lucide-react";
import type { LessonDiagram } from "../../../types/course";
import { useTutorContext } from "@/Helper/TutorContext";

interface MentalModelViewerProps {
  diagram: LessonDiagram;
  lessonTitle?: string;
}

export const MentalModelViewer: React.FC<MentalModelViewerProps> = ({
  diagram,
  lessonTitle,
}) => {
  const [viewMode, setViewMode] = useState<"stepper" | "topology">("stepper");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    diagram.nodes[0]?.id || null
  );

  const { askTutorWithPrompt, setIsOpen: setTutorOpen } = useTutorContext();

  const totalSteps = diagram.nodes.length;
  const activeNode = diagram.nodes[currentStep] || diagram.nodes[0];

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1 < totalSteps ? prev + 1 : 0));
  }, [totalSteps]);

  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev - 1 >= 0 ? prev - 1 : totalSteps - 1));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Auto-play interval for temporal state machine visualization
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      handleNextStep();
    }, 2800);

    return () => clearInterval(timer);
  }, [isPlaying, handleNextStep]);

  // Sync selectedNode when in stepper mode
  useEffect(() => {
    if (activeNode) {
      setSelectedNodeId(activeNode.id);
    }
  }, [activeNode]);

  const handleAskTutorAboutState = () => {
    if (!activeNode) return;
    const prompt = `Can you give me an intuitive explanation of the mental model state at Step ${
      currentStep + 1
    } ("${activeNode.label}") for the lesson "${
      lessonTitle || diagram.title
    }"? Specifically: what state invariants change here, and why does this lead to the next step?`;

    setTutorOpen(true);
    askTutorWithPrompt(prompt);
  };

  const incomingConnections = diagram.connections.filter(
    (c) => c.to === activeNode?.id
  );
  const outgoingConnections = diagram.connections.filter(
    (c) => c.from === activeNode?.id
  );

  return (
    <div className="space-y-6">
      {/* Header with Dual-Coding Mode Switcher */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-sky-500">
                {diagram.type.toUpperCase()} DUAL-CODING MODEL
              </span>
              <span className="text-xs text-muted-foreground">
                Paivio (1986) &amp; Mayer (2009)
              </span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-foreground">
              {diagram.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {diagram.caption}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex shrink-0 rounded-lg border border-border bg-secondary/60 p-1">
            <button
              type="button"
              onClick={() => setViewMode("stepper")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "stepper"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>State Machine Stepper</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("topology")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "topology"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="h-3.5 w-3.5 text-sky-500" />
              <span>Full Topology</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Interactive State Machine Stepper */}
      {viewMode === "stepper" && (
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm sm:p-7">
          {/* Stepper Timeline & Playback Controls */}
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {currentStep + 1}
              </span>
              <span className="font-display text-sm font-bold text-foreground">
                Phase {currentStep + 1} of {totalSteps}: {activeNode?.label}
              </span>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                title="Restart from Phase 1"
                className="rounded-lg border border-border bg-secondary/60 p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevStep}
                title="Previous Phase"
                className="rounded-lg border border-border bg-secondary/60 p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-transform hover:opacity-90 active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Auto-Step</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                title="Next Phase"
                className="rounded-lg border border-border bg-secondary/60 p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Track */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {diagram.nodes.map((node, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setCurrentStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary"
                      : isPast
                        ? "border-border/80 bg-secondary/40 text-muted-foreground"
                        : "border-border/40 bg-card/40 text-muted-foreground/60 hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isPast
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium">{node.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active State Deep-Dive Card */}
          {activeNode && (
            <div className="mt-6 rounded-2xl border border-primary/30 bg-background/90 p-5 shadow-inner sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      activeNode.category === "input"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : activeNode.category === "process"
                          ? "bg-sky-500/10 text-sky-500"
                          : activeNode.category === "output"
                            ? "bg-indigo-500/10 text-indigo-500"
                            : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {activeNode.category || "state node"}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Node ID: <code className="font-mono">{activeNode.id}</code>
                  </span>
                </div>

                {/* Socratic Escalation Button */}
                <button
                  type="button"
                  onClick={handleAskTutorAboutState}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  <Bot className="h-3.5 w-3.5" />
                  Ask Nova Tutor About this Phase
                </button>
              </div>

              <h4 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {activeNode.label}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {activeNode.subtext ||
                  "This phase coordinates the algorithmic execution and validates state prerequisites before proceeding."}
              </p>

              {/* State Invariant Transitions Row */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Incoming Transitions */}
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5 rotate-180 text-sky-500" />
                    <span>Incoming State Transitions</span>
                  </div>
                  {incomingConnections.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {incomingConnections.map((conn, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <span className="font-mono text-muted-foreground">
                            {conn.from}
                          </span>
                          <span className="text-[11px] font-medium text-sky-500">
                            {conn.label || "triggers"} →
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Initial entry state (no preceding transitions)
                    </p>
                  )}
                </div>

                {/* Outgoing Transitions */}
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Outgoing State Transitions</span>
                  </div>
                  {outgoingConnections.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {outgoingConnections.map((conn, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-secondary/50 px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <span className="text-[11px] font-medium text-emerald-500">
                            → {conn.label || "yields"}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {conn.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Terminal state (pipeline complete)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Full Topology Network Graph */}
      {viewMode === "topology" && (
        <div className="rounded-xl border border-border bg-secondary/20 p-6">
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Layers className="h-4 w-4 text-primary" /> Full Concept
              Progression Map
            </span>
            <span>
              Click any node to inspect invariants &amp; state changes
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {diagram.nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50 hover:bg-secondary/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          node.category === "input"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : node.category === "process"
                              ? "bg-sky-500/10 text-sky-500"
                              : node.category === "output"
                                ? "bg-indigo-500/10 text-indigo-500"
                                : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {node.category || "concept"}
                      </span>
                    </div>

                    <h4 className="mt-3 font-display text-sm font-bold text-foreground">
                      {node.label}
                    </h4>
                    {node.subtext && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {node.subtext}
                      </p>
                    )}
                  </div>

                  {index < diagram.nodes.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-xs">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Node Deep-Dive Card in Topology View */}
          {selectedNodeId && (
            <div className="mt-6 rounded-xl border border-primary/20 bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h4 className="font-display text-sm font-bold text-foreground">
                    Deep-Dive:{" "}
                    {diagram.nodes.find((n) => n.id === selectedNodeId)?.label}
                  </h4>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {diagram.nodes.find((n) => n.id === selectedNodeId)?.subtext ||
                  "This phase coordinates the input parameters and validates state prerequisites before proceeding."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-foreground">
                  Related Transitions:
                </span>
                {diagram.connections
                  .filter(
                    (c) => c.from === selectedNodeId || c.to === selectedNodeId
                  )
                  .map((conn, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {conn.from} → {conn.to}{" "}
                      {conn.label ? `(${conn.label})` : ""}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mental Model Cognitive Takeaways */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Key Structural
          Invariants
        </h4>
        <ul className="mt-3 space-y-2">
          {diagram.takeaways.map((takeaway, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

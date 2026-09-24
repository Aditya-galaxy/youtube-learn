"use client";

import React, { useState } from "react";
import {
  Network,
  ArrowRight,
  Info,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import type { LessonDiagram } from "../../../types/course";

interface MentalModelViewerProps {
  diagram: LessonDiagram;
}

export const MentalModelViewer: React.FC<MentalModelViewerProps> = ({
  diagram,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    diagram.nodes[0]?.id || null
  );

  const selectedNode =
    diagram.nodes.find((n) => n.id === selectedNodeId) || diagram.nodes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-sky-500 uppercase">
            {diagram.type.toUpperCase()} MODEL
          </span>
          <span className="text-xs text-muted-foreground">
            Dual Coding Visual Framework
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold text-foreground">
          {diagram.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{diagram.caption}</p>
      </div>

      {/* Visual Node Diagram Flow */}
      <div className="rounded-xl border border-border bg-secondary/20 p-6">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Layers className="h-4 w-4 text-primary" /> Concept Progression Map
          </span>
          <span>Click any node to inspect invariants & state changes</span>
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
      </div>

      {/* Selected Node Deep-Dive Card */}
      {selectedNode && (
        <div className="rounded-xl border border-primary/20 bg-card p-5">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-display text-sm font-bold text-foreground">
              Deep-Dive: {selectedNode.label}
            </h4>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {selectedNode.subtext ||
              "This phase coordinates the input parameters and validates state prerequisites before proceeding."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-foreground">
              Related Transitions:
            </span>
            {diagram.connections
              .filter(
                (c) => c.from === selectedNode.id || c.to === selectedNode.id
              )
              .map((conn, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {conn.from} → {conn.to} {conn.label ? `(${conn.label})` : ""}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Mental Model Takeaways */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 font-display text-xs font-bold text-foreground uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-primary" /> Cognitive Takeaways
        </h4>
        <ul className="mt-3 space-y-2">
          {diagram.takeaways.map((takeaway, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import {
  ExternalLink,
  BookOpen,
  GitBranch,
  FileCode,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { DeepDiveResource } from "../../../types/course";

interface CuratedDeepDivesProps {
  resources: DeepDiveResource[];
  lessonTitle: string;
}

export const CuratedDeepDives: React.FC<CuratedDeepDivesProps> = ({
  resources,
  lessonTitle,
}) => {
  const getResourceIcon = (type: DeepDiveResource["type"]) => {
    switch (type) {
      case "github":
        return <GitBranch className="h-4 w-4" />;
      case "ocw":
        return <GraduationCap className="h-4 w-4" />;
      case "playground":
        return <FileCode className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-500 uppercase">
            OPEN RESOURCE VAULT
          </span>
          <span className="text-xs text-muted-foreground">
            Curated Deep-Dives & Tooling
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold text-foreground">
          Further Reading & Artifacts: {lessonTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Explore production codebases, academic university lecture notes, and
          interactive sandboxes beyond the video.
        </p>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {resources.map((res) => (
          <a
            key={res.id}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-secondary/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                  {getResourceIcon(res.type)}
                  {res.badge || "Resource"}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>

              <h4 className="mt-3 font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {res.title}
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {res.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-medium text-primary flex items-center gap-1">
              <span>Open in new tab</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

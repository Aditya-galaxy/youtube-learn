"use client";
import React from "react";
import { LearningProgressCardProps } from "./types";

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  progress,
}) => {
  if (!progress || Object.keys(progress).length === 0) return null;

  return (
    <section className="rounded-lg bg-card p-8">
      <p className="eyebrow">Progress</p>
      <div className="mt-6 space-y-6">
        {Object.entries(progress).map(([skill, value]) => (
          <div key={skill}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm tracking-tightish text-foreground">
                {skill}
              </span>
              <span className="font-display text-lg tracking-display text-muted-foreground">
                {value}%
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

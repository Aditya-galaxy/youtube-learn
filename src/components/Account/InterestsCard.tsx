"use client";
import React from "react";
import { InterestsCardProps } from "./types";

export const InterestsCard: React.FC<InterestsCardProps> = ({ interests }) => {
  if (!Array.isArray(interests) || interests.length === 0) return null;

  return (
    <section className="rounded-lg bg-card p-8">
      <p className="eyebrow">Interests</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <span
            key={interest}
            className="rounded-full bg-secondary px-3.5 py-1.5 text-sm tracking-tightish text-foreground"
          >
            {interest}
          </span>
        ))}
      </div>
    </section>
  );
};

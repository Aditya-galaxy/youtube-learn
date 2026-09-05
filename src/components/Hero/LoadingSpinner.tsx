"use client";
import React from "react";

/** Skeleton grid — matches the card layout so nothing jumps when data lands. */
const LoadingSpinner = () => (
  <div
    className="grid grid-cols-1 gap-x-6 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3"
    aria-busy="true"
    aria-label="Loading videos"
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-video rounded-lg bg-secondary" />
        <div className="mt-5 h-5 w-4/5 rounded-full bg-secondary" />
        <div className="mt-3 h-3 w-1/3 rounded-full bg-secondary" />
      </div>
    ))}
  </div>
);

export default LoadingSpinner;

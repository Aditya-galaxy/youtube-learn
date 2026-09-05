"use client";
import React from "react";

interface VideoHeaderProps {
  title: string;
  videoCount: number;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ title, videoCount }) => (
  <div>
    <p className="eyebrow">
      {videoCount} {videoCount === 1 ? "video" : "videos"}
    </p>
    <h1 className="mt-2 font-display text-4xl tracking-display text-foreground sm:text-5xl">
      {title}
    </h1>
  </div>
);

export default VideoHeader;

"use client";
import React from "react";

interface VideoHeaderProps {
  title: string;
  videoCount: number;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ title, videoCount }) => (
  <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
    {title}
    <span className="rounded-full bg-muted px-3 py-1 text-sm font-normal text-muted-foreground">
      {videoCount} {videoCount === 1 ? "video" : "videos"}
    </span>
  </h2>
);

export default VideoHeader;

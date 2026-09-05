"use client";

import React from "react";
import type { Video } from "../../../types/video";
import VideoCard from "./VideoCard";
import VideoHeader from "./VideoHeader";
import LoadingSpinner from "./LoadingSpinner";

interface VideoGridProps {
  title: string;
  videos: Video[];
  loading?: boolean;
  emptyMessage?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  title,
  videos,
  loading = false,
  emptyMessage = "No videos found.",
  footer,
  headerAction,
}) => (
  <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-10 sm:py-16">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
      <VideoHeader title={title} videoCount={videos.length} />
      {headerAction}
    </div>

    {loading ? (
      <LoadingSpinner />
    ) : videos.length === 0 ? (
      <p className="py-24 text-center text-sm tracking-tightish text-muted-foreground">
        {emptyMessage}
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    )}

    {footer}
  </section>
);

export default VideoGrid;

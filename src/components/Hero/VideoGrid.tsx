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
  /** Rendered under the grid — used by the feed for its infinite-scroll sentinel. */
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

/**
 * Presentational list of videos. Deliberately does no fetching: pages such as
 * Library and History render purely local collections through this, and used to
 * be forced through the API-backed feed instead, which meant a signed-in user's
 * "Library" showed the generic recommendation feed.
 */
const VideoGrid: React.FC<VideoGridProps> = ({
  title,
  videos,
  loading = false,
  emptyMessage = "No videos found.",
  footer,
  headerAction,
}) => (
  <section className="p-4 sm:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <VideoHeader title={title} videoCount={videos.length} />
      {headerAction}
    </div>

    {loading ? (
      <LoadingSpinner />
    ) : videos.length === 0 ? (
      <p className="py-12 text-center text-muted-foreground">{emptyMessage}</p>
    ) : (
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3 sm:gap-x-6 sm:gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    )}

    {footer}
  </section>
);

export default VideoGrid;

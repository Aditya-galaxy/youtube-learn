"use client";

import React from "react";
import type { Video } from "../../../types/video";
import { useAppContext } from "@/Helper/Context";
import { formatRelativeTime, formatViewCount } from "@/lib/utils";
import VideoActions from "./VideoActions";
import VideoThumbnail from "./VideoThumbnail";

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { openVideo } = useAppContext();

  return (
    <article className="group">
      <button
        type="button"
        onClick={() => openVideo(video)}
        className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        aria-label={`Play ${video.title}`}
      >
        <VideoThumbnail video={video} />
      </button>

      <div className="flex items-start justify-between gap-3 pt-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl leading-snug tracking-display text-foreground">
            <button
              type="button"
              onClick={() => openVideo(video)}
              className="text-left decoration-1 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {video.title}
            </button>
          </h2>

          <p className="mt-2 text-sm tracking-tightish text-muted-foreground">
            {video.channelName}
          </p>
          <p className="mt-1 text-xs tracking-tightish text-muted-foreground">
            {formatViewCount(video.views)} views ·{" "}
            {formatRelativeTime(video.publishedAt)}
            {video.watched && " · Watched"}
          </p>
        </div>

        <VideoActions video={video} />
      </div>
    </article>
  );
};

export default VideoCard;

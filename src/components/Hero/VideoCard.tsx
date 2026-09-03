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
    <article className="group relative overflow-hidden rounded-xl bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* The whole card used to be a plain div with onClick, so it could not be
          reached or activated with a keyboard. */}
      <button
        type="button"
        onClick={() => openVideo(video)}
        className="w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Play ${video.title}`}
      >
        <VideoThumbnail video={video} />
      </button>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="mr-2 line-clamp-2 flex-1 text-base font-semibold">
            <button
              type="button"
              onClick={() => openVideo(video)}
              className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {video.title}
            </button>
          </h3>
          <div className="flex-shrink-0">
            <VideoActions video={video} />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="font-medium">{video.channelName}</span>
          <div className="flex items-center gap-2">
            <span>{formatViewCount(video.views)} views</span>
            <span aria-hidden>•</span>
            <span>{formatRelativeTime(video.publishedAt)}</span>
            {video.watched && (
              <>
                <span aria-hidden>•</span>
                <span>Watched</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;

"use client";

import React from "react";
import Image from "next/image";
import { Clock, Play } from "lucide-react";
import type { Video } from "../../../types/video";
import { formatDuration } from "@/lib/utils";

interface VideoThumbnailProps {
  video: Video;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ video }) => (
  <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
    <Image
      src={video.thumbnail}
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
      <div className="flex h-12 w-12 transform items-center justify-center rounded-full bg-purple-500 transition-transform group-hover:scale-110">
        <Play className="h-5 w-5 text-white" />
      </div>
    </div>
    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
      <Clock className="h-3 w-3" />
      {formatDuration(video.duration)}
    </span>
  </div>
);

export default VideoThumbnail;

"use client";

import React from "react";
import Image from "next/image";
import type { Video } from "../../../types/video";
import { formatDuration } from "@/lib/utils";

interface VideoThumbnailProps {
  video: Video;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ video }) => (
  <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
    <Image
      src={video.thumbnail}
      alt=""
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
    />
    <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs tracking-tightish text-foreground backdrop-blur-sm">
      {formatDuration(video.duration)}
    </span>
  </div>
);

export default VideoThumbnail;

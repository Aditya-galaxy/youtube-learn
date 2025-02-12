"use client"
import React from 'react';

interface VideoHeaderProps {
  title: string;
  videoCount: number;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ title, videoCount }) => {
  return(
  <h2 className="text-2xl font-semibold mb-8 text-white/90 flex items-center gap-2">
    {title}
    <span className="text-sm font-normal text-white/50 bg-white/5 px-3 py-1 rounded-full">
      {videoCount} videos
    </span>
  </h2 >
  );
};

export default VideoHeader;
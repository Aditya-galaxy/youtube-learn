"use client"
import React from 'react';
import { Video } from '../../../types/video';
import { Play, Clock } from 'lucide-react';

interface VideoThumbnailProps {
  video: Video;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ video }) => {
    return (
        <div className="relative rounded-xl overflow-hidden bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white" />
                    </div>
                </div>
                <span className="absolute bottom-3 right-3 bg-black/70 text-white/90 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                </span>
        </div>
  );
};

export default VideoThumbnail;
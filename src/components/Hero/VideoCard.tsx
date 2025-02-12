"use client"
import React from 'react';
import { Video } from '@/Helper/Context';
import { useAppContext } from '@/Helper/Context';
import VideoThumbnail from './VideoThumbnail';
import VideoActions from './VideoActions';
import { useParams } from 'next/navigation';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    const { handleVideoClick } = useAppContext();

    return (
    <div 
      className="group cursor-pointer"
      onClick={() => handleVideoClick(video)}
    >
      <VideoThumbnail video={video} />
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-sm text-white/90 line-clamp-2 group-hover:text-purple-400 transition-colors flex-1">
            {video.title}
          </h3>
          <VideoActions video={video} />
        </div>
        <p className="text-sm text-white/50">
          {video.channelName}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>{video.views} views</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>{video.publishedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
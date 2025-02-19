import React from 'react';
import { Video } from '../../../types/video';
import { useAppContext } from '@/Helper/Context';
import VideoThumbnail from './VideoThumbnail';
import VideoActions from './VideoActions';
import { formatViewCount } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { handleVideoClick } = useAppContext();

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div 
        className="cursor-pointer"
        onClick={() => handleVideoClick(video)}
      >
        <VideoThumbnail video={video} />
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold line-clamp-2 text-base flex-1 mr-2">
              {video.title}
            </h3>
            <div className="flex-shrink-0">
              <VideoActions video={video} />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
            <span className="font-medium hover:text-foreground transition-colors">
              {video.channelName}
            </span>
            <div className="flex items-center gap-2">
              <span>{formatViewCount(video.views)} views</span>
              <span>•</span>
              <span>{video.publishedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
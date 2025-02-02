import React from 'react';
import { useAppContext } from '@/Helper/Context';
import { Video } from '@/Helper/Context';
import { Play, Clock, MoreVertical, Bookmark, Library } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface HeroProps {
  title: string;
  videos: Video[];
}

const Hero: React.FC<HeroProps> = ({ videos, title }) => {
  const { loading, handleVideoClick, addVideoToLibrary } = useAppContext();

  const handleAddToLibrary = (e: React.MouseEvent, video:Video) => {
    e.stopPropagation();
    addVideoToLibrary(video);
  };

  return (
    <div className="p-8 ml-12">
      <h2 className="text-2xl font-semibold mb-8 text-white/90 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-white/50 bg-white/5 px-3 py-1 rounded-full">
          {videos.length} videos
        </span>
      </h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="group cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
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
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-medium text-sm text-white/90 line-clamp-2 group-hover:text-purple-400 transition-colors flex-1">
                    {video.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="mt-0.5 p-1 rounded-full hover:bg-white/10 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4 text-white/50 hover:text-white/90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem 
                        className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10"
                        onClick={(e) => handleAddToLibrary(e,video)}
                      >
                        <Library className="w-4 h-4" />
                        Add to Library
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Hero;
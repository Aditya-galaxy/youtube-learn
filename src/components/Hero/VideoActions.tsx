"use client"
import React from 'react';
import { Video } from '@/Helper/Context';
import { MoreVertical, Library } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/Helper/Context';

interface VideoActionsProps {
  video: Video;
}

const VideoActions: React.FC<VideoActionsProps> = ({ video }) => {
    const { addVideoToLibrary } = useAppContext();
    const { toast } = useToast();

    const handleAddToLibrary = (e: React.MouseEvent) => {
        e.stopPropagation();
        addVideoToLibrary(video);
        toast({
            title: 'Success!',
            description: `Video "${video.title}" has been added to library`,
            duration: 3000
        });
    };

    return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="mt-0.5 p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-0 focus:ring-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4 text-white/50 hover:text-white/90" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800">
        <DropdownMenuItem 
          className="flex items-center gap-2 text-sm text-white/90 hover:text-white hover:bg-white/10 focus:outline-none"
          onClick={handleAddToLibrary}
        >
          <Library className="w-4 h-4 focus:outline-none" />
          Add to Library
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VideoActions;

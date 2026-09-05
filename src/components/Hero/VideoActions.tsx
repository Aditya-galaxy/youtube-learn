"use client";

import React from "react";
import { Bookmark, Check, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/Helper/Context";
import type { Video } from "../../../types/video";

interface VideoActionsProps {
  video: Video;
}

const VideoActions: React.FC<VideoActionsProps> = ({ video }) => {
  const { toggleLibrary, toggleSaved, isInLibrary, isSaved } = useAppContext();
  const { toast } = useToast();

  const inLibrary = isInLibrary(video.id);
  const saved = isSaved(video.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="-mr-1 mt-1 shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`More actions for ${video.title}`}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-md">
        <DropdownMenuItem
          className="gap-2.5 rounded-sm text-sm tracking-tightish"
          onClick={() => {
            const added = toggleLibrary(video);
            toast({
              title: added ? "Added to library" : "Removed from library",
              description: video.title,
              duration: 3000,
            });
          }}
        >
          {inLibrary ? (
            <Check className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          )}
          {inLibrary ? "Remove from Library" : "Add to Library"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 rounded-sm text-sm tracking-tightish"
          onClick={() => {
            const added = toggleSaved(video);
            toast({
              title: added ? "Saved" : "Removed from saved",
              description: video.title,
              duration: 3000,
            });
          }}
        >
          <Bookmark
            className="h-4 w-4"
            strokeWidth={1.75}
            fill={saved ? "currentColor" : "none"}
          />
          {saved ? "Remove from Saved" : "Save for later"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VideoActions;

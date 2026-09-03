"use client";

import React from "react";
import { Bookmark, BookmarkCheck, Library, LibraryBig, MoreVertical } from "lucide-react";
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

  // Both actions are toggles now: previously "Add to Library" was one-way, so a
  // video added by mistake could not be removed from the UI at all.
  const handleLibrary = () => {
    const added = toggleLibrary(video);
    toast({
      title: added ? "Added to library" : "Removed from library",
      description: video.title,
      duration: 3000,
    });
  };

  const handleSave = () => {
    const added = toggleSaved(video);
    toast({
      title: added ? "Saved" : "Removed from saved",
      description: video.title,
      duration: 3000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="mt-0.5 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`More actions for ${video.title}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem className="gap-2" onClick={handleLibrary}>
          {inLibrary ? (
            <LibraryBig className="h-4 w-4" />
          ) : (
            <Library className="h-4 w-4" />
          )}
          {inLibrary ? "Remove from Library" : "Add to Library"}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={handleSave}>
          {saved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {saved ? "Remove from Saved" : "Save for later"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VideoActions;

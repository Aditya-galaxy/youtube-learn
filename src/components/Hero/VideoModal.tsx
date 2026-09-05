"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAppContext } from "@/Helper/Context";
import { formatRelativeTime, formatViewCount } from "@/lib/utils";

const VideoModal = () => {
  const { selectedVideo, closeVideo } = useAppContext();

  return (
    <Dialog
      open={selectedVideo !== null}
      onOpenChange={(open) => {
        if (!open) closeVideo();
      }}
    >
      <DialogContent className="overflow-hidden border-border bg-card p-0 sm:max-w-3xl">
        {selectedVideo && (
          <>
            <div className="relative pt-[56.25%]">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="absolute left-0 top-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="px-7 pb-8 pt-6">
              <DialogHeader>
                <DialogTitle className="text-left font-display text-2xl leading-snug tracking-display text-foreground">
                  {selectedVideo.title}
                </DialogTitle>
              </DialogHeader>
              <p className="mt-3 text-sm tracking-tightish text-muted-foreground">
                {selectedVideo.channelName} ·{" "}
                {formatViewCount(selectedVideo.views)} views ·{" "}
                {formatRelativeTime(selectedVideo.publishedAt)}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;

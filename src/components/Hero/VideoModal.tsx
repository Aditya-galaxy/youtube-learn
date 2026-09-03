"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAppContext } from "@/Helper/Context";
import { formatRelativeTime, formatViewCount } from "@/lib/utils";

/**
 * Rendered once, from the root layout.
 *
 * It used to be rendered by the layout *and* by the feed, so opening a video
 * mounted two players bound to the same state and both started playing — the
 * "double sound" this file previously worked around by reaching into the DOM
 * and calling `iframe.remove()` on nodes React owned. Unmounting the dialog
 * content stops playback on its own.
 */
const VideoModal = () => {
  const { selectedVideo, closeVideo } = useAppContext();

  return (
    <Dialog
      open={selectedVideo !== null}
      onOpenChange={(open) => {
        if (!open) closeVideo();
      }}
    >
      <DialogContent className="bg-background p-0 sm:max-w-[800px]">
        {selectedVideo && (
          <>
            <DialogHeader className="p-4 pb-0 text-foreground">
              <DialogTitle className="pr-8 text-lg font-semibold">
                {selectedVideo.title}
              </DialogTitle>
            </DialogHeader>

            <div className="relative mt-4 pt-[56.25%]">
              <iframe
                // `origin` was read from window during render, which breaks
                // server rendering; the embed does not need it without the JS API.
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="absolute left-0 top-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4">
              <h3 className="font-medium text-foreground">
                {selectedVideo.channelName}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatViewCount(selectedVideo.views)} views •{" "}
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

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/Helper/Context";
import VideoGrid from "./Hero/VideoGrid";

const History = () => {
  const { watched, clearWatched } = useAppContext();

  return (
    <VideoGrid
      title="Watch History"
      videos={watched}
      emptyMessage="Nothing here yet. Videos you open show up in your history."
      headerAction={
        watched.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clearWatched}>
            Clear history
          </Button>
        ) : null
      }
    />
  );
};

export default History;

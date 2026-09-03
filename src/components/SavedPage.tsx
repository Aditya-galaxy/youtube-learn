"use client";

import React from "react";
import { useAppContext } from "@/Helper/Context";
import VideoGrid from "./Hero/VideoGrid";

/**
 * Backed by the videos the user actually saved. This page previously rendered a
 * hardcoded list of three fictional items regardless of user or state.
 */
export const SavedPage = () => {
  const { saved } = useAppContext();

  return (
    <VideoGrid
      title="Saved Items"
      videos={saved}
      emptyMessage='Nothing saved yet. Use the "..." menu on any video to save it.'
    />
  );
};

export default SavedPage;

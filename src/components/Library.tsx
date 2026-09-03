"use client";

import React from "react";
import { useAppContext } from "@/Helper/Context";
import VideoGrid from "./Hero/VideoGrid";

const Library = () => {
  const { library } = useAppContext();

  return (
    <VideoGrid
      title="Library"
      videos={library}
      emptyMessage='Your library is empty. Use the "..." menu on any video to add it.'
    />
  );
};

export default Library;

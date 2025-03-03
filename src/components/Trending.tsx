"use client"
import React from 'react';
import { useAppContext } from '../Helper/Context';
import Hero from '../components/Hero/Hero';

const Trending = () => {
  const context = useAppContext();
  const { videos } = context;

  // Filter trending videos (example: videos with > 400K views)
  const trendingVideos = videos.filter(video => video.views > "100K");

  return (
    <Hero title="Trending" contextVideos={ trendingVideos} />
  );
};

export default Trending;
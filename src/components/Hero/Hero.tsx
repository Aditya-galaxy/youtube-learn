"use client"
import React from 'react';
import { useAppContext } from '@/Helper/Context';
import { Video } from '@/Helper/Context';
import VideoHeader from './VideoHeader';
import LoadingSpinner from './LoadingSpinner';
import VideoCard from './VideoCard';

interface HeroProps {
  title: string;
  videos: Video[];
}

const Hero: React.FC<HeroProps> = ({ videos, title }) => {
  const { loading } = useAppContext();

  return (
    <div className="p-8 ml-12 bg-background/70 backdrop-blur-xl min-h-screen">
      <VideoHeader title={title} videoCount={videos.length} />
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Hero;
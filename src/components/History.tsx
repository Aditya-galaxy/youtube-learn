import React, { useContext } from 'react';
import { useAppContext } from '../Helper/Context';
import Hero from '../components/Hero/Hero';

const History = () => {
  const { videos } = useAppContext();

  // Filter watched videos
  const watchedVideos = videos.filter(video => video.watched==true);

  return (
    <Hero title="Watch History" contextVideos={watchedVideos}/>
  );
};

export default History;
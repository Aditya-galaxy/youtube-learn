import React from 'react'
import Hero from '../components/Hero/Hero'
import { useAppContext } from '@/Helper/Context';

const Library = () => {
  const { videos } = useAppContext();
  const libVideos = videos.filter(video => video.inLibrary == true);
  
  return (
    <Hero title='Library' contextVideos={libVideos}/>
  )
}

export default Library
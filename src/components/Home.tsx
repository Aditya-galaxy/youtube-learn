import React from 'react'
import Hero from '../components/Hero/Hero'
import { useAppContext } from '@/Helper/Context'

const Home = () => {
    const { videos } = useAppContext();
    
    return (
        <Hero contextVideos={videos} title='Recommended Videos' />
    )
}

export default Home
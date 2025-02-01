import React from 'react'
import Hero from '../components/Hero'
import { useAppContext } from '@/Helper/Context'

const Home = () => {
    const { videos } = useAppContext();
    return (
        <Hero videos={videos} title='Recommended Videos' />
    )
}

export default Home
import React, { useEffect } from 'react';
import { useAppContext } from '@/Helper/Context';
import Hero from './Hero/Hero';
import { useSearchParams } from 'react-router-dom';

const SearchResults: React.FC = () => {
  const { videos,searchQuery, setSearchQuery } = useAppContext();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, setSearchQuery]);

  const titleMessage = searchQuery 
    ? `Educational Content: "${searchQuery}"`
    : 'Recommended Educational Videos';

  return <Hero title={titleMessage} contextVideos={videos}/>;
};

export default SearchResults;
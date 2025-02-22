import React, { useEffect } from 'react';
import { useAppContext } from '@/Helper/Context';
import Hero from './Hero/Hero';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from './Hero/LoadingSpinner';
import { useSession } from 'next-auth/react';

const SearchResults: React.FC = () => {
  const { 
    setSearchQuery, 
    videos: contextVideos, 
    filteredSearchVideos,
    loading,
    handleSearch 
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams, setSearchQuery, handleSearch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const titleMessage = searchParams.get('q')
    ? `Search Results: "${searchParams.get('q')}"`
    : 'Recommended Educational Videos';

  const displayVideos = searchParams.get('q') 
    ? filteredSearchVideos 
    : contextVideos;

  return <Hero title={titleMessage} contextVideos={displayVideos} />;
};

export default SearchResults;
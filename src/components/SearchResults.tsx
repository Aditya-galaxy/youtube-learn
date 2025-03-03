"use client"

import React, { useEffect } from 'react';
import { useAppContext } from '@/Helper/Context';
import Hero from './Hero/Hero';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    if (searchParams) {
      const query = searchParams.get('q');
      if (query) {
        setSearchQuery(query);
        handleSearch(query);
      }
    }
  }, [searchParams, setSearchQuery, handleSearch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const query = searchParams?.get('q') || '';
  const titleMessage = query 
    ? `Search Results: "${query}"`
    : 'Recommended Educational Videos';

  const displayVideos = query
    ? filteredSearchVideos 
    : contextVideos;

  return <Hero title={titleMessage} contextVideos={displayVideos} />;
};

export default SearchResults;
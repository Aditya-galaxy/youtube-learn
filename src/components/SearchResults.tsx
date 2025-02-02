import React from 'react';
import { useAppContext } from '@/Helper/Context';
import Hero from './Hero';

const SearchResults: React.FC = () => {
  const { filteredSearchVideos, searchQuery } = useAppContext();

  return (
    <Hero title={`Search Results for "${searchQuery}"`} videos={filteredSearchVideos} />
  );
};

export default SearchResults;
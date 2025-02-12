import React from 'react';
import { useAppContext } from '@/Helper/Context';
import Hero from './Hero/Hero';

const SearchResults: React.FC = () => {
  const { filteredSearchVideos, searchQuery } = useAppContext();
  const titleMessage= (searchQuery) ? `Search Results for "${searchQuery}"` : 'Recommended Videos'

  return (
    <Hero title={titleMessage} videos={filteredSearchVideos} />
  );
};

export default SearchResults;
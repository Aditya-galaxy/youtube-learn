import React, { useEffect, useState, use } from 'react';
import { useAppContext } from '@/Helper/Context';
import Hero from './Hero/Hero';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from './Hero/LoadingSpinner';
import { useSession } from 'next-auth/react';

const SearchResults: React.FC = () => {
  const { setSearchQuery, videos: contextVideos } = useAppContext();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      if (!session?.accessToken) {
        // If not authenticated, we don't need to fetch - Hero component will handle it
        setIsLoading(false);
        return;
      }
      fetchSearchResults(query);
    }
  }, [searchParams, session]);

  const fetchSearchResults = async (query: string) => {
    if (!session?.accessToken) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/videos?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.videos)) {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setIsLoading(false);
    }
  };

  const titleMessage = searchParams.get('q')
    ? `Search Results: "${searchParams.get('q')}"`
    : 'Recommended Educational Videos';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return <Hero title={titleMessage} />;
};

export default SearchResults;
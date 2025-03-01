"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useInView } from 'react-hook-inview';
import VideoHeader from './VideoHeader';
import LoadingSpinner from './LoadingSpinner';
import VideoCard from './VideoCard';
import VideoModal from './VideoModal';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/Helper/Context';
import { Video } from '../../../types/video';
import { formatDuration } from '@/lib/utils';
import './hero.css';

interface HeroProps {
  title: string;
  contextVideos: Video[];
}

const Hero: React.FC<HeroProps> = ({ title , contextVideos }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { searchQuery } = useAppContext();
  
  const [ref, inView] = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const filterContextVideos = (query: string) => {
    if (!query.trim()) {
      return contextVideos; // Return all videos if query is empty
    }
    return contextVideos.filter(video => {
      const searchTerms = query.toLowerCase().split(' ');
      const videoText = `${video.title} ${video.description} ${video.channelName}`.toLowerCase();
      return searchTerms.every(term => videoText.includes(term));
    });
  };

  const fetchVideos = async (loadMore = false, query?: string) => {
    if (!session?.accessToken) {
      // Handle unauthenticated users with context videos
      const filteredVideos = filterContextVideos(query || '');
      
      setVideos(filteredVideos);
      setLoading(false);
      return;
    }

    try {
      setIsLoadingMore(loadMore);
      
      const params = new URLSearchParams({
        refresh: 'true'
      });
      
      if (query) {
        params.append('q', query.trim());
      }

      if (loadMore && pageToken) {
        params.append('pageToken', pageToken);
      }
      
      const response = await fetch(`/api/videos?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }
      
      const data = await response.json();
      
      const formattedVideos = data.videos.map((video: Video) => ({
        ...video,
        duration: formatDuration(video.duration)
      }));
      
      const newVideos = formattedVideos.filter((newVideo: Video) => 
        !videos.some(existingVideo => existingVideo.id === newVideo.id)
      );
      
      setVideos(loadMore ? [...videos, ...newVideos] : newVideos);
      setPageToken(data.nextPageToken);
    } catch (error) {
      console.error('Video fetch error:', error);
      toast({
        title: 'Error fetching videos',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      // Fallback to context videos
      const filteredVideos = query 
        ? filterContextVideos(query)
        : contextVideos;
      setVideos(filteredVideos);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPageToken(undefined); // Reset page token when search query changes
    fetchVideos(false, searchQuery);
  }, [session, searchQuery]);

  useEffect(() => {
    if (inView && !loading && !isLoadingMore && pageToken) {
      fetchVideos(true, searchQuery);
    }
  }, [inView]);

  return (
    <div 
      className="hero p-4 sm:p-8 ml-4 sm:ml-12 bg-background/70 backdrop-blur-xl min-h-screen overflow-y-auto font-normal"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <VideoHeader 
          title={session ? title : 'Recommended Videos'} 
          videoCount={videos.length} 
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-full sm:max-w-[2000px] mx-auto">
          {videos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No videos found. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
          
          <div ref={ref} className="h-20 flex items-center justify-center mt-8">
            {isLoadingMore && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading more videos...</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        {!session && (
          <p>Sign in to see personalized recommendations</p>
        )}
      </div>

      <VideoModal />
    </div>
  );
};

export default Hero;
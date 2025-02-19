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

interface HeroProps {
    title: string;
}

const Hero: React.FC<HeroProps> = ({ title }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { videos: contextVideos, searchQuery } = useAppContext();
  
  const [ref, inView] = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const fetchVideos = async (loadMore = false, query?: string) => {
    if (!session?.accessToken) {
      // Handle unauthenticated users with context videos
      const filteredVideos = contextVideos.filter(video =>
        video.title.toLowerCase().includes((query || '').toLowerCase()) ||
        video.description.toLowerCase().includes((query || '').toLowerCase())
      );
      setVideos(filteredVideos);
      setLoading(false);
      return;
    }

    try {
      setIsLoadingMore(loadMore);
      
      // Build query parameters
      const params = new URLSearchParams({
        refresh: 'true'
      });
      
      if (query) {
        params.append('q', query.trim());
      }

      if (loadMore && pageToken) {
        params.append('pageToken', pageToken);
      }
      
      console.log(`Fetching videos with params: ${params.toString()}`);
      const response = await fetch(`/api/videos?${params.toString()}`);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch videos: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data.videos)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }
      
      const formattedVideos = data.videos.map((video: Video) => ({
        ...video,
        duration: formatDuration(video.duration)
      }));
      
      // Filter out duplicates when loading more
      const newVideos = formattedVideos.filter((newVideo: Video) => 
        !videos.some(existingVideo => existingVideo.id === newVideo.id)
      );
      
      setVideos(loadMore ? [...videos, ...newVideos] : newVideos);
      setPageToken(data.nextPageToken);

      // If no new videos were loaded, try loading more
      if (loadMore && newVideos.length === 0 && data.nextPageToken) {
        await fetchVideos(true, query);
      }
    } catch (error) {
      console.error('Video fetch error:', error);
      toast({
        title: 'Error fetching videos',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      if (!videos.length) {
        // Fallback to context videos only if we have no videos
        const filteredVideos = contextVideos.filter(video =>
          video.title.toLowerCase().includes((query || '').toLowerCase()) ||
          video.description.toLowerCase().includes((query || '').toLowerCase())
        );
        setVideos(filteredVideos);
      }
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
      className="p-4 sm:p-8 ml-4 sm:ml-12 bg-background/70 backdrop-blur-xl min-h-screen overflow-y-auto font-normal text-lg"
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
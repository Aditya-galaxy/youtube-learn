import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useAppContext } from '@/Helper/Context'

const VideoModal = () => {
  const { selectedVideo, setSelectedVideo } = useAppContext();
  const [iframeKey, setIframeKey] = useState(0); // Add state to force re-render

  // Clean up function to remove any existing iframes when modal closes
  useEffect(() => {
    return () => {
      const existingIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
      existingIframes.forEach(iframe => iframe.remove());
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // When closing, first remove the iframe to stop any sound
      const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
      iframes.forEach(iframe => iframe.remove());
      // Then update the state
      setSelectedVideo(null);
      setIframeKey(prevKey => prevKey + 1); // Force re-render by updating key
    }
  };

  // Create iframe source with additional parameters to better control playback
  const getIframeSrc = () => {
    if (!selectedVideo) return '';
    return `https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;
  };

  return (
    <Dialog 
      open={selectedVideo !== null} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[800px] bg-background p-0">
        <DialogHeader className="p-4 text-foreground pb-0">
          <DialogTitle className="text-lg font-semibold pr-8">
            {selectedVideo?.title}
          </DialogTitle>
        </DialogHeader>
        
        {selectedVideo && (
          <div className="relative pt-[56.25%] mt-4">
            <iframe
              key={iframeKey} // Use state key to force re-render
              src={getIframeSrc()}
              title={selectedVideo.title}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {selectedVideo && (
          <div className="p-4">
            <h3 className="font-medium text-foreground">{selectedVideo.channelName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedVideo.views} views • {selectedVideo.publishedAt}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VideoModal
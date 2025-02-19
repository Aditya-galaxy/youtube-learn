import React, { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useAppContext } from '@/Helper/Context'

const VideoModal = () => {
  const { selectedVideo, setSelectedVideo } = useAppContext();
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      cleanupIframes();
    };
  }, []);

  // Clean up when video changes
  useEffect(() => {
    if (!selectedVideo) {
      cleanupIframes();
    }
  }, [selectedVideo]);

  const cleanupIframes = () => {
    // Remove only iframes that aren't the current one
    const existingIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    existingIframes.forEach(iframe => {
      if (iframe !== iframeRef.current) {
        iframe.remove();
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Stop video playback by setting src to empty
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
      // Clean up iframes
      cleanupIframes();
      // Update state
      setSelectedVideo(null);
      setIframeKey(prevKey => prevKey + 1);
    }
  };

  const getIframeSrc = () => {
    if (!selectedVideo) return '';
    // Add additional parameters to prevent autoplay issues
    return `https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}&playsinline=1&rel=0&mute=1`;
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
              ref={iframeRef}
              key={iframeKey}
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
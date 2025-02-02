import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAppContext } from '@/Helper/Context'
import { Button } from './ui/button';
import { X } from 'lucide-react';

const VideoModal = () => {
  const { selectedVideo, setSelectedVideo } = useAppContext();

  const handleClose = () => {
    setSelectedVideo(null);
  };

  return (
    <Dialog 
        open={selectedVideo !== null} 
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      >
        <DialogContent className="sm:max-w-[800px] bg-black p-0">
          <DialogHeader className="p-4 text-white pb-0">
            <DialogTitle className="text-lg text-white font-semibold pr-8">
              {selectedVideo?.title}
            </DialogTitle>
            {/* <Button
              onClick={handleClose}
              variant="ghost"
              className="absolute right-4 top-4 p-0 h-auto w-auto text-white hover:bg-gray-800"
            >
            <X className="h-5 w-5" />
            </Button> */}
          </DialogHeader>
          
          
          {selectedVideo && (
            <div className="relative pt-[56.25%] mt-4">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {selectedVideo && (
            <div className="p-4">
              <h3 className="font-medium text-gray-50">{selectedVideo.channelName}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {selectedVideo.views} views • {selectedVideo.publishedAt}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
  )
}

export default VideoModal
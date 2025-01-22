import React, { useContext } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { AppContext } from '@/Helper/Context'
import { X } from 'lucide-react'

const VideoModal = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext is null");
    }
    const { selectedVideo, setSelectedVideo } = context;

    return (
    <Dialog 
        open={selectedVideo !== null} 
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      >
        <DialogContent className="sm:max-w-[800px] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-semibold pr-8">
              {selectedVideo?.title}
            </DialogTitle>
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
            <div className="p-4 border-t mt-4">
              <h3 className="font-medium">{selectedVideo.channelName}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVideo.views} views • {selectedVideo.publishedAt}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
  )
}

export default VideoModal
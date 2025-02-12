import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAppContext } from '@/Helper/Context'

const VideoModal = () => {
  const { selectedVideo, setSelectedVideo } = useAppContext();

  return (
    <Dialog 
      open={selectedVideo !== null} 
      onOpenChange={(open) => !open && setSelectedVideo(null)}
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
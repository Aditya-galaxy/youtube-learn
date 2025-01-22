import React, { useContext } from 'react'
import { AppContext } from '@/Helper/Context'

const Hero = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext is null");
    }
    const { loading, videos, handleVideoClick } = context;
  return (
    <main className="pt-16 pl-48 bg-black">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Recommended Videos</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-4 gap-y-8">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className="group cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {video.channelName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {video.views} views • {video.publishedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
  )
}

export default Hero
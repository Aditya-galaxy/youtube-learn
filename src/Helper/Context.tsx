"use client";
import React, {useState, useContext} from "react";
import { createContext } from "react";
import { ReactNode } from "react";

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  views: string;
  publishedAt: string;
  watched: boolean;
  inLibrary: boolean;
}

interface SearchEvent extends React.FormEvent<HTMLFormElement> { }

interface AppContextType {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  selectedVideo: Video | null;
  setSelectedVideo: React.Dispatch<React.SetStateAction<Video | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (e: SearchEvent) => void;
  handleVideoClick: (video: Video) => void;
  addVideoToLibrary: (video: Video) => void;
  removeVideoFromLibrary: (videoId: string) => void;
  filteredSearchVideos:Video[];
}

export const AppContext = createContext<AppContextType | null>(null);

const Context = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: '6wf5dIrryoQ', // Example YouTube video ID
      title: 'Introduction to React Hooks - Complete Guide 2024',
      thumbnail: 'https://img.youtube.com/vi/6wf5dIrryoQ/hqdefault.jpg',
      duration: '2:17:46',
      channelName: 'GreatStack',
      views: '125K',
      publishedAt: '7 months ago',
      watched: true,
      inLibrary:false
    },
    {
    id: 'JRHAM1nAuD4',
    title: 'Artificial Intelligence | Research and Which Majors to Pick',
    thumbnail: 'https://img.youtube.com/vi/JRHAM1nAuD4/hqdefault.jpg',
    duration: '18:32',
    channelName: 'Zach Star',
    views: '172K',
    publishedAt: '7 years ago',
    watched:true,
    inLibrary:true
  },
    
  {
    id: 'WUvTyaaNkzM',
    title: 'The essence of calculus',
    thumbnail: 'https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg',
    duration: '17:04',
    channelName: '3Blue1Brown',
    views: '9.6M',
    publishedAt: '7 years ago',
    watched:false,
    inLibrary:false
  },
  {
    id: 'p7HKvqRI_Bo',
    title: 'How does the stock market work? - Oliver Elfenbaum',
    thumbnail: 'https://img.youtube.com/vi/p7HKvqRI_Bo/hqdefault.jpg',
    duration: '4:29',
    channelName: 'TED-Ed',
    views: '567K',
    publishedAt: '5 years ago',
    watched:true,
    inLibrary:false
  },
  {
    id: 'jZKXS5VAzPw',
    title: 'Learn German for beginners A1',
    thumbnail: 'https://img.youtube.com/vi/jZKXS5VAzPw/hqdefault.jpg',
    duration: '7:21',
    channelName: 'Learn German',
    views: '411K',
    publishedAt: '7 years ago',
    watched: true,
    inLibrary:false
  },
  {
    id: 'Rt6beTKDtqY',
    title: 'The Mathematics of Machine Learning',
    thumbnail: 'https://img.youtube.com/vi/Rt6beTKDtqY/hqdefault.jpg',
    duration: '16:33',
    channelName: 'Zach Star',
    views: '488K',
    publishedAt: '6 years ago',
    watched:true,
    inLibrary:false

    },
    {
    id: 'fkAAbXPEAtU',
    title: 'Quantum Entanglement Explained Simply',
    thumbnail: 'https://img.youtube.com/vi/fkAAbXPEAtU/hqdefault.jpg',
    duration: '9:56',
    channelName: 'Science ABC',
    views: '786K',
    publishedAt: '4 years ago',
    watched: true,
    inLibrary:false
  },
  {
    id: 'Qqe4thU-os8',
    title: 'DNA Replication (Updated)',
    thumbnail: 'https://img.youtube.com/vi/Qqe4thU-os8/hqdefault.jpg',
    duration: '8:11',
    channelName: 'Amoeba Sisters',
    views: '7.7M',
    publishedAt: '5 years ago',
    watched: false,
    inLibrary:false
  },
  {
    id: 'F1cghFu9zBs',
    title: 'How To Build Wealth In Your 20s (Realistically)',
    thumbnail: 'https://img.youtube.com/vi/F1cghFu9zBs/hqdefault.jpg',
    duration: '14:33',
    channelName: 'Graham Stephan',
    views: '290K',
    publishedAt: '10 months ago',
    watched:false,
    inLibrary:false
  },
  {
    id: 'e-P5IFTqB98',
    title: 'Black Holes Explained - From Birth to Death',
    thumbnail: 'https://img.youtube.com/vi/e-P5IFTqB98/hqdefault.jpg',
    duration: '5:55',
    channelName: 'Kurzgesagt - In a Nutshell',
    views: '25M',
    publishedAt: '9 years ago',
    watched:true,
    inLibrary:false
  },
  {
    id: 'yZvFH7B6gKI',
    title: 'What Is Data Analytics? - An Introduction (Full Guide)',
    thumbnail: 'https://img.youtube.com/vi/yZvFH7B6gKI/hqdefault.jpg',
    duration: '9:04',
    channelName: 'CareerFoundry',
    views: '1.5M',
    publishedAt: '3 years ago',
    watched: false,
    inLibrary:false
  },
  {
    id: 'fE_QTn4daPU',
    title: 'The Science Behind Climate Change, Explained in 2 Minutes',
    thumbnail: 'https://img.youtube.com/vi/fE_QTn4daPU/hqdefault.jpg',
    duration: '1:47',
    channelName: 'Bloomberg Originals',
    views: '35K',
    publishedAt: '9 years ago',
    watched: false,
    inLibrary:false
  },
  {
    id: '4Q22hN-1mLI',
    title: 'JAPANESE PHRASES for Absolute Beginners',
    thumbnail: 'https://img.youtube.com/vi/4Q22hN-1mLI/hqdefault.jpg',
    duration: '3:20',
    channelName: 'Japanese Tomato',
    views: '2M',
    publishedAt: '3 years ago',
    watched:false,
    inLibrary:false
  },
  {
    id: 'ReFqFPJHLhA',
    title: 'Heuristics and biases in decision making, explained',
    thumbnail: 'https://img.youtube.com/vi/ReFqFPJHLhA/hqdefault.jpg',
    duration: '3:48',
    channelName: 'Learn Liberty',
    views: '631K',
    publishedAt: '7 years ago',
    watched: false,
    inLibrary:false
    },
  {
    id: 'TImdsUglGv4',
    title: 'How Encryption Works - and How It Can Be Bypassed',
    thumbnail: 'https://img.youtube.com/vi/TImdsUglGv4/hqdefault.jpg',
    duration: '2:48',
    channelName: 'The Wall Street Journal',
    views: '5M',
    publishedAt: '8 years ago',
    watched: true,
    inLibrary:false
  }
    // ... other video objects
  ]);
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSearchVideos, setFilteredSearchVideos] = useState<Video[]>([]);

  function handleSearch(e: SearchEvent) {
    e.preventDefault();
    // Implement search functionality
    const filteredSearchVideos = videos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredSearchVideos(filteredSearchVideos);
  }

  function handleVideoClick(video: Video) {
    setSelectedVideo(video);
  }
  
  function addVideoToLibrary(video: Video) {
    // Check if video is already in library
    const isAlreadyInLibrary = videos.some(v => v.id === video.id && v.inLibrary);
    
    if (!isAlreadyInLibrary) {
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === video.id 
            ? {...v, inLibrary: true} 
            : v
        )
      );
    }
  }

  function removeVideoFromLibrary(videoId: string) {
    setVideos(prevVideos => 
      prevVideos.map(v => 
        v.id === videoId 
          ? {...v, inLibrary: false} 
          : v
      )
    );
  }

  const value = {
    videos,
    setVideos,
    selectedVideo,
    setSelectedVideo,
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleVideoClick,
    addVideoToLibrary,
    removeVideoFromLibrary,
    filteredSearchVideos
  };
  return (
    //provide context api data through attribute value
    <div>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </div>
  );
};

export default Context;

// Custom hook for easier context usage
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
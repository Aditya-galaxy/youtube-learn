"use client";
import React, {useState, useContext, useCallback} from "react";
import { createContext } from "react";
import { ReactNode } from "react";
import { Video } from "../../types/video";

interface SearchEvent extends React.FormEvent<HTMLFormElement> { }

interface AppContextType {
  videos: Video[];
  // setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  setVideos: (videos: Video[]) => void;
  selectedVideo: Video | null;
  setSelectedVideo: React.Dispatch<React.SetStateAction<Video | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  // setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSearchQuery: (query: string) => void;
  // handleSearch: (e: SearchEvent) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleVideoClick: (video: Video) => void;
  addVideoToLibrary: (video: Video) => void;
  removeVideoFromLibrary: (videoId: string) => void;
  filteredSearchVideos: Video[];
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const Context = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([
    {
    id: 'JRHAM1nAuD4',  // id of the video on youtube
    channelId: 'UCZ9qFEC82qM6Pk-54Q4TVWA',
    title: 'Artificial Intelligence | Research and Which Majors to Pick',
    thumbnail: 'https://img.youtube.com/vi/JRHAM1nAuD4/hqdefault.jpg',
    duration: '18:32',
    channelName: 'Zach Star',
    views: '172K',
    publishedAt: '7 years ago',
    watched:true,
    inLibrary:true,
    description: 'A video about AI research and majors to pick.'
  },
    
  {
    id: 'WUvTyaaNkzM',
    channelId: 'UCYO_jab_esuFRV4b17AJtAw',
    title: 'The essence of calculus',
    thumbnail: 'https://img.youtube.com/vi/WUvTyaaNkzM/hqdefault.jpg',
    duration: '17:04',
    channelName: '3Blue1Brown',
    views: '9.6M',
    publishedAt: '7 years ago',
    watched:false,
    inLibrary:false,
    description: 'A video explaining the essence of calculus.'
  },
  {
    id: 'p7HKvqRI_Bo',
    channelId: 'UCsooa4yRKGN_zEE8iknghZA',
    title: 'How does the stock market work? - Oliver Elfenbaum',
    thumbnail: 'https://img.youtube.com/vi/p7HKvqRI_Bo/hqdefault.jpg',
    duration: '4:29',
    channelName: 'TED-Ed',
    views: '567K',
    publishedAt: '5 years ago',
    watched:true,
    inLibrary:false,
    description: 'A video explaining how the stock market works.'
  },
  {
    id: 'Rt6beTKDtqY',
    channelId: 'UCZ9qFEC82qM6Pk-54Q4TVWA',
    title: 'The Mathematics of Machine Learning',
    thumbnail: 'https://img.youtube.com/vi/Rt6beTKDtqY/hqdefault.jpg',
    duration: '16:33',
    channelName: 'Zach Star',
    views: '488K',
    publishedAt: '6 years ago',
    watched:true,
    inLibrary:false,
    description: 'A video about the mathematics of machine learning.'
    },
    {
    id: 'fkAAbXPEAtU',
    channelId: 'UC7DdEm33SyaTDtWYGO2CwdA',
    title: 'Quantum Entanglement Explained Simply',
    thumbnail: 'https://img.youtube.com/vi/fkAAbXPEAtU/hqdefault.jpg',
    duration: '9:56',
    channelName: 'Science ABC',
    views: '786K',
    publishedAt: '4 years ago',
    watched: true,
    inLibrary:false,
    description: 'A video explaining quantum entanglement simply.'
  },
  {
    id: 'Qqe4thU-os8',
    channelId: 'UCb1GdqUqArXMQ3RS86lqqOw',
    title: 'DNA Replication (Updated)',
    thumbnail: 'https://img.youtube.com/vi/Qqe4thU-os8/hqdefault.jpg',
    duration: '8:11',
    channelName: 'Amoeba Sisters',
    views: '7.7M',
    publishedAt: '5 years ago',
    watched: false,
    inLibrary:false,
    description: 'A video about DNA replication.'
  },
  {
    id: 'F1cghFu9zBs',
    channelId: 'UCV6KDgJskWaEckne5aPA0aQ',
    title: 'How To Build Wealth In Your 20s (Realistically)',
    thumbnail: 'https://img.youtube.com/vi/F1cghFu9zBs/hqdefault.jpg',
    duration: '14:33',
    channelName: 'Graham Stephan',
    views: '290K',
    publishedAt: '10 months ago',
    watched:false,
    inLibrary:false,
    description: 'A video about building wealth in your 20s.'
  },
  {
    id: 'e-P5IFTqB98',
    channelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
    title: 'Black Holes Explained - From Birth to Death',
    thumbnail: 'https://img.youtube.com/vi/e-P5IFTqB98/hqdefault.jpg',
    duration: '5:55',
    channelName: 'Kurzgesagt - In a Nutshell',
    views: '25M',
    publishedAt: '9 years ago',
    watched:true,
    inLibrary:false,
    description: 'A video explaining black holes from birth to death.'
  },
  {
    id: 'yZvFH7B6gKI',
    channelId: 'UCz8J7E5w3Wp3yFoZpC3y7mw',
    title: 'What Is Data Analytics? - An Introduction (Full Guide)',
    thumbnail: 'https://img.youtube.com/vi/yZvFH7B6gKI/hqdefault.jpg',
    duration: '9:04',
    channelName: 'CareerFoundry',
    views: '1.5M',
    publishedAt: '3 years ago',
    watched: false,
    inLibrary:false,
    description: 'A video introducing data analytics.'
  },
  {
    id: 'fE_QTn4daPU',
    channelId: 'UCUMZ7gohGI9HcU9VNsr2FJQ',
    title: 'The Science Behind Climate Change, Explained in 2 Minutes',
    thumbnail: 'https://img.youtube.com/vi/fE_QTn4daPU/hqdefault.jpg',
    duration: '1:47',
    channelName: 'Bloomberg Originals',
    views: '35K',
    publishedAt: '9 years ago',
    watched: false,
    inLibrary:false,
    description: 'A video explaining the science behind climate change in 2 minutes.'
  },
  {
    id: 'ReFqFPJHLhA',
    channelId: 'UCn7dB9UMTBDjKtEKBy_XISw',
    title: 'Heuristics and biases in decision making, explained',
    thumbnail: 'https://img.youtube.com/vi/ReFqFPJHLhA/hqdefault.jpg',
    duration: '3:48',
    channelName: 'Learn Liberty',
    views: '631K',
    publishedAt: '7 years ago',
    watched: false,
    inLibrary:false,
    description: 'A video explaining heuristics and biases in decision making.'
    },
  {
    id: 'TImdsUglGv4',
    channelId: 'UCW4J0Z1pL9J4G9Uq8i4e0wA',
    title: 'How Encryption Works - and How It Can Be Bypassed',
    thumbnail: 'https://img.youtube.com/vi/TImdsUglGv4/hqdefault.jpg',
    duration: '2:48',
    channelName: 'The Wall Street Journal',
    views: '5M',
    publishedAt: '8 years ago',
    watched: true,
    inLibrary:false,
    description: 'A video explaining how encryption works and how it can be bypassed.'
  }
    // ... other video objects
  ]);
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSearchVideos, setFilteredSearchVideos] = useState<Video[]>([]);

  const handleSearch = useCallback((e: React.FormEvent) => {
  e.preventDefault();
  setFilteredSearchVideos(videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase())
  ));
  }, [searchQuery, videos]);

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
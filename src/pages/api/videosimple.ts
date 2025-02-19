import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { google, youtube_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Video } from '../../../types/video';

interface VideoResponse {
  videos: Video[];
  error?: string;
}


// Constants
const HOURLY_TOKEN_LIMIT = 10000;
const TOKENS_PER_REQUEST = 50;
const MAX_RESULTS = 50;
const HOURS_24 = 24 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      videos: [],
      error: 'Method not allowed' 
    });
  }

  try {
    const { q: searchQuery, region = 'US' } = req.query;

    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({ 
        videos: [],
        error: 'YouTube API key not found' 
      });
    }

    // Initialize YouTube client
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });

    // Fetch videos
    const videos = await fetchVideos(youtube, searchQuery as string | undefined, region as string);
    

  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return res.status(500).json({
      videos: [],
      error: error.message || 'Failed to fetch videos'
    });
  }
}

async function fetchVideos(
  youtube: youtube_v3.Youtube,
  searchQuery?: string,
  region: string = 'US'
): Promise<Video[]> {
  const searchParams: youtube_v3.Params$Resource$Search$List = {
    auth: process.env.YOUTUBE_API_KEY,
    
    part: ['snippet'],
    maxResults: MAX_RESULTS,
    type: ['video'],
    regionCode: region,
    videoCategoryId: '27',
    order: 'relevance',
    safeSearch: 'moderate'
  };

  if (searchQuery) {
    searchParams.q = searchQuery;
  } else {
      searchParams.order = 'viewCount';
  }

  const response = await youtube.search.list(searchParams);

  if (!response.data.items?.length) {
    return [];
  }

  // Get video statistics
  const videoIds = response.data.items.map(item => item.id?.videoId).filter((id): id is string => !!id);
  const videoStats = await youtube.videos.list({
    part: ['statistics'],
    id: videoIds
  });

  return response.data.items.map((item, index) => ({
    id: item.id?.videoId || '',
    title: item.snippet?.title || '',
    thumbnail: item.snippet?.thumbnails?.high?.url || '',
    channelName: item.snippet?.channelTitle || '',
    channelId: item.snippet?.channelId || '',
    publishedAt: item.snippet?.publishedAt 
      ? new Date(item.snippet.publishedAt).toLocaleDateString()
      : '',
    views: videoStats.data.items?.[index]?.statistics?.viewCount || '0',
    description: item.snippet?.description || '',
    duration: '0', // Placeholder value, replace with actual duration if available
    watched: false // Placeholder value, replace with actual watched status if available
  }));
}


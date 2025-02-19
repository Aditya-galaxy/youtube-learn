import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { Video } from '../../../../types/video';

const DAILY_TOKEN_LIMIT = 100000;
const TOKENS_PER_REQUEST = 50;
const MAX_RESULTS = 12;
const HOURS_24 = 24 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Allow unauthenticated access with limited functionality
    if (!session?.user?.id) {
      return res.status(200).json({ 
        videos: [], 
        tokensRemaining: 0,
        message: 'Sign in to see personalized recommendations'
      });
    }

    if (!session.accessToken) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    // Check token usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userTokens = await prisma.userTokens.upsert({
      where: { userId: session.user.id },
      update: userTokens?.lastReset < today 
        ? { tokensUsed: TOKENS_PER_REQUEST, lastReset: today }
        : { tokensUsed: { increment: TOKENS_PER_REQUEST } },
      create: {
        userId: session.user.id,
        tokensUsed: TOKENS_PER_REQUEST,
        lastReset: today
      }
    });

    if (userTokens.tokensUsed > DAILY_TOKEN_LIMIT) {
      return res.status(429).json({ 
        error: 'Daily token limit reached',
        tokensRemaining: 0
      });
    }

    // Initialize YouTube client
    const youtube = google.youtube('v3');
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    // Get search parameters
    const { q: searchQuery, pageToken, refresh } = req.query;
    const isSearch = typeof searchQuery === 'string' && searchQuery.length > 0;

    // Get previously viewed videos
    const viewedVideos = await prisma.viewedVideos.findMany({
      where: { 
        userId: session.user.id,
        viewedAt: { gte: new Date(Date.now() - HOURS_24) }
      },
      select: { videoId: true }
    });

    const viewedVideoIds = viewedVideos.map(v => v.videoId);

    // Fetch videos from YouTube
    const searchResponse = await youtube.search.list({
      auth,
      part: ['snippet'],
      maxResults: MAX_RESULTS,
      type: ['video'],
      videoCategoryId: '27',
      order: 'relevance',
      pageToken: typeof pageToken === 'string' ? pageToken : undefined,
      q: isSearch 
        ? `${searchQuery} educational course tutorial` 
        : 'educational|tutorial|learning|course',
      relevanceLanguage: 'en',
      regionCode: 'US',
      safeSearch: 'moderate',
      videoType: isSearch ? 'any' : undefined,
    });

    if (!searchResponse.data.items?.length) {
      return res.status(200).json({ 
        videos: [], 
        tokensRemaining: DAILY_TOKEN_LIMIT - userTokens.tokensUsed
      });
    }

    const videoIds = searchResponse.data.items
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[];

    // Get detailed video information
    const [videoDetails, playlistDetails] = await Promise.all([
      youtube.videos.list({
        auth,
        part: ['contentDetails', 'statistics'],
        id: videoIds,
        regionCode: 'US'
      }),
      youtube.playlists.list({
        auth,
        part: ['snippet'],
        channelId: searchResponse.data.items[0].snippet?.channelId
      })
    ]);

    // Format video data
    const videos: Video[] = searchResponse.data.items.map((item, index) => ({
      id: item.id?.videoId || '',
      title: item.snippet?.title || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      channelName: item.snippet?.channelTitle || '',
      channelId: item.snippet?.channelId || '',
      publishedAt: new Date(item.snippet?.publishedAt || '').toLocaleDateString('en-US'),
      duration: videoDetails.data.items?.[index]?.contentDetails?.duration || '',
      views: videoDetails.data.items?.[index]?.statistics?.viewCount || '0',
      description: item.snippet?.description || '',
      watched: viewedVideoIds.includes(item.id?.videoId || ''),
      inLibrary: false
    }));

    // Store viewed videos if not already viewed
    if (refresh !== 'true') {
      const newVideoIds = videoIds.filter(id => !viewedVideoIds.includes(id));
      if (newVideoIds.length > 0) {
        await prisma.viewedVideos.createMany({
          data: newVideoIds.map(videoId => ({
            userId: session.user.id,
            videoId,
            viewedAt: new Date()
          })),
          skipDuplicates: true
        });
      }
    }

    res.status(200).json({
      videos,
      nextPageToken: searchResponse.data.nextPageToken,
      tokensRemaining: DAILY_TOKEN_LIMIT - userTokens.tokensUsed
    });
  } catch (error: any) {
    console.error('API Error:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'YouTube access token expired' });
    }

    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { google, youtube_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Types
interface VideoResponse {
  videos: Video[];
  nextPageToken?: string;
  tokensRemaining: number;
  message?: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  views: string;
  description: string;
  watched: boolean;
  inLibrary: boolean;
}


interface ChannelInfo {
  id: string;
  title: string;
  isEducational: boolean;
}

// Constants
const HOURLY_TOKEN_LIMIT = 10000;
const TOKENS_PER_REQUEST = 50;
const MAX_RESULTS = 12;
const HOURS_24 = 24 * 60 * 60 * 1000;

// Request validation schema
const QuerySchema = z.object({
  q: z.string().optional(),
  pageToken: z.string().optional(),
  refresh: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
  language: z.string().optional().default('en'),
  region: z.string().optional().default('US')
});

async function ensureUserExists(user: { id: string; email?: string | null; name?: string | null; image?: string | null }) {
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name,
        image: user.image,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const queryResult = QuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      console.error('Query validation error:', queryResult.error);
      return res.status(400).json({ error: `Invalid query parameters: ${queryResult.error.message}` });
    }
    const { q: searchQuery, pageToken, refresh, category, language, region } = queryResult.data;
    
    // Session handling
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (session.user.id) {
      await ensureUserExists(session.user as { id: string; email?: string | null; name?: string | null; image?: string | null });
    } else {
      return res.status(401).json({ error: 'User ID is missing' });
    }

    // Check YouTube API credentials
    if (!process.env.YOUTUBE_API_KEY) {
      console.error('Missing YouTube API credentials');
      return res.status(500).json({ 
        error: 'Server configuration error: YouTube API key not found' 
      });
    }
    
    // Token usage management
    const tokenResult = await handleTokenUsage(session.user.id);
    if ('error' in tokenResult) {
      return res.status(429).json({
        error: `Rate limit: ${tokenResult.error}`,
        tokensRemaining: 0
      });
    }

    // YouTube client initialization
    let youtube;
    try {
      youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
      });
    } catch (error) {
      console.error('YouTube client initialization error:', error);
      return res.status(500).json({ 
        error: 'Failed to initialize YouTube client' 
      });
    }

    // Fetch viewed videos
    const viewedVideoIds = await getViewedVideos(session.user.id);

    // Fetch videos from YouTube
    const result = await fetchYouTubeVideos({
      youtube,
      searchQuery,
      pageToken,
      viewedVideoIds,
      category,
      language,
      region
    });

    if ('error' in result) {
      return res.status(500).json({ error: result.error });
    }

    // Update viewed videos if not refreshing
    if (refresh !== 'true' && result.videos.length > 0) {
      await updateViewedVideos(session.user.id, result.videos);
    }

    // Return successful response
    return res.status(200).json({
      videos: result.videos,
      nextPageToken: result.nextPageToken,
      tokensRemaining: tokenResult.tokensRemaining
    });

  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data
    });
    return handleApiError(error, res);
  }
}

async function handleTokenUsage(userId: string): Promise<{ tokensRemaining: number } | { error: string }> {
  const now = new Date();
  const hour = now.getHours();

  try {
    return await prisma.$transaction(async (tx:any) => {
      const userTokens = await tx.userTokens.findUnique({
        where: { userId }
      });

      const needsReset = !userTokens || userTokens.lastResetHour !== hour;
      const newTokensUsed = needsReset ? TOKENS_PER_REQUEST : userTokens.tokensUsed + TOKENS_PER_REQUEST;

      if (newTokensUsed > HOURLY_TOKEN_LIMIT) {
        return { error: 'Hourly token limit reached' };
      }

      await tx.userTokens.upsert({
        where: { userId },
        update: {
          tokensUsed: newTokensUsed,
          lastResetHour: needsReset ? hour : userTokens.lastResetHour
        },
        create: {
          userId,
          tokensUsed: TOKENS_PER_REQUEST,
          lastResetHour: hour
        }
      });

      return { tokensRemaining: HOURLY_TOKEN_LIMIT - newTokensUsed };
    });
  } catch (error) {
    console.error('Token usage error:', error);
    return { error: 'Failed to process token usage' };
  }
}

async function getViewedVideos(userId: string): Promise<string[]> {
  try {
    const viewedVideos = await prisma.viewedVideos.findMany({
      where: {
        userId,
        viewedAt: { gte: new Date(Date.now() - HOURS_24) }
      },
      select: { videoId: true }
    });
    return viewedVideos.map((v:any) => v.videoId);
  } catch (error) {
    console.error('Error fetching viewed videos:', error);
    return [];
  }
}

async function fetchYouTubeVideos({
  youtube,
  searchQuery,
  pageToken,
  viewedVideoIds,
  category,
  language,
  region
}: {
  youtube: youtube_v3.Youtube;
  searchQuery?: string;
  pageToken?: string;
  viewedVideoIds: string[];
  category?: string;
  language: string;
  region: string;
}): Promise<{ videos: Video[]; nextPageToken?: string } | { error: string }> {
  try {
    // First, get search results with academic focus
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      maxResults: MAX_RESULTS,
      type: ['video'],
      videoCategoryId: category || '27', // Education category
      order: 'relevance',
      pageToken,
      q: searchQuery 
        ? `${searchQuery} (lecture|course|education) site:edu`
        : 'university lecture course site:edu',
      relevanceLanguage: language,
      regionCode: region,
      safeSearch: 'moderate',
      // videoDefinition: 'high',
      // videoDuration: 'long', // Focus on full lectures
    });

    if (!searchResponse.data.items?.length) {
      return { videos: [], nextPageToken: undefined };
    }

    const videoIds = searchResponse.data.items
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[];

    // Get detailed video information
    const videoDetails = await youtube.videos.list({
      part: ['contentDetails', 'statistics', 'snippet'],
      id: videoIds
    });

    if (!videoDetails.data.items?.length) {
      return { videos: [], nextPageToken: undefined };
    }

    // Filter and process videos
    const videos: Video[] = [];
    
    for (let i = 0; i < searchResponse.data.items.length; i++) {
      const searchItem = searchResponse.data.items[i];
      const videoDetail = videoDetails.data.items?.find(
        v => v.id === searchItem.id?.videoId
      );

      if (!videoDetail) continue;

      // Parse duration to seconds
      const duration = videoDetail.contentDetails?.duration || '';
      const durationInSeconds = parseDuration(duration);

      // Skip videos that don't meet our criteria
      if (
        // Skip videos shorter than 2 minutes (likely not full courses)
        durationInSeconds < 120 ||
        // Skip videos with very low views (likely not quality content)
        Number(videoDetail.statistics?.viewCount || 0) < 100 ||
        // Skip videos with suspicious titles
        hasSuspiciousTitle(searchItem.snippet?.title || '')
      ) {
        continue;
      }

      videos.push({
        id: searchItem.id?.videoId || '',
        title: searchItem.snippet?.title || '',
        thumbnail: searchItem.snippet?.thumbnails?.medium?.url || '',
        channelName: searchItem.snippet?.channelTitle || '',
        channelId: searchItem.snippet?.channelId || '',
        publishedAt: searchItem.snippet?.publishedAt 
          ? new Date(searchItem.snippet.publishedAt).toLocaleDateString()
          : '',
        duration: duration,
        views: videoDetail.statistics?.viewCount || '0',
        description: searchItem.snippet?.description || '',
        watched: viewedVideoIds.includes(searchItem.id?.videoId || ''),
        inLibrary: false
      });
    }

    return {
      videos,
      nextPageToken: searchResponse.data.nextPageToken ?? undefined
    };
  } catch (error) {
    // Check for YouTube API quota exceeded errors
    if ((error as any).code === 403 && (error as any).message?.includes('quota')) {
      return { 
        error: 'YouTube API token limit reached. Please try again later.' 
      };
    }
    console.error('YouTube API error:', error);
    return { error: 'Failed to fetch videos from YouTube' };
  }
}

async function updateViewedVideos(userId: string, videos: Video[]) {
  try {
    await prisma.$transaction(async (tx:any) => {
      await Promise.all(videos.map(async (video) => {
        await tx.viewedVideos.create({
          data: {
            userId,
            videoId: video.id,
            viewedAt: new Date(),
          }
        });
      }));
    });
  } catch (error) {
    console.error('Error updating viewed videos:', error);
  }
}

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (parseInt(match?.[1] ?? '0')) || 0;
  const minutes = (parseInt(match?.[2] ?? '0')) || 0;
  const seconds = (parseInt(match?.[3] ?? '0')) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to check for suspicious titles
function hasSuspiciousTitle(title: string): boolean {
  const suspiciousPatterns = [
    /\b(funny|prank|reaction|gameplay|stream|shorts|short|tiktok)\b/i,
    /\b(click\s*bait|clickbait|click\s*here|must\s*watch)\b/i,
    /\b(fortnite|minecraft|roblox|gaming|game\s*play)\b/i,
    /\b(vlog|blog|daily|diary|live|stream)\b/i,
    /\b(compilation|highlights|moments|clips)\b/i,
    /[😂🤣😍🎮🎲🎯🎪]/u // Emojis often used in non-educational content
  ];

  return suspiciousPatterns.some(pattern => pattern.test(title));
}

// Helper function to check for suspicious descriptions
function hasSuspiciousDescription(description: string): boolean {
  const suspiciousPatterns = [
    /\b(subscribe|like|comment|notification|bell|merch)\b/i,
    /\b(giveaway|free|win|contest|lottery)\b/i,
    /\b(affiliate|sponsored|promotion|ad|advertisement)\b/i,
    /\b(gaming|gameplay|stream|streaming|streamer)\b/i,
    /\b(follow me|social media|instagram|twitter|tiktok)\b/i
  ];

  // Check if description is too short (might indicate non-educational content)
  if (description.length < 50) return true;

  return suspiciousPatterns.some(pattern => pattern.test(description));
}

function handleApiError(error: any, res: NextApiResponse) {
  console.error('Handling API error:', {
    message: error.message,
    code: error.code,
    response: error.response?.data
  });

  if (error.code === 401 || error.message?.includes('invalid_grant')) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'YouTube service unavailable' });
  }
  if (error.code === 'ETIMEDOUT') {
    return res.status(504).json({ error: 'Request timed out' });
  }
  if (error.response?.data?.error?.message) {
    return res.status(500).json({ 
      error: `YouTube API error: ${error.response.data.error.message}` 
    });
  }
  return res.status(500).json({ error: 'Internal server error' });
}
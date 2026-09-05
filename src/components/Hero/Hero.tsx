"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useInView } from "react-hook-inview";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/Helper/Context";
import type { Video } from "../../../types/video";
import VideoGrid from "./VideoGrid";

interface HeroProps {
  title: string;
  /** Search term. Empty/undefined renders the default recommendation feed. */
  query?: string;
  order?: "relevance" | "viewCount" | "date";
}

interface VideosResponse {
  videos: Video[];
  nextPageToken?: string;
  error?: string;
}

function matchesQuery(video: Video, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack =
    `${video.title} ${video.description} ${video.channelName}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/**
 * The one component that talks to /api/videos.
 *
 * Search state lives in the URL and arrives here as a prop. It previously lived
 * in React context alongside a `handleSearch` that both read and wrote the video
 * list; because `handleSearch` was in a `useEffect` dependency array, every
 * fetch changed its identity and re-triggered the effect, so a single search
 * looped indefinitely and burned YouTube quota on every pass.
 */
const Hero: React.FC<HeroProps> = ({ title, query, order = "relevance" }) => {
  const { data: session, status } = useSession();
  const { demoVideos, isInLibrary } = useAppContext();
  const { toast } = useToast();

  const [videos, setVideos] = useState<Video[]>([]);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  // Guards against a slow response for an old query overwriting a newer one.
  const requestIdRef = useRef(0);

  const [sentinelRef, inView] = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  const trimmedQuery = query?.trim() ?? "";
  const isAuthenticated = status === "authenticated" && Boolean(session);

  const loadPage = useCallback(
    async (token?: string) => {
      const requestId = ++requestIdRef.current;
      const isFirstPage = !token;

      if (isFirstPage) setLoading(true);
      else setIsLoadingMore(true);

      // Signed-out visitors get the local sample feed; there is no API budget
      // to spend on them and the endpoint requires a session anyway.
      if (!isAuthenticated) {
        const filtered = trimmedQuery
          ? demoVideos.filter((video) => matchesQuery(video, trimmedQuery))
          : demoVideos;
        if (requestId === requestIdRef.current) {
          setVideos(filtered);
          setPageToken(undefined);
          setExhausted(true);
          setLoading(false);
          setIsLoadingMore(false);
        }
        return;
      }

      try {
        const params = new URLSearchParams();
        if (trimmedQuery) params.set("q", trimmedQuery);
        if (order !== "relevance") params.set("order", order);
        if (token) params.set("pageToken", token);

        const response = await fetch(`/api/videos?${params.toString()}`);
        const data: VideosResponse = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Request failed (${response.status})`);
        }
        if (requestId !== requestIdRef.current) return;

        const incoming = data.videos ?? [];
        setVideos((prev) => {
          if (isFirstPage) return incoming;
          const known = new Set(prev.map((v) => v.id));
          return [...prev, ...incoming.filter((v) => !known.has(v.id))];
        });
        setPageToken(data.nextPageToken);
        // A page that yields nothing new ends the scroll; without this an
        // always-visible sentinel would keep requesting the same page.
        setExhausted(!data.nextPageToken || incoming.length === 0);
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        console.error("Video fetch error:", error);
        toast({
          title: "Could not load videos",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          variant: "destructive",
        });
        if (isFirstPage) {
          const fallback = trimmedQuery
            ? demoVideos.filter((video) => matchesQuery(video, trimmedQuery))
            : demoVideos;
          setVideos(fallback);
        }
        setExhausted(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [isAuthenticated, trimmedQuery, order, demoVideos, toast]
  );

  useEffect(() => {
    // Wait for NextAuth to resolve, otherwise the first render fetches the
    // signed-out feed and immediately refetches the signed-in one.
    if (status === "loading") return;
    setPageToken(undefined);
    setExhausted(false);
    loadPage(undefined);
  }, [status, trimmedQuery, order, loadPage]);

  useEffect(() => {
    if (inView && !loading && !isLoadingMore && !exhausted && pageToken) {
      loadPage(pageToken);
    }
  }, [inView, loading, isLoadingMore, exhausted, pageToken, loadPage]);

  const decorated = videos.map((video) => ({
    ...video,
    inLibrary: isInLibrary(video.id),
  }));

  return (
    <>
      <VideoGrid
        title={title}
        videos={decorated}
        loading={loading}
        emptyMessage={
          trimmedQuery
            ? `No videos found for "${trimmedQuery}". Try a different search term.`
            : "No videos found."
        }
        footer={
          <div
            ref={sentinelRef}
            className="mt-16 flex h-16 items-center justify-center"
          >
            {isLoadingMore && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                <span className="text-sm tracking-tightish">Loading more</span>
              </div>
            )}
          </div>
        }
      />

      {!isAuthenticated && status !== "loading" && (
        <p className="pb-16 text-center text-sm tracking-tightish text-muted-foreground">
          Sign in to see personalised recommendations.
        </p>
      )}
    </>
  );
};

export default Hero;

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Video } from "../../types/video";
import { DEMO_VIDEOS } from "@/lib/demoVideos";

interface AppContextType {
  /** Videos shown to signed-out visitors and used as an offline fallback. */
  demoVideos: Video[];
  selectedVideo: Video | null;
  openVideo: (video: Video) => void;
  closeVideo: () => void;
  library: Video[];
  saved: Video[];
  watched: Video[];
  isInLibrary: (videoId: string) => boolean;
  isSaved: (videoId: string) => boolean;
  toggleLibrary: (video: Video) => boolean;
  toggleSaved: (video: Video) => boolean;
  clearWatched: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  library: "ytlearn.library",
  saved: "ytlearn.saved",
  watched: "ytlearn.watched",
} as const;

const MAX_WATCHED = 200;

function readStored(key: string): Video[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Storage is user-writable, so never trust its shape.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Video =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as Video).id === "string"
    );
  } catch {
    return [];
  }
}

function writeStored(key: string, videos: Video[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(videos));
  } catch {
    // Quota exceeded or storage disabled — the list simply will not persist.
  }
}

const Context = ({ children }: { children: ReactNode }) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [library, setLibrary] = useState<Video[]>([]);
  const [saved, setSaved] = useState<Video[]>([]);
  const [watched, setWatched] = useState<Video[]>([]);
  // Reading localStorage during render would make the server and client markup
  // disagree, so we hydrate after mount and only start writing once we have.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLibrary(readStored(STORAGE_KEYS.library));
    setSaved(readStored(STORAGE_KEYS.saved));
    setWatched(readStored(STORAGE_KEYS.watched));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStored(STORAGE_KEYS.library, library);
  }, [library, hydrated]);

  useEffect(() => {
    if (hydrated) writeStored(STORAGE_KEYS.saved, saved);
  }, [saved, hydrated]);

  useEffect(() => {
    if (hydrated) writeStored(STORAGE_KEYS.watched, watched);
  }, [watched, hydrated]);

  const openVideo = useCallback((video: Video) => {
    setSelectedVideo(video);
    setWatched((prev) => [
      { ...video, watched: true },
      ...prev.filter((v) => v.id !== video.id),
    ].slice(0, MAX_WATCHED));
  }, []);

  const closeVideo = useCallback(() => setSelectedVideo(null), []);

  const libraryIds = useMemo(
    () => new Set(library.map((v) => v.id)),
    [library]
  );
  const savedIds = useMemo(() => new Set(saved.map((v) => v.id)), [saved]);
  const watchedIds = useMemo(
    () => new Set(watched.map((v) => v.id)),
    [watched]
  );

  const isInLibrary = useCallback(
    (videoId: string) => libraryIds.has(videoId),
    [libraryIds]
  );
  const isSaved = useCallback(
    (videoId: string) => savedIds.has(videoId),
    [savedIds]
  );

  /** Returns true when the video ended up in the list, false when removed. */
  const toggleLibrary = useCallback((video: Video) => {
    let added = false;
    setLibrary((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      added = !exists;
      return exists
        ? prev.filter((v) => v.id !== video.id)
        : [{ ...video, inLibrary: true }, ...prev];
    });
    return added;
  }, []);

  const toggleSaved = useCallback((video: Video) => {
    let added = false;
    setSaved((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      added = !exists;
      return exists ? prev.filter((v) => v.id !== video.id) : [video, ...prev];
    });
    return added;
  }, []);

  const clearWatched = useCallback(() => setWatched([]), []);

  const demoVideos = useMemo(
    () =>
      DEMO_VIDEOS.map((video) => ({
        ...video,
        watched: watchedIds.has(video.id),
        inLibrary: libraryIds.has(video.id),
      })),
    [watchedIds, libraryIds]
  );

  const value = useMemo<AppContextType>(
    () => ({
      demoVideos,
      selectedVideo,
      openVideo,
      closeVideo,
      library,
      saved,
      watched,
      isInLibrary,
      isSaved,
      toggleLibrary,
      toggleSaved,
      clearWatched,
    }),
    [
      demoVideos,
      selectedVideo,
      openVideo,
      closeVideo,
      library,
      saved,
      watched,
      isInLibrary,
      isSaved,
      toggleLibrary,
      toggleSaved,
      clearWatched,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default Context;

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

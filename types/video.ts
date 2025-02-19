export interface Playlist {
  id: string;
  title: string;
}

export interface Video {
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
    inLibrary?: boolean;
    playlists?: Playlist[];
}
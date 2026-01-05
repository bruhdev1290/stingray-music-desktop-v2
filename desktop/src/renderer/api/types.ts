export interface StingrayAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  streamingUrl: string;
  imageUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  releaseDate?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  imageUrl?: string;
}

export interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrackId: string | null;
  progress: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
}

export interface PlayerError {
  code: string;
  message: string;
  retryable: boolean;
}

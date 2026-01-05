import type { StingrayAuthTokens, Track, Album, Artist, Playlist, SearchResults } from './types';
import { CacheManager } from './cache';
import { SecureStorage } from './storage';

export class StingrayClient {
  private baseUrl: string;
  private cache: CacheManager;
  private tokenRefreshPromise: Promise<StingrayAuthTokens> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.cache = new CacheManager();
  }

  async ping(): Promise<boolean> {
    const url = `${this.baseUrl}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, { method: 'GET', signal: controller.signal });
      return response.ok;
    } finally {
      clearTimeout(timeout);
    }
  }

  async login(username: string, password: string): Promise<StingrayAuthTokens> {
    const url = `${this.baseUrl}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error(`Auth failed with status ${response.status}`);
    }

    const tokens = (await response.json()) as StingrayAuthTokens;
    SecureStorage.setTokens(tokens);
    SecureStorage.setUsername(username);
    this.cache.clear();

    return tokens;
  }

  async refreshToken(): Promise<StingrayAuthTokens> {
    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    const refreshToken = SecureStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.tokenRefreshPromise = this._performTokenRefresh(refreshToken);

    try {
      const tokens = await this.tokenRefreshPromise;
      return tokens;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  private async _performTokenRefresh(refreshToken: string): Promise<StingrayAuthTokens> {
    const url = `${this.baseUrl}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      SecureStorage.clearTokens();
      throw new Error('Token refresh failed');
    }

    const tokens = (await response.json()) as StingrayAuthTokens;
    SecureStorage.setTokens(tokens);

    return tokens;
  }

  async logout(): Promise<void> {
    try {
      const token = SecureStorage.getAccessToken();
      if (token) {
        const url = `${this.baseUrl}/auth/logout`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } finally {
      SecureStorage.clearTokens();
      this.cache.clear();
    }
  }

  async getCurrentUser(): Promise<{ id: string; username: string; email: string }> {
    return this._authenticatedRequest(`${this.baseUrl}/user`, 'GET');
  }

  async getRecentTracks(limit: number = 20): Promise<Track[]> {
    const cacheKey = `recent_tracks_${limit}`;
    const cached = this.cache.get<Track[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const tracks = await this._authenticatedRequest<Track[]>(
      `${this.baseUrl}/tracks/recent?limit=${limit}`,
      'GET'
    );

    this.cache.set(cacheKey, tracks, 2 * 60 * 1000);
    return tracks;
  }

  async getTrack(trackId: string): Promise<Track> {
    const cacheKey = `track_${trackId}`;
    const cached = this.cache.get<Track>(cacheKey);
    if (cached) {
      return cached;
    }

    const track = await this._authenticatedRequest<Track>(
      `${this.baseUrl}/tracks/${trackId}`,
      'GET'
    );

    this.cache.set(cacheKey, track, 30 * 60 * 1000);
    return track;
  }

  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    const cacheKey = `search_tracks_${query}_${limit}`;
    const cached = this.cache.get<Track[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const encoded = encodeURIComponent(query);
    const tracks = await this._authenticatedRequest<Track[]>(
      `${this.baseUrl}/search/tracks?q=${encoded}&limit=${limit}`,
      'GET'
    );

    this.cache.set(cacheKey, tracks, 10 * 60 * 1000);
    return tracks;
  }

  async search(query: string, limit: number = 10): Promise<SearchResults> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.cache.get<SearchResults>(cacheKey);
    if (cached) {
      return cached;
    }

    const encoded = encodeURIComponent(query);
    const results = await this._authenticatedRequest<SearchResults>(
      `${this.baseUrl}/search?q=${encoded}&limit=${limit}`,
      'GET'
    );

    this.cache.set(cacheKey, results, 10 * 60 * 1000);
    return results;
  }

  async getPlaylists(): Promise<Playlist[]> {
    const cacheKey = 'playlists';
    const cached = this.cache.get<Playlist[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const playlists = await this._authenticatedRequest<Playlist[]>(
      `${this.baseUrl}/playlists`,
      'GET'
    );

    this.cache.set(cacheKey, playlists, 5 * 60 * 1000);
    return playlists;
  }

  async getPlaylist(playlistId: string): Promise<Playlist> {
    const cacheKey = `playlist_${playlistId}`;
    const cached = this.cache.get<Playlist>(cacheKey);
    if (cached) {
      return cached;
    }

    const playlist = await this._authenticatedRequest<Playlist>(
      `${this.baseUrl}/playlists/${playlistId}`,
      'GET'
    );

    this.cache.set(cacheKey, playlist, 5 * 60 * 1000);
    return playlist;
  }

  async getStreamingUrl(trackId: string): Promise<string> {
    const response = await this._authenticatedRequest<{ url: string }>(
      `${this.baseUrl}/tracks/${trackId}/stream`,
      'GET'
    );

    return response.url;
  }

  private async _authenticatedRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    let token = SecureStorage.getAccessToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired and refresh if needed
    if (SecureStorage.isTokenExpired()) {
      try {
        await this.refreshToken();
        token = SecureStorage.getAccessToken();
      } catch (error) {
        SecureStorage.clearTokens();
        throw new Error('Authentication required');
      }
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Handle token expiration
    if (response.status === 401) {
      SecureStorage.clearTokens();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

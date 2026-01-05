import type { Track, Album, Artist, Playlist, SearchResults } from './types';
import { CacheManager } from './cache';

const WEB_PLAYER_URL = 'https://webplayer.stingray.com';

export interface WebPlayerSession {
  authenticated: boolean;
  cookies?: string[];
  userId?: string;
  username?: string;
}

export class WebPlayerClient {
  private baseUrl: string;
  private cache: CacheManager;
  private session: WebPlayerSession = { authenticated: false };

  constructor() {
    this.baseUrl = WEB_PLAYER_URL;
    this.cache = new CacheManager();
  }

  /**
   * Authenticate via web player
   * Opens the web player in a popup/window for user to login
   */
  async authenticate(): Promise<WebPlayerSession> {
    try {
      // Fetch the login page to establish session
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to connect to web player');
      }

      // Extract session cookies from response headers
      const setCookieHeaders = response.headers.getSetCookie?.();
      if (setCookieHeaders) {
        this.session.cookies = setCookieHeaders;
      }

      this.session.authenticated = true;
      return this.session;
    } catch (error) {
      throw new Error(`Web player authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if session is still valid
   */
  async validateSession(): Promise<boolean> {
    if (!this.session.authenticated) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/user`, {
        method: 'GET',
        credentials: 'include'
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Open web player authentication window
   * User logs in there, then returns session
   */
  async openAuthWindow(): Promise<WebPlayerSession> {
    return new Promise((resolve, reject) => {
      // Create authentication URL with callback
      const authUrl = `${this.baseUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;

      // Open in new window/tab with centered positioning
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const width = 900;
      const height = 700;
      const left = (screenWidth - width) / 2;
      const top = (screenHeight - height) / 2;

      const authWindow = window.open(
        authUrl,
        'WebPlayerAuth',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!authWindow) {
        reject(new Error('Failed to open authentication window. Please check if pop-ups are blocked in your browser.'));
        return;
      }

      let checkCount = 0;
      const maxChecks = 300; // 5 minutes with 1-second intervals

      // Poll for authentication completion
      const checkAuth = setInterval(async () => {
        checkCount++;

        try {
          // Check if user is authenticated by trying to fetch user data
          const userResponse = await fetch(`${this.baseUrl}/api/user`, {
            credentials: 'include'
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            clearInterval(checkAuth);
            authWindow.close();

            this.session.authenticated = true;
            this.session.userId = userData.id;
            this.session.username = userData.username;

            resolve(this.session);
          }
        } catch (error) {
          // Still waiting for auth
        }

        // Check if window was closed by user
        if (authWindow.closed) {
          clearInterval(checkAuth);
          reject(new Error('Authentication window was closed. Please try again.'));
        }

        // Timeout after max checks
        if (checkCount >= maxChecks) {
          clearInterval(checkAuth);
          authWindow.close();
          reject(new Error('Authentication took too long. Please check your internet connection and try again.'));
        }
      }, 1000);
    });
  }

  /**
   * Fetch recent tracks from web player
   */
  async getRecentTracks(limit: number = 20): Promise<Track[]> {
    const cacheKey = `webplayer_recent_tracks_${limit}`;
    const cached = this.cache.get<Track[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const tracks = await this._fetchFromWebPlayer<Track[]>(
      `/api/tracks/recent?limit=${limit}`
    );

    this.cache.set(cacheKey, tracks, 2 * 60 * 1000);
    return tracks;
  }

  /**
   * Fetch individual track
   */
  async getTrack(trackId: string): Promise<Track> {
    const cacheKey = `webplayer_track_${trackId}`;
    const cached = this.cache.get<Track>(cacheKey);
    if (cached) {
      return cached;
    }

    const track = await this._fetchFromWebPlayer<Track>(
      `/api/tracks/${trackId}`
    );

    this.cache.set(cacheKey, track, 30 * 60 * 1000);
    return track;
  }

  /**
   * Search across web player catalog
   */
  async search(query: string, limit: number = 10): Promise<SearchResults> {
    const cacheKey = `webplayer_search_${query}_${limit}`;
    const cached = this.cache.get<SearchResults>(cacheKey);
    if (cached) {
      return cached;
    }

    const encoded = encodeURIComponent(query);
    const results = await this._fetchFromWebPlayer<SearchResults>(
      `/api/search?q=${encoded}&limit=${limit}`
    );

    this.cache.set(cacheKey, results, 10 * 60 * 1000);
    return results;
  }

  /**
   * Search tracks only
   */
  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    const cacheKey = `webplayer_search_tracks_${query}_${limit}`;
    const cached = this.cache.get<Track[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const encoded = encodeURIComponent(query);
    const tracks = await this._fetchFromWebPlayer<Track[]>(
      `/api/search/tracks?q=${encoded}&limit=${limit}`
    );

    this.cache.set(cacheKey, tracks, 10 * 60 * 1000);
    return tracks;
  }

  /**
   * Get user's playlists
   */
  async getPlaylists(): Promise<Playlist[]> {
    const cacheKey = 'webplayer_playlists';
    const cached = this.cache.get<Playlist[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const playlists = await this._fetchFromWebPlayer<Playlist[]>(
      '/api/playlists'
    );

    this.cache.set(cacheKey, playlists, 5 * 60 * 1000);
    return playlists;
  }

  /**
   * Get playlist details
   */
  async getPlaylist(playlistId: string): Promise<Playlist> {
    const cacheKey = `webplayer_playlist_${playlistId}`;
    const cached = this.cache.get<Playlist>(cacheKey);
    if (cached) {
      return cached;
    }

    const playlist = await this._fetchFromWebPlayer<Playlist>(
      `/api/playlists/${playlistId}`
    );

    this.cache.set(cacheKey, playlist, 5 * 60 * 1000);
    return playlist;
  }

  /**
   * Get streaming URL for track
   * This is crucial - the web player has the ability to generate streaming URLs
   */
  async getStreamingUrl(trackId: string): Promise<string> {
    const response = await this._fetchFromWebPlayer<{ url: string }>(
      `/api/tracks/${trackId}/stream`
    );

    return response.url;
  }

  /**
   * Get user info
   */
  async getCurrentUser(): Promise<{ id: string; username: string; email?: string }> {
    return this._fetchFromWebPlayer<{ id: string; username: string; email?: string }>(
      '/api/user'
    );
  }

  /**
   * Logout from web player
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      this.session = { authenticated: false };
      this.cache.clear();
    }
  }

  /**
   * Internal method to fetch from web player API
   */
  private async _fetchFromWebPlayer<T>(
    endpoint: string
  ): Promise<T> {
    if (!this.session.authenticated) {
      throw new Error('Not authenticated with web player');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        this.session.authenticated = false;
        throw new Error('Session expired - please log in again');
      }

      if (!response.ok) {
        throw new Error(`Web player API error: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch from web player');
    }
  }

  /**
   * Get web player URL for opening in browser
   */
  getWebPlayerUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.session.authenticated;
  }

  /**
   * Get current session
   */
  getSession(): WebPlayerSession {
    return { ...this.session };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

# Quick API Reference

## Importing & Using Components

```typescript
import { StingrayClient } from './api/stingrayClient';
import { PlaybackController } from './api/playback';
import { SecureStorage } from './api/storage';
import { CacheManager } from './api/cache';
```

## StingrayClient - Main API Client

```typescript
const client = new StingrayClient('https://api.stingray.com');

// Authentication
await client.login(username, password);           // Returns tokens
await client.logout();                            // Clear session
await client.refreshToken();                      // Refresh expired tokens
const user = await client.getCurrentUser();       // Get user info

// Catalog
const recent = await client.getRecentTracks(20);
const track = await client.getTrack(trackId);

// Search
const results = await client.search(query, 10);   // Multi-type search
const tracks = await client.searchTracks(query);  // Tracks only

// Playlists
const playlists = await client.getPlaylists();
const playlist = await client.getPlaylist(id);

// Playback
const url = await client.getStreamingUrl(trackId);

// Cache control
client.clearCache();
```

## PlaybackController - Audio Playback

```typescript
const playback = new PlaybackController(client);

// Play tracks
await playback.play(track);
await playback.playQueue(tracks, startIndex);

// Control playback
playback.togglePlayPause();
await playback.next();
await playback.previous();
playback.pause();
playback.resume();
playback.stop();

// Seek & volume
playback.seek(progress);                // Seek to time (seconds)
playback.setVolume(0.8);               // Set volume (0-1)

// State & listeners
const state = playback.getState();     // Get current state
playback.addListener(state => { });    // Listen for state changes
playback.addErrorListener(error => {}); // Listen for errors

// Cleanup
playback.destroy();
```

## SecureStorage - Session Persistence

```typescript
// Store tokens after login
SecureStorage.setTokens(tokens);

// Retrieve tokens
const token = SecureStorage.getAccessToken();
const refresh = SecureStorage.getRefreshToken();

// Check token status
SecureStorage.isTokenExpired();        // Check if refresh needed
SecureStorage.hasValidToken();         // Check if authenticated

// User info
SecureStorage.setUsername(username);
const username = SecureStorage.getUsername();

// Logout
SecureStorage.clearTokens();
```

## CacheManager - Data Caching

```typescript
const cache = new CacheManager();

// Store data with TTL
cache.set('key', data, 5 * 60 * 1000); // 5 minutes

// Retrieve data
const data = cache.get('key');

// Check existence
cache.has('key');

// Manage cache
cache.remove('key');
cache.clear();
```

## Types

```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentTrackId: string | null;
  progress: number;          // Current position in seconds
  duration: number;          // Track duration in seconds
  queue: Track[];
  currentIndex: number;
}

interface PlayerError {
  code: string;              // Error identifier
  message: string;           // Human-readable message
  retryable: boolean;        // Can be retried?
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  streamingUrl: string;
  imageUrl?: string;
}

interface StingrayAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;        // Seconds until expiration
}
```

## React Integration Example

```typescript
import { useEffect, useRef, useState } from 'react';
import { StingrayClient, PlaybackController } from './api';

export function Player() {
  const clientRef = useRef(new StingrayClient(baseUrl));
  const playbackRef = useRef(new PlaybackController(clientRef.current));
  const [state, setState] = useState<PlaybackState>({...});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleStateChange = (newState: PlaybackState) => {
      setState(newState);
    };

    const handleError = (err: PlayerError) => {
      setError(err.message);
    };

    playbackRef.current.addListener(handleStateChange);
    playbackRef.current.addErrorListener(handleError);

    return () => {
      playbackRef.current?.removeListener(handleStateChange);
      playbackRef.current?.removeErrorListener(handleError);
    };
  }, []);

  return (
    <div>
      <button onClick={() => playbackRef.current?.togglePlayPause()}>
        {state.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => playbackRef.current?.next()}>
        Skip
      </button>
      {error && <p>{error}</p>}
      <progress
        value={state.progress}
        max={state.duration}
        onChange={(e) => playbackRef.current?.seek(e.currentTarget.value)}
      />
    </div>
  );
}
```

## Media Key Handling (in Electron)

```typescript
// Listen for media controls (from preload.js)
window.desktop.onMediaControl((action: string) => {
  switch (action) {
    case 'play-pause':
      playback.togglePlayPause();
      break;
    case 'next':
      playback.next();
      break;
    case 'previous':
      playback.previous();
      break;
    case 'stop':
      playback.stop();
      break;
  }
});

// Notify Electron of playback state changes
window.desktop.notifyPlaybackStateChanged(state);
```

## Common Patterns

### Auto-Login on App Start
```typescript
useEffect(() => {
  if (SecureStorage.hasValidToken()) {
    setIsAuthenticated(true);
    // Load user data
  }
}, []);
```

### Handle Token Expiration
```typescript
try {
  const results = await client.search(query);
} catch (error) {
  if (error.message === 'Authentication required') {
    // Redirect to login
    SecureStorage.clearTokens();
  }
}
```

### Cache Search Results
```typescript
// Built-in to StingrayClient - search results cached for 10 minutes
const results = await client.search(query); // API call
const cached = await client.search(query);  // From cache
```

### Monitor Playback
```typescript
playback.addListener((state) => {
  console.log(`Playing: ${state.isPlaying}`);
  console.log(`Progress: ${state.progress}/${state.duration}`);
  window.desktop?.notifyPlaybackStateChanged(state);
});
```

## Error Handling

```typescript
try {
  await client.login(username, password);
} catch (error) {
  if (error instanceof Error) {
    console.error('Login failed:', error.message);
  }
}

playback.addErrorListener((error) => {
  console.error(`[${error.code}] ${error.message}`);
  if (error.retryable) {
    // Attempt retry
  }
});
```

For complete documentation, see [IMPLEMENTATION.md](./IMPLEMENTATION.md)

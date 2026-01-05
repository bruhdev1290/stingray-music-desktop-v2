# Stingray Music Desktop - Implementation Guide

This document describes the newly implemented features for the Stingray Music Desktop client.

## ✅ Implemented Features

### 1. Token-Based Authentication
**File**: `desktop/src/renderer/api/stingrayClient.ts`

- **Login Flow**: `client.login(username, password)` exchanges credentials for access/refresh tokens
- **Token Refresh**: Automatic token refresh when expired via `refreshToken()`
- **Logout**: Clears all stored tokens via `logout()`
- **Session State**: Maintains authentication state and prevents simultaneous refresh requests

**Key Methods**:
```typescript
await client.login(username, password);      // Authenticate and store tokens
await client.refreshToken();                 // Refresh expired tokens
await client.logout();                       // Clear session
const user = await client.getCurrentUser();  // Get authenticated user info
```

### 2. Playback Controls & Streaming
**File**: `desktop/src/renderer/api/playback.ts`

- **Full Playback Control**: Play, pause, skip forward/backward, stop, seek
- **Queue Management**: Load and play tracks from a queue
- **Streaming URL Retrieval**: Automatically fetches authenticated streaming URLs
- **Playback State Tracking**: Real-time playback state updates via listeners
- **Error Handling**: Comprehensive error reporting for playback failures

**Key Methods**:
```typescript
await playback.play(track);                   // Play a single track
await playback.playQueue(tracks, startIndex); // Play queue from position
playback.togglePlayPause();                   // Toggle play/pause state
await playback.next();                        // Skip to next track
await playback.previous();                    // Go to previous track
playback.seek(progress);                      // Seek to time position
playback.setVolume(0.8);                      // Set volume (0-1)
```

**State Listening**:
```typescript
playback.addListener((state: PlaybackState) => {
  console.log('Playing:', state.isPlaying);
  console.log('Progress:', state.progress);
});

playback.addErrorListener((error: PlayerError) => {
  console.error(error.message);
});
```

### 3. Media Key & Tray Controls
**File**: `desktop/main.js`, `desktop/preload.js`

#### Keyboard Media Controls
- **MediaPlayPause**: Toggle play/pause
- **MediaNextTrack**: Skip to next track
- **MediaPreviousTrack**: Go to previous track
- **MediaStop**: Stop playback

#### System Tray Integration
- Minimize to system tray (Windows/Linux)
- Tray context menu with playback controls
- Double-click tray icon to show/restore window
- Real-time playback status in tray tooltip

#### IPC Communication
The preload script exposes:
```typescript
window.desktop.onMediaControl((action: string) => {
  // Handle: 'play-pause', 'next', 'previous', 'stop'
});

window.desktop.notifyPlaybackStateChanged(state);
```

### 4. Session Persistence
**File**: `desktop/src/renderer/api/storage.ts`

- **Secure Token Storage**: Uses localStorage with structured key naming
- **Session Recovery**: Automatically restores authenticated sessions on app restart
- **Token Expiry Tracking**: Monitors token expiration and triggers automatic refresh
- **Username Caching**: Remembers logged-in username for convenience

**Key Methods**:
```typescript
SecureStorage.setTokens(tokens);          // Store access/refresh tokens
SecureStorage.getAccessToken();           // Retrieve access token
SecureStorage.isTokenExpired();           // Check if token needs refresh
SecureStorage.hasValidToken();            // Check for valid session
SecureStorage.clearTokens();              // Logout and clear session
```

### 5. Lightweight Cache System
**File**: `desktop/src/renderer/api/cache.ts`

- **TTL-Based Caching**: Each cache entry has configurable time-to-live
- **Automatic Expiration**: Expired entries are automatically removed on access
- **Reduced API Calls**: Caches API responses (tracks, playlists, search results)
- **Manual Control**: Clear cache, check cache existence, remove specific entries

**Key Methods**:
```typescript
cache.set<T>(key, data, ttlMs);  // Cache data with TTL
const data = cache.get<T>(key);  // Retrieve cached data
cache.has(key);                   // Check if key exists (not expired)
cache.remove(key);                // Remove specific entry
cache.clear();                    // Clear entire cache
```

**Cache Durations** (in API client):
- Tracks: 30 minutes
- Search results: 10 minutes
- Recent tracks: 2 minutes
- Playlists: 5 minutes

## Architecture

### API Client (`StingrayClient`)
Provides a typed interface to the Stingray API with:
- Automatic token injection in all requests
- Token refresh on 401 responses
- Built-in caching for common queries
- Error handling and recovery

```
StingrayClient
├── Auth: login, logout, refreshToken
├── Catalog: getTracks, getPlaylists, getTrack
├── Search: search, searchTracks
├── Playback: getStreamingUrl
└── Internal: _authenticatedRequest
```

### Playback Controller (`PlaybackController`)
Manages audio playback with:
- HTMLAudioElement wrapper
- Queue-based playback
- Listener pattern for state updates
- Event-driven architecture

```
PlaybackController
├── Playback: play, pause, resume, stop
├── Queue: playQueue, next, previous
├── Control: seek, setVolume, togglePlayPause
└── Events: addListener, addErrorListener
```

### Storage & Cache
- **SecureStorage**: Persistent token/session storage
- **CacheManager**: In-memory cache with TTL support

## UI Integration

The main `App.tsx` component demonstrates all features:

1. **API Base URL Configuration**: Override endpoint for testing
2. **Authentication UI**: Login form with token management
3. **Playback Controls**: Play/pause/skip buttons with state display
4. **Theme System**: 18 preserved themes from legacy UI
5. **Status Indicators**: Real-time feedback on auth and API status

## Error Handling

Each component handles errors gracefully:

- **Auth Errors**: Invalid credentials, token refresh failures
- **Playback Errors**: Network issues, invalid streaming URLs, codec problems
- **API Errors**: Network failures, 4xx/5xx responses, timeout handling

Errors are propagated via listeners and UI status indicators.

## Security Considerations

⚠️ **Before Production Release**:

1. **Token Storage**: Replace localStorage with OS keyring (Electron's `safeStorage`)
   ```typescript
   // Use Electron's secure storage
   import { safeStorage } from 'electron';
   ```

2. **Token Transmission**: Use HTTPS only
3. **CORS**: Ensure proper CORS headers on API
4. **Sandbox**: Keep preload script minimal, use IPC for sensitive operations
5. **SSL Pinning**: Consider implementing certificate pinning for production

## Testing the Implementation

### 1. API Connectivity
```typescript
const client = new StingrayClient('https://api.example.com');
const reachable = await client.ping();
```

### 2. Authentication Flow
```typescript
const tokens = await client.login('user@example.com', 'password');
const user = await client.getCurrentUser();
```

### 3. Playback
```typescript
const tracks = await client.searchTracks('your search query');
await playback.playQueue(tracks, 0);
playback.addListener(state => console.log(state));
```

### 4. Cache Behavior
```typescript
const tracks = await client.searchTracks('test'); // API call
const cached = await client.searchTracks('test'); // From cache
```

## Next Steps

1. **Update API Endpoint**: Configure real Stingray API URL
2. **Implement Token Refresh UI**: Show loading state during refresh
3. **Add Audio Visualization**: Spectrum analyzer or waveform display
4. **Implement Favorites/Library**: Persist user library
5. **Add Offline Mode**: Queue downloads for offline playback
6. **Desktop Notifications**: Show current track in system notifications
7. **Custom Keyboard Shortcuts**: Configurable media key bindings

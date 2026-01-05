# Web Player Alternative Login Flow

## Overview

The Stingray Music Desktop now supports **two authentication methods**:

1. **Direct API Authentication** - Traditional token-based auth against the Stingray API
2. **Web Player Authentication** - Skip the API entirely and authenticate via https://webplayer.stingray.com

## Web Player Client (`webPlayerClient.ts`)

The `WebPlayerClient` provides a complete interface to authenticate and fetch content through the Stingray web player.

### Authentication Flow

```typescript
const webPlayerClient = new WebPlayerClient();

// Method 1: Open auth window
const session = await webPlayerClient.openAuthWindow();

// Method 2: Direct authentication
const session = await webPlayerClient.authenticate();
```

### How It Works

1. **Opens Authentication Window**: User clicks "Login with Web Player" button
2. **User Logs In**: Browser opens webplayer.stingray.com where user logs in naturally
3. **Session Detection**: App polls for authentication completion
4. **Automatic Closure**: Once authenticated, auth window closes and playback begins
5. **Session Persistence**: Cookies are maintained for subsequent API calls

## Key Features

### Session Management
```typescript
// Check if authenticated
const isAuth = webPlayerClient.isAuthenticated();

// Validate session
const valid = await webPlayerClient.validateSession();

// Get current session
const session = webPlayerClient.getSession();

// Logout
await webPlayerClient.logout();
```

### Content Fetching (Same API as StingrayClient)

```typescript
// Get recent tracks
const recent = await webPlayerClient.getRecentTracks(20);

// Search
const results = await webPlayerClient.search('query', 10);
const tracks = await webPlayerClient.searchTracks('query');

// Playlists
const playlists = await webPlayerClient.getPlaylists();
const playlist = await webPlayerClient.getPlaylist(playlistId);

// Get track details
const track = await webPlayerClient.getTrack(trackId);

// Get streaming URL
const url = await webPlayerClient.getStreamingUrl(trackId);

// User info
const user = await webPlayerClient.getCurrentUser();
```

### Built-in Caching

The web player client includes the same TTL-based caching as the API client:
- Recent tracks: 2 minutes
- Playlists: 5 minutes
- Search results: 10 minutes
- Track details: 30 minutes

## UI Integration

The app now shows **two login options**:

### Option 1: Login with API
- Enter username/password
- Direct Stingray API authentication
- Credentials exchanged for tokens
- Full control over token management

### Option 2: Login with Web Player
- Click "Login with Web Player" button
- Browser opens webplayer.stingray.com
- Login naturally through the web interface
- No password needed (browser handles it)
- Automatic session detection

## Technical Details

### Cookie-Based Authentication

The web player client uses browser cookies for session management:
- Credentials never sent to the desktop app
- Browser security features protect the login
- Session cookies maintained across requests
- CORS-compliant requests with credentials

### Cross-Origin Requests

All requests to webplayer.stingray.com include:
```
credentials: 'include'
```

This ensures cookies are sent with each request for authentication.

### Session Polling

The auth window polls every 1 second to check for authentication:
```
GET https://webplayer.stingray.com/api/user
```

Once successful, the auth window closes automatically.

## Error Handling

```typescript
try {
  const session = await webPlayerClient.openAuthWindow();
  if (session.authenticated) {
    // Use web player for content
  }
} catch (error) {
  // Handle auth failure
  console.error(error.message);
}
```

Common errors:
- **"Failed to open authentication window"** - Popup blocked
- **"Authentication timeout"** - User didn't login within 5 minutes
- **"Session expired"** - 401 error during API calls
- **"Web player API error"** - 4xx/5xx response

## Advantages of Web Player Auth

✅ **User Experience**
- Familiar login interface (the official web player)
- No need to remember API credentials
- Browser handles password security

✅ **Security**
- Credentials stay in browser
- No token exchange over network
- Browser's security model protects auth

✅ **Reliability**
- Works even if API is down
- Uses production-tested web player
- Same authentication as official app

✅ **Flexibility**
- 2FA/SSO support if web player has it
- OAuth/OpenID if integrated
- Company-wide authentication policies

## When to Use Each Method

### Use **API Authentication** when:
- You want programmatic access
- Building headless clients
- You need explicit token control
- Working with service accounts

### Use **Web Player Authentication** when:
- Users want familiar login experience
- API is unreliable or unavailable
- You want maximum security
- Users are already logged into web player

## Example: Switching Between Methods

```typescript
const [authMethod, setAuthMethod] = useState<'api' | 'webplayer' | null>(null);

const loginViaApi = async (username: string, password: string) => {
  await apiClient.login(username, password);
  setAuthMethod('api');
};

const loginViaWebPlayer = async () => {
  const session = await webPlayerClient.openAuthWindow();
  setAuthMethod('webplayer');
};

const getContent = async () => {
  if (authMethod === 'api') {
    return await apiClient.searchTracks('query');
  } else {
    return await webPlayerClient.searchTracks('query');
  }
};
```

## Debugging Web Player Issues

### If Auth Window Doesn't Open
- Check browser popup blocker settings
- Ensure HTTPS is supported
- Check console for security errors

### If Session Polling Fails
- Verify webplayer.stingray.com is accessible
- Check network tab in DevTools
- Ensure CORS headers are correct

### If Content Fetch Fails
- Validate session with `validateSession()`
- Check API response in DevTools
- Ensure endpoint exists on web player

## Browser Compatibility

Works with any browser that supports:
- window.open() for popup
- Fetch API with credentials
- CORS with credentials
- localStorage (for optional session caching)

## Security Considerations

⚠️ **Before Production**:

1. **HTTPS Only** - Ensure webplayer.stingray.com uses HTTPS
2. **CORS Policy** - Verify correct CORS headers
3. **Cookie SameSite** - Check cookie policies
4. **CSP Headers** - Content Security Policy for popups
5. **Session Timeout** - Implement server-side session validation

## Future Enhancements

Potential improvements:
- Redirect-based auth (OAuth 2.0 flow)
- Refresh token support
- Persistent session across restarts
- Multi-account support
- Social login (if web player supports it)

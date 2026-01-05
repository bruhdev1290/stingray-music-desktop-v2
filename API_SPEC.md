## Stingray API Endpoints Expected

This document lists the API endpoints that the client expects from the Stingray backend.

### Authentication

```
POST /auth/login
├── Request: { username: string, password: string }
└── Response: { 
    accessToken: string, 
    refreshToken?: string, 
    expiresIn?: number 
  }

POST /auth/refresh
├── Request: { refreshToken: string }
└── Response: { 
    accessToken: string, 
    refreshToken?: string, 
    expiresIn?: number 
  }

POST /auth/logout
├── Headers: Authorization: Bearer {accessToken}
└── Response: { success: boolean }
```

### User

```
GET /user
├── Headers: Authorization: Bearer {accessToken}
└── Response: { 
    id: string, 
    username: string, 
    email: string 
  }
```

### Tracks

```
GET /tracks/recent?limit=20
├── Headers: Authorization: Bearer {accessToken}
└── Response: Track[]

GET /tracks/{trackId}
├── Headers: Authorization: Bearer {accessToken}
└── Response: Track (see below)

GET /search/tracks?q={query}&limit=20
├── Headers: Authorization: Bearer {accessToken}
└── Response: Track[]

GET /tracks/{trackId}/stream
├── Headers: Authorization: Bearer {accessToken}
└── Response: { url: string }
```

### Search

```
GET /search?q={query}&limit=10
├── Headers: Authorization: Bearer {accessToken}
└── Response: {
    tracks: Track[],
    artists: Artist[],
    albums: Album[],
    playlists: Playlist[]
  }
```

### Playlists

```
GET /playlists
├── Headers: Authorization: Bearer {accessToken}
└── Response: Playlist[]

GET /playlists/{playlistId}
├── Headers: Authorization: Bearer {accessToken}
└── Response: Playlist (see below)
```

### Data Types

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  streamingUrl: string;
  imageUrl?: string;
}

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  releaseDate?: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  imageUrl?: string;
}

interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}
```

### Error Handling

All endpoints should return appropriate HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Maintenance

Error response format:
```json
{
  "error": "error_code",
  "message": "Human readable error message"
}
```

### CORS Requirements

The API should set the following CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Rate Limiting

Recommended rate limits:

- Authentication endpoints: 5 requests per minute per IP
- Search endpoints: 30 requests per minute per user
- Playback endpoints: Unlimited
- Other endpoints: 100 requests per minute per user

### Authentication Flow

```
1. POST /auth/login
   ├── username, password
   └── returns accessToken, refreshToken, expiresIn

2. All subsequent requests
   ├── Include: Authorization: Bearer {accessToken}
   └── If 401, attempt refresh

3. POST /auth/refresh
   ├── refreshToken
   └── returns new accessToken, refreshToken, expiresIn

4. Update stored tokens
   └── Continue with new accessToken

5. POST /auth/logout
   ├── Invalidate current tokens
   └── Optional (for cleanup)
```

### Testing the Endpoints

You can test these endpoints with curl:

```bash
# Login
curl -X POST https://api.stingray.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# Get current user
curl -X GET https://api.stingray.com/user \
  -H "Authorization: Bearer {accessToken}"

# Search
curl -X GET "https://api.stingray.com/search?q=query&limit=10" \
  -H "Authorization: Bearer {accessToken}"

# Get streaming URL
curl -X GET https://api.stingray.com/tracks/{trackId}/stream \
  -H "Authorization: Bearer {accessToken}"
```

---

## Web Player API Endpoints (Alternative Authentication)

The web player at https://webplayer.stingray.com provides an alternative authentication flow without relying on direct API calls.

### Authentication Flow

```
1. Open Auth Window
   └─ https://webplayer.stingray.com/login opens in browser

2. User Logs In
   └─ Natural login interface, browser handles credentials

3. Session Detection
   └─ App polls /api/user with credentials: 'include'
   └─ Returns 200 with session cookies present

4. Automatic Window Close
   └─ Once /api/user succeeds, auth window closes
```

### Web Player Endpoints

All endpoints require `credentials: 'include'` (session cookies):

```
GET /api/user
├─ Response: { id: string, username: string }

GET /api/tracks/recent?limit=20
├─ Response: Track[]

GET /api/tracks/{trackId}
├─ Response: Track

GET /api/search?q={query}&limit=10
├─ Response: SearchResults

GET /api/search/tracks?q={query}&limit=20
├─ Response: Track[]

GET /api/playlists
├─ Response: Playlist[]

GET /api/playlists/{playlistId}
├─ Response: Playlist

GET /api/tracks/{trackId}/stream
├─ Response: { url: string }

POST /api/logout
├─ Response: { success: boolean }
```

### CORS Requirements for Web Player

```
Access-Control-Allow-Origin: * (or specific origin)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

### Advantages of Web Player Auth

✅ No password stored in desktop app
✅ Uses official Stingray login interface
✅ Works if direct API is unavailable
✅ Browser handles security credentials
✅ Same data access as API method
✅ Supports 2FA if web player implements it

For detailed information, see [WEB_PLAYER_AUTH.md](./WEB_PLAYER_AUTH.md)

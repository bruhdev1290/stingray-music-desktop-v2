import React, { useEffect, useMemo, useState, useRef } from 'react';
import { StingrayClient } from './api/stingrayClient';
import { WebPlayerClient } from './api/webPlayerClient';
import { PlaybackController } from './api/playback';
import { SecureStorage } from './api/storage';
import { themes } from './theme/themes';
import type { Theme } from './theme/types';
import type { PlaybackState } from './api/types';

const DEFAULT_BASE_URL = 'https://music-api.stingray.com';

type Status = 'idle' | 'checking' | 'ok' | 'error' | 'authenticated';
type AuthStatus = 'idle' | 'logging-in' | 'authenticated' | 'error';
type AuthMethod = 'api' | 'webplayer' | null;

declare global {
  interface Window {
    desktop?: {
      onMediaControl: (callback: (action: string) => void) => void;
      notifyPlaybackStateChanged: (state: PlaybackState) => void;
      platform: string;
      versions: NodeJS.ProcessVersions;
    };
  }
}

export default function App(): JSX.Element {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTrackId: null,
    progress: 0,
    duration: 0,
    queue: [],
    currentIndex: -1
  });

  const clientRef = useRef<StingrayClient | null>(null);
  const webPlayerClientRef = useRef<WebPlayerClient | null>(null);
  const playbackRef = useRef<PlaybackController | null>(null);

  const client = useMemo(() => {
    const newClient = new StingrayClient(baseUrl);
    clientRef.current = newClient;
    return newClient;
  }, [baseUrl]);

  const webPlayerClient = useMemo(() => {
    const newClient = new WebPlayerClient();
    webPlayerClientRef.current = newClient;
    return newClient;
  }, []);

  // Initialize playback controller
  useEffect(() => {
    playbackRef.current = new PlaybackController(client);

    const handlePlaybackStateChange = (state: PlaybackState) => {
      setPlaybackState(state);
      if (window.desktop?.notifyPlaybackStateChanged) {
        window.desktop.notifyPlaybackStateChanged(state);
      }
    };

    const handlePlaybackError = (error: any) => {
      setMessage(`Playback error: ${error.message}`);
      console.error('Playback error:', error);
    };

    playbackRef.current.addListener(handlePlaybackStateChange);
    playbackRef.current.addErrorListener(handlePlaybackError);

    return () => {
      if (playbackRef.current) {
        playbackRef.current.removeListener(handlePlaybackStateChange);
        playbackRef.current.removeErrorListener(handlePlaybackError);
        playbackRef.current.destroy();
      }
    };
  }, [client]);

  // Register media key handlers
  useEffect(() => {
    if (!window.desktop?.onMediaControl) {
      return;
    }

    const handleMediaControl = (action: string) => {
      if (!playbackRef.current) return;

      switch (action) {
        case 'play-pause':
          playbackRef.current.togglePlayPause();
          break;
        case 'next':
          playbackRef.current.next().catch(err => console.error('Next track error:', err));
          break;
        case 'previous':
          playbackRef.current.previous().catch(err => console.error('Previous track error:', err));
          break;
        case 'stop':
          playbackRef.current.stop();
          break;
      }
    };

    window.desktop.onMediaControl(handleMediaControl);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    if (SecureStorage.hasValidToken()) {
      setAuthStatus('authenticated');
      const storedUsername = SecureStorage.getUsername();
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (!activeTheme?.properties) {
      resetThemeVariables();
      return;
    }

    const root = document.documentElement;
    Object.entries(activeTheme.properties).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      resetThemeVariables();
    };
  }, [activeTheme]);

  const onPing = async (): Promise<void> => {
    setStatus('checking');
    setMessage('');

    try {
      const reachable = await client.ping();
      setStatus(reachable ? 'ok' : 'error');
      setMessage(reachable ? 'API reachable' : 'API responded with a non-OK status');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ping failed');
    }
  };

  const onLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setAuthStatus('logging-in');
    setMessage('');

    try {
      await client.login(username, password);
      setAuthStatus('authenticated');
      setAuthMethod('api');
      setPassword('');
      setMessage('Successfully logged in via API');
      setStatus('authenticated');
    } catch (error) {
      setAuthStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setMessage(errorMsg.includes('401') || errorMsg.includes('invalid') ? 'Invalid username or password' : errorMsg);
    }
  };

  const onWebPlayerLogin = async (): Promise<void> => {
    setAuthStatus('logging-in');
    setMessage('Opening web player authentication window...');

    try {
      const session = await webPlayerClient.openAuthWindow();
      if (session.authenticated) {
        setAuthStatus('authenticated');
        setAuthMethod('webplayer');
        setUsername(session.username || 'Web Player User');
        setMessage('Successfully logged in via Web Player');
        setStatus('authenticated');
      } else {
        throw new Error('Authentication was not completed. Please try again.');
      }
    } catch (error) {
      setAuthStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Web player login failed';
      setMessage(errorMsg);
    }
  };

  const onLogout = async (): Promise<void> => {
    try {
      if (authMethod === 'api') {
        await client.logout();
      } else if (authMethod === 'webplayer') {
        await webPlayerClient.logout();
      }
      setAuthStatus('idle');
      setAuthMethod(null);
      setUsername('');
      setPassword('');
      setMessage('Logged out');
      if (playbackRef.current) {
        playbackRef.current.stop();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Logout failed');
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="pill">Desktop • Electron + React</p>
          <h1 className="headline">Stingray Music Desktop Shell</h1>
          <p className="subhead">
            A fully-featured Electron + React shell with token auth, playback controls, media keys, and session persistence.
          </p>
          <div className="row" style={{ gap: 14 }}>
            <button onClick={onPing} disabled={status === 'checking'}>
              {status === 'checking' ? 'Pinging…' : 'Check API reachability'}
            </button>
            <span className="muted">Current base URL: {baseUrl}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <StatusPill status={status} message={message} />
          </div>
        </div>
        <div className="card stack">
          <label className="muted" htmlFor="base-url">
            API Base URL
          </label>
          <input
            id="base-url"
            className="input"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={DEFAULT_BASE_URL}
          />
          <p className="muted" style={{ margin: 0 }}>
            Override if you use a staging gateway or local proxy.
          </p>
        </div>
      </section>

      <section className="grid">
        {authStatus !== 'authenticated' ? (
          <>
            <div className="card stack">
              <h3 style={{ margin: 0 }}>Login with API</h3>
              <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={authStatus === 'logging-in'}
                />
                <input
                  type="password"
                  className="input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authStatus === 'logging-in'}
                />
                <button
                  type="submit"
                  disabled={authStatus === 'logging-in' || !username || !password}
                  style={{ cursor: authStatus === 'logging-in' ? 'not-allowed' : 'pointer' }}
                >
                  {authStatus === 'logging-in' ? 'Logging in…' : 'Login with API'}
                </button>
                {authStatus === 'error' && (
                  <p style={{ color: '#ff6b6b', margin: 0, fontSize: '0.9em' }}>{message}</p>
                )}
              </form>
            </div>

            <div className="card stack">
              <h3 style={{ margin: 0 }}>Login via Web Player</h3>
              <p className="muted" style={{ margin: '8px 0', fontSize: '0.9em' }}>
                A new window will open where you can log in with your Stingray account. Select your operator and complete the login process.
              </p>
              <button
                onClick={onWebPlayerLogin}
                disabled={authStatus === 'logging-in'}
                style={{
                  cursor: authStatus === 'logging-in' ? 'not-allowed' : 'pointer',
                  backgroundColor: '#1e88e5'
                }}
              >
                {authStatus === 'logging-in' ? 'Opening Web Player…' : '🌐 Open Web Player Login'}
              </button>
              {authStatus === 'error' && message.includes('Web player') && (
                <p style={{ color: '#ff6b6b', margin: '8px 0', fontSize: '0.9em' }}>{message}</p>
              )}
            </div>
          </>
        ) : (
          <div className="card stack">
            <h3 style={{ margin: 0 }}>Authenticated</h3>
            <p className="muted" style={{ margin: '8px 0' }}>
              Logged in as: <strong>{username}</strong>
            </p>
            <p className="muted" style={{ margin: '4px 0', fontSize: '0.85em' }}>
              Via: {authMethod === 'api' ? 'API' : 'Web Player'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onLogout} style={{ flex: 1 }}>
                Logout
              </button>
            </div>
          </div>
        )}

        {authStatus === 'authenticated' && (
          <div className="card stack">
            <h3 style={{ margin: 0 }}>Playback Controls</h3>
            <div className="muted" style={{ lineHeight: 1.5, marginBottom: 12 }}>
              <div>Status: {playbackState.isPlaying ? 'Playing' : 'Stopped'}</div>
              <div>
                Progress: {playbackState.progress.toFixed(1)}s / {playbackState.duration.toFixed(1)}s
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => playbackRef.current?.previous()}>⏮ Previous</button>
              <button onClick={() => playbackRef.current?.togglePlayPause()}>
                {playbackState.isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button onClick={() => playbackRef.current?.next()}>⏭ Next</button>
              <button onClick={() => playbackRef.current?.stop()}>⏹ Stop</button>
            </div>
          </div>
        )}

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Implementation Status</h3>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
            <li>✅ Token-based auth flow (API)</li>
            <li>✅ Web player alternative login</li>
            <li>✅ Playback controls and streaming URLs</li>
            <li>✅ Media key handling and tray controls</li>
            <li>✅ Session persistence and cache system</li>
          </ul>
        </div>
      </section>

      <section className="card stack">
        <h3 style={{ margin: 0 }}>Themes (preserved from legacy UI)</h3>
        <p className="muted" style={{ margin: 0 }}>
          Pick a theme to preview background and highlight tokens. These values are applied as CSS variables.
        </p>
        <div className="theme-grid">
          {themes.map((theme) => {
            const isActive = theme.id === activeTheme.id;
            const color = theme.thumbnailColor || '#1c1c1c';
            const thumbSrc = theme.thumbnailImage;

            return (
              <button
                key={theme.id}
                className="theme-card"
                onClick={() => setActiveTheme(theme)}
                aria-pressed={isActive}
                style={{
                  outline: isActive ? '2px solid rgba(102, 209, 255, 0.8)' : 'none',
                  boxShadow: isActive ? '0 0 0 4px rgba(102, 209, 255, 0.16)' : undefined
                }}
              >
                {thumbSrc ? (
                  <img src={thumbSrc} alt={theme.name} className="theme-thumb" />
                ) : (
                  <div
                    className="theme-thumb"
                    style={{ background: color }}
                    aria-hidden
                  />
                )}
                <div className="theme-meta">
                  <span>{theme.name}</span>
                  {isActive ? <span className="badge">Active</span> : <span className="muted">Tap to apply</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status, message }: { status: Status; message: string }): JSX.Element {
  const label =
    status === 'idle'
      ? 'Idle'
      : status === 'checking'
        ? 'Checking…'
        : status === 'ok'
          ? 'Reachable'
          : status === 'authenticated'
            ? 'Authenticated'
            : 'Error';

  const tone = status === 'ok' || status === 'authenticated' ? '#3cd17c' : status === 'error' ? '#ff6b6b' : '#a5adba';

  return (
    <div className="pill" style={{ borderColor: `${tone}55`, color: tone }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: tone, display: 'inline-block' }} />
      <span>{label}</span>
      {message && <span className="muted">{message}</span>}
    </div>
  );
}

function resetThemeVariables(): void {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', '#0b0c0f');
  root.style.setProperty('--color-highlight', '#66d1ff');
  root.style.setProperty('--bg-image', 'none');
  root.style.setProperty('--bg-position', 'center');
  root.style.removeProperty('--font-family');
}

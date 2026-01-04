import React, { useEffect, useMemo, useState } from 'react';
import { StingrayClient } from './api/stingrayClient';
import { themes } from './theme/themes';
import type { Theme } from './theme/types';

const DEFAULT_BASE_URL = 'https://music-api.stingray.com';

type Status = 'idle' | 'checking' | 'ok' | 'error';

export default function App(): JSX.Element {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);

  const client = useMemo(() => new StingrayClient(baseUrl), [baseUrl]);

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

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="pill">Desktop • Electron + React</p>
          <h1 className="headline">Stingray Music Desktop Shell</h1>
          <p className="subhead">
            This is a starter Electron + React shell that talks to the Stingray API. Configure the API base URL,
            wire up auth and playback, and ship native builds for Windows and Linux.
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
            Override if you use a staging gateway or local proxy. Auth and playback endpoints will reuse this base.
          </p>
        </div>
      </section>

      <section className="grid">
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Next steps</h3>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
            <li>Implement token-based auth against the Stingray API</li>
            <li>Build playback controls around streaming URLs</li>
            <li>Add media key handling and tray controls</li>
            <li>Persist session and lightweight cache for recent items</li>
          </ul>
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Project layout</h3>
          <div className="muted" style={{ lineHeight: 1.5 }}>
            <div>/main.js — Electron entry</div>
            <div>/preload.js — safe bridge</div>
            <div>/src/renderer — React UI</div>
            <div>/src/renderer/api — API client stubs</div>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Use `npm run dev` to start Vite and Electron together. Build installers with `npm run build`.
          </p>
        </div>

        <div className="card stack">
          <h3 style={{ margin: 0 }}>Stingray API</h3>
          <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
            Wire up login, catalog browse, search, favorites, and playback URL retrieval in
            <code> stingrayClient.ts</code>. Add secure token storage (e.g., OS keyring) before release.
          </p>
        </div>
      </section>

      <section className="card stack">
        <h3 style={{ margin: 0 }}>Themes (preserved from legacy UI)</h3>
        <p className="muted" style={{ margin: 0 }}>
          Pick a theme to preview background and highlight tokens. These values are applied as CSS variables for the
          renderer.
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
          : 'Error';

  const tone = status === 'ok' ? '#3cd17c' : status === 'error' ? '#ff6b6b' : '#a5adba';

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

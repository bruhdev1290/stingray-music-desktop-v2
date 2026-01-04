# Stingray Music Desktop Client (Electron + React)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)

A cross-platform desktop client (Electron + React + TypeScript) that talks directly to the Stingray Music API. The legacy Laravel/Vue backend has been removed; only shared UI/theme assets remain.

## Introduction

This repo now focuses solely on the Electron/React desktop app. It will authenticate against the Stingray Music API, fetch catalog/search data, and play streams natively on Windows and Linux. Theme assets from the legacy UI are preserved and applied via CSS variables.

## Features (current and planned)

- 🎵 Streaming playback via Stingray API streams
- 🎨 Theme selector using preserved Stingray/Koel visual assets
- 🔐 Token-based auth against Stingray API (stub in code; wire real flow)
- ⌨️ Media keys, tray controls, now-playing metadata (to be added)
- 🔍 Browse/search catalog (to be added)
- ⬇️ Optional offline cache (future)

## System Requirements

- Node.js 18+
- npm (or pnpm/yarn if you prefer; scripts assume npm)
- Windows 10+ or modern Linux desktop

## Getting Started (Electron app)

```bash
git clone https://github.com/bruhdev1290/stingray-music-desktop-v2.git
cd stingray-music-desktop-v2/desktop
npm install
npm run dev   # runs Vite + Electron
```

Build installers:

```bash
npm run build   # outputs to release/
```

## Project Structure (after Laravel removal)

```
stingray-music-desktop-v2/
├── desktop/                   # Electron + React app (source lives here)
│   ├── main.js                # Electron entry
│   ├── preload.js             # Secure bridge
│   ├── src/renderer/          # React renderer (Vite, TS)
│   │   ├── App.tsx            # UI shell + theme picker
│   │   ├── api/stingrayClient.ts
│   │   └── theme/             # Theme catalog and types
│   └── public/themes/         # Preserved theme images/thumbnails
├── resources/assets/img/      # Legacy images kept for reuse
├── public/                    # Legacy web artifacts (may be pruned later)
└── docs/                      # Documentation
```

## Theme Assets

- Preserved backgrounds/thumbnails live in `desktop/public/themes` and `desktop/public/themes/thumbnails`.
- The theme catalog is defined in `desktop/src/renderer/theme/themes.ts` and applied via CSS variables.

## Development

```bash
cd desktop
npm run dev      # Vite + Electron
npm run build    # package app
npm run typecheck
```

## Stingray API Integration

- The API client stub is in `desktop/src/renderer/api/stingrayClient.ts`. Implement real auth, catalog, search, playback URL retrieval, and token refresh here.
- Store tokens securely (e.g., OS keyring) before shipping.

## Contributing

1. Fork and branch (`git checkout -b feature/your-feature`).
2. Update code and docs.
3. Run checks (`npm run typecheck`, optionally add tests when available).
4. Open a PR.

## License

MIT. See [LICENSE.md](LICENSE.md).

## Support

Open an [issue](https://github.com/bruhdev1290/stingray-music-desktop-v2/issues) with details about your environment and steps to reproduce.

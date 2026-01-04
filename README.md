# Stingray Music Desktop Client

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-brightgreen.svg)
![Build](https://img.shields.io/badge/build-Electron%20%2B%20React-blue.svg)

A modern cross-platform desktop client built with **Electron**, **React**, and **TypeScript** that integrates with the Stingray Music API. The legacy Laravel/Vue backend has been removed, leaving a clean, focused Electron application with preserved theme assets.

## 🎯 Overview

This project provides a native desktop experience for Stingray Music on Windows and Linux. It authenticates against the Stingray Music API, manages your music library, and supports streaming with a beautiful, customizable interface powered by preserved theme assets.

## ✨ Features

- **🎵 Streaming Playback** – Play streams directly from the Stingray Music API
- **🎨 Theme Selector** – Choose from multiple themes using preserved visual assets
- **🔐 Secure Authentication** – Token-based auth against Stingray API (implementation in progress)
- **⌨️ Keyboard Controls** – Media keys, tray integration, and now-playing metadata (planned)
- **🔍 Search & Browse** – Discover and search your music catalog (planned)
- **⬇️ Offline Cache** – Optional offline playback support (future)

## 📋 System Requirements

- **Node.js** 18 or higher
- **npm**, pnpm, or yarn (scripts assume npm)
- **Windows 10+** or modern Linux desktop environment

## �� Quick Start

### Clone and Install

```bash
git clone https://github.com/bruhdev1290/stingray-music-desktop-v2.git
cd stingray-music-desktop-v2/desktop
npm install
```

### Development

```bash
npm run dev       # Start Vite dev server + Electron
npm run typecheck # Type check the code
```

### Build Installers

```bash
npm run build     # Create distributable packages in release/
```

## 📁 Project Structure

```
stingray-music-desktop-v2/
├── desktop/                          # Electron + React application
│   ├── main.js                       # Electron main process entry
│   ├── preload.js                    # Secure IPC bridge
│   ├── src/
│   │   ├── renderer/
│   │   │   ├── App.tsx               # Root React component + theme picker
│   │   │   ├── api/                  # API client integration
│   │   │   ├── theme/                # Theme configuration and types
│   │   │   └── styles.css            # Global styles
│   │   └── ...
│   └── public/themes/                # Theme images and thumbnails
├── resources/assets/                 # Shared legacy assets
├── public/                           # Web artifacts (legacy, may be pruned)
└── docs/                             # Documentation
```

## 🎨 Theme Assets

- Theme images and thumbnails are located in `desktop/public/themes/` and `desktop/public/themes/thumbnails/`
- Theme definitions are in `desktop/src/renderer/theme/themes.ts`
- Themes are applied dynamically via CSS variables

## 🔧 Development Guide

### API Integration

The Stingray API client stub is located at `desktop/src/renderer/api/stingrayClient.ts`. You'll need to implement:

- Real authentication flow
- Catalog and search endpoints
- Playback URL retrieval
- Token refresh logic
- Secure token storage (using OS keyring)

### Type Checking

```bash
npm run typecheck
```

### Project Standards

- Use TypeScript for all new code
- Follow existing code conventions
- Check existing components before creating new ones

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes and update documentation
4. **Test** your changes: `npm run typecheck`
5. **Commit** with clear messages
6. **Push** to your fork and **open a PR**

## 📄 License

MIT License – See [LICENSE.md](LICENSE.md) for details.

## 💬 Support

Found a bug or have a question? Please [open an issue](https://github.com/bruhdev1290/stingray-music-desktop-v2/issues) with:

- Your environment details (OS, Node version)
- Steps to reproduce the issue
- Expected vs. actual behavior

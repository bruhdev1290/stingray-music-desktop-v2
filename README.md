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

### General

- **Node.js** 18 or higher
- **npm**, pnpm, or yarn (scripts assume npm)

### Windows

- **Windows 10+** (64-bit recommended)
- Build tools (Visual Studio Build Tools or similar for native modules)

### Linux

- **Modern Linux desktop environment** (Ubuntu 18.04+, Fedora 30+, etc.)
- Development headers (`build-essential`, `libx11-dev`, etc.)
- GTK 3.0+ libraries

## 🚀 Quick Start

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

##  Building & Deployment

### Development Build

```bash
npm run dev
```

Runs the application in development mode with hot reload.

### Production Build (All Platforms)

```bash
npm run build
```

This command:
- Bundles the React frontend with Vite
- Packages the Electron app
- Generates platform-specific installers in `desktop/release/`

### Platform-Specific Builds

#### Windows Deployment

**Prerequisites:**
- Windows 10+ (64-bit)
- Node.js 18+
- Optional: Visual Studio Build Tools for native module compilation

**Build Windows Installer:**

```bash
cd desktop
npm install
npm run build
# Outputs: release/Stingray Music Desktop Setup *.exe (32-bit and 64-bit)
```

The Windows build generates:
- `*.exe` – Installer executable
- `*.msi` – MSI installer package (if configured)
- Portable executable (optional)

**Installation:**
1. Download the installer from `release/`
2. Run the `.exe` file
3. Follow the installation wizard
4. The app will be installed to `Program Files/Stingray Music Desktop` (or similar)

**Portable Execution (Optional):**
```bash
cd release
./Stingray\ Music\ Desktop.exe
```

#### Linux Deployment

**Prerequisites:**
- Modern Linux distribution (Ubuntu 18.04+, Fedora 30+, etc.)
- Node.js 18+
- Build tools: `build-essential`, `libx11-dev`, `libxrandr-dev`, `libxinerama-dev`, `libxcursor-dev`, `libxi-dev`

**Install Build Dependencies (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  libx11-dev \
  libxrandr-dev \
  libxinerama-dev \
  libxcursor-dev \
  libxi-dev \
  libgtk-3-dev \
  libdbus-1-dev
```

**Install Build Dependencies (Fedora/RHEL):**

```bash
sudo dnf install -y \
  gcc \
  gcc-c++ \
  make \
  libX11-devel \
  libXrandr-devel \
  libxinerama-devel \
  libxcursor-devel \
  libxi-devel \
  gtk3-devel \
  dbus-devel
```

**Build Linux Package:**

```bash
cd desktop
npm install
npm run build
# Outputs: release/Stingray\ Music\ Desktop-*.AppImage
#          release/Stingray\ Music\ Desktop-*.snap (if configured)
#          release/*.deb or *.rpm (if configured)
```

The Linux build generates:
- **AppImage** – Portable Linux executable (recommended)
- **DEB** – Debian/Ubuntu installer package
- **RPM** – Fedora/RHEL installer package
- **Snap** – Snap package (if configured)

**Installation Options:**

*Option 1: AppImage (No Installation Required)*
```bash
chmod +x Stingray\ Music\ Desktop-*.AppImage
./Stingray\ Music\ Desktop-*.AppImage
```

*Option 2: DEB Package*
```bash
sudo dpkg -i Stingray\ Music\ Desktop-*.deb
# Or double-click in your file manager to install
```

*Option 3: RPM Package*
```bash
sudo rpm -i Stingray\ Music\ Desktop-*.rpm
```

## 📦 Build Configuration

Build settings are configured in:
- `desktop/electron-builder.config.cjs` – Electron Builder configuration
- `desktop/vite.config.ts` – Vite bundler configuration
- `desktop/package.json` – Build scripts and dependencies

To customize the build output:
1. Edit `electron-builder.config.cjs` to change installer settings, signing, notarization, etc.
2. Run `npm run build` to regenerate packages

## 📁 Project Structure

```
stingray-music-desktop-v2/
├── desktop/                          # Electron + React application
│   ├── main.js                       # Electron main process entry
│   ├── preload.js                    # Secure IPC bridge
│   ├── electron-builder.config.cjs   # Build configuration
│   ├── vite.config.ts                # Frontend bundler config
│   ├── src/
│   │   ├── renderer/
│   │   │   ├── App.tsx               # Root React component + theme picker
│   │   │   ├── api/                  # API client integration
│   │   │   ├── theme/                # Theme configuration and types
│   │   │   └── styles.css            # Global styles
│   │   └── ...
│   ├── public/themes/                # Theme images and thumbnails
│   └── release/                      # Build output (after running build)
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

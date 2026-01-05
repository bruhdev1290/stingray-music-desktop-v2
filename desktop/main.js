const path = require('path');
const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0b0c0f',
    icon: path.join(__dirname, 'public/app-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false
    }
  });

  if (isDev) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle minimize to tray on Windows and Linux
  mainWindow.on('minimize', (event) => {
    if (process.platform !== 'darwin') {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('close', (event) => {
    if (mainWindow && !app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public/tray-icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Play/Pause',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('media-control', 'play-pause');
        }
      }
    },
    {
      label: 'Next',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('media-control', 'next');
        }
      }
    },
    {
      label: 'Previous',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('media-control', 'previous');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Show window on tray icon double-click
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Register global media key shortcuts
function registerMediaKeys() {
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Handle media key events
    if (input.control === false && input.shift === false && input.alt === false && input.meta === false) {
      if (input.type === 'keyDown') {
        switch (input.keyCode) {
          case 'MediaPlayPause':
            mainWindow.webContents.send('media-control', 'play-pause');
            event.preventDefault();
            break;
          case 'MediaNextTrack':
            mainWindow.webContents.send('media-control', 'next');
            event.preventDefault();
            break;
          case 'MediaPreviousTrack':
            mainWindow.webContents.send('media-control', 'previous');
            event.preventDefault();
            break;
          case 'MediaStop':
            mainWindow.webContents.send('media-control', 'stop');
            event.preventDefault();
            break;
          default:
            break;
        }
      }
    }
  });
}

// IPC handlers for playback state
ipcMain.on('playback-state-changed', (event, state) => {
  if (tray) {
    // Update tray tooltip with current track info
    const tooltip = state.currentTrackId 
      ? `Now playing: ${state.progress.toFixed(0)}s / ${state.duration.toFixed(0)}s`
      : 'Stingray Music';
    tray.setToolTip(tooltip);
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  if (mainWindow) {
    registerMediaKeys();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createTray();
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

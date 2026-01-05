const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  versions: process.versions,
  platform: process.platform,

  // Media control functions
  onMediaControl: (callback) => {
    ipcRenderer.on('media-control', (event, action) => {
      callback(action);
    });
  },

  removeMediaControlListener: (callback) => {
    ipcRenderer.removeListener('media-control', callback);
  },

  // Playback state notifications
  notifyPlaybackStateChanged: (state) => {
    ipcRenderer.send('playback-state-changed', state);
  },

  // Version info
  getAppVersion: () => process.env.npm_package_version || '0.1.0',

  // System info
  getSystemInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    osVersion: process.getSystemVersion?.() || 'Unknown'
  })
});

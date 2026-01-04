module.exports = {
  appId: 'com.stingray.desktop',
  productName: 'StingrayMusic',
  directories: {
    output: 'release',
    buildResources: 'buildResources'
  },
  files: ['dist/**/*', 'main.js', 'preload.js', 'package.json'],
  win: {
    target: 'nsis'
  },
  linux: {
    target: 'AppImage',
    category: 'Audio'
  }
};

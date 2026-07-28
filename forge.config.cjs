module.exports = {
  packagerConfig: {
    icon: 'build/icon',
    derefSymlinks: true,
  },
  makers: [
    { name: '@electron-forge/maker-zip', platforms: ['darwin', 'linux', 'win32'] },
  ],
}

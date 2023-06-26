const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  handlePlaylist: (url) => ipcRenderer.invoke('playlist-request', url),
  onPlaylistFound: (callback) => ipcRenderer.on("playlist-found", callback),
  onPlaylistError: (callback) => ipcRenderer.on("playlist-error", callback),
  viewYtDlp: () => ipcRenderer.invoke('view-yt-dlp')
});
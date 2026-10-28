const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVideoLink: (titles, episode) => ipcRenderer.invoke('get-video-link', titles, episode),
  getRuTitle: (titles) => ipcRenderer.invoke('get-ru-title', titles),
  showNotification: (data) => ipcRenderer.send('show-notification', data) // <--- ДОБАВИЛИ
});
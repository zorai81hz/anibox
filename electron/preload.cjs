const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVideoLink: (titles, episode, year) => ipcRenderer.invoke('get-video-link', titles, episode, year),
  getAnilibriaRelease: (titles, year) => ipcRenderer.invoke('get-anilibria-release', titles, year),
  getAchievements: (animeId, episode) => ipcRenderer.invoke('get-achievements', animeId, episode),
  generateAchievements: (animeId, episode, subsUrl, title, desc) => ipcRenderer.invoke('generate-achievements', animeId, episode, subsUrl, title, desc),
  translateTitlesAI: (titles) => ipcRenderer.invoke('translate-titles-ai', titles),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  getAchievements: (animeId) => ipcRenderer.invoke('get-achievements', animeId),
  getRuTitle: (titles) => ipcRenderer.invoke('get-ru-title', titles),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getVideoLinkAlt: (title, episode, malId) => ipcRenderer.invoke('get-video-link-alt', title, episode, malId),
  getSkipTimes: (malId, episode, length) => ipcRenderer.invoke('get-skip-times', malId, episode, length)
});
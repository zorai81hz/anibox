const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0a0a0f',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // 1. Обработчик смены темы
  ipcMain.handle('set-theme', (event, theme) => {
    nativeTheme.themeSource = theme; // 'dark', 'light' или 'system'
  });

  // 2. Обработчик для Достижений
  ipcMain.handle('get-achievements', async (event, animeId) => {
    try {
      const filePath = path.join(__dirname, `../src/data/achievements/${animeId}.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Ошибка чтения ачивок:', error);
      return [];
    }
  });

  // 3. Обработчик для Видео (AniLibria v1 API)
  ipcMain.handle('get-video-link', async (event, titlesArray, episode) => {
    try {
      let foundRelease = null;

      // Ищем релиз по названию
      for (const title of titlesArray) {
        if (!title) continue;
        const searchUrl = `https://anilibria.top/api/v1/app/search/releases?query=${encodeURIComponent(title)}`;
        const res = await fetch(searchUrl).then(r => r.json());
        
        if (res && res.length > 0) {
          foundRelease = res[0];
          break;
        }
      }

      if (!foundRelease) return null;

      // Получаем полную информацию о релизе
      const releaseUrl = `https://anilibria.top/api/v1/anime/releases/${foundRelease.id}`;
      const releaseData = await fetch(releaseUrl).then(r => r.json());

      if (!releaseData.episodes || releaseData.episodes.length === 0) return null;

      // Ищем нужную серию
      const targetEpisode = releaseData.episodes.find(ep => ep.ordinal === episode) || releaseData.episodes[0];
      const hlsUrl = targetEpisode.hls_1080 || targetEpisode.hls_720 || targetEpisode.hls_480;

      if (hlsUrl) {
        return hlsUrl.startsWith('//') ? `https:${hlsUrl}` : hlsUrl;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при поиске видео на AniLibria:', error);
      return null;
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
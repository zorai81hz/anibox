const { app, BrowserWindow, ipcMain, net, Notification } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, backgroundColor: '#0a0a0f', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true },
  });
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(__dirname, '../dist/index.html'));
}

async function fetchWithTimeout(url, options = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await net.fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

app.whenReady().then(() => {
  ipcMain.handle('get-ru-title', async (event, titlesArray) => {
    for (const title of titlesArray) {
      if (!title) continue;
      try {
        const shikiUrl = `https://shikimori.one/api/animes?search=${encodeURIComponent(title)}&limit=1`;
        const res = await fetchWithTimeout(shikiUrl, { headers: { 'User-Agent': 'AniBox/1.0' } });
        const text = await res.text();
        if (text && text.trim().startsWith('<!DOCTYPE')) throw new Error('HTML response');
        const shikiRes = JSON.parse(text);
        if (shikiRes && shikiRes.length > 0 && shikiRes[0].russian) return shikiRes[0].russian;
      } catch (e) {}

      try {
        const jikanUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`;
        const res = await fetchWithTimeout(jikanUrl);
        const text = await res.text();
        if (text && text.trim().startsWith('<!DOCTYPE')) throw new Error('HTML response');
        const jikanRes = JSON.parse(text);
        if (jikanRes?.data?.[0]?.titles) {
          const ruTitle = jikanRes.data[0].titles.find(t => t.type === 'Russian');
          if (ruTitle && ruTitle.title) return ruTitle.title;
        }
      } catch (e) {}
    }
    return null;
  });

  ipcMain.handle('get-video-link', async (event, titlesArray, episode) => {
    try {
      let foundAnime = null;
      for (const title of titlesArray) {
        if (!title) continue;
        const url = `https://api.anilibria.tv/v3/title/search?search=${encodeURIComponent(title)}&limit=1`;
        const res = await fetchWithTimeout(url).then(r => r.json());
        if (res.list && res.list.length > 0) { foundAnime = res.list[0]; break; }
      }
      if (!foundAnime) return null;
      const detailsUrl = `https://api.anilibria.tv/v3/title?code=${foundAnime.code}`;
      const detailsRes = await fetchWithTimeout(detailsUrl).then(r => r.json());
      const episodeData = detailsRes.player?.list?.[episode];
      if (episodeData && episodeData.hls) return episodeData.hls.startsWith('//') ? `https:${episodeData.hls}` : episodeData.hls;
      return null;
    } catch (error) { return null; }
  });

  ipcMain.on('show-notification', (event, { title, body, icon }) => {
    if (Notification.isSupported()) {
      new Notification({ title: title, body: body, icon: icon || path.join(__dirname, 'icon.ico') }).show();
    }
  });

  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
const { app, BrowserWindow, ipcMain, session, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const dotenv = require('dotenv');
const { AniParsec } = require('aniparsec-ru');

// Загружаем ключи из .env
dotenv.config({ path: path.join(__dirname, '../.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const GIGACHAT_KEY = process.env.GIGACHAT_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// По умолчанию ставим темную тему
nativeTheme.themeSource = 'dark';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0a0a0f', 
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // ==================== ПОДМЕНА ЗАГОЛОВКОВ ДЛЯ ANILIBRIA ====================
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.libria.fun/*', '*://*.anilibria.top/*'] },
    (details, callback) => {
      // Создаем копию заголовков, чтобы избежать ошибок
      const headers = { ...details.requestHeaders };
      headers['Referer'] = 'https://anilibria.top/';
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      callback({ requestHeaders: headers });
    }
  );

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==================== УПРАВЛЕНИЕ ТЕМОЙ ====================
ipcMain.handle('set-theme', (event, theme) => {
  nativeTheme.themeSource = theme; 
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(win => {
    win.setBackgroundColor(theme === 'light' ? '#f1f5f9' : '#0a0a0f');
  });
  return true;
});

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ИИ ====================

async function askGigaChat(prompt) {
  if (!GIGACHAT_KEY) return null;
  try {
    const authRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json', 'RqUID': crypto.randomUUID(), 'Authorization': `Basic ${GIGACHAT_KEY}` },
      body: 'scope=GIGACHAT_API_PERS', agent: httpsAgent
    });
    const authData = await authRes.json();
    if (!authData.access_token) return null;

    const chatRes = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.access_token}` },
      body: JSON.stringify({ model: 'GigaChat:latest', messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 1500 }),
      agent: httpsAgent
    });
    const chatData = await chatRes.json();
    if (!chatData || !chatData.choices) return null;
    return chatData.choices[0].message.content;
  } catch (e) {
    console.log('GigaChat упал:', e.message);
    return null;
  }
}

async function askGemini(prompt) {
  if (!GEMINI_KEY) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    if (!data || !data.candidates || !data.candidates[0].content) return null;
    return data.candidates[0].content.parts[0].text;
  } catch (e) {
    console.log('Gemini упал:', e.message);
    return null;
  }
}

// ==================== ОЧИСТКА КЭША ====================
ipcMain.handle('clear-cache', async () => {
  await session.defaultSession.clearCache();
  return true;
});

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

// ==================== ПОИСК ВИДЕО (ANILIBRIA) ====================
ipcMain.handle('get-video-link', async (event, titlesArray, episode, seasonYear) => {
  try {
    let release = null;
    const searchUrl = `https://anilibria.top/api/v1/app/search/releases?query=${encodeURIComponent(titlesArray[0])}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData && searchData.length > 0) {
      if (seasonYear) release = searchData.find(r => Number(r.year) === Number(seasonYear));
      if (!release) release = searchData.find(r => titlesArray.some(t => r.name.main.toLowerCase().includes(t.toLowerCase())));
      if (release && seasonYear && Number(release.year) !== Number(seasonYear)) release = null;
      if (!release && !seasonYear) release = searchData[0];
    }
    if (!release) return null;

    const releaseUrl = `https://anilibria.top/api/v1/anime/releases/${release.id}`;
    const releaseRes = await fetch(releaseUrl);
    const releaseData = await releaseRes.json();

    if (!releaseData.episodes || releaseData.episodes.length === 0) return null;

    const targetEpisode = releaseData.episodes.find(ep => ep.ordinal === episode) || releaseData.episodes[0];
    
        const qualities = {};
    
    // ФУНКЦИЯ ОБХОДА БЛОКИРОВКИ
    const fixUrl = (url) => {
      if (!url) return null;
      // Меняем заблокированный CDN на основной
      return url.replace('cache-rfn.libria.fun', 'cache.libria.fun');
    };

    if (targetEpisode.hls_1080) qualities['1080p'] = fixUrl(targetEpisode.hls_1080);
    if (targetEpisode.hls_720) qualities['720p'] = fixUrl(targetEpisode.hls_720);
    if (targetEpisode.hls_480) qualities['480p'] = fixUrl(targetEpisode.hls_480);

    let subtitlesUrl = null;
    if (targetEpisode.subtitles && targetEpisode.subtitles.length > 0) subtitlesUrl = targetEpisode.subtitles[0].url;
    const dubbers = releaseData.team?.voice?.map(v => v.name) || ['AniLibria'];

    return { qualities, dubbers, subtitlesUrl, animeId: release.id };
  } catch (error) {
    return null;
  }
});

// ==================== АЛЬТЕРНАТИВНЫЙ ИСТОЧНИК (Kodik / Aniboom) ====================
ipcMain.handle('get-video-link', async (event, titlesArray, episode) => {
  try {
    let foundRelease = null;

    // 1. Ищем релиз по названию через новый API
    for (const title of titlesArray) {
      if (!title) continue;
      const searchUrl = `https://anilibria.top/api/v1/app/search/releases?query=${encodeURIComponent(title)}`;
      const res = await fetchWithTimeout(searchUrl).then(r => r.json());
      
      // В новом API результаты поиска лежат в массиве, и у них есть id
      if (res && res.length > 0) {
        foundRelease = res[0];
        break;
      }
    }

    if (!foundRelease) return null;

    // 2. Получаем полную информацию о релизе (включая эпизоды)
    const releaseUrl = `https://anilibria.top/api/v1/anime/releases/${foundRelease.id}`;
    const releaseData = await fetchWithTimeout(releaseUrl).then(r => r.json());

    if (!releaseData.episodes || releaseData.episodes.length === 0) return null;

    // 3. Ищем нужную серию по номеру (ordinal)
    const targetEpisode = releaseData.episodes.find(ep => ep.ordinal === episode) || releaseData.episodes[0];

    // 4. Достаем HLS-ссылку (приоритет: 1080p, 720p, 480p)
    const hlsUrl = targetEpisode.hls_1080 || targetEpisode.hls_720 || targetEpisode.hls_480;

    if (hlsUrl) {
      // Некоторые ссылки могут быть относительными, добавляем https
      return hlsUrl.startsWith('//') ? `https:${hlsUrl}` : hlsUrl;
    }

    return null;
  } catch (error) {
    console.error('Ошибка при поиске видео на AniLibria:', error);
    return null;
  }
});

// ==================== ОЗВУЧКИ ====================
ipcMain.handle('get-anilibria-release', async (event, titlesArray, seasonYear) => {
  try {
    console.log('--- ЗАПРОС К ANILIBRIA ---');
    let release = null;
    const searchUrl = `https://anilibria.top/api/v1/app/search/releases?query=${encodeURIComponent(titlesArray[0])}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    if (searchData && searchData.length > 0) {
      if (seasonYear) release = searchData.find(r => Number(r.year) === Number(seasonYear));
      if (!release) release = searchData[0]; 
    }
    if (!release) return null;
    const releaseRes = await fetch(`https://anilibria.top/api/v1/anime/releases/${release.id}`);
    return await releaseRes.json();
  } catch (error) { return null; }
});

// ==================== АЧИВКИ ====================
ipcMain.handle('get-achievements', async (event, animeId, episode) => {
  try {
    const userDataDir = path.join(app.getPath('userData'), 'achievements');
    const filePath = path.join(userDataDir, `${animeId}_ep${episode}.json`);
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.error('ОШИБКА ПОИСКА ВИДЕО:', error);
    return null;
  } catch (error) { return null; }
});

ipcMain.handle('generate-achievements', async (event, animeId, episode, subtitlesUrl, animeTitle, animeDescription) => {
  try {
    let subText = "";
    if (subtitlesUrl) {
      const subRes = await fetch(subtitlesUrl, { agent: httpsAgent });
      subText = await subRes.text();
      subText = subText.replace(/\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/g, '')
                         .replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim() !== '' && !l.includes('-->')).join(' ');
      const chunks = subText.split('. ');
      subText = chunks.filter((_, i) => i % 5 === 0).join('. ');
    } else {
      subText = animeDescription ? animeDescription.replace(/<[^>]*>/g, '') : "Описание отсутствует.";
    }

    const prompt = `
Ты — геймдизайнер, который придумывает ачивки для видеоигры по аниме "${animeTitle}", серия ${episode}.
Выбери РОВНО 2 или МАКСИМУМ 3 ключевых момента за серию.
1. НИКАКИХ ВОПРОСОВ!
2. НИКАКИХ СПОЙЛЕРОВ!
3. Названия (title) до 3-4 слов.
4. Время (time) РАЗНОЕ и НЕ РОВНОЕ (от 3-й до 22-й минуты), например "00:07:43".
Верни СТРОГО JSON массив: [{"time": "00:07:43", "title": "Тени прошлого", "desc": "Герой узнает тайну."}]
Текст: ${subText.substring(0, 3000)}
`;

    let resultText = await askGigaChat(prompt);
    if (!resultText) {
      console.log('⚠️ GigaChat не ответил. Переключаемся на Gemini...');
      resultText = await askGemini(prompt);
    }
    if (!resultText) throw new Error('Оба ИИ не смогли ответить');

    const startIdx = resultText.indexOf('[');
    const endIdx = resultText.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) resultText = resultText.substring(startIdx, endIdx + 1);
    
    const achievements = JSON.parse(resultText);

    const userDataDir = path.join(app.getPath('userData'), 'achievements');
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(path.join(userDataDir, `${animeId}_ep${episode}.json`), JSON.stringify(achievements, null, 2));

    return { success: true, achievements };
  } catch (error) {
    return { error: error.message };
  }
});

// ==================== ПЕРЕВОД НАЗВАНИЙ ====================
ipcMain.handle('translate-titles-ai', async (event, titlesArray) => {
  if (!titlesArray || titlesArray.length === 0) return null;

  const prompt = `
Ты — эксперт по аниме. Вот список названий: ${JSON.stringify(titlesArray)}.
Переведи их на русский, используя ОФИЦИАЛЬНЫЕ названия. Если нет — литературно.
Верни СТРОГО JSON объект (ключ - оригинал, значение - перевод).
Пример: {"Naruto": "Наруто", "Kusuriya no Hitorigoto": "Монолог фармацевта"}
Без лишнего текста, только JSON!
`;

  try {
    let resultText = await askGigaChat(prompt);
    if (!resultText) {
      resultText = await askGemini(prompt);
    }
    if (!resultText) return null;

    const startIdx = resultText.indexOf('{');
    const endIdx = resultText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) resultText = resultText.substring(startIdx, endIdx + 1);
    
    return JSON.parse(resultText);
  } catch (error) {
    return null;
  }
});

// ==================== ANISKIP API ====================
ipcMain.handle('get-skip-times', async (event, malId, episode, episodeLength) => {
  if (!malId || !episodeLength) return null;
  try {
    const url = `https://api.aniskip.com/v2/skip-times/${malId}/${episode}?types[]=op&types[]=ed&types[]=mixed-op&types[]=mixed-ed&episodeLength=${episodeLength}`;
    const res = await fetch(url);
    const data = await res.json();

    const result = { op: null, ed: null };

    if (data.found && data.results) {
      const opResult = data.results.find(r => r.skipType === 'op' || r.skipType === 'mixed-op');
      if (opResult && opResult.interval) result.op = { start: opResult.interval.startTime, end: opResult.interval.endTime };
      
      const edResult = data.results.find(r => r.skipType === 'ed' || r.skipType === 'mixed-ed');
      if (edResult && edResult.interval) result.ed = { start: edResult.interval.startTime, end: edResult.interval.endTime };
    }
    return result;
  } catch (error) {
    return null;
  }
});

// ==================== ЗАГЛУШКА ====================
ipcMain.handle('get-ru-title', async () => {
  return null; 
});
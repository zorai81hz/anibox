import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import https from 'https'; // <--- ДОБАВИЛИ ЭТО

dotenv.config();

const GIGACHAT_KEY = process.env.GIGACHAT_KEY;

if (!GIGACHAT_KEY) {
  console.error('❌ Ошибка: Не найден GIGACHAT_KEY в файле .env');
  process.exit(1);
}

// Создаем агента, который игнорирует ошибки сертификатов (для Сбера)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// 1. Получаем токен доступа
async function getGigaChatToken() {
  console.log('⏳ Авторизация в GigaChat...');
  const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': randomUUID(),
      'Authorization': `Basic ${GIGACHAT_KEY}`
    },
    body: 'scope=GIGACHAT_API_PERS',
    agent: httpsAgent // <--- ДОБАВИЛИ ЭТО
  });

  if (!response.ok) {
    throw new Error(`Ошибка авторизации: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// 2. Простой парсер SRT файлов
function parseSRT(srtContent) {
  const blocks = srtContent.replace(/\r\n/g, '\n').split('\n\n');
  const subtitles = [];
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeStr = lines[1];
      const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '');
      if (timeStr && timeStr.includes('-->')) {
        const [start] = timeStr.split(' --> ');
        subtitles.push(`[${start.trim()}] ${text}`);
      }
    }
  }
  return subtitles.join('\n');
}

// 3. Отправляем запрос к GigaChat
async function analyzeSubtitles(srtText, animeTitle, episode) {
  console.log(`🧠 Отправляем субтитры в GigaChat для анализа...`);
  const token = await getGigaChatToken();

  const lines = srtText.split('\n');
  const sampledLines = lines.filter((_, i) => i % 5 === 0).join('\n');

  const prompt = `
Ты — эксперт по аниме. Вот фрагменты субтитров к аниме "${animeTitle}" (серия ${episode}).
Найди 5-10 ключевых сюжетных моментов (знакомства, драки, важные реплики).
Формат ответа СТРОГО JSON массив, без markdown, без лишних слов. Только массив!
Пример формата:
[
  {
    "time": "00:17:41",
    "title": "Знакомство с Дио",
    "desc": "Дио переступил порог дома Джостаров"
  }
]

Вот субтитры:
${sampledLines}
`;

  const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: 'GigaChat:latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    }),
    agent: httpsAgent // <--- ДОБАВИЛИ ЭТО
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ошибка GigaChat: ${response.status} - ${errText}`);
  }

  const data = await response.json();
   let resultText = data.choices[0].message.content;
  
  // Умный поиск JSON массива (находим первую [ и последнюю ])
  const startIdx = resultText.indexOf('[');
  const endIdx = resultText.lastIndexOf(']');
  
  if (startIdx !== -1 && endIdx !== -1) {
    resultText = resultText.substring(startIdx, endIdx + 1);
  }
  
  try {
    return JSON.parse(resultText);
  } catch (e) {
    console.error('❌ GigaChat вернул невалидный JSON:', resultText);
    throw e;
  } 

// 4. Главная функция
async function main() {
  const testSrtPath = path.join(process.cwd(), 'scripts', 'test.srt');
  const animeTitle = "JoJo's Bizarre Adventure";
  const episode = 1;

  if (!fs.existsSync(testSrtPath)) {
    const fakeSrt = `1
00:17:40,000 --> 00:17:45,000
Я — Дио Брандо!

2
00:18:00,000 --> 00:18:05,000
Джостары, я уничтожу ваш род!

3
00:19:00,000 --> 00:19:05,000
Ты пожалеешь об этом, Дио!`;
    fs.writeFileSync(testSrtPath, fakeSrt, 'utf8');
  }

  const srtContent = fs.readFileSync(testSrtPath, 'utf8');
  const parsedSubs = parseSRT(srtContent);

  try {
    const achievements = await analyzeSubtitles(parsedSubs, animeTitle, episode);
    
    const outDir = path.join(process.cwd(), 'src', 'data', 'achievements');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'test_achievements.json');
    fs.writeFileSync(outPath, JSON.stringify(achievements, null, 2), 'utf8');

    console.log(`\n🎉 УСПЕХ! Сгенерировано ${achievements.length} ачивок.`);
    console.log(`📁 Сохранено в: ${outPath}`);
    console.log(achievements);
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error.message);
  }
}

main()}
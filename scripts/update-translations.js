import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadTitles() {
  console.log('⏳ Начинаем скачивание базы AniLibria...');
  
  try {
    let allAnime = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`📦 Скачиваем страницу ${page}...`);
      
      const response = await fetch(`https://api.anilibria.tv/v3/title/catalog?limit=100&page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AniBox/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.list && data.list.length > 0) {
        allAnime = [...allAnime, ...data.list];
        
        // Проверяем, есть ли еще страницы
        if (data.pagination && page < data.pagination.total_page) {
          page++;
          // Небольшая задержка, чтобы не забанили
          await new Promise(r => setTimeout(r, 500));
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Всего получено: ${allAnime.length} аниме. Формируем словарь...`);

    const dictionary = {};
    
    allAnime.forEach(anime => {
      if (anime.names && anime.names.ru) {
        const ruTitle = anime.names.ru;
        // Добавляем все возможные варианты названий
        if (anime.names.en) dictionary[anime.names.en.toLowerCase().trim()] = ruTitle;
        if (anime.names.alt) dictionary[anime.names.alt.toLowerCase().trim()] = ruTitle;
        if (anime.names.romaji) dictionary[anime.names.romaji.toLowerCase().trim()] = ruTitle;
        if (anime.code) dictionary[anime.code.toLowerCase().trim()] = ruTitle;
      }
    });

    const outputPath = path.join(__dirname, '..', 'src', 'data', 'auto-translations.json');
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2), 'utf-8');
    
    console.log(`🎉 УСПЕХ! Словарь сохранен (${Object.keys(dictionary).length} ключей).`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

downloadTitles();
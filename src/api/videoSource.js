import { AniParsec } from 'aniparsec-ru';

const parser = new AniParsec();

export async function getVideoLink(animeTitle, episode = 1) {
  try {
    console.log(`Ищем видео для: ${animeTitle} (Серия ${episode})...`);

    // 1. Ищем аниме по названию
    const searchResults = await parser.search(animeTitle);
    if (!searchResults || searchResults.length === 0) {
      throw new Error('Аниме не найдено в базе парсера');
    }

    // Берем первый результат
    const anime = searchResults[0];
    console.log('Найдено:', anime.title);

    // 2. Получаем прямую ссылку на видео (.m3u8)
    const video = await parser.getVideo({ shikimoriId: anime.id, episode });
    
    if (!video || !video.url) {
      throw new Error('Не удалось получить ссылку на видео');
    }

    console.log('Ссылка получена:', video.url);
    return video.url; // Возвращаем ссылку на m3u8
  } catch (error) {
    console.error('Ошибка в videoSource:', error);
    return null; // Если не удалось, вернем null
  }
}
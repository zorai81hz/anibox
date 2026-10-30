// src/api/shikimori.js
const URL = 'https://shikimori.io/api/graphql';

async function gql(query, variables) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json',
      'User-Agent': 'AniBox' 
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error('Shikimori API error: ' + res.status);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// Утилита для правильного пути картинки
function getImageUrl(poster) {
  if (!poster || !poster.originalUrl) return '';
  const url = poster.originalUrl;
  return url.startsWith('http') ? url : `https://shikimori.one${url}`;
}

// Адаптер: превращает данные Shikimori в формат AniList
function mapAnime(anime) {
  const img = getImageUrl(anime.poster);
  
  return {
    id: anime.id,
    title: { 
      romaji: anime.name, 
      english: anime.name, 
      native: anime.russian || anime.name 
    },
    coverImage: { 
      extraLarge: img, 
      large: img 
    },
    bannerImage: null,
    description: anime.description || 'Описание отсутствует',
    episodes: anime.episodes,
    seasonYear: anime.airedOn?.year || null,
    format: anime.kind ? anime.kind.toUpperCase() : 'TV',
    status: anime.status === 'released' ? 'FINISHED' : anime.status === 'ongoing' ? 'RELEASING' : 'FINISHED',
    genres: anime.genres ? anime.genres.map(g => g.russian || g.name) : [],
    averageScore: anime.score ? parseInt(anime.score) * 10 : null,
  };
}

// 1. Поиск
export async function searchAnime(search, page = 1) {
  const query = `
    query ($search: String, $page: Int) {
      animes(search: $search, limit: 24, page: $page, kind: "!special") {
        id name russian poster { originalUrl } episodes airedOn { year } kind status score
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, { search, page });
  return data.animes.map(mapAnime);
}

// 2. Главная страница (Тренды/Популярное)
export async function getTrending() {
  const query = `
    query {
      animes(limit: 24, status: "ongoing", order: popularity) {
        id name russian poster { originalUrl } episodes airedOn { year } kind status score
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  return data.animes.map(mapAnime);
}

// 3. Детали аниме (для карточки)
export async function getAnimeDetails(id) {
  const query = `
    query ($id: String) {
      anime(id: $id) {
        id name russian poster { originalUrl } description episodes airedOn { year } kind status score
        genres { russian name }
        related {
          anime { id name russian poster { originalUrl } episodes airedOn { year } kind status }
        }
      }
    }
  `;
  const data = await gql(query, { id: String(id) });
  const raw = data.anime;
  const mapped = mapAnime(raw);
  
  const relations = [];
  if (raw.related) {
    raw.related.forEach(rel => {
      if (rel.anime) {
        relations.push({ relationType: 'SEQUEL', node: mapAnime(rel.anime) });
      }
    });
  }

  return {
    ...mapped,
    relations: { edges: relations },
    recommendations: { nodes: [] } 
  };
}

// 4. Рандом
export async function getRandomAnime() {
  const query = `
    query {
      animes(limit: 50, order: popularity) {
        id name russian poster { originalUrl } episodes airedOn { year } kind status score
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  const randomIndex = Math.floor(Math.random() * data.animes.length);
  return mapAnime(data.animes[randomIndex]);
}

// 5. Топ 100 (Лидерборд)
export async function getTopAnime() {
  const query = `
    query {
      animes(limit: 100, order: ranked) {
        id name russian poster { originalUrl } episodes airedOn { year } kind status score
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  return data.animes.map(mapAnime);
}

// 6. Каталог
export async function getCatalog(page = 1) {
  const query = `
    query ($page: Int) {
      animes(limit: 24, page: $page, order: popularity) {
        id name russian poster { originalUrl } episodes airedOn { year } kind status score
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, { page });
  return data.animes.map(mapAnime);
}

// 7. Расписание (онгоинги)
export async function getAiringSchedule() {
  const query = `
    query {
      animes(limit: 30, status: "ongoing", order: popularity) {
        id name russian poster { originalUrl } episodes airedOn { year } kind status score
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  return data.animes.map(mapAnime);
}

// Дубликат для совместимости
export async function getSchedule() {
  return getAiringSchedule();
}
// src/api/shikimori.js
const URL = 'https://obxodanibox.sfasfasfa219.workers.dev';

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

function getImageUrl(poster) {
  if (!poster || !poster.originalUrl) return '';
  const url = poster.originalUrl;
  return url.startsWith('http') ? url : `https://shikimori.one${url}`;
}

// ФИЛЬТР: Убираем хентай и жесткое эччи
function filterSafeAnime(animes) {
  if (!animes) return [];
  return animes.filter(anime => {
    if (anime.rating === 'rx' || anime.rating === 'r_plus') return false;
    if (anime.genres && anime.genres.some(g => g.name === 'Hentai' || g.russian === 'Хентай')) return false;
    return true;
  });
}

function mapAnime(anime) {
  if (!anime) return null;
  const img = getImageUrl(anime.poster);
  const realEpisodes = anime.episodes || anime.episodesAired || null;
  
  return {
    id: anime.id,
    type: 'ANIME',
    title: { 
      romaji: anime.name, 
      english: anime.name, 
      native: anime.russian || anime.name 
    },
    coverImage: { extraLarge: img, large: img },
    bannerImage: null,
    description: anime.description || 'Описание отсутствует',
    episodes: realEpisodes,
    seasonYear: anime.airedOn?.year || null,
    format: anime.kind ? anime.kind.toUpperCase() : 'TV',
    status: anime.status === 'released' ? 'FINISHED' : anime.status === 'ongoing' ? 'RELEASING' : 'FINISHED',
    genres: anime.genres ? anime.genres.map(g => g.russian || g.name) : [],
    averageScore: anime.score ? parseInt(anime.score) * 10 : null,
  };
}

export async function searchAnime(search, page = 1) {
  const query = `
    query ($search: String, $page: Int) {
      animes(search: $search, limit: 30, page: $page, kind: "!special") {
        id name russian poster { originalUrl } episodes episodesAired airedOn { year } kind status score rating
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, { search, page });
  return filterSafeAnime(data.animes).slice(0, 24).map(mapAnime);
}

export async function getTrending() {
  const query = `
    query {
      animes(limit: 30, status: "ongoing", order: popularity) {
        id name russian poster { originalUrl } description episodes episodesAired airedOn { year } kind status score rating
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  return filterSafeAnime(data.animes).slice(0, 24).map(mapAnime);
}

export async function getAnimeDetails(id) {
  const query = `
    query ($id: String) {
      animes(ids: $id, limit: 1) {
        id name russian poster { originalUrl } description episodes episodesAired airedOn { year } kind status score rating nextEpisodeAt
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, { id: String(id) });
  
  if (!data || !data.animes || data.animes.length === 0) return null;
  
  // Если это хентай, не показываем его
  const safeAnime = filterSafeAnime(data.animes);
  if (safeAnime.length === 0) return null;

  return {
    ...mapAnime(safeAnime[0]),
    nextEpisodeAt: safeAnime[0].nextEpisodeAt,
    relations: { edges: [] },
    recommendations: { nodes: [] } 
  };
}

export async function getRandomAnime() {
  const query = `
    query {
      animes(limit: 50, order: popularity) {
        id name russian poster { originalUrl } episodes episodesAired airedOn { year } kind status score rating
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  const safe = filterSafeAnime(data.animes);
  const randomIndex = Math.floor(Math.random() * safe.length);
  return mapAnime(safe[randomIndex]);
}

export async function getTopAnime() {
  const query = `
    query {
      animes(limit: 100, order: ranked) {
        id name russian poster { originalUrl } episodes episodesAired airedOn { year } kind status score rating
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  return filterSafeAnime(data.animes).map(mapAnime);
}

export async function getCatalog(page = 1) {
  const query = `
    query ($page: Int) {
      animes(limit: 30, page: $page, order: popularity) {
        id name russian poster { originalUrl } episodes episodesAired airedOn { year } kind status score rating
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, { page });
  return filterSafeAnime(data.animes).slice(0, 24).map(mapAnime);
}

export async function getAiringSchedule() {
  const query = `
    query {
      animes(limit: 40, status: "ongoing", order: popularity) {
        id name russian poster { originalUrl } episodes episodesAired airedOn { year } kind status score rating
        genres { russian name }
      }
    }
  `;
  const data = await gql(query, {});
  return filterSafeAnime(data.animes).slice(0, 30).map(mapAnime);
}

export async function getSchedule() {
  return getAiringSchedule();
}
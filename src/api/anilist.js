const URL = 'https://graphql.anilist.co';

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { extraLarge large }
  bannerImage
  description
  episodes
  duration
  seasonYear
  format
  status
  genres
  averageScore
  trailer { id site }
  nextAiringEpisode {
    airingAt
    timeUntilAiring
    episode
  }
`;

async function gql(query, variables) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error('AniList API error: ' + res.status);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export async function searchAnime(search, page = 1) {
  const query = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 24) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await gql(query, { search, page });
  return data.Page.media;
}

export async function getTrending(page = 1) {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 24) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await gql(query, { page });
  return data.Page.media;
}

export async function getAnimeDetails(id) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        isAdult
        relations {
          edges {
            relationType
            node {
              id
              type
              format
              title { romaji english }
              coverImage { large }
              episodes
              seasonYear
              status
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 8) {
          nodes {
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { large }
            }
          }
        }
      }
    }
  `;
  const data = await gql(query, { id });
  return data.Media;
}

// КАТАЛОГ С ПРАВИЛЬНЫМ ДИАПАЗОНОМ (через startDate)
export async function getCatalog({ 
  genre, 
  yearStart = 1990, 
  yearEnd = 2026, 
  minScore = 0, 
  status, 
  format, 
  country, 
  excludeCN = false,
  sort = 'POPULARITY_DESC', 
  page = 1 
}) {
  let args = ['type: ANIME', 'isAdult: false', 'sort: $sort'];
  let queryArgs = ['$page: Int', '$sort: [MediaSort]'];
  let vars = { page, sort: [sort] };

  const safeStart = Math.min(yearStart, yearEnd);
  const safeEnd = Math.max(yearStart, yearEnd);

  // ИСПОЛЬЗУЕМ ДАТЫ (FuzzyDateInt) ВМЕСТО ГОДОВ
  if (safeStart === safeEnd) {
    args.push('seasonYear: $year');
    queryArgs.push('$year: Int');
    vars.year = safeStart;
  } else {
    // Формируем даты (например, 2024 -> 20240101)
    const startDate = safeStart * 10000 + 101;
    const endDate = safeEnd * 10000 + 1231;
    args.push('startDate_greater: $startDate', 'startDate_lesser: $endDate');
    queryArgs.push('$startDate: FuzzyDateInt', '$endDate: FuzzyDateInt');
    vars.startDate = startDate;
    vars.endDate = endDate;
  }

  if (genre) { args.push('genre: $genre'); queryArgs.push('$genre: String'); vars.genre = genre; }
  if (status) { args.push('status: $status'); queryArgs.push('$status: MediaStatus'); vars.status = status; }
  if (format) { args.push('format: $format'); queryArgs.push('$format: MediaFormat'); vars.format = format; }
  
  if (country) { 
    args.push('countryOfOrigin: $country'); 
    queryArgs.push('$country: CountryCode'); 
    vars.country = country; 
  } else if (excludeCN) {
    args.push('countryOfOrigin: JP'); 
  }
  
  if (minScore > 0) { args.push('averageScore_greater: $minScore'); queryArgs.push('$minScore: Int'); vars.minScore = minScore; }

  const query = `
    query (${queryArgs.join(', ')}) {
      Page(page: $page, perPage: 24) {
        media(${args.join(', ')}) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  
  try {
    const data = await gql(query, vars);
    return data.Page.media;
  } catch (error) {
    // Если AniList снова выдаст ошибку, мы выведем её в консоль
    console.error("❌ Ошибка фильтров в AniList:", error.message);
    
    // Аварийный режим
    try {
        const fallbackQuery = `
          query ($page: Int) {
            Page(page: $page, perPage: 24) {
              media(type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
                ${MEDIA_FIELDS}
              }
            }
          }
        `;
        const fallbackData = await gql(fallbackQuery, { page });
        return fallbackData.Page.media;
    } catch (e) {
        return [];
    }
  }
}

export async function getAiring(page = 1) {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 24) {
        media(type: ANIME, status: RELEASING, sort: START_DATE_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await gql(query, { page });
  return data.Page.media;
}

export async function getTopAnime(page = 1) {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 24) {
        media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await gql(query, { page });
  return data.Page.media;
}

export async function getMultipleAnime(ids) {
  if (!ids || ids.length === 0) return [];
  const query = `
    query ($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          id
          episodes
          status
          nextAiringEpisode { episode }
        }
      }
    }
  `;
  const data = await gql(query, { ids });
  return data.Page.media;
}
// Получение расписания на неделю (все онгоинги с точным временем)
export async function getAiringSchedule() {
  // Вычисляем начало текущей недели (Понедельник 00:00) и конец (Воскресенье 23:59)
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Делаем так, чтобы Пн был 1, Вс - 7
  const startOfWeek = new Date(now.setDate(now.getDate() - currentDay + 1));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const startUnix = Math.floor(startOfWeek.getTime() / 1000);
  const endUnix = Math.floor(endOfWeek.getTime() / 1000);

  const query = `
    query ($page: Int, $start: Int, $end: Int) {
      Page(page: $page, perPage: 50) {
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
          airingAt
          episode
          media {
            id
            title { romaji english native }
            coverImage { large extraLarge }
            format
          }
        }
      }
    }
  `;
  
  try {
    const data = await gql(query, { page: 1, start: startUnix, end: endUnix });
    return data.Page.airingSchedules;
  } catch (error) {
    console.error("Ошибка при загрузке расписания:", error);
    return [];
  }
}
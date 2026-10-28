import { useState, useEffect } from 'react';
import { searchAnime } from '../api/anilist';
import AnimeCard from './AnimeCard';
import { getSearchQuery } from '../utils/translations'; // Импортируем функцию

export default function SearchPage({ onOpen, library, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  async function performSearch(searchQuery) {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      // МАГИЯ ТУТ: Переводим "наруто" в "naruto" для API
      const apiQuery = getSearchQuery(searchQuery);
      const data = await searchAnime(apiQuery);
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e?.preventDefault();
    performSearch(query);
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Результаты поиска</h2>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Уточнить запрос (Например: Наруто, Синяя тюрьма)..."
            className="flex-1 max-w-lg bg-[#15151f] border border-white/5 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500/50 transition text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold disabled:opacity-50 transition shadow-lg shadow-purple-500/20 text-white"
          >
            {loading ? 'Ищем...' : 'Найти'}
          </button>
        </div>
      </form>

      {searched && !loading && results.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-slate-400 text-xl">По запросу «{query}» ничего не найдено 😢</p>
          <p className="text-slate-600 text-sm mt-2">Попробуй написать название на английском (например, Naruto).</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {results.map(anime => (
          <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />
        ))}
      </div>
    </div>
  );
}
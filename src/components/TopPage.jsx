import { useState, useEffect } from 'react';
import { getTopAnime } from '../api/shikimori';
import AnimeCard from './AnimeCard';
import { Loader2, AlertCircle, Trophy } from 'lucide-react';

export default function TopPage({ onOpen, library }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTopAnime()
      .then(data => {
        setAnimeList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки топа:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h2>
        <p className="text-slate-400">Не удалось загрузить топ аниме.</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <h2 className="text-3xl font-black text-white light:text-slate-900 mb-6 flex items-center gap-3">
        <Trophy className="text-yellow-400" size={32} />
        Зал Славы (Топ 100)
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {animeList.map(anime => (
          <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />
        ))}
      </div>
    </div>
  );
}
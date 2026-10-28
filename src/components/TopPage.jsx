import { useState, useEffect } from 'react';
import { getTopAnime } from '../api/anilist';
import AnimeCard from './AnimeCard';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function TopPage({ onOpen, library }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopAnime()
      .then(data => { setAnimeList(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="text-yellow-400" size={32} />
        <h2 className="text-3xl font-bold text-white">Зал Славы (Топ 100)</h2>
      </div>
      <p className="text-slate-400 mb-8 ml-11">Самые высокооцененные аниме всех времен</p>

      {loading ? (
        <div className="text-purple-500 font-bold text-xl animate-pulse text-center mt-20">Загрузка топа...</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {animeList.map(anime => (
            <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
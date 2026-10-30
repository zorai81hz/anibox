import { useState, useEffect } from 'react';
import { getSeasonAnime } from '../api/shikimori';
import AnimeCard from './AnimeCard';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function SeasonPage({ onOpen, library }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeasonAnime()
      .then(data => { setAnimeList(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Flame className="text-orange-500" size={32} />
        <h2 className="text-3xl font-bold text-white">Аниме этого сезона</h2>
      </div>
      <p className="text-slate-400 mb-8 ml-11">Все самые свежие новинки, которые вышли в этом сезоне</p>

      {loading ? (
        <div className="text-purple-500 font-bold text-xl animate-pulse text-center mt-20">Загрузка сезона...</div>
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
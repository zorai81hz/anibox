import { useEffect, useState } from 'react';
import { getTrending } from '../api/anilist';
import AnimeCard from './AnimeCard';
import { Play, Info, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { translateText, translateGenre, translateTitle } from '../utils/translations';

function ContinueWatchingCard({ item, onOpen }) {
  const [displayTitle, setDisplayTitle] = useState(item.title.ru || item.title.romaji);
  
  useEffect(() => {
    let isMounted = true;
    const origTitle = item.title.ru || item.title.romaji || item.title.english;
    
    translateTitle(origTitle, [item.title.english, item.title.romaji, item.title.native]).then(res => {
      if (isMounted) setDisplayTitle(res);
    });
    return () => { isMounted = false; };
  }, [item]);

  // Умный подсчет процентов (с десятыми долями)
  const hasTotal = item.episodes && item.episodes > 0;
  const rawPercent = hasTotal ? (item.progress / item.episodes) * 100 : 0;
  
  let displayPercent = Math.round(rawPercent);
  if (rawPercent > 0 && rawPercent < 1) {
    displayPercent = rawPercent.toFixed(1); // Если меньше 1%, показываем 0.1%
  }

  return (
    <div onClick={() => onOpen(item.id)} className="group cursor-pointer bg-[#0f0f17] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
         <img src={item.coverImage?.extraLarge || item.coverImage?.large} alt={displayTitle} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Play size={32} fill="white" className="text-white" /></div>
      </div>
      <div className="p-2.5">
        <h3 className="text-xs font-bold text-white truncate">{displayTitle}</h3>
        
        {/* Прогресс-бар */}
        <div className="mt-1.5 w-full bg-white/10 rounded-full h-1">
            <div className="bg-purple-500 h-1 rounded-full transition-all duration-300" style={{ width: `${Math.max(rawPercent, 1)}%` }} /> 
        </div>
        
        {/* Текст и проценты */}
        <div className="flex justify-between items-center mt-1.5">
          <p className="text-[10px] text-slate-400">Серия {item.progress} {hasTotal ? `из ${item.episodes}` : ''}</p>
          {hasTotal && <p className="text-[10px] font-bold text-purple-400">{displayPercent}%</p>}
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ onOpen, library }) {
  const [trending, setTrending] = useState([]);
  const [heroAnime, setHeroAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [ruDesc, setRuDesc] = useState('');
  const [ruHeroTitle, setRuHeroTitle] = useState('');

  useEffect(() => {
    setLoading(true);
    getTrending(page).then(data => {
      setTrending(data);
      if (page === 1) {
        const hero = data.find(a => a.bannerImage) || data[0];
        setHeroAnime(hero);
        
        if (hero.description) {
          translateText(hero.description.replace(/<[^>]*>/g, '')).then(setRuDesc);
        }
        
        const origTitle = hero.title.romaji || hero.title.english;
        translateTitle(origTitle, [hero.title.english, hero.title.romaji, hero.title.native]).then(res => {
            setRuHeroTitle(res || origTitle);
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  const continueWatching = Object.values(library.items).filter(x => x.status === 'watching');

  return (
    <div className="pb-20">
      {page === 1 && heroAnime && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative h-[55vh] min-h-[400px] rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/10 group">
          <img src={heroAnime.bannerImage || heroAnime.coverImage.extraLarge} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-10 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              {heroAnime.averageScore && <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded text-xs font-bold backdrop-blur"><Star size={12} fill="currentColor" /> {heroAnime.averageScore / 10}</span>}
              {heroAnime.genres?.slice(0, 3).map(g => <span key={g} className="bg-white/10 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur border border-white/10">{translateGenre(g)}</span>)}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3 drop-shadow-2xl line-clamp-3">
              {ruHeroTitle || heroAnime.title.romaji || heroAnime.title.english}
            </h1>
            <p className="text-slate-300 line-clamp-2 mb-6 text-sm md:text-base drop-shadow">{ruDesc ? ruDesc : 'Загрузка описания...'}</p>
            <div className="flex gap-3">
              <button onClick={() => onOpen(heroAnime.id)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-purple-500 hover:text-white rounded-lg font-bold transition shadow-lg"><Play size={18} fill="currentColor" /> Смотреть</button>
              <button onClick={() => onOpen(heroAnime.id)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg font-bold text-white transition"><Info size={18} /> Подробнее</button>
            </div>
          </div>
        </motion.div>
      )}

      {continueWatching.length > 0 && page === 1 && (
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><span className="w-1.5 h-5 bg-purple-500 rounded-full"></span> Продолжить просмотр</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {continueWatching.slice(0, 7).map(item => (
              <ContinueWatchingCard key={item.id} item={item} onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2"><span className="w-1.5 h-5 bg-purple-500 rounded-full"></span> Сейчас в тренде (Стр. {page})</h3>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={40} className="text-purple-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
            {trending.map(anime => <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />)}
          </div>
        )}

        <div className="flex justify-center items-center gap-4 mt-10">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-2 px-5 py-2 bg-[#15151f] hover:bg-[#1f1f2e] border border-white/10 rounded-lg text-white font-medium disabled:opacity-30 transition"><ChevronLeft size={18} /> Назад</button>
          <span className="text-purple-400 font-bold px-4">Страница {page}</span>
          <button onClick={() => setPage(p => p + 1)} className="flex items-center gap-2 px-5 py-2 bg-[#15151f] hover:bg-[#1f1f2e] border border-white/10 rounded-lg text-white font-medium transition">Вперед <ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getTrending } from '../api/anilist';
import AnimeCard from './AnimeCard';
import { Loader2, AlertCircle, RefreshCw, Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { translateText } from '../utils/translations';

export default function HomePage({ onOpen, library }) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [heroDesc, setHeroDesc] = useState('');

  const loadData = async (currentPage) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getTrending(currentPage);
      setTrending(data);
      
      // Переводим описание для баннера
      if (data && data.length > 0 && data[0].description) {
        const cleanDesc = data[0].description.replace(/<[^>]*>/g, '');
        const translated = await translateText(cleanDesc);
        setHeroDesc(translated);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки трендов:', err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  const continueWatching = Object.values(library.items).filter(x => x.status === 'watching');
  const heroAnime = trending.length > 0 ? trending[0] : null;

  if (loading && trending.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error && trending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-slate-200 rounded-2xl p-10 text-center">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white light:text-slate-900 mb-2">Ошибка загрузки</h2>
        <p className="text-slate-400 mb-8 max-w-md">Не удалось связаться с AniList API. Возможно, вы используете VPN, или сервер перегружен.</p>
        <button 
          onClick={() => loadData(page)}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition"
        >
          <RefreshCw size={20} /> Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* HERO BANNER */}
      {heroAnime && (
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-10 group">
          <img 
            src={heroAnime.bannerImage || heroAnime.coverImage.extraLarge} 
            alt={heroAnime.title.romaji}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent light:from-black/90 light:via-black/40"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {heroAnime.averageScore && (
                <span className="flex items-center gap-1 text-yellow-400 bg-black/60 px-2 py-1 rounded backdrop-blur-sm font-bold text-sm">
                  ★ {heroAnime.averageScore}
                </span>
              )}
              {heroAnime.genres?.slice(0, 3).map(g => (
                <span key={g} className="text-xs text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                  {g}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl font-black text-white drop-shadow-lg max-w-3xl">
              {heroAnime.title.romaji}
            </h1>
            
            <p className="text-slate-300 max-w-3xl line-clamp-2 text-sm drop-shadow-md">
              {heroDesc || 'Описание загружается...'}
            </p>
            
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => onOpen(heroAnime.id)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg font-bold hover:bg-slate-200 transition"
              >
                <Play size={18} fill="currentColor" /> Смотреть
              </button>
              <button 
                onClick={() => onOpen(heroAnime.id)}
                className="flex items-center gap-2 px-6 py-2.5 bg-black/60 hover:bg-black/80 text-white rounded-lg font-bold backdrop-blur-sm border border-white/10 transition"
              >
                <Info size={18} /> Подробнее
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ПРОДОЛЖИТЬ ПРОСМОТР */}
      {continueWatching.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-white light:text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-purple-500 rounded-full inline-block"></span>
            Продолжить просмотр
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatching.slice(0, 6).map(item => (
              <div
                key={item.id}
                onClick={() => onOpen(item.id)}
                className="cursor-pointer bg-[#15151f] light:bg-white rounded-xl overflow-hidden border border-[#1f1f2e] light:border-slate-200 hover:border-purple-500/50 transition group"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.coverImage?.extraLarge || item.coverImage?.large}
                    alt={item.title.romaji}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2 text-white light:text-slate-900">{item.title.romaji}</h3>
                  <p className="text-xs text-purple-400 mt-1">
                    Серия {item.progress} из {item.episodes || '?'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ТРЕНДЫ */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white light:text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-purple-500 rounded-full inline-block"></span>
          Сейчас в тренде (Стр. {page})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.map(anime => (
            <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />
          ))}
        </div>
        
        {/* ПАГИНАЦИЯ */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-slate-200 rounded-lg text-slate-300 light:text-slate-700 disabled:opacity-50 hover:bg-[#1f1f2e] light:hover:bg-slate-100 transition"
          >
            <ChevronLeft size={18} /> Назад
          </button>
          
          <span className="text-purple-400 font-bold">Страница {page}</span>
          
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-slate-200 rounded-lg text-slate-300 light:text-slate-700 hover:bg-[#1f1f2e] light:hover:bg-slate-100 transition"
          >
            Вперед <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
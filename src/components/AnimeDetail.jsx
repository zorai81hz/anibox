import { useEffect, useState } from 'react';
import { getAnimeDetails } from '../api/anilist';
import { X, Play, Plus, Star, Calendar, Tv, MonitorPlay, Loader2, Clock, AlertTriangle, Check, ChevronDown, Trash2, Heart } from 'lucide-react';
import Player from './Player';
import { translateFormat, translateStatus, translateText } from '../utils/translations';

const STATUSES = [
  { id: 'watching', label: 'Смотрю' },
  { id: 'planning', label: 'В планах' },
  { id: 'completed', label: 'Просмотрено' },
  { id: 'dropped', label: 'Брошено' },
];

export default function AnimeDetail({ id, onClose, library, onOpen }) {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingEpisode, setPlayingEpisode] = useState(null);
  const [ruDescription, setRuDescription] = useState('');
  const [ruTitle, setRuTitle] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAnimeDetails(id).then(data => {
      if (!data) return setLoading(false);
      setAnime(data); 
      setLoading(false); 
      
      const isAdult = data.isAdult || data.genres?.includes('Ecchi') || data.genres?.includes('Hentai');
      if (isAdult && !ageConfirmed) setShowAgeWarning(true);

      if (data.description) translateText(data.description.replace(/<[^>]*>/g, '')).then(setRuDescription);
      if (window.api) window.api.getRuTitle([data.title.english, data.title.romaji, data.title.native]).then(res => {
        if (res && /[а-яА-ЯЁё]/.test(res)) setRuTitle(res);
      });
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!playingEpisode) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [playingEpisode]);

  if (loading) return <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"><Loader2 size={48} className="text-purple-500 animate-spin" /></div>;
  if (!anime) return <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-pointer" onClick={onClose}><p className="text-red-500 font-bold">Ошибка загрузки. Нажмите, чтобы закрыть.</p></div>;

  if (showAgeWarning && !ageConfirmed) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Контент 18+</h2>
        <p className="text-slate-400 max-w-md mb-8">Это аниме содержит сцены насилия, эротики или другой контент, не предназначенный для лиц младше 18 лет.</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-3 bg-[#1f1f2e] hover:bg-[#2a2a3e] rounded-xl font-bold text-white transition">Уйти</button>
          <button onClick={() => setAgeConfirmed(true)} className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white transition">Мне есть 18 лет</button>
        </div>
      </div>
    );
  }

  const title = ruTitle || anime.title.romaji || anime.title.english;
  const inLib = library.items[anime.id];
  const isFav = inLib?.isFavorite;

  let totalEpisodes = anime.episodes;
  if (!totalEpisodes) {
    if (anime.format === 'MOVIE') totalEpisodes = 1;
    else if (anime.nextAiringEpisode) totalEpisodes = anime.nextAiringEpisode.episode - 1;
    else totalEpisodes = 100;
  }
  if (totalEpisodes === 0) totalEpisodes = 1;

  const episodesArray = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const nextEpDate = anime.nextAiringEpisode ? new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : null;

  const franchise = [
    anime,
    ...(anime.relations?.edges || []).filter(e => ['SEQUEL', 'PREQUEL'].includes(e.relationType)).map(e => e.node).filter(n => n.type === 'ANIME')
  ].sort((a, b) => (a.seasonYear || 9999) - (b.seasonYear || 9999));

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ СЕРДЕЧКА
  const handleFavoriteClick = () => {
    if (!inLib) {
      // Если нет в библиотеке, добавляем со статусом 'favorite' (чтобы не висело в "Планах")
      library.add({ ...anime, episodes: totalEpisodes, title: { ...anime.title, ru: title } }, 'favorite');
      setTimeout(() => library.toggleFavorite(anime.id), 50);
    } else {
      // Если уже в библиотеке, просто переключаем сердечко
      library.toggleFavorite(anime.id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto custom-scrollbar" onClick={onClose}>
        <div className="max-w-6xl mx-auto my-8 bg-[#0a0a0f] rounded-2xl overflow-hidden border border-[#1f1f2e] shadow-2xl" onClick={e => e.stopPropagation()}>
          
          <div className="relative h-[300px] overflow-hidden">
            {anime.bannerImage ? <img src={anime.bannerImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center transition z-10"><X size={20} /></button>
          </div>

          <div className="px-8 pb-8 -mt-24 relative z-10">
            <div className="flex gap-6 flex-col md:flex-row">
              <img src={anime.coverImage.extraLarge} className="w-52 rounded-xl shadow-2xl shrink-0 -mt-8 border-4 border-[#0a0a0f]" />
              <div className="flex-1 pt-2">
                <h2 className="text-3xl font-black text-white">{title}</h2>
                <p className="text-slate-500 text-sm mt-1">{anime.title.romaji}</p>
                
                <div className="flex flex-wrap gap-3 mt-4 text-xs font-medium">
                  {anime.averageScore && <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded"><Star size={14} fill="currentColor" /> {anime.averageScore}%</span>}
                  <span className="flex items-center gap-1 text-slate-300 bg-[#1f1f2e] px-2 py-1 rounded"><Calendar size={14} /> {anime.seasonYear || '—'}</span>
                  <span className="flex items-center gap-1 text-slate-300 bg-[#1f1f2e] px-2 py-1 rounded"><Tv size={14} /> {totalEpisodes} эп.</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">{translateFormat(anime.format)}</span>
                  <span className={`px-2 py-1 rounded ${anime.status === 'RELEASING' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-300'}`}>{translateStatus(anime.status)}</span>
                </div>

                {nextEpDate && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs text-purple-200">
                    <Clock size={14} className="text-purple-400" /> <span>Серия {anime.nextAiringEpisode.episode} выйдет: <span className="font-bold text-white">{nextEpDate}</span></span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-5 relative">
                  <button onClick={() => {
                      const startEp = inLib?.progress > 0 ? inLib.progress + 1 : 1;
                      const updatedAnime = { ...anime, episodes: totalEpisodes, title: { ...anime.title, ru: title } };
                      if (!inLib) library.add(updatedAnime, 'watching');
                      setPlayingEpisode(startEp);
                    }} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition">
                    <Play size={18} fill="currentColor" /> {inLib?.progress > 0 ? `Продолжить (Серия ${inLib.progress + 1})` : 'Смотреть'}
                  </button>
                  
                  <button 
                    onClick={handleFavoriteClick} 
                    className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition border ${
                      isFav 
                        ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30' 
                        : 'bg-[#1f1f2e] text-slate-300 border-transparent hover:bg-[#2a2a3e]'
                    }`}
                    title={isFav ? "Убрать из избранного" : "В избранное"}
                  >
                    <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                  </button>

                  {!inLib ? (
                    <button onClick={() => library.add({ ...anime, title: { ...anime.title, ru: title }, episodes: totalEpisodes }, 'planning')} className="flex items-center gap-2 px-5 py-2.5 bg-[#1f1f2e] hover:bg-[#2a2a3e] rounded-lg font-semibold text-sm transition">
                      <Plus size={18} /> В планы
                    </button>
                  ) : (
                    <div className="relative">
                      <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-[#2a2a3e] hover:text-white rounded-lg font-semibold text-sm transition">
                        <Check size={18} /> {STATUSES.find(s => s.id === inLib.status)?.label || 'В библиотеке'} <ChevronDown size={14} />
                      </button>
                      {showStatusMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#15151f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                          {STATUSES.map(s => (
                            <button key={s.id} onClick={() => { library.setStatus(anime.id, s.id); setShowStatusMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition ${inLib.status === s.id ? 'text-purple-400 font-bold' : 'text-slate-300'}`}>
                              {s.label}
                            </button>
                          ))}
                          <div className="border-t border-white/10">
                            <button onClick={() => { library.remove(anime.id); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition flex items-center gap-2">
                              <Trash2 size={14} /> Удалить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><MonitorPlay className="text-purple-500" size={20} /> Серии ({totalEpisodes})</h3>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {episodesArray.map(ep => {
                  const isWatched = inLib && inLib.progress >= ep;
                  return <button key={ep} onClick={() => { 
                      setPlayingEpisode(ep); 
                      if (inLib && ep > inLib.progress) library.setProgress(anime.id, ep); 
                      else if (!inLib) {
                          library.add({ ...anime, episodes: totalEpisodes, title: { ...anime.title, ru: title } }, 'watching');
                          library.setProgress(anime.id, ep);
                      }
                    }} className={`py-2 rounded font-bold text-xs transition ${isWatched ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-[#15151f] text-slate-300 hover:bg-[#1f1f2e]'}`}>{ep}</button>;
                })}
              </div>
            </div>

            <div className="mt-8 bg-[#15151f] p-5 rounded-xl border border-[#1f1f2e]">
              <h3 className="text-lg font-bold mb-2 text-purple-300">Описание</h3>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{ruDescription || 'Перевод описания...'}</p>
            </div>

            {franchise.length > 1 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">Порядок просмотра</h3>
                <div className="space-y-2">
                  {franchise.map((part, idx) => {
                    const isCurrent = part.id === anime.id;
                    return (
                      <div key={part.id} onClick={() => !isCurrent && onOpen(part.id)} className={`flex items-center gap-4 p-3 rounded-lg transition ${isCurrent ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-[#15151f] border border-[#1f1f2e] hover:border-purple-500/30 cursor-pointer'}`}>
                        <span className="text-slate-500 font-mono text-sm w-6">{idx + 1}.</span>
                        {part.coverImage && <img src={part.coverImage.large || part.coverImage.extraLarge} className="w-12 h-16 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate text-sm ${isCurrent ? 'text-purple-300' : 'text-white'}`}>{part.title.romaji || part.title.english} {isCurrent && <span className="ml-2 text-[10px]">(текущее)</span>}</p>
                          <p className="text-xs text-slate-500">{part.seasonYear || '—'} • {translateFormat(part.format)} {part.episodes && `• ${part.episodes} эп.`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {playingEpisode && (
        <Player 
          anime={anime} 
          episode={playingEpisode} 
          initialTime={inLib?.timestamps?.[playingEpisode] || 0} 
          library={library} 
          onClose={() => setPlayingEpisode(null)} 
          onNextEpisode={(ep) => { 
            if (ep <= totalEpisodes) { 
              setPlayingEpisode(ep); 
              if (inLib) library.setProgress(anime.id, ep); 
            } else {
              setPlayingEpisode(null); 
            }
          }} 
        />
      )}
    </>
  );
}
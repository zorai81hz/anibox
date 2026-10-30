import { useEffect, useState } from 'react';
import { getAnimeDetails } from '../api/shikimori';
import { X, Play, Plus, Star, Calendar, Tv, MonitorPlay, Loader2, Clock, AlertTriangle, Check, ChevronDown, Trash2, Heart, Mic2, Info } from 'lucide-react';
import Player from './Player';
import { translateFormat, translateStatus, translateText } from '../utils/translations';

const STATUSES = [
  { id: 'watching', label: 'Смотрю' }, { id: 'planning', label: 'В планах' },
  { id: 'completed', label: 'Просмотрено' }, { id: 'dropped', label: 'Брошено' },
];

// ==========================================
// УНИВЕРСАЛЬНЫЙ АЛГОРИТМ ПОСТРОЕНИЯ ПОРЯДКА ПРОСМОТРА
// ==========================================
const buildWatchOrder = (startAnime) => {
  if (!startAnime) return [];

  const allParts = new Map();
  allParts.set(startAnime.id, startAnime);

  // Собираем все прямые связи из AniList
  if (startAnime.relations && startAnime.relations.edges) {
    startAnime.relations.edges.forEach(edge => {
      // Берем вообще все аниме-связи (сиквелы, приквелы, фильмы, спешлы, спин-оффы)
      if (edge.node && edge.node.type === 'ANIME') {
        if (!allParts.has(edge.node.id)) {
          allParts.set(edge.node.id, edge.node);
        }
      }
    });
  }

  const partsArray = Array.from(allParts.values());

  // Сортируем: сначала TV-сериалы по годам, потом OVA, потом фильмы, потом спешлы
  return partsArray.sort((a, b) => {
    const formatWeight = {
      'TV': 1, 
      'TV_SHORT': 2, 
      'ONA': 3, 
      'OVA': 4, 
      'MOVIE': 5, 
      'SPECIAL': 6,
      'MUSIC': 7
    };
    
    const weightA = formatWeight[a.format] || 8;
    const weightB = formatWeight[b.format] || 8;

    // Если формат разный, сортируем по весу (TV в первую очередь)
    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // Если формат одинаковый (например, два фильма), сортируем по году
    const yearA = a.seasonYear || 9999;
    const yearB = b.seasonYear || 9999;
    if (yearA !== yearB) return yearA - yearB;

    return (a.title.romaji || '').localeCompare(b.title.romaji || '');
  });
};
// ==========================================

export default function AnimeDetail({ id, onClose, library, onOpen }) {
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingEpisode, setPlayingEpisode] = useState(null);
  const [ruDescription, setRuDescription] = useState('');
  const [ruTitle, setRuTitle] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [dubs, setDubs] = useState([]);
  
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
      
      if (window.api) {
        window.api.getRuTitle([data.title.english, data.title.romaji, data.title.native]).then(res => {
          if (res && /[а-яА-ЯЁё]/.test(res)) setRuTitle(res);
        });

        const titles = [data.title.english, data.title.romaji, data.title.native].filter(Boolean);
        window.api.getAnilibriaRelease(titles, data.seasonYear).then(release => {
          if (release && release.team) setDubs(release.team);
        });
      }
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!playingEpisode) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [playingEpisode]);

  if (loading) return <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"><Loader2 size={48} className="text-purple-500 animate-spin" /></div>;
   if (!anime) return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-6 text-center">
      <AlertTriangle size={64} className="text-red-500 mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">Не удалось загрузить аниме</h2>
      <p className="text-slate-400 max-w-md mb-8">AniList API заблокирован или недоступен. Попробуйте включить/выключить VPN (OnionHop) и нажать «Обновить».</p>
      <div className="flex gap-4">
        <button onClick={onClose} className="px-6 py-3 bg-[#1f1f2e] hover:bg-[#2a2a3e] rounded-xl font-bold text-white transition">Закрыть</button>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition">Обновить</button>
      </div>
    </div>
  );

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
  
  // Применяем наш универсальный алгоритм
  const franchise = buildWatchOrder(anime);

  const handleFavoriteClick = () => {
    if (!inLib) {
      library.add({ ...anime, episodes: totalEpisodes, title: { ...anime.title, ru: title } }, 'favorite');
      setTimeout(() => library.toggleFavorite(anime.id), 50);
    } else {
      library.toggleFavorite(anime.id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto custom-scrollbar" onClick={onClose}>
        <div className="max-w-6xl mx-auto my-8 bg-[#0a0a0f] light:bg-slate-50 rounded-2xl overflow-hidden border border-[#1f1f2e] light:border-slate-200 shadow-2xl" onClick={e => e.stopPropagation()}>
          
          {/* БАННЕР */}
          <div className="relative h-[300px] overflow-hidden bg-transparent">
            {anime.bannerImage ? <img src={anime.bannerImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900" />}
            
            {/* Темный градиент снизу (всегда) для читаемости текста на баннере */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent light:from-black/90 light:via-black/40"></div>
            
            <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center transition z-10 text-white"><X size={20} /></button>
          </div>

          {/* ИНФОРМАЦИЯ */}
          <div className="px-8 pb-8 relative z-10 -mt-32">
            <div className="flex gap-6 flex-col md:flex-row">
              <img src={anime.coverImage.extraLarge} className="w-48 rounded-xl shadow-2xl shrink-0 border-4 border-white/10 relative z-20" />
              <div className="flex-1 pt-16">
                <h2 className="text-3xl font-black text-white keep-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{title}</h2>
                <p className="text-slate-300 keep-white text-sm mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{anime.title.romaji}</p>
                
                <div className="flex flex-wrap gap-3 mt-4 text-xs font-medium">
                  {anime.averageScore && <span className="flex items-center gap-1 text-yellow-400 bg-black/60 px-2 py-1 rounded backdrop-blur-sm"><Star size={14} fill="currentColor" /> {anime.averageScore}%</span>}
                  <span className="flex items-center gap-1 text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm keep-white"><Calendar size={14} /> {anime.seasonYear || '—'}</span>
                  <span className="flex items-center gap-1 text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm keep-white"><Tv size={14} /> {totalEpisodes} эп.</span>
                  <span className="px-2 py-1 bg-purple-600/80 text-white keep-white rounded backdrop-blur-sm">{translateFormat(anime.format)}</span>
                  <span className={`px-2 py-1 rounded backdrop-blur-sm keep-white ${anime.status === 'RELEASING' ? 'bg-green-600/80 text-white' : 'bg-slate-600/80 text-white'}`}>{translateStatus(anime.status)}</span>
                </div>

                {dubs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dubs.map(team => (
                      <span key={team.id} className="flex items-center gap-1 text-[11px] font-medium text-pink-300 keep-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                        <Mic2 size={12} /> {team.name}
                      </span>
                    ))}
                  </div>
                )}

                {nextEpDate && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-purple-900/60 light:bg-purple-100 border border-purple-500/30 light:border-purple-300 px-3 py-1.5 rounded-lg text-xs text-purple-200 light:text-purple-800 backdrop-blur-sm">
                    <Clock size={14} /> <span>Серия {anime.nextAiringEpisode.episode} выйдет: <span className="font-bold keep-white light:text-purple-900">{nextEpDate}</span></span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-5 relative">
                  <button onClick={() => {
                      const startEp = inLib?.progress > 0 ? inLib.progress + 1 : 1;
                      const updatedAnime = { ...anime, episodes: totalEpisodes, title: { ...anime.title, ru: title } };
                      if (!inLib) library.add(updatedAnime, 'watching');
                      setPlayingEpisode(startEp);
                    }} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition text-white keep-white">
                    <Play size={18} fill="currentColor" /> {inLib?.progress > 0 ? `Продолжить (Серия ${inLib.progress + 1})` : 'Смотреть'}
                  </button>
                  
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-black/60 hover:bg-black/80 rounded-lg font-semibold text-sm transition text-white keep-white backdrop-blur-sm border border-white/10">
                    <Info size={18} /> Подробнее
                  </button>

                  <button onClick={handleFavoriteClick} className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition border backdrop-blur-sm keep-white ${ isFav ? 'bg-red-500/40 text-white border-red-500/50 hover:bg-red-500/60' : 'bg-black/60 text-white border-white/10 hover:bg-black/80' }`} title={isFav ? "Убрать из избранного" : "В избранное"}>
                    <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                  </button>

                  {!inLib ? (
                    <button onClick={() => library.add({ ...anime, title: { ...anime.title, ru: title }, episodes: totalEpisodes }, 'planning')} className="flex items-center gap-2 px-5 py-2.5 bg-black/60 hover:bg-black/80 rounded-lg font-semibold text-sm transition text-white keep-white backdrop-blur-sm border border-white/10"><Plus size={18} /> В планы</button>
                  ) : (
                    <div className="relative">
                      <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-green-600/80 hover:bg-green-600 text-white keep-white backdrop-blur-sm rounded-lg font-semibold text-sm transition border border-green-500/50">
                        <Check size={18} /> {STATUSES.find(s => s.id === inLib.status)?.label || 'В библиотеке'} <ChevronDown size={14} />
                      </button>
                      {showStatusMenu && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-[#15151f] light:bg-white border border-white/10 light:border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50">
                          {STATUSES.map(s => (
                            <button key={s.id} onClick={() => { library.setStatus(anime.id, s.id); setShowStatusMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 light:hover:bg-slate-100 transition ${inLib.status === s.id ? 'text-purple-400 font-bold' : 'text-slate-300 light:text-slate-700'}`}>{s.label}</button>
                          ))}
                          <div className="border-t border-white/10 light:border-slate-200">
                            <button onClick={() => { library.remove(anime.id); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition flex items-center gap-2"><Trash2 size={14} /> Удалить</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-white light:text-slate-900"><MonitorPlay className="text-purple-500" size={20} /> Серии ({totalEpisodes})</h3>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {episodesArray.map(ep => {
                  const isWatched = inLib && inLib.progress >= ep;
                  return <button key={ep} onClick={() => { setPlayingEpisode(ep); if (inLib && ep > inLib.progress) library.setProgress(anime.id, ep); else if (!inLib) { library.add({ ...anime, episodes: totalEpisodes, title: { ...anime.title, ru: title } }, 'watching'); library.setProgress(anime.id, ep); } }} className={`py-2 rounded font-bold text-xs transition ${isWatched ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-[#15151f] light:bg-white text-slate-300 light:text-slate-700 border border-transparent light:border-slate-200 hover:bg-[#1f1f2e] light:hover:bg-slate-100'}`}>{ep}</button>;
                })}
              </div>
            </div>

            <div className="mt-8 bg-[#15151f] light:bg-white p-5 rounded-xl border border-[#1f1f2e] light:border-slate-200">
              <h3 className="text-lg font-bold mb-2 text-purple-300 light:text-purple-600">Описание</h3>
              <p className="text-slate-300 light:text-slate-700 leading-relaxed text-sm whitespace-pre-line">{ruDescription || 'Перевод описания...'}</p>
            </div>

            {franchise.length > 1 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3 text-white light:text-slate-900">Порядок просмотра</h3>
                <div className="space-y-2">
                  {franchise.map((part, idx) => {
                    const isCurrent = part.id === anime.id;
                    return (
                      <div key={part.id} onClick={() => !isCurrent && onOpen(part.id)} className={`flex items-center gap-4 p-3 rounded-lg transition ${isCurrent ? 'bg-purple-500/20 light:bg-purple-100 border border-purple-500/50 light:border-purple-300' : 'bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-slate-200 hover:border-purple-500/30 cursor-pointer'}`}>
                        <span className="text-slate-500 font-mono text-sm w-6">{idx + 1}.</span>
                        {part.coverImage && <img src={part.coverImage.large || part.coverImage.extraLarge} className="w-12 h-16 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate text-sm ${isCurrent ? 'text-purple-300 light:text-purple-700' : 'text-white light:text-slate-900'}`}>{part.title.romaji || part.title.english} {isCurrent && <span className="ml-2 text-[10px]">(текущее)</span>}</p>
                          <p className="text-xs text-slate-500 light:text-slate-500">{part.seasonYear || '—'} • {translateFormat(part.format)} {part.episodes && `• ${part.episodes} эп.`}</p>
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
        <Player anime={anime} episode={playingEpisode} initialTime={inLib?.timestamps?.[playingEpisode] || 0} library={library} onClose={() => setPlayingEpisode(null)} onNextEpisode={(ep) => { if (ep <= totalEpisodes) { setPlayingEpisode(ep); if (inLib) library.setProgress(anime.id, ep); } else { setPlayingEpisode(null); } }} />
      )}
    </>
  );
}
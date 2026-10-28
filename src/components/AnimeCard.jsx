import { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { translateFormat, translateTitle } from '../utils/translations';

export default function AnimeCard({ anime, onOpen, library }) {
  const originalTitle = anime.title.romaji || anime.title.english || anime.title.native;
  const [displayTitle, setDisplayTitle] = useState(originalTitle);
  const [isHovered, setIsHovered] = useState(false);
  
  const inLib = library.items[anime.id];
  const progress = inLib?.progress || 0;

  useEffect(() => {
    let isMounted = true;
    
    // Вызываем наш мгновенный переводчик
    translateTitle(originalTitle, [anime.title.english, anime.title.romaji, anime.title.native])
      .then(res => { 
        if (isMounted && res) {
          setDisplayTitle(res); 
        }
      });
      
    return () => { isMounted = false; };
  }, [anime, originalTitle]);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!inLib) {
      library.add({ ...anime, title: { ...anime.title, ru: displayTitle } }, 'planning');
    }
  };

  return (
    <div 
      onClick={() => onOpen(anime.id)} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-[#0f0f17] rounded-xl overflow-hidden border border-[#1f1f2e] hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20 relative"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img src={anime.coverImage.extraLarge || anime.coverImage.large} alt={displayTitle} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        
        {anime.averageScore && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-yellow-400">
            ★ {anime.averageScore}
          </div>
        )}

        {isHovered && !inLib && (
          <button onClick={handleAdd} className="absolute top-2 left-2 w-8 h-8 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110 z-10 animate-fade-in" title="Добавить в библиотеку">
            <Plus size={18} strokeWidth={3} />
          </button>
        )}
        {inLib && (
          <div className="absolute top-2 left-2 w-8 h-8 bg-purple-500/80 text-white rounded-full flex items-center justify-center shadow-lg z-10">
            <Check size={18} strokeWidth={3} />
          </div>
        )}

        {progress > 0 && anime.episodes && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 text-xs">
            <div className="w-full bg-white/20 rounded-full h-1 mb-1">
              <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${Math.min(100, (progress / anime.episodes) * 100)}%` }} />
            </div>
            {progress}/{anime.episodes}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-xs line-clamp-2 text-white leading-tight" title={displayTitle}>{displayTitle}</h3>
        <p className="text-[10px] text-slate-500 mt-1">
          {anime.seasonYear || '—'} • {translateFormat(anime.format)} {anime.episodes ? `• ${anime.episodes} эп.` : ''}
        </p>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { translateTitle } from '../utils/translations'; // Путь может отличаться, проверь, где лежит файл

export default function AnimeCard({ anime, onOpen, library }) {
  // По умолчанию ставим оригинальное название
  const [displayTitle, setDisplayTitle] = useState(
    anime.title?.romaji || anime.title?.english || anime.title?.native || 'Без названия'
  );

  const inLib = library.items[anime.id];
  const progress = inLib?.progress || 0;

  useEffect(() => {
    let isMounted = true;
    const titlesArray = [anime.title?.romaji, anime.title?.english, anime.title?.native].filter(Boolean);

    // Вызываем твою функцию перевода
    translateTitle(displayTitle, titlesArray).then((res) => {
      if (isMounted && res) {
        setDisplayTitle(res); // Обновляем название, когда перевод готов
      }
    });

    return () => { isMounted = false; };
  }, [anime]);

  return (
    <div
      onClick={() => onOpen(anime.id)}
      className="group cursor-pointer bg-[#15151f] rounded-xl overflow-hidden border border-[#1f1f2e] hover:border-purple-500/50 transition transform hover:scale-[1.02]"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={anime.coverImage?.extraLarge || anime.coverImage?.large || 'https://via.placeholder.com/300x450/15151f/6b7280?text=Нет+обложки'}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        {anime.averageScore && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-bold text-yellow-400">
            ★ {anime.averageScore}
          </div>
        )}
        {progress > 0 && anime.episodes && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 text-xs">
            <div className="w-full bg-white/20 rounded-full h-1 mb-1">
              <div
                className="bg-purple-500 h-1 rounded-full"
                style={{ width: `${Math.min(100, (progress / anime.episodes) * 100)}%` }}
              />
            </div>
            {progress}/{anime.episodes}
          </div>
        )}
      </div>
      <div className="p-3">
        {/* Выводим переведенное название */}
        <h3 className="font-semibold text-sm line-clamp-2">{displayTitle}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {anime.seasonYear || '—'} • {anime.format}
          {anime.episodes ? ` • ${anime.episodes} эп.` : ''}
        </p>
      </div>
    </div>
  );
}
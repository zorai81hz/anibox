import { useState, useEffect } from 'react';
import { getTrending } from '../api/anilist';
import { Dices } from 'lucide-react';

export default function RandomPage({ onOpen }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    getTrending(randomPage).then(data => {
      if (data && data.length > 0) {
        const randomAnime = data[Math.floor(Math.random() * data.length)];
        setTimeout(() => onOpen(randomAnime.id), 800); // Небольшая задержка для анимации
      }
    });
  }, [onOpen]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <Dices size={80} className="text-purple-500 animate-bounce mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
      <h2 className="text-3xl font-black text-white mb-2">Крутим барабан...</h2>
      <p className="text-slate-400">Ищем случайное аниме для тебя</p>
    </div>
  );
}
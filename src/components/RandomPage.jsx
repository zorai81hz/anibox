import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRandomAnime } from '../api/shikimori';

export default function RandomPage({ onOpen }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Искусственная задержка в 1.5 секунды, чтобы красиво крутился барабан
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const anime = await getRandomAnime();
      if (anime && anime.id) {
        onOpen(anime.id); // Открываем карточку аниме
      } else {
        throw new Error('Не удалось найти аниме');
      }
    } catch (err) {
      console.error(err);
      setError('Что-то пошло не так. Попробуй еще раз!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    roll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Запускаем рандом при заходе на вкладку

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-6 text-purple-500"
        >
          <Shuffle size={80} />
        </motion.div>
      ) : (
        <div className="mb-6 text-purple-500">
          <Shuffle size={80} />
        </div>
      )}
      
      <h2 className="text-3xl font-bold mb-4">
        {loading ? 'Крутим барабан...' : error ? 'Упс!' : 'Готово!'}
      </h2>
      
      <p className="text-slate-400 mb-8 max-w-md">
        {loading 
          ? 'Ищем случайное аниме для тебя' 
          : error 
            ? error 
            : 'Мы нашли для тебя случайное аниме. Если оно не открылось, нажми кнопку ниже.'}
      </p>

      {!loading && (
        <button
          onClick={roll}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/30"
        >
          Крутить еще раз
        </button>
      )}
    </div>
  );
} 
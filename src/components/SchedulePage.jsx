import { useEffect, useState } from 'react';
import { getAiringSchedule } from '../api/anilist';
import { CalendarDays, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translateTitle } from '../utils/translations';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

// Отдельный компонент для строки расписания, чтобы переводить название на лету
function ScheduleItem({ item, onOpen }) {
  const [ruTitle, setRuTitle] = useState(item.media.title.romaji || item.media.title.english);
  
  useEffect(() => {
    let isMounted = true;
    const origTitle = item.media.title.romaji || item.media.title.english;
    
    translateTitle(origTitle, [item.media.title.english, item.media.title.romaji, item.media.title.native]).then(res => {
      if (isMounted) setRuTitle(res);
    });
    return () => { isMounted = false; };
  }, [item]);

  const time = new Date(item.airingAt * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={() => onOpen(item.media.id)}
      className="flex items-center gap-6 p-4 hover:bg-white/5 transition cursor-pointer group"
    >
      <div className="w-16 text-center shrink-0">
        <div className="flex items-center justify-center gap-1 text-purple-400 font-bold text-lg">
          <Clock size={16} /> {time}
        </div>
      </div>
      
      <img 
        src={item.media.coverImage.large} 
        alt={ruTitle} 
        className="w-14 h-20 object-cover rounded-md shadow-md group-hover:scale-105 transition" 
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-lg truncate group-hover:text-purple-400 transition">{ruTitle}</h4>
        <p className="text-slate-400 text-sm mt-1">{item.media.format}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="inline-block bg-purple-600/20 text-purple-400 px-4 py-2 rounded-lg font-bold">
          Серия {item.episode}
        </span>
      </div>
    </div>
  );
}

export default function SchedulePage({ onOpen }) {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 7 : new Date().getDay());

  useEffect(() => {
    setLoading(true);
    getAiringSchedule().then(data => {
      const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

      data.forEach(item => {
        const date = new Date(item.airingAt * 1000);
        let dayOfWeek = date.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7; 
        grouped[dayOfWeek].push(item);
      });

      setSchedule(grouped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const currentDayItems = schedule[activeDay] || [];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <CalendarDays className="text-purple-500" size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Расписание выхода</h2>
          <p className="text-slate-400">Онгоинги на этой неделе</p>
        </div>
      </div>

      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 pb-2">
        {DAYS.map((day, index) => {
          const dayId = index + 1;
          const count = schedule[dayId]?.length || 0;
          return (
            <button
              key={dayId}
              onClick={() => setActiveDay(dayId)}
              className={`px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeDay === dayId
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#0f0f17] border-white/5 text-slate-400 hover:bg-[#1f1f2e] hover:text-white'
              }`}
            >
              {day}
              {count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeDay === dayId ? 'bg-white/20' : 'bg-[#1f1f2e]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={40} className="text-purple-500 animate-spin" /></div>
      ) : currentDayItems.length === 0 ? (
        <div className="text-center py-20 bg-[#0f0f17] border border-white/5 rounded-2xl">
          <p className="text-slate-400 text-lg">В этот день нет выхода новых серий 😴</p>
        </div>
      ) : (
        <div className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-white/5"
            >
              {currentDayItems.map((item, idx) => (
                <ScheduleItem key={`${item.media.id}-${idx}`} item={item} onOpen={onOpen} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
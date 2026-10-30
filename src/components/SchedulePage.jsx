import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { getAiringSchedule } from '../api/shikimori';

export default function SchedulePage({ onOpen }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7); // 1-7 (Пн-Вс)

  const days = [
    { id: 1, name: 'Понедельник' },
    { id: 2, name: 'Вторник' },
    { id: 3, name: 'Среда' },
    { id: 4, name: 'Четверг' },
    { id: 5, name: 'Пятница' },
    { id: 6, name: 'Суббота' },
    { id: 7, name: 'Воскресенье' },
  ];

  useEffect(() => {
    setLoading(true);
    // Получаем расписание на неделю (или можно на сегодня)
    getAiringSchedule().then(data => {
      setSchedule(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Фильтруем по выбранному дню (в AniList день недели 1 - Пн, 7 - Вс)
  const filteredSchedule = schedule.filter(item => {
    if (!item.airingAt) return false;
    const date = new Date(item.airingAt * 1000);
    let day = date.getDay(); // 0 - Вс, 1 - Пн...
    if (day === 0) day = 7; // Переделываем под формат 1-7
    return day === selectedDay;
  }).sort((a, b) => a.airingAt - b.airingAt);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Calendar className="text-purple-500" /> Расписание выхода
      </h2>

      {/* Дни недели */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {days.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`px-4 py-2 rounded-xl font-medium transition whitespace-nowrap ${
              selectedDay === day.id
                ? 'bg-purple-600 text-white'
                : 'bg-[#15151f] text-slate-400 hover:bg-[#1f1f2e]'
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Загрузка расписания...</p>
      ) : filteredSchedule.length === 0 ? (
        <div className="bg-[#15151f] border border-[#1f1f2e] rounded-xl p-10 text-center">
          <p className="text-slate-400">В этот день нет выходящих серий.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedule.map(item => {
            const time = new Date(item.airingAt * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={item.id} className="flex items-center gap-4 bg-[#15151f] border border-[#1f1f2e] p-4 rounded-xl hover:border-purple-500/30 transition cursor-pointer" onClick={() => onOpen(item.media.id)}>
                <div className="text-purple-400 font-bold text-lg w-16 flex items-center gap-1">
                  <Clock size={16} /> {time}
                </div>
                <img src={item.media.coverImage.large} alt="" className="w-12 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{item.media.title.romaji}</h3>
                  <p className="text-sm text-slate-400">{item.media.format} • {item.media.seasonYear}</p>
                </div>
                <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm font-bold">
                  Серия {item.episode}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
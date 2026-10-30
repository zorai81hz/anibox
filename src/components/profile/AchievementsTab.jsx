// src/components/profile/AchievementsTab.jsx
import { Trophy } from 'lucide-react';

export default function AchievementsTab({ unlocked = {} }) {
  const achievementsArray = Object.values(unlocked).sort((a, b) => b.unlockedAt - a.unlockedAt);

  if (achievementsArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-slate-200 rounded-2xl">
        <Trophy size={64} className="mb-4 opacity-50 text-purple-500" />
        <h3 className="text-xl font-bold text-white light:text-slate-900 mb-2">Пока нет достижений</h3>
        <p className="text-sm">Смотрите аниме и достигайте таймкодов, чтобы открыть свои первые ачивки!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievementsArray.map(ach => (
        <div key={ach.id} className="bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-slate-200 p-4 rounded-xl flex gap-4 items-center shadow-lg">
          <div className="w-16 h-16 rounded-lg bg-black/50 overflow-hidden shrink-0 border border-purple-500/30">
            {ach.image ? (
              <img src={ach.image} alt={ach.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-yellow-500">
                <Trophy size={32} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white light:text-slate-900 truncate">{ach.title}</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ach.desc}</p>
<p className="text-[10px] text-purple-400 mt-2 font-mono">
  {ach.unlockedAt && !isNaN(new Date(ach.unlockedAt).getTime()) 
    ? `Получено: ${new Date(ach.unlockedAt).toLocaleDateString('ru-RU')}` 
    : 'Получено ранее'}
</p>
          </div>
        </div>
      ))}
    </div>
  );
}
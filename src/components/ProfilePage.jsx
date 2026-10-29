import { useState, useEffect } from 'react';
import { Award, BarChart3, Clock, Heart, Trophy } from 'lucide-react';

// ВОТ ТУТ МЫ ДОБАВИЛИ ПАПКУ /profile/
import StatsTab from './profile/StatsTab';
import HistoryTab from './profile/HistoryTab';
import FavoritesTab from './profile/FavoritesTab';
import AchievementsTab from './profile/AchievementsTab';

const TABS = [
  { id: 'stats', label: 'Статистика', icon: BarChart3 },
  { id: 'history', label: 'История', icon: Clock },
  { id: 'favorites', label: 'Избранное', icon: Heart },
  { id: 'achievements', label: 'Достижения', icon: Trophy }, // <--- Новая вкладка
];

export default function ProfilePage({ library, onOpen }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [achievements, setAchievements] = useState([]);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(50); // Заглушка для XP, потом можешь привязать к реальным данным

  useEffect(() => {
    // Загружаем ачивки для счетчика в шапке
    const saved = JSON.parse(localStorage.getItem('anibox_achievements') || '[]');
    setAchievements(saved);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* ================= ШАПКА ПРОФИЛЯ ================= */}
      <div className="bg-[#15151f] border border-[#1f1f2e] rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Фоновый блик */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {/* Аватарка */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
            A
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0a0a0f] px-3 py-1 rounded-full border border-purple-500/50 text-xs font-bold text-white">
            LVL {level}
          </div>
        </div>

        {/* Информация */}
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-black text-white mb-2">Мой Профиль</h2>
          <div className="flex items-center gap-4 max-w-md mx-auto md:mx-0">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>До {level + 1} уровня</span>
                <span>{xp}/100 XP</span>
              </div>
              <div className="w-full bg-[#15151f] rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${xp}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Счетчик ачивок */}
        <div className="flex gap-4">
          <div className="text-center bg-[#0f0f17] border border-white/5 px-6 py-4 rounded-2xl">
            <Award className="text-purple-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-black text-white">{achievements.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Ачивок</p>
          </div>
        </div>
      </div>

      {/* ================= ВКЛАДКИ ================= */}
      <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-[#0f0f17] text-slate-400 hover:bg-[#1f1f2e]'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ================= КОНТЕНТ ВКЛАДКИ ================= */}
      <div>
        {activeTab === 'stats' && <StatsTab library={library} />}
        {activeTab === 'history' && <HistoryTab library={library} onOpen={onOpen} />}
        {activeTab === 'favorites' && <FavoritesTab library={library} onOpen={onOpen} />}
        {activeTab === 'achievements' && <AchievementsTab />} {/* <--- Рендер ачивок */}
      </div>
    </div>
  );
}
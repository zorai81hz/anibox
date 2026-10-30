import { useState } from 'react';
import { BarChart, Clock, Heart, Trophy } from 'lucide-react';
import StatsTab from './profile/StatsTab';
import HistoryTab from './profile/HistoryTab';
import FavoritesTab from './profile/FavoritesTab';
import AchievementsTab from './profile/AchievementsTab';

export default function ProfilePage({ library, onOpen, achievements }) {
  const [activeTab, setActiveTab] = useState('stats');

  const tabs = [
    { id: 'stats', label: 'Статистика', icon: BarChart },
    { id: 'history', label: 'История', icon: Clock },
    { id: 'favorites', label: 'Избранное', icon: Heart },
    { id: 'achievements', label: 'Достижения', icon: Trophy },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Шапка профиля */}
      <div className="bg-gradient-to-r from-[#15151f] to-[#1f1f2e] light:from-white light:to-slate-50 rounded-2xl p-8 mb-8 border border-[#1f1f2e] light:border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black text-white shadow-lg">
            A
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white light:text-slate-900 mb-2">Мой Профиль</h1>
            <p className="text-slate-400">До 2 уровня: 50/100 XP</p>
            <div className="w-64 h-2 bg-black/50 rounded-full mt-2 overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </div>
          </div>
        </div>
        <div className="text-center bg-white/5 light:bg-white px-6 py-4 rounded-xl border border-white/10 light:border-slate-200">
          <Trophy className="text-purple-400 mx-auto mb-1" size={28} />
          <span className="block text-2xl font-black text-white light:text-slate-900">
            {Object.keys(achievements?.unlocked || {}).length}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Достижений</span>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-[#15151f] light:bg-white text-slate-400 light:text-slate-600 hover:bg-[#1f1f2e] light:hover:bg-slate-100'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Контент табов */}
      <div className="pb-10">
        {activeTab === 'stats' && <StatsTab library={library} achievements={achievements} />}
        {activeTab === 'history' && <HistoryTab library={library} onOpen={onOpen} />}
        {activeTab === 'favorites' && <FavoritesTab library={library} onOpen={onOpen} />}
        {/* Вот сюда мы прокидываем наши ачивки */}
        {activeTab === 'achievements' && <AchievementsTab unlocked={achievements?.unlocked} />}
      </div>
    </div>
  );
}
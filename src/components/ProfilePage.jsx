import { useState } from 'react';
import { User, BarChart3, History, Heart, Award, Star } from 'lucide-react';
import StatsTab from './profile/StatsTab';
import HistoryTab from './profile/HistoryTab';
import FavoritesTab from './profile/FavoritesTab';

export default function ProfilePage({ library, onOpen }) {
  const [activeTab, setActiveTab] = useState('stats');
  const achievements = JSON.parse(localStorage.getItem('anibox_achievements') || '[]');
  
  // Считаем уровень (1 уровень за каждые 10 достижений)
  const level = Math.floor(achievements.length / 10) + 1;
  const xp = (achievements.length % 10) * 10;

  const TABS = [
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
    { id: 'history', label: 'История', icon: History },
    { id: 'favorites', label: 'Избранное', icon: Heart },
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Шапка профиля */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-gradient-to-r from-[#15151f] to-transparent p-8 rounded-3xl border border-white/5">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-5xl font-black shadow-[0_0_40px_rgba(168,85,247,0.4)] border-4 border-[#0a0a0f] relative z-10">A</div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0a0a0f] px-3 py-1 rounded-full border border-purple-500/30 text-purple-400 text-xs font-bold z-20">LVL {level}</div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-black text-white mb-2">Мой Профиль</h2>
          <div className="flex items-center gap-4 max-w-md mx-auto md:mx-0">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1"><span>До {level + 1} уровня</span><span>{xp}/100 XP</span></div>
              <div className="w-full bg-[#15151f] rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${xp}%` }} /></div>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-[#0f0f17] border border-white/5 px-6 py-4 rounded-2xl">
            <Award className="text-purple-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-black text-white">{achievements.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Ачивок</p>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition ${
              activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-[#0f0f17] text-slate-400 hover:bg-[#1f1f2e] hover:text-white'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Контент вкладки */}
      <div>
        {activeTab === 'stats' && <StatsTab library={library} />}
        {activeTab === 'history' && <HistoryTab library={library} onOpen={onOpen} />}
        {activeTab === 'favorites' && <FavoritesTab library={library} onOpen={onOpen} />}
      </div>

      {/* Достижения (показываем в самом низу всегда) */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Star className="text-yellow-400" /> Мои Достижения</h3>
        {achievements.length === 0 ? (
          <p className="text-slate-500">Пока нет достижений. Смотри аниме, чтобы открыть их!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {achievements.map(ach => (
              <div key={ach.id} className="bg-[#0f0f17] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
                <img src={ach.image} alt="" className="w-16 h-16 rounded-xl object-cover mb-3 shadow-lg" />
                <h4 className="font-bold text-white text-sm leading-tight">{ach.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{ach.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
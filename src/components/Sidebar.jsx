import { Home, Library, Sparkles, Compass, CalendarDays, Trophy, Settings, User, Dices } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ view, setView, library }) {
  const total = Object.keys(library.items).length;

  const navItems = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'catalog', label: 'Каталог', icon: Compass },
    { id: 'random', label: 'Рандом', icon: Dices }, // Оставили Рандом
    { id: 'schedule', label: 'Расписание', icon: CalendarDays },
    { id: 'top', label: 'Лидерборд', icon: Trophy },
    { id: 'library', label: 'Мой список', icon: Library, badge: total },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0a0a0f]/80 backdrop-blur-xl border-r border-white/5 p-4 flex flex-col z-10">
      <div className="flex items-center gap-2 mb-8 cursor-pointer px-2 mt-2" onClick={() => setView('home')}>
        <Sparkles className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" size={26} />
        <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AniBox</h1>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${view === item.id ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            {view === item.id && <motion.div layoutId="active-nav" className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent border-l-4 border-purple-500 rounded-lg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
            <item.icon size={18} className={view === item.id ? 'text-purple-400' : ''} />
            <span className="flex-1 text-left text-sm font-medium relative z-10">{item.label}</span>
            {item.badge > 0 && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full relative z-10">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-white/5 mt-4">
        <button onClick={() => setView('profile')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${view === 'profile' ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><User size={18} /><span className="font-medium">Профиль</span></button>
        <button onClick={() => setView('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm mt-1 ${view === 'settings' ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Settings size={18} /><span className="font-medium">Настройки</span></button>
      </div>
    </aside>
  );
}
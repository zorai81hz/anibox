import { Home, Search, Library, Sparkles, Trophy, User, Settings, Calendar, Shuffle, ListVideo } from 'lucide-react';

export default function Sidebar({ view, setView, library }) {
  const watching = Object.values(library.items).filter(x => x.status === 'watching').length;
  const total = Object.keys(library.items).length;

  const mainNavItems = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'catalog', label: 'Каталог', icon: Search },
    { id: 'random', label: 'Рандом', icon: Shuffle },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'top', label: 'Топ 100', icon: Trophy },
    { id: 'library', label: 'Мой список', icon: ListVideo, badge: total },
  ];

  const bottomNavItems = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0f0f17] light:bg-white border-r border-[#1f1f2e] light:border-slate-200 p-4 flex flex-col z-10 transition-colors">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Sparkles className="text-purple-500" size={24} />
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AniBox
        </h1>
      </div>

      <nav className="space-y-1 flex-1">
        {mainNavItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              view === item.id
                ? 'bg-purple-500/20 text-purple-300 light:bg-purple-100 light:text-purple-700'
                : 'text-slate-400 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-slate-100 light:hover:text-slate-900'
            }`}
          >
            <item.icon size={18} />
            <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
            {item.badge > 0 && (
              <span className="text-[10px] bg-purple-500/30 text-purple-300 light:bg-purple-200 light:text-purple-700 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="space-y-1 pt-4 border-t border-[#1f1f2e] light:border-slate-200">
        {bottomNavItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              view === item.id
                ? 'bg-purple-500/20 text-purple-300 light:bg-purple-100 light:text-purple-700'
                : 'text-slate-400 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-slate-100 light:hover:text-slate-900'
            }`}
          >
            <item.icon size={18} />
            <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
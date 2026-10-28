import { useState } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query); // Передаем запрос в App.jsx
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-[#050508]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between gap-8">
      
      {/* Поле поиска */}
      <div className="relative flex-1 max-w-xl group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Поиск аниме... (Нажми Enter)"
          className="w-full bg-[#15151f] border border-white/5 text-white placeholder-slate-500 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-[#1a1a25] transition-all"
        />
      </div>

      {/* Правые иконки (уведомления, настройки) */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-[#15151f] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition">
          <Bell size={18} />
        </button>
        <button className="w-10 h-10 rounded-full bg-[#15151f] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition">
          <Settings size={18} />
        </button>
        
        {/* Фейковый аватар (заглушка) */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white cursor-pointer shadow-lg shadow-purple-500/30">
          A
        </div>
      </div>
    </header>
  );
}
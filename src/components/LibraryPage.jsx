import { useState } from 'react';
import { Play, Trash2, Search, Download, Upload, ListVideo } from 'lucide-react';

const STATUSES = [
  { id: 'watching', label: 'Смотрю' },
  { id: 'planning', label: 'Запланировано' },
  { id: 'completed', label: 'Просмотрено' },
  { id: 'dropped', label: 'Брошено' },
  { id: 'on_hold', label: 'Отложено' },
];

export default function LibraryPage({ onOpen, library }) {
  const [tab, setTab] = useState('watching');
  const [search, setSearch] = useState('');

  const allItems = Object.values(library.items);
  // Фильтруем элементы для текущей вкладки
  const filteredItems = allItems.filter(x => {
    const matchesTab = x.status === tab;
    // Если это 'planning', мы не показываем те, что добавлены ТОЛЬКО в избранное
    if (tab === 'planning' && x.isFavorite && x.status === 'favorite') return false; 
    return matchesTab && (x.title?.ru || x.title?.romaji || x.title?.english || '').toLowerCase().includes(search.toLowerCase());
  });

  const exportData = () => {
    const data = { library: JSON.parse(localStorage.getItem('anibox_library') || '{}'), achievements: JSON.parse(localStorage.getItem('anibox_achievements') || '[]') };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `anibox_backup.json`; a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.library) localStorage.setItem('anibox_library', JSON.stringify(data.library));
        if (data.achievements) localStorage.setItem('anibox_achievements', JSON.stringify(data.achievements));
        window.location.reload();
      } catch (err) { alert('Ошибка файла'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Мой список</h2>
          <p className="text-slate-400">Отслеживайте прогресс просмотра аниме</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-[#15151f] hover:bg-[#1f1f2e] border border-white/5 text-slate-300 rounded-xl transition text-sm cursor-pointer">
            <Upload size={16} /> Импорт <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
          <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-[#15151f] hover:bg-[#1f1f2e] border border-white/5 text-slate-300 rounded-xl transition text-sm">
            <Download size={16} /> Экспорт
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Поиск по списку..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0f0f17] border border-white/5 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500/50 transition"
        />
      </div>

      <div className="flex gap-6 mb-8 border-b border-white/5 overflow-x-auto custom-scrollbar">
        {STATUSES.map(s => {
          const count = allItems.filter(x => x.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={`pb-3 text-sm font-medium transition relative whitespace-nowrap ${tab === s.id ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
            >
              {s.label} <span className="ml-1 opacity-60 text-xs">{count > 0 ? count : ''}</span>
              {tab === s.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-[#0f0f17] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-10">
          <ListVideo size={64} className="text-purple-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Список пока пуст</h3>
          <p className="text-slate-400 mb-6 text-sm">Добавляйте аниме в список, чтобы не потерять прогресс просмотра.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map(item => <LibraryCard key={item.id} item={item} onOpen={onOpen} library={library} />)}
        </div>
      )}
    </div>
  );
}

function LibraryCard({ item, onOpen, library }) {
  const title = item.title?.ru || item.title?.romaji || item.title?.english;
  const hasTotal = item.episodes && item.episodes > 0;
  const percent = hasTotal ? Math.min(100, (item.progress / item.episodes) * 100) : 0;
  const nextEpisode = (item.progress || 0) + 1;

  return (
    <div className="group bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden flex shadow-lg hover:border-purple-500/30 transition-all h-[160px]">
      <div className="relative w-28 shrink-0 overflow-hidden cursor-pointer" onClick={() => onOpen(item.id)}>
        <img src={item.coverImage?.extraLarge || item.coverImage?.large} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
      </div>
      <div className="p-4 flex-1 flex flex-col min-w-0">
        <h3 className="font-bold text-white text-base cursor-pointer hover:text-purple-400 line-clamp-2 leading-tight" onClick={() => onOpen(item.id)}>{title}</h3>
        <p className="text-xs text-slate-500 mt-1">{item.seasonYear || '—'} • {item.format}</p>

        <div className="mt-auto">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Прогресс</span>
            <span className="font-bold text-purple-400">{item.progress} / {hasTotal ? item.episodes : '?'} {hasTotal && `(${Math.round(percent)}%)`}</span>
          </div>
          <div className="w-full bg-[#1f1f2e] rounded-full h-1.5 mb-3">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between">
             <button onClick={() => onOpen(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg text-xs font-bold transition">
                <Play size={14} fill="currentColor" /> {item.progress > 0 ? `Серия ${nextEpisode}` : 'Смотреть'}
             </button>
             <button onClick={() => library.remove(item.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded transition"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
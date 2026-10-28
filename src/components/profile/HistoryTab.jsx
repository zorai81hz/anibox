import { Play, Clock, Trash2 } from 'lucide-react';
import { translateTitle } from '../../utils/translations';
import { useState, useEffect } from 'react';

function HistoryItem({ record, onOpen }) {
  const [title, setTitle] = useState(record.title.romaji || record.title.english);
  
  useEffect(() => {
    translateTitle(title, [record.title.english, record.title.romaji]).then(setTitle);
  }, [record]);

  const date = new Date(record.watchedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div onClick={() => onOpen(record.animeId)} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition group">
      <img src={record.coverImage.large} className="w-12 h-16 object-cover rounded-md" />
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold truncate group-hover:text-purple-400">{title}</h4>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock size={12}/> Серия {record.episode} • {date}</p>
      </div>
      <Play size={20} className="text-purple-500 opacity-0 group-hover:opacity-100 transition" />
    </div>
  );
}

export default function HistoryTab({ library, onOpen }) {
  if (library.history.length === 0) return <div className="text-center py-20 text-slate-500">История просмотров пуста.</div>;

  return (
    <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-4 space-y-2 animate-fade-in max-h-[600px] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-bold text-white">Последние просмотры</h3>
        <button onClick={library.clearHistory} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"><Trash2 size={14}/> Очистить</button>
      </div>
      {library.history.map((record, idx) => <HistoryItem key={idx} record={record} onOpen={onOpen} />)}
    </div>
  );
}
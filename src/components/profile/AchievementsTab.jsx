import { Clock, Play, Flame, CheckCircle2, Library } from 'lucide-react';

export default function StatsTab({ library }) {
  const items = Object.values(library.items);
  
  // Считаем статистику
  const totalAnime = items.length;
  const totalEpisodes = items.reduce((acc, item) => acc + (item.progress || 0), 0);
  const watching = items.filter(i => i.status === 'watching').length;
  const completed = items.filter(i => i.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Время просмотра */}
      <div className="bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-[#e2e8f0] rounded-xl p-6 flex items-center gap-4 light:shadow-md">
        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
          <Clock className="text-purple-500" size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Всего времени</p>
          <p className="text-2xl font-bold text-white light:text-slate-900">{Math.round(totalEpisodes * 24 / 60)} ч.</p>
        </div>
      </div>

      {/* Просмотрено серий */}
      <div className="bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-[#e2e8f0] rounded-xl p-6 flex items-center gap-4 light:shadow-md">
        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
          <Play className="text-blue-500" size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Просмотрено серий</p>
          <p className="text-2xl font-bold text-white light:text-slate-900">{totalEpisodes}</p>
        </div>
      </div>

      {/* Смотрю */}
      <div className="bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-[#e2e8f0] rounded-xl p-6 flex items-center gap-4 light:shadow-md">
        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
          <Flame className="text-orange-500" size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Смотрю</p>
          <p className="text-2xl font-bold text-white light:text-slate-900">{watching}</p>
        </div>
      </div>

      {/* Завершено */}
      <div className="bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-[#e2e8f0] rounded-xl p-6 flex items-center gap-4 light:shadow-md">
        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="text-green-500" size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">Завершено</p>
          <p className="text-2xl font-bold text-white light:text-slate-900">{completed}</p>
        </div>
      </div>

      {/* В библиотеке */}
      <div className="bg-[#15151f] light:bg-white border border-[#1f1f2e] light:border-[#e2e8f0] rounded-xl p-6 flex items-center gap-4 md:col-span-2 light:shadow-md">
        <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
          <Library className="text-yellow-500" size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">В библиотеке</p>
          <p className="text-2xl font-bold text-white light:text-slate-900">{totalAnime}</p>
        </div>
      </div>

    </div>
  );
}
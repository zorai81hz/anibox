import { Clock, Play, CheckCircle, Trophy, Flame } from 'lucide-react';

export default function StatsTab({ library }) {
  const items = Object.values(library.items);
  const totalEpisodes = items.reduce((acc, item) => acc + (item.progress || 0), 0);
  const totalHours = Math.floor((totalEpisodes * 24) / 60);
  const completed = items.filter(i => i.status === 'completed').length;
  const watching = items.filter(i => i.status === 'watching').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f17] border border-white/5 p-8 rounded-3xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <Clock size={40} className="text-purple-400" />
          </div>
          <div>
            <p className="text-slate-400 font-medium">Всего времени</p>
            <h3 className="text-4xl font-black text-white">{totalHours} <span className="text-xl text-slate-500">ч.</span></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a25] to-[#0f0f17] border border-white/5 p-8 rounded-3xl flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Play size={40} className="text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 font-medium">Просмотрено серий</p>
            <h3 className="text-4xl font-black text-white">{totalEpisodes}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0f0f17] border border-white/5 p-6 rounded-2xl text-center">
          <Flame size={32} className="text-orange-500 mx-auto mb-2" />
          <h4 className="text-3xl font-bold text-white">{watching}</h4>
          <p className="text-sm text-slate-400">Смотрю</p>
        </div>
        <div className="bg-[#0f0f17] border border-white/5 p-6 rounded-2xl text-center">
          <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
          <h4 className="text-3xl font-bold text-white">{completed}</h4>
          <p className="text-sm text-slate-400">Завершено</p>
        </div>
        <div className="bg-[#0f0f17] border border-white/5 p-6 rounded-2xl text-center">
          <Trophy size={32} className="text-yellow-500 mx-auto mb-2" />
          <h4 className="text-3xl font-bold text-white">{items.length}</h4>
          <p className="text-sm text-slate-400">В библиотеке</p>
        </div>
      </div>
    </div>
  );
}
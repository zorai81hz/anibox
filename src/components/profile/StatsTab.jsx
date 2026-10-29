import { Clock, Play, Flame, CheckCircle2, Library } from 'lucide-react';

export default function StatsTab({ library }) {
  const items = Object.values(library.items);
  
  const totalAnime = items.length;
  const totalEpisodes = items.reduce((acc, item) => acc + (item.progress || 0), 0);
  const watching = items.filter(i => i.status === 'watching').length;
  const completed = items.filter(i => i.status === 'completed').length;

  const Card = ({ icon: Icon, color, title, value }) => (
    <div className="bg-[#15151f] border border-[#1f1f2e] rounded-xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 flex items-center justify-center shrink-0`}>
        <Icon className={`text-${color}-500`} size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card icon={Clock} color="purple" title="Всего времени" value={`${Math.round(totalEpisodes * 24 / 60)} ч.`} />
      <Card icon={Play} color="blue" title="Просмотрено серий" value={totalEpisodes} />
      <Card icon={Flame} color="orange" title="Смотрю" value={watching} />
      <Card icon={CheckCircle2} color="green" title="Завершено" value={completed} />
      <div className="md:col-span-2">
        <Card icon={Library} color="yellow" title="В библиотеке" value={totalAnime} />
      </div>
    </div>
  );
}
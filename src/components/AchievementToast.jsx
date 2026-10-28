import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

export default function AchievementToast({ achievement, onClose }) {
  if (!achievement) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-10 right-10 z-[200] bg-[#15151f]/95 backdrop-blur-2xl border-2 border-purple-500/50 p-1 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.4)] cursor-pointer overflow-hidden max-w-sm"
      onClick={onClose}
    >
      <div className="bg-[#0a0a0f] rounded-xl overflow-hidden flex items-stretch">
        <div className="w-24 shrink-0 relative">
          <img src={achievement.image} alt="Achievement" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/80" />
        </div>
        <div className="p-4 flex flex-col justify-center pr-8 relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={14}/></button>
          <p className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1 mb-1">
            <Trophy size={14} /> Достижение!
          </p>
          <h4 className="text-white font-black text-lg leading-tight">{achievement.title}</h4>
          <p className="text-slate-400 text-xs mt-1 leading-snug">{achievement.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
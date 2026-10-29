import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useEffect } from 'react';

export default function AchievementToast({ achievement, onClose }) {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="absolute top-24 right-6 z-50 flex items-center gap-4 bg-[#15151f]/95 border border-purple-500/50 backdrop-blur-md p-3 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] w-80"
        >
          {/* Картинка ачивки */}
          {achievement.image ? (
            <img 
              src={achievement.image} 
              alt="Achievement" 
              className="w-20 h-20 object-cover rounded-lg border border-purple-500/30 shrink-0" 
            />
          ) : (
            <div className="w-20 h-20 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/30">
              <Trophy size={32} className="text-purple-400" />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Trophy size={12} /> Достижение!
            </p>
            <h4 className="text-white font-bold text-sm leading-tight">{achievement.title}</h4>
            <p className="text-slate-400 text-xs line-clamp-2 mt-1">{achievement.desc}</p>
          </div>

          <button onClick={onClose} className="absolute top-2 right-2 text-slate-500 hover:text-white transition">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
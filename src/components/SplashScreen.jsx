import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#050508] flex flex-col items-center justify-center z-[999]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <Sparkles className="text-purple-500" size={48} />
        <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          AniBox
        </h1>
      </motion.div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        className="h-1 bg-purple-600 rounded-full mt-8 overflow-hidden"
      >
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-1/2 h-full bg-white/50 blur-sm"
        />
      </motion.div>
      <p className="text-slate-500 mt-4 text-sm animate-pulse font-medium tracking-widest uppercase">Загрузка...</p>
    </div>
  );
}
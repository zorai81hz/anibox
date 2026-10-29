import { useState, useEffect } from 'react';
import { Palette, MonitorPlay, Database, Sun, Moon, Trash2, Download, Upload, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('anibox_theme') || 'dark');
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('anibox_autoplay') !== 'false');
  const [quality, setQuality] = useState(() => localStorage.getItem('anibox_quality') || '1080p');
  
  // Состояния для модалки сброса
  const [showResetModal, setShowResetModal] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  useEffect(() => {
    localStorage.setItem('anibox_theme', theme);
    localStorage.setItem('anibox_autoplay', autoplay);
    localStorage.setItem('anibox_quality', quality);

    // Применяем тему к HTML тегу
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme, autoplay, quality]);

  useEffect(() => {
    localStorage.setItem('anibox_theme', theme);
    localStorage.setItem('anibox_autoplay', autoplay);
    localStorage.setItem('anibox_quality', quality);

    // 1. Меняем CSS для React
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // 2. Меняем тему для рамки Windows (САМОЕ ВАЖНОЕ)
    if (window.api && window.api.setTheme) {
      window.api.setTheme(theme);
    }
  }, [theme, autoplay, quality]);
  
  // 1. ОЧИСТКА КЭША (безопасная)
  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      if (window.api && window.api.clearCache) {
        await window.api.clearCache();
      }
      setTimeout(() => {
        setIsClearingCache(false);
        alert('Кэш успешно очищен! Приложение будет работать быстрее.');
      }, 500);
    } catch (e) {
      setIsClearingCache(false);
      alert('Ошибка при очистке кэша');
    }
  };

  // 2. ПОЛНЫЙ СБРОС ВСЕГО (опасный)
  const handleResetAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Экспорт/Импорт остаются без изменений
  const handleExport = () => {
    const data = {
      library: JSON.parse(localStorage.getItem('anibox_library') || '{}'),
      history: JSON.parse(localStorage.getItem('anibox_history') || '[]'),
      achievements: JSON.parse(localStorage.getItem('anibox_achievements') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anibox_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.library) localStorage.setItem('anibox_library', JSON.stringify(data.library));
        if (data.history) localStorage.setItem('anibox_history', JSON.stringify(data.history));
        if (data.achievements) localStorage.setItem('anibox_achievements', JSON.stringify(data.achievements));
        alert('Библиотека успешно восстановлена!');
        window.location.reload();
      } catch (err) {
        alert('Ошибка: Неверный формат файла!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl relative">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Palette className="text-purple-500" /> Настройки
      </h2>

      <div className="space-y-6">
        {/* ВНЕШНИЙ ВИД */}
        <div className="bg-[#15151f] border border-[#1f1f2e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1f1f2e] flex items-center gap-2 bg-[#1a1a24]">
            <Palette size={18} className="text-purple-400" />
            <h3 className="font-bold text-white">Внешний вид</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Тема оформления</p>
                <p className="text-sm text-slate-500">Цвет фона</p>
              </div>
              <div className="flex bg-[#0a0a0f] rounded-lg p-1 border border-[#1f1f2e]">
                <button onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${theme === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><Moon size={16} /> Тёмная</button>
                <button onClick={() => setTheme('light')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${theme === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><Sun size={16} /> Светлая</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Язык интерфейса</p>
                <p className="text-sm text-slate-500">Язык меню</p>
              </div>
              <select className="bg-[#0a0a0f] border border-[#1f1f2e] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500">
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* ВОСПРОИЗВЕДЕНИЕ */}
        <div className="bg-[#15151f] border border-[#1f1f2e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1f1f2e] flex items-center gap-2 bg-[#1a1a24]">
            <MonitorPlay size={18} className="text-blue-400" />
            <h3 className="font-bold text-white">Воспроизведение</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Автовоспроизведение</p>
                <p className="text-sm text-slate-500">Следующая серия автоматом</p>
              </div>
              <button onClick={() => setAutoplay(!autoplay)} className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${autoplay ? 'bg-purple-600' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${autoplay ? 'left-8' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Качество по умолчанию</p>
                <p className="text-sm text-slate-500">Для загрузки видео</p>
              </div>
              <select value={quality} onChange={(e) => setQuality(e.target.value)} className="bg-[#0a0a0f] border border-[#1f1f2e] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500">
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
                <option value="480p">480p (SD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ДАННЫЕ */}
        <div className="bg-[#15151f] border border-[#1f1f2e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1f1f2e] flex items-center gap-2 bg-[#1a1a24]">
            <Database size={18} className="text-green-400" />
            <h3 className="font-bold text-white">Данные</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Резервная копия</p>
                <p className="text-sm text-slate-500">Сохранить вашу библиотеку</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0f] hover:bg-[#1f1f2e] border border-[#1f1f2e] text-white rounded-lg text-sm transition"><Download size={16} /> Экспорт</button>
                <label className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0f] hover:bg-[#1f1f2e] border border-[#1f1f2e] text-white rounded-lg text-sm transition cursor-pointer">
                  <Upload size={16} /> Импорт
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            {/* ОЧИСТКА КЭША */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1f1f2e]">
              <div>
                <p className="font-semibold text-white">Очистить кэш</p>
                <p className="text-sm text-slate-500">Ускорить работу приложения</p>
              </div>
              <button onClick={handleClearCache} disabled={isClearingCache} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0f] hover:bg-[#1f1f2e] border border-[#1f1f2e] text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                {isClearingCache ? 'Очистка...' : <><Trash2 size={16} /> Очистить</>}
              </button>
            </div>

            {/* ПОЛНЫЙ СБРОС */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1f1f2e]">
              <div>
                <p className="font-semibold text-red-400">Сбросить всё</p>
                <p className="text-sm text-slate-500">Удалить историю и достижения</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium transition">
                <ShieldAlert size={16} /> Сбросить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ СБРОСА */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowResetModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#15151f] border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Вы уверены?</h3>
              </div>
              
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                Это действие <span className="font-bold text-red-400">необратимо</span>. Вся ваша история просмотров, библиотека и полученные достижения будут удалены навсегда.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowResetModal(false)} className="flex-1 py-2.5 bg-[#1f1f2e] hover:bg-[#2a2a3e] text-white rounded-xl font-semibold transition">
                  Отмена
                </button>
                <button onClick={handleResetAll} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition shadow-lg shadow-red-600/20">
                  Да, удалить всё
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
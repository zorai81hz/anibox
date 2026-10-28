import { useState } from 'react';
import { Settings, Trash2, Sun, Moon, Globe, Palette, PlayCircle, Database, Download, Upload } from 'lucide-react';

const Toggle = ({ enabled, onChange }) => (
  <button onClick={() => onChange(!enabled)} className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${enabled ? 'bg-purple-600' : 'bg-[#2a2a3a]'}`}>
    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);

export default function SettingsPage() {
  const [theme, setTheme] = useState(localStorage.getItem('setting_theme') || 'dark');
  const [lang, setLang] = useState(localStorage.getItem('setting_lang') || 'ru');
  const [autoplay, setAutoplay] = useState(localStorage.getItem('setting_autoplay') !== 'false');
  const [defaultQuality, setDefaultQuality] = useState(localStorage.getItem('setting_quality') || '1080p');

  const save = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value);
  };

  const clearCache = () => {
    if(confirm('ВНИМАНИЕ! Это удалит всю библиотеку, историю и достижения. Продолжить?')) {
      localStorage.removeItem('anibox_library');
      localStorage.removeItem('anibox_achievements');
      window.location.reload();
    }
  };

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
        alert('Данные импортированы!');
        window.location.reload();
      } catch (err) { alert('Ошибка файла'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in max-w-4xl pb-20">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-purple-500" size={32} />
        <h2 className="text-3xl font-bold text-white">Настройки</h2>
      </div>

      <div className="space-y-6">
        {/* ВНЕШНИЙ ВИД */}
        <section className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2"><Palette className="text-purple-400" size={20} /><h3 className="text-lg font-bold text-white">Внешний вид</h3></div>
          
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div><h4 className="text-white font-medium">Тема оформления</h4><p className="text-slate-500 text-sm">Цвет фона</p></div>
            <div className="flex bg-[#15151f] rounded-lg p-1 border border-white/5">
              <button onClick={() => save('setting_theme', 'dark', setTheme)} className={`px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium ${theme === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><Moon size={16} /> Тёмная</button>
              <button onClick={() => save('setting_theme', 'light', setTheme)} className={`px-4 py-2 rounded-md transition flex items-center gap-2 text-sm font-medium ${theme === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><Sun size={16} /> Светлая</button>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div><h4 className="text-white font-medium">Язык интерфейса</h4><p className="text-slate-500 text-sm">Язык меню</p></div>
            <select value={lang} onChange={(e) => save('setting_lang', e.target.value, setLang)} className="bg-[#15151f] text-white px-4 py-2 rounded-lg outline-none border border-white/10">
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>

        {/* ВОСПРОИЗВЕДЕНИЕ */}
        <section className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2"><PlayCircle className="text-blue-400" size={20} /><h3 className="text-lg font-bold text-white">Воспроизведение</h3></div>
          
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div><h4 className="text-white font-medium">Автовоспроизведение</h4><p className="text-slate-500 text-sm">Следующая серия автоматом</p></div>
            <Toggle enabled={autoplay} onChange={(val) => save('setting_autoplay', val, setAutoplay)} />
          </div>

          <div className="p-6 flex items-center justify-between">
            <div><h4 className="text-white font-medium">Качество по умолчанию</h4><p className="text-slate-500 text-sm">Для загрузки видео</p></div>
            <select value={defaultQuality} onChange={(e) => save('setting_quality', e.target.value, setDefaultQuality)} className="bg-[#15151f] text-white px-4 py-2 rounded-lg outline-none border border-white/10">
              <option value="1080p">1080p (Full HD)</option>
              <option value="720p">720p (HD)</option>
              <option value="480p">480p (SD)</option>
            </select>
          </div>
        </section>

        {/* ДАННЫЕ */}
        <section className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2"><Database className="text-green-400" size={20} /><h3 className="text-lg font-bold text-white">Данные</h3></div>
          
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div><h4 className="text-white font-medium">Резервная копия</h4><p className="text-slate-500 text-sm">Сохранить вашу библиотеку</p></div>
            <div className="flex gap-3">
              <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-[#15151f] hover:bg-[#2a2a3a] border border-white/10 text-white rounded-lg transition text-sm"><Download size={16} /> Экспорт</button>
              <label className="flex items-center gap-2 px-4 py-2 bg-[#15151f] hover:bg-[#2a2a3a] border border-white/10 text-white rounded-lg transition text-sm cursor-pointer"><Upload size={16} /> Импорт<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
            </div>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div><h4 className="text-red-400 font-medium">Очистить кэш</h4><p className="text-slate-500 text-sm">Удалить историю и достижения</p></div>
            <button onClick={clearCache} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition text-sm font-medium"><Trash2 size={16} /> Очистить</button>
          </div>
        </section>
      </div>
    </div>
  );
}
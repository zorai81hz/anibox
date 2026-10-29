import { useState, useEffect, useRef } from 'react';
import { Search, Bell, BellOff, Settings, Check, Trash2 } from 'lucide-react';

// Начальные уведомления (если в памяти пусто)
const DEFAULT_NOTIFICATIONS = [
  { id: 1, text: 'Вышла новая серия Клинок, рассекающий демонов!', time: '10 минут назад', isRead: false },
  { id: 2, text: 'Добро пожаловать в AniBox! Твой профиль готов к настройке.', time: '1 час назад', isRead: false }
];

export default function Header({ setView, onSearch }) {
  const [query, setQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Состояние: включены ли уведомления (по умолчанию true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('anibox_notifications_enabled');
    return saved !== 'false'; // Если null или 'true', то true
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('anibox_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const notifRef = useRef(null);

  // Сохраняем настройки уведомлений
  useEffect(() => {
    localStorage.setItem('anibox_notifications_enabled', notificationsEnabled);
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('anibox_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Закрываем по клику в пустоту
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query);
    }
  };

  const unreadCount = notificationsEnabled ? notifications.filter(n => !n.isRead).length : 0;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="flex items-center justify-between p-6 bg-[#0a0a0f] border-b border-[#1f1f2e] sticky top-0 z-40">
      
      {/* Поисковая строка */}
      <div className="flex-1 max-w-2xl">
        <div className="relative flex items-center w-full bg-[#15151f] rounded-xl border border-[#1f1f2e] focus-within:border-purple-500/50 transition">
          <Search size={20} className="absolute left-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск аниме... (Нажми Enter)"
            className="w-full bg-transparent text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Кнопки справа */}
      <div className="flex items-center gap-4">
        
        {/* Блок уведомлений */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition ${
              showNotifications 
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' 
                : notificationsEnabled 
                  ? 'bg-[#15151f] border-[#1f1f2e] hover:bg-[#1f1f2e] text-slate-400 hover:text-white'
                  : 'bg-[#15151f] border-[#1f1f2e] text-slate-600'
            }`}
          >
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            
            {/* Красная точка, только если включено и есть непрочитанные */}
            {notificationsEnabled && unreadCount > 0 && (
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-pink-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-[#15151f] border border-[#1f1f2e] rounded-xl shadow-2xl overflow-hidden z-50">
              {/* Шапка меню с тумблером */}
              <div className="p-4 border-b border-[#1f1f2e] flex justify-between items-center bg-[#1a1a24]">
                <h3 className="font-bold text-white">Уведомления</h3>
                
                <div className="flex items-center gap-3">
                  {notificationsEnabled && unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition">
                      <Check size={14} /> Прочитано
                    </button>
                  )}

                  {/* Сам тумблер Вкл/Выкл */}
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'bg-purple-600' : 'bg-slate-600'}`}
                    title={notificationsEnabled ? "Выключить уведомления" : "Включить уведомления"}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${notificationsEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
              
              {/* Список уведомлений */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {!notificationsEnabled ? (
                  <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                    <BellOff size={24} className="text-slate-600" />
                    Уведомления отключены
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Нет новых уведомлений
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-[#1f1f2e] transition ${n.isRead ? 'opacity-60' : 'bg-[#1a1a24]/50'}`}>
                      <p className="text-sm text-slate-200">{n.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                    </div>
                  ))
                )}
              </div>

              {notificationsEnabled && notifications.length > 0 && (
                <div className="p-3 text-center border-t border-[#1f1f2e] bg-[#0f0f17]">
                  <button onClick={clearAll} className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-1 w-full transition">
                    <Trash2 size={12} /> Очистить всё
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Настройки */}
        <button 
          onClick={() => setView('settings')} 
          className="w-12 h-12 rounded-full bg-[#15151f] border border-[#1f1f2e] flex items-center justify-center hover:bg-[#1f1f2e] text-slate-400 hover:text-white transition"
        >
          <Settings size={20} />
        </button>

        {/* Аватарка */}
        <button 
          onClick={() => setView('profile')}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg hover:opacity-80 transition shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          A
        </button>
      </div>
    </header>
  );
}
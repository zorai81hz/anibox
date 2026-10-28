import { useState, useEffect, Component } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import LibraryPage from './components/LibraryPage';
import AnimeDetail from './components/AnimeDetail';
import SplashScreen from './components/SplashScreen';
import CatalogPage from './components/CatalogPage';
import SchedulePage from './components/SchedulePage';
import TopPage from './components/TopPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import RandomPage from './components/RandomPage';
import { useLibrary } from './hooks/useLibrary';
import { getMultipleAnime, getAiringSchedule } from './api/anilist';
import { AnimatePresence, motion } from 'framer-motion';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() { if (this.state.hasError) { return <div className="p-10 text-center"><h2 className="text-red-500 text-2xl mb-4">Упс, ошибка.</h2><button onClick={() => window.location.reload()} className="px-6 py-2 bg-purple-600 rounded-lg">Перезагрузить</button></div>; } return this.props.children; }
}

export default function App() {
  const [view, setView] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState(''); 
  
  const library = useLibrary();

  // 1. Синхронизация библиотеки
  useEffect(() => {
    const syncOnStartup = async () => {
      const savedIds = Object.keys(library.items).map(Number);
      if (savedIds.length > 0) {
        try {
          for (let i = 0; i < savedIds.length; i += 50) {
            const chunk = savedIds.slice(i, i + 50);
            const freshData = await getMultipleAnime(chunk);
            if (freshData && freshData.length > 0) {
              library.syncLibrary(freshData);
            }
          }
        } catch (error) { console.error("Ошибка синхронизации:", error); }
      }
    };
    syncOnStartup();
  }, []); 

  // 2. УВЕДОМЛЕНИЯ О НОВЫХ СЕРИЯХ
  useEffect(() => {
    const checkNewEpisodes = async () => {
      // Ждем 3 секунды, чтобы приложение загрузилось и не спамило уведомлениями при старте
      await new Promise(r => setTimeout(r, 3000));
      
      const schedule = await getAiringSchedule();
      if (!schedule || schedule.length === 0) return;

      const today = new Date().toDateString();
      const lastNotified = localStorage.getItem('anibox_last_notified_date');
      
      // Если мы уже показывали уведомления сегодня, не показываем снова
      if (lastNotified === today) return;

      let notifiedCount = 0;
      schedule.forEach(item => {
        const inLib = library.items[item.media.id];
        // Если аниме в списке "Смотрю"
        if (inLib && inLib.status === 'watching') {
          const title = item.media.title.romaji || item.media.title.english;
          if (window.api && window.api.showNotification) {
             window.api.showNotification({
               title: `Новая серия: ${title}`,
               body: `Вышла ${item.episode} серия! Пора смотреть.`,
               icon: item.media.coverImage.large
             });
             notifiedCount++;
          }
        }
      });

      if (notifiedCount > 0) {
        localStorage.setItem('anibox_last_notified_date', today);
      }
    };

    checkNewEpisodes();
  }, [library.items]); // Зависит от библиотеки

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <div className="flex min-h-screen bg-[#050508] text-white">
      <Sidebar view={view} setView={setView} library={library} />
      
      <div className="flex-1 ml-60 flex flex-col h-screen overflow-hidden">
        <Header onSearch={(q) => { setGlobalSearchQuery(q); setView('search'); }} />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="p-6 pb-20">
              
              <ErrorBoundary>
                {view === 'home' && <HomePage onOpen={setSelectedId} library={library} />}
                {view === 'search' && <SearchPage onOpen={setSelectedId} library={library} initialQuery={globalSearchQuery} />}
                {view === 'library' && <LibraryPage onOpen={setSelectedId} library={library} />}
                {view === 'catalog' && <CatalogPage onOpen={setSelectedId} library={library} />}
                {view === 'schedule' && <SchedulePage onOpen={setSelectedId} library={library} />}
                {view === 'top' && <TopPage onOpen={setSelectedId} library={library} />}
                {view === 'profile' && <ProfilePage library={library} />}
                {view === 'settings' && <SettingsPage />}
                {view === 'random' && <RandomPage onOpen={setSelectedId} />}
              </ErrorBoundary>

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {selectedId && (
        <ErrorBoundary>
          <AnimeDetail id={selectedId} onClose={() => setSelectedId(null)} library={library} onOpen={setSelectedId} />
        </ErrorBoundary>
      )}
    </div>
  );
}
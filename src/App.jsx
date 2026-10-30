import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import LibraryPage from './components/LibraryPage';
import CatalogPage from './components/CatalogPage';
import SchedulePage from './components/SchedulePage';
import TopPage from './components/TopPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import RandomPage from './components/RandomPage';
import AnimeDetail from './components/AnimeDetail';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { useLibrary } from './hooks/useLibrary';
import { useAchievements } from './hooks/useAchievements';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const library = useLibrary();
  // Подключаем наш новый хук достижений
  const achievements = useAchievements();

  // Применяем сохраненную тему и перекрашиваем рамку Windows при запуске
  useEffect(() => {
    const savedTheme = localStorage.getItem('anibox_theme') || 'dark';
    
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    if (window.api && window.api.setTheme) {
      window.api.setTheme(savedTheme);
    }
  }, []);

  // Эмуляция загрузки при старте
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-slate-100 font-sans">
      <Sidebar view={view} setView={setView} library={library} />

      <div className="flex-1 ml-60 flex flex-col h-screen overflow-hidden">
        <Header 
          setView={setView} 
          onSearch={(q) => { 
            setGlobalSearchQuery(q); 
            setView('search'); 
          }} 
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div 
              key={view} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.2 }}
              className="p-8 h-full"
            >
              <ErrorBoundary>
                {view === 'home' && <HomePage onOpen={setSelectedId} library={library} />}
                {view === 'search' && <SearchPage onOpen={setSelectedId} library={library} initialQuery={globalSearchQuery} />}
                {view === 'library' && <LibraryPage onOpen={setSelectedId} library={library} />}
                {view === 'catalog' && <CatalogPage onOpen={setSelectedId} library={library} />}
                {view === 'schedule' && <SchedulePage onOpen={setSelectedId} library={library} />}
                {view === 'top' && <TopPage onOpen={setSelectedId} library={library} />}
                {/* Прокидываем achievements в профиль */}
                {view === 'profile' && <ProfilePage library={library} onOpen={setSelectedId} achievements={achievements} />}
                {view === 'settings' && <SettingsPage />}
                {view === 'random' && <RandomPage onOpen={setSelectedId} library={library} />}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Прокидываем achievements в карточку аниме */}
      {selectedId && (
        <ErrorBoundary>
          <AnimeDetail 
            id={selectedId} 
            onClose={() => setSelectedId(null)} 
            library={library} 
            onOpen={setSelectedId} 
            achievements={achievements}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
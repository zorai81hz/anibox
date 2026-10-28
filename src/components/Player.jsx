import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX, Maximize, Settings, ChevronRight, Check, Loader2, AlertCircle, Mic2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import AchievementToast from './AchievementToast';
import { TIMECODE_ACHIEVEMENTS } from '../data/achievementsData';

export default function Player({ anime, episode, onClose, onNextEpisode, initialTime = 0, library }) {
  const title = anime.title?.ru || anime.title.romaji || anime.title.english;

  // Собираем массив названий один раз (без пересоздания)
  const titlesArray = useMemo(() => {
    const t = [anime.title?.ru, anime.title?.english, anime.title?.romaji, anime.title?.native];
    return [...new Set(t.filter(Boolean))];
  }, [anime]);

  // ================ СОСТОЯНИЯ ================
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('main');
  const [quality, setQuality] = useState('1080p');
  const [dub, setDub] = useState('AniLibria');

  const [videoSrc, setVideoSrc] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isTestVideo, setIsTestVideo] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // ================ ФУНКЦИЯ ВЫДАЧИ ДОСТИЖЕНИЙ ================
  const unlockAchievement = (id, title, desc, image) => {
    const unlocked = JSON.parse(localStorage.getItem('anibox_achievements') || '[]');
    if (!unlocked.find(a => a.id === id)) {
      const newAch = { id, title, desc, image };
      localStorage.setItem('anibox_achievements', JSON.stringify([...unlocked, newAch]));
      setNewAchievement(newAch);
    }
  };

  // ================ useMemo: ФИЛЬТРУЕМ ДОСТИЖЕНИЯ ДЛЯ ЭТОГО АНИМЕ ================
  // Не нужно перебирать 10 000 достижений каждую секунду. Фильтруем один раз.
  const relevantAchievements = useMemo(() => {
    if (!TIMECODE_ACHIEVEMENTS) return [];
    return TIMECODE_ACHIEVEMENTS.filter(ach => {
      if (ach.episode !== episode) return false;
      const lowerTitle = title.toLowerCase();
      return ach.animeTitleMatch.some(t => lowerTitle.includes(t.toLowerCase()));
    });
  }, [title, episode]);

  // ================ useEffect #1: ПРОВЕРКА ДОСТИЖЕНИЙ ================
  useEffect(() => {
    if (relevantAchievements.length === 0) return;

    const check = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const time = Math.floor(videoRef.current.currentTime);
        relevantAchievements.forEach(ach => {
          if (time >= ach.time && time <= ach.time + 2) {
            unlockAchievement(ach.id, ach.title, ach.desc, ach.image);
          }
        });
      }
    }, 1000);
    return () => clearInterval(check);
  }, [relevantAchievements, isPlaying]);

  // ================ useEffect #2: ЗАГРУЗКА ВИДЕО ================
  useEffect(() => {
    // Если тестовое видео уже включено, не перезагружаем
    if (isTestVideo) return;

    setIsLoadingVideo(true);
    setVideoError(false);

    if (window.api) {
      window.api.getVideoLink(titlesArray, episode).then(url => {
        if (url) {
          setVideoSrc(url);
        } else {
          setVideoError(true);
        }
        setIsLoadingVideo(false);
      }).catch(() => {
        setVideoError(true);
        setIsLoadingVideo(false);
      });
    } else {
      setVideoError(true);
      setIsLoadingVideo(false);
    }
  }, [titlesArray, episode, isTestVideo]);

  // ================ useEffect #3: HLS ПЛЕЕР ================
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialTime > 0 && videoRef.current) videoRef.current.currentTime = initialTime;
        videoRef.current?.play();
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoSrc;
      videoRef.current.onloadedmetadata = () => {
        if (initialTime > 0 && videoRef.current) videoRef.current.currentTime = initialTime;
        videoRef.current?.play();
      };
    }

    return () => { if (hls) hls.destroy(); };
  }, [videoSrc, initialTime]);

  // ================ useEffect #4: СОХРАНЕНИЕ ТАЙМКОДА ================
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying && !isTestVideo && videoRef.current.currentTime > 0) {
        library.saveTimestamp(anime.id, episode, videoRef.current.currentTime);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, episode, anime.id, library, isTestVideo]);

  // ================ useEffect #5: ДОБАВЛЕНИЕ В ИСТОРИЮ ================
  useEffect(() => {
    if (videoSrc && !isLoadingVideo && !isTestVideo) {
      library.addHistory(anime, episode);
    }
  }, [videoSrc, isLoadingVideo, isTestVideo, anime, episode]);

  // ================ useEffect #6: АВТО-СКРЫТИЕ КОНТРОЛОВ ================
  useEffect(() => {
    // Инициализируем таймер скрытия при монтировании / смене состояния
    const handle = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showSettings) setShowControls(false);
      }, 3000);
    };
    handle();

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showSettings]);

  // ================ ОСТАЛЬНЫЕ ФУНКЦИИ ================
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  const handleClose = () => {
    if (videoRef.current && !isTestVideo) {
      library.saveTimestamp(anime.id, episode, videoRef.current.currentTime);
    }
    onClose();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60), s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const playTestVideo = () => {
    setVideoError(false);
    setIsLoadingVideo(true);
    setIsTestVideo(true);
    setTimeout(() => {
      setVideoSrc("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
      setIsLoadingVideo(false);
    }, 500);
  };

  // ================ ЭКРАН ЗАГРУЗКИ ================
  if (isLoadingVideo) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
      <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
      <p className="text-purple-400 text-xl font-bold">Поиск видео для серии {episode}...</p>
      <button onClick={handleClose} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">Отмена</button>
    </div>
  );

  // ================ ЭКРАН ОШИБКИ ================
  if (videoError) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] p-6 text-center">
      <AlertCircle size={64} className="text-red-500 mb-6" />
      <h3 className="text-2xl font-bold text-white mb-2">Видео не найдено</h3>
      <p className="text-slate-400 max-w-lg mb-8">На AniLibria нет этого аниме или конкретной серии. Но ты можешь проверить плеер.</p>
      <div className="flex gap-4">
        <button onClick={handleClose} className="px-6 py-3 bg-[#1f1f2e] hover:bg-[#2a2a3e] rounded-xl font-bold text-white transition">Вернуться назад</button>
        <button onClick={playTestVideo} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition flex items-center gap-2">
          <Music size={18} /> Включить Lofi Girl
        </button>
      </div>
    </div>
  );

  // ================ ОСНОВНОЙ РЕНДЕР ================
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[100] flex flex-col group"
      onMouseMove={handleMouseMove}
      onClick={() => { if (showSettings) setShowSettings(false); }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        autoPlay
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => onNextEpisode(episode + 1)}
      />

      {/* ОВЕРЛЕЙ ДЛЯ ТЕСТОВОГО ВИДЕО */}
      {isTestVideo && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/20 text-center z-10 pointer-events-none">
          <Music size={48} className="text-pink-400 mx-auto mb-3 animate-pulse" />
          <h2 className="text-2xl font-black text-white mb-2">Тестовый режим</h2>
          <p className="text-slate-300 text-sm max-w-sm">
            Это видео-заглушка (Lofi Girl), чтобы проверить работу плеера.<br />
            В базе AniLibria не оказалось этой серии.
          </p>
        </div>
      )}

      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />

      {/* КНОПКА PLAY ПО ЦЕНТРУ (когда на паузе) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-24 h-24 bg-purple-600/80 rounded-full flex items-center justify-center backdrop-blur shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <Play size={48} fill="white" className="text-white ml-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent z-20 flex justify-between items-start"
          >
            <div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">{title}</h2>
              <p className="text-purple-400 font-medium text-lg">Серия {episode}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="w-12 h-12 bg-white/10 hover:bg-red-500/80 rounded-full flex items-center justify-center transition backdrop-blur text-white"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-20 bg-gradient-to-t from-black/90 to-transparent z-20 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Полоса перемотки */}
            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range" min="0" max={duration || 100} value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* Кнопки */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-purple-400">
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
                <button onClick={() => onNextEpisode(episode + 1)} className="text-white hover:text-purple-400">
                  <SkipForward size={28} fill="currentColor" />
                </button>

                <div className="flex items-center gap-2 group/vol relative">
                  <button onClick={toggleMute} className="text-white hover:text-purple-400">
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/vol:w-24 transition-all duration-300 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 relative">
                <button
                  onClick={() => { setShowSettings(!showSettings); setSettingsTab('main'); }}
                  className={`text-white hover:text-purple-400 transition ${showSettings ? 'text-purple-500' : ''}`}
                >
                  <Settings size={28} />
                </button>
                <button
                  onClick={() => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen()}
                  className="text-white hover:text-purple-400"
                >
                  <Maximize size={24} />
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-12 right-14 w-64 bg-[#15151f]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {settingsTab === 'main' && (
                        <div className="p-2">
                          <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase">Настройки</p>
                          <button onClick={() => setSettingsTab('quality')} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg text-white text-sm transition">
                            <span className="flex items-center gap-2"><Settings size={14} /> Качество</span>
                            <span className="text-slate-400 flex items-center">{quality} <ChevronRight size={16} /></span>
                          </button>
                          <button onClick={() => setSettingsTab('dub')} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg text-white text-sm transition">
                            <span className="flex items-center gap-2"><Mic2 size={14} /> Озвучка</span>
                            <span className="text-slate-400 flex items-center">{dub} <ChevronRight size={16} /></span>
                          </button>
                        </div>
                      )}

                      {settingsTab === 'quality' && (
                        <div className="p-2">
                          <button onClick={() => setSettingsTab('main')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:text-white uppercase mb-1">← Назад</button>
                          {['1080p', '720p', '480p'].map(q => (
                            <button key={q} onClick={() => { setQuality(q); setSettingsTab('main'); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-white transition">
                              <span className={quality === q ? 'text-purple-400' : ''}>{q}</span>
                              {quality === q && <Check size={16} className="text-purple-400" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {settingsTab === 'dub' && (
                        <div className="p-2">
                          <button onClick={() => setSettingsTab('main')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:text-white uppercase mb-1">← Назад</button>
                          {['AniLibria', 'Studio Band', 'AniDUB', 'Субтитры'].map(d => (
                            <button key={d} onClick={() => { setDub(d); setSettingsTab('main'); }} className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-white transition">
                              <span className={dub === d ? 'text-purple-400' : ''}>{d}</span>
                              {dub === d && <Check size={16} className="text-purple-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
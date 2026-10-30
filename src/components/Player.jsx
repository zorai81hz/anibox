import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX, Maximize, Settings, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import AchievementToast from './AchievementToast';

function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parseInt(parts[2].split(',')[0], 10);
  return h * 3600 + m * 60 + s;
}

export default function Player({ anime, episode, totalEpisodes, onClose, onNextEpisode, initialTime = 0, library, achievements }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('main');
  const [speed, setSpeed] = useState(1);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [error, setError] = useState(null);
  const [isTestVideo, setIsTestVideo] = useState(false);
  
  const [newAchievement, setNewAchievement] = useState(null);
  const [animeAchievements, setAnimeAchievements] = useState([]);
  const unlockedAchievementsRef = useRef(new Set());

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const initialTimeRef = useRef(initialTime);
  const libraryRef = useRef(library);

  useEffect(() => { initialTimeRef.current = initialTime; }, [initialTime]);
  useEffect(() => { libraryRef.current = library; }, [library]);

  // Загрузка ачивок
  useEffect(() => {
    if (window.api && window.api.getAchievements && anime?.id) {
      window.api.getAchievements(anime.id).then(data => {
        setAnimeAchievements(data || []);
        unlockedAchievementsRef.current.clear();
      });
    }
  }, [anime?.id]);

  const relevantAchievements = useMemo(() => {
    if (!animeAchievements || animeAchievements.length === 0) return [];
    return animeAchievements.map(ach => ({ ...ach, timeInSeconds: timeToSeconds(ach.time) }));
  }, [animeAchievements]);

  // Проверка достижений
  useEffect(() => {
    if (relevantAchievements.length === 0) return;
    const check = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const time = Math.floor(videoRef.current.currentTime);
        relevantAchievements.forEach(ach => {
          if (time >= ach.timeInSeconds && time <= ach.timeInSeconds + 2) {
            if (!unlockedAchievementsRef.current.has(ach.title)) {
              setNewAchievement(ach);
              unlockedAchievementsRef.current.add(ach.title);
              if (achievements && achievements.unlockAchievement) {
                achievements.unlockAchievement(ach.title, ach.title, ach.desc, ach.image);
              }
            }
          }
        });
      }
    }, 1000);
    return () => clearInterval(check);
  }, [relevantAchievements, isPlaying, achievements]);

  // Загрузка видео
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVideo(true);
    setError(null);
    
    const fetchVideo = async () => {
      try {
        const titlesArray = [anime.title.romaji, anime.title.english, anime.title.native].filter(Boolean);
        if (window.api && window.api.getVideoLink) {
          const link = await window.api.getVideoLink(titlesArray, episode);
          if (link && isMounted) {
            setVideoSrc(link);
            setIsTestVideo(false);
            setIsLoadingVideo(false);
          } else {
            if (isMounted) {
              setError("Видео не найдено. Возможно, этой серии нет на AniLibria.");
              setIsLoadingVideo(false);
            }
          }
        } else {
           if (isMounted) {
             setError("Ошибка подключения к AniLibria.");
             setIsLoadingVideo(false);
           }
        }
      } catch (err) {
        if (isMounted) {
          setError("Ошибка при загрузке видео");
          setIsLoadingVideo(false);
        }
      }
    };

    fetchVideo();
    return () => { isMounted = false; };
  }, [anime, episode]);

  // HLS
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls({ startLevel: -1 });
      hls.loadSource(videoSrc);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialTimeRef.current > 0 && videoRef.current) {
          videoRef.current.currentTime = initialTimeRef.current;
        }
        videoRef.current?.play().catch(() => setIsPlaying(false));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
            case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
            default: setError("Не удалось загрузить видеопоток"); hls.destroy(); break;
          }
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoSrc;
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (initialTimeRef.current > 0 && videoRef.current) {
          videoRef.current.currentTime = initialTimeRef.current;
        }
        videoRef.current?.play().catch(() => setIsPlaying(false));
      });
    }
    return () => { if (hls) hls.destroy(); };
  }, [videoSrc]);

  // Сохранение таймкода
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying && !isTestVideo && videoRef.current.currentTime > 0) {
        libraryRef.current.saveTimestamp(anime.id, episode, videoRef.current.currentTime);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, episode, anime.id, isTestVideo]);

  const handleMouseMove = () => {
    const controls = document.getElementById('video-controls');
    if (controls) {
      controls.style.opacity = '1';
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) controls.style.opacity = '0';
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('player-container')?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isEnding = duration > 0 && progress > 0 && (duration - progress) <= 90;

  return (
    <div id="player-container" className="fixed inset-0 bg-black z-50 flex flex-col" onMouseMove={handleMouseMove}>
      <div id="video-controls" className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent z-20 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white keep-white">{anime.title.romaji}</h2>
            <p className="text-sm text-slate-400">Серия {episode} {isTestVideo && <span className="text-yellow-400 ml-2">(Тестовое видео)</span>}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"><X size={24} /></button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black">
        {isLoadingVideo ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-slate-400">Загрузка видео...</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-slate-400">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-purple-600 rounded-lg text-white mt-4">Вернуться</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            onEnded={() => {
              if (onNextEpisode && episode < totalEpisodes) {
                onNextEpisode(episode + 1);
              }
            }}
            crossOrigin="anonymous"
          />
        )}

        {!isPlaying && !isLoadingVideo && !error && (
          <button onClick={togglePlay} className="absolute inset-0 m-auto w-20 h-20 bg-purple-600/80 hover:bg-purple-500 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition transform hover:scale-110 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            <Play size={40} className="ml-2" fill="currentColor" />
          </button>
        )}

        <AnimatePresence>
          {isEnding && episode < totalEpisodes && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              onClick={() => onNextEpisode && onNextEpisode(episode + 1)}
              className="absolute bottom-24 right-8 z-30 flex items-center gap-3 px-6 py-4 bg-black/70 hover:bg-purple-600/90 backdrop-blur-md border border-white/20 hover:border-purple-400/50 rounded-2xl text-white font-bold text-lg transition-all shadow-2xl group cursor-pointer"
            >
              {/* ВОТ ТУТ ТЕКСТ С НОМЕРОМ СЕРИИ */}
              <span>Переход на следующую серию ({episode + 1})</span>
              <SkipForward size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div id="video-controls-bottom" className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent z-20 transition-opacity duration-300">
        <div className="flex items-center gap-4 mb-4 text-xs font-mono text-slate-300">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-purple-400 transition">
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
            </button>

            <div className="flex items-center gap-2 group">
              <button onClick={toggleMute} className="text-white hover:text-purple-400 transition">
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
             <button onClick={() => setShowSettings(!showSettings)} className={`text-white hover:text-purple-400 transition ${showSettings ? 'text-purple-400' : ''}`}>
              <Settings size={24} />
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-purple-400 transition">
              <Maximize size={24} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-12 right-10 w-64 bg-[#15151f] border border-[#2a2a3a] rounded-xl overflow-hidden shadow-2xl z-50"
                >
                  {settingsTab === 'main' ? (
                    <div className="p-2">
                      <button onClick={() => setSettingsTab('speed')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-lg text-sm text-white transition">
                        <span className="flex items-center gap-3"><ChevronRight size={16} /> Скорость</span>
                        <span className="text-slate-400">{speed}x</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2">
                      <button onClick={() => setSettingsTab('main')} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-white uppercase transition">
                        <ChevronRight size={14} className="rotate-180" /> Назад
                      </button>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                        <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg text-sm transition ${speed === s ? 'text-purple-400' : 'text-white'}`}>
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AchievementToast 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />
    </div>
  );
}
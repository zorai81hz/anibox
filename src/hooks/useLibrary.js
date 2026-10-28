import { useState, useEffect } from 'react';

const STORAGE_KEY = 'anibox_library';
const HISTORY_KEY = 'anibox_history';

export function useLibrary() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  });

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);

  const add = (anime, status = 'planning') => {
    setItems(prev => ({
      ...prev,
      [anime.id]: {
        ...anime,
        status,
        isFavorite: prev[anime.id]?.isFavorite || false,
        progress: prev[anime.id]?.progress || 0,
        addedAt: prev[anime.id]?.addedAt || Date.now(),
        timestamps: prev[anime.id]?.timestamps || {},
      },
    }));
  };

  const toggleFavorite = (id) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], isFavorite: !prev[id].isFavorite } };
    });
  };

  const addHistory = (anime, episode, timestamp = 0) => {
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.animeId === anime.id && h.episode === episode));
      const newRecord = { animeId: anime.id, title: anime.title, coverImage: anime.coverImage, episode, timestamp, watchedAt: Date.now() };
      return [newRecord, ...filtered].slice(0, 50);
    });
  };

  const setStatus = (id, status) => {
    setItems(prev => prev[id] ? { ...prev, [id]: { ...prev[id], status } } : prev);
  };

  const setProgress = (id, progress) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      const updated = { ...prev[id], progress: Math.max(0, progress) };
      if (updated.episodes && updated.progress >= updated.episodes && updated.status === 'watching') {
        updated.status = 'completed';
      }
      return { ...prev, [id]: updated };
    });
  };

  const saveTimestamp = (id, episode, time) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], timestamps: { ...(prev[id].timestamps || {}), [episode]: time } } };
    });
  };

  const syncLibrary = (apiData) => {
    setItems(prev => {
      let changed = false;
      const updated = { ...prev };
      apiData.forEach(apiItem => {
        if (updated[apiItem.id]) {
          let realEps = apiItem.episodes;
          if (!realEps && apiItem.nextAiringEpisode) realEps = apiItem.nextAiringEpisode.episode - 1;
          if (realEps && updated[apiItem.id].episodes !== realEps) {
            updated[apiItem.id] = { ...updated[apiItem.id], episodes: realEps };
            changed = true;
          }
        }
      });
      return changed ? updated : prev;
    });
  };

  const remove = (id) => {
    setItems(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearHistory = () => setHistory([]);

  return { items, history, add, toggleFavorite, addHistory, setStatus, setProgress, saveTimestamp, remove, syncLibrary, clearHistory };
}
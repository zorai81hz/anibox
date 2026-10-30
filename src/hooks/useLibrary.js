import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'anibox_library';
const CLOUD_URL = 'https://obxodanibox.sfasfasfa219.workers.dev/library';

export function useLibrary() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  // 1. Загрузка из облака при старте
  useEffect(() => {
    async function loadFromCloud() {
      try {
        console.log('🔄 Загрузка библиотеки из облака...');
        const res = await fetch(CLOUD_URL);
        const cloudData = await res.json();
        
        if (cloudData && Object.keys(cloudData).length > 0) {
          console.log('✅ Данные из облака получены:', cloudData);
          setItems(prev => ({ ...prev, ...cloudData }));
        } else {
          console.log('☁️ В облаке пока пусто.');
        }
      } catch (err) {
        console.error('❌ Ошибка загрузки из облака:', err);
      }
    }
    loadFromCloud();
  }, []);

  // 2. Сохранение в localStorage и облако
  useEffect(() => {
    // Сохраняем локально
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    // Отправляем в облако с задержкой
    const timeout = setTimeout(async () => {
      try {
        console.log('📤 Отправка данных в облако...', items);
        const res = await fetch(CLOUD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(items)
        });
        const result = await res.json();
        console.log('✅ Ответ от облака:', result);
      } catch (err) {
        console.error('❌ Ошибка отправки в облако:', err);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [items]);

  // --- Функции управления библиотекой ---
  const add = (anime, status = 'planning') => {
    setItems(prev => ({
      ...prev,
      [anime.id]: {
        id: anime.id,
        title: anime.title,
        coverImage: anime.coverImage,
        episodes: anime.episodes,
        seasonYear: anime.seasonYear,
        format: anime.format,
        status,
        progress: prev[anime.id]?.progress || 0,
        addedAt: prev[anime.id]?.addedAt || Date.now(),
        isFavorite: prev[anime.id]?.isFavorite || false,
        timestamps: prev[anime.id]?.timestamps || {},
      },
    }));
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

  const remove = (id) => {
    setItems(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const toggleFavorite = (id) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], isFavorite: !prev[id].isFavorite } };
    });
  };

  const saveTimestamp = (id, episode, time) => {
    setItems(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          timestamps: { ...prev[id].timestamps, [episode]: time }
        }
      };
    });
  };

  const addHistory = (anime, episode) => {
    // Тут можно оставить пустым, если история не нужна, или дописать логику
  };

  return { items, add, setStatus, setProgress, remove, toggleFavorite, saveTimestamp, addHistory };
}
// src/hooks/useAchievements.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'anibox_achievements';
const CLOUD_URL = 'https://obxodanibox.sfasfasfa219.workers.dev/leaderboard';

export function useAchievements() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  // Сохранение локально и отправка в облако при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    
    // Отправляем в облако (с задержкой)
    const count = Object.keys(unlocked).length;
    if (count > 0) {
      const timeout = setTimeout(async () => {
        try {
          await fetch(CLOUD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: 'anibox_user_1', // Твой уникальный ID
              achievementsCount: count 
            })
          });
          console.log('🏆 Счет отправлен в лидерборд:', count);
        } catch (err) {
          console.error('Ошибка отправки в лидерборд:', err);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [unlocked]);

  const unlockAchievement = (id, title, desc, image) => {
    if (unlocked[id]) return;
    setUnlocked(prev => ({
      ...prev,
      [id]: { id, title, desc, image, unlockedAt: Date.now() }
    }));
  };

  const clearAchievements = () => setUnlocked({});

  return { unlocked, unlockAchievement, clearAchievements };
}
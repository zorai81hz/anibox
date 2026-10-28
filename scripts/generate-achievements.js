import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Список популярных аниме (можешь добавить свои)
const animeList = [
  { title: 'One Piece', match: ['one piece', 'ван пис', 'ванпис'] },
  { title: 'Naruto', match: ['naruto', 'наруто'] },
  { title: 'Bleach', match: ['bleach', 'блич'] },
  { title: 'Attack on Titan', match: ['shingeki no kyojin', 'attack on titan', 'атака титанов'] },
  { title: 'Jujutsu Kaisen', match: ['jujutsu kaisen', 'магическая битва'] },
  { title: 'Demon Slayer', match: ['kimetsu no yaiba', 'demon slayer', 'клинок'] },
  { title: 'Death Note', match: ['death note', 'тетрадь смерти'] },
  { title: 'Fullmetal Alchemist', match: ['fullmetal alchemist', 'стальной алхимик'] },
  { title: 'Hunter x Hunter', match: ['hunter x hunter', 'охотник'] },
  { title: 'Tokyo Ghoul', match: ['tokyo ghoul', 'токийский гуль'] },
  { title: 'Sword Art Online', match: ['sword art online', 'мастера меча'] },
  { title: 'My Hero Academia', match: ['boku no hero academia', 'моя геройская'] },
  { title: 'Chainsaw Man', match: ['chainsaw man', 'человек-бензопила'] },
  { title: 'Spy x Family', match: ['spy x family', 'семья шпиона'] },
  { title: 'JoJo\'s Bizarre Adventure', match: ['jojo', 'джоджо'] },
  { title: 'Steins;Gate', match: ['steins gate', 'врата штейна'] },
  { title: 'Code Geass', match: ['code geass', 'код гиас'] },
  { title: 'Evangelion', match: ['evangelion', 'евангелион'] },
  { title: 'Gintama', match: ['gintama', 'гинтама'] },
  { title: 'Haikyuu!!', match: ['haikyuu', 'волейбол'] },
  { title: 'Kuroko no Basket', match: ['kuroko no basket', 'баскетбол куроко'] },
  { title: 'Fairy Tail', match: ['fairy tail', 'хвост феи'] },
  { title: 'Black Clover', match: ['black clover', 'черный клевер'] },
  { title: 'Seven Deadly Sins', match: ['nanatsu no taizai', 'семь смертных грехов'] },
  { title: 'Mob Psycho 100', match: ['mob psycho 100', 'моб психо'] },
  { title: 'Re:Zero', match: ['re zero', 're:zero', 'жизнь с нуля'] },
  { title: 'Overlord', match: ['overlord', 'оверлорд'] },
  { title: 'Konosuba', match: ['konosuba', 'замечательный мир'] },
  { title: 'Shield Hero', match: ['tate no yuusha', 'восхождение героя щита'] },
  { title: 'Mushoku Tensei', match: ['mushoku tensei', 'реинкарнация безработного'] },
  { title: 'Slime', match: ['tensei shitara slime', 'перерождении в слизь'] },
  { title: 'Vinland Saga', match: ['vinland saga', 'сага о винланде'] },
  { title: 'Violet Evergarden', match: ['violet evergarden', 'вайолет'] },
  { title: 'Your Name', match: ['kimi no na wa', 'твое имя'] },
  { title: 'Weathering With You', match: ['tenki no ko', 'дитя погоды'] },
  { title: 'Suzume', match: ['suzume', 'судзумэ'] },
  { title: 'Spirited Away', match: ['spirited away', 'унесенные призраками'] },
  { title: 'Princess Mononoke', match: ['mononoke hime', 'принцесса мононоке'] },
  { title: 'Howl\'s Moving Castle', match: ['howl', 'ходячий замок'] },
  { title: 'Cyberpunk Edgerunners', match: ['cyberpunk', 'киберпанк'] },
  { title: 'Bocchi the Rock', match: ['bocchi', 'одинокий рокер'] },
  { title: 'Oshi no Ko', match: ['oshi no ko', 'звездный ребенок'] },
  { title: 'Frieren', match: ['frieren', 'фрирен'] },
  { title: 'Dungeon Meshi', match: ['dungeon meshi', 'подземелье вкусностей'] },
  { title: 'Solo Leveling', match: ['solo leveling', 'поднятие уровня'] },
  { title: 'Blue Lock', match: ['blue lock', 'синяя тюрьма'] },
  { title: 'Dandadan', match: ['dandadan', 'дандадан'] },
  { title: 'Kaiju No. 8', match: ['kaijuu 8', 'кайдзю'] },
  { title: 'Hell\'s Paradise', match: ['jigokuraku', 'адский рай'] },
  { title: 'Mashle', match: ['mashle', 'магия и мускулы'] }
];

// Серии, для которых генерируем достижения
const episodes = [1, 2, 3, 4, 5, 10, 20, 50, 100, 500];
// Таймкоды (в секундах): 1 мин, 3 мин, 5 мин... до 19 минут
const timecodes = [60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140];

// Шаблоны названий и описаний
const titles = ['Начало пути', 'Первый шаг', 'Втянулся', 'Продолжаем', 'Фанат', 'Хардкор', 'Легенда', 'Марафонец', 'Одержимый', 'Бессмертный'];
const descriptions = ['Вы посмотрели до', 'Вы дошли до', 'Вы осилили', 'Вы продержались до'];

const achievements = [];

animeList.forEach(anime => {
  episodes.forEach((ep, epIndex) => {
    timecodes.forEach((time, timeIndex) => {
      // Пропускаем некоторые комбинации, чтобы не было слишком много однотипных
      if (timeIndex % 2 !== 0 && epIndex % 2 !== 0) return; 

      const id = `${anime.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ep${ep}_time${time}`;
      
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
      const minutes = Math.floor(time / 60);
      const seconds = time % 60 < 10 ? `0${time % 60}` : time % 60;

      achievements.push({
        id,
        animeTitleMatch: anime.match,
        episode: ep,
        time: time,
        title: `${randomTitle}: ${anime.title}`,
        desc: `${randomDesc} ${minutes}:${seconds} серии ${ep}.`,
        // Используем плейсхолдер (картинку можно заменить потом)
        image: `https://placehold.co/200x200/1a1a25/9333ea?text=${encodeURIComponent(anime.title)}`
      });
    });
  });
});

// Запись файла
const outputPath = path.join(__dirname, '..', 'src', 'data', 'achievementsData.js');
const content = `export const TIMECODE_ACHIEVEMENTS = ${JSON.stringify(achievements, null, 2)};\n`;
fs.writeFileSync(outputPath, content, 'utf-8');

console.log(`✅ Сгенерировано ${achievements.length} достижений!`);
console.log(`📁 Файл: src/data/achievementsData.js`);
import { useState, useEffect } from 'react';
import { getCatalog } from '../api/anilist';
import AnimeCard from './AnimeCard';
import AnimeCardSkeleton from './AnimeCardSkeleton';
import { ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCcw } from 'lucide-react';

const GENRES = [
  { eng: 'Action', ru: 'Боевик' }, { eng: 'Adventure', ru: 'Приключения' }, { eng: 'Comedy', ru: 'Комедия' },
  { eng: 'Drama', ru: 'Драма' }, { eng: 'Fantasy', ru: 'Фэнтези' }, { eng: 'Horror', ru: 'Ужасы' },
  { eng: 'Mystery', ru: 'Детектив' }, { eng: 'Romance', ru: 'Романтика' }, { eng: 'Sci-Fi', ru: 'Фантастика' },
  { eng: 'Slice of Life', ru: 'Повседневность' }, { eng: 'Sports', ru: 'Спорт' }, { eng: 'Supernatural', ru: 'Сверхъестественное' },
];
const STATUSES = [
  { eng: 'RELEASING', ru: 'Онгоинг' }, { eng: 'FINISHED', ru: 'Завершено' }, { eng: 'NOT_YET_RELEASED', ru: 'Анонс' }
];
const FORMATS = [
  { eng: 'TV', ru: 'ТВ Сериал' }, { eng: 'MOVIE', ru: 'Фильм' }, { eng: 'OVA', ru: 'OVA' }, { eng: 'ONA', ru: 'ONA' }, { eng: 'SPECIAL', ru: 'Спешл' }
];
const COUNTRIES = [
  { eng: 'JP', ru: 'Япония' }, { eng: 'CN', ru: 'Китай' }, { eng: 'KR', ru: 'Корея' }, { eng: 'US', ru: 'США' }
];

export default function CatalogPage({ onOpen, library }) {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('');
  const [format, setFormat] = useState('');
  const [country, setCountry] = useState('');
  const [excludeCN, setExcludeCN] = useState(false);
  const [sort, setSort] = useState('POPULARITY_DESC');
  
  // Стейт для ползунков
  const [yearRange, setYearRange] = useState([1990, 2026]);
  const [minScore, setMinScore] = useState(0);

  // ДЕБАУНС: Задержка для ползунков, чтобы не спамить API
  const [debouncedYearRange, setDebouncedYearRange] = useState([1990, 2026]);
  const [debouncedMinScore, setDebouncedMinScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedYearRange(yearRange);
      setDebouncedMinScore(minScore);
    }, 800); // Ждем 0.8 секунды после последнего движения ползунка
    return () => clearTimeout(timer);
  }, [yearRange, minScore]);

  // Основной запрос к API
  useEffect(() => {
    setLoading(true);
    getCatalog({ 
      genre: genre || undefined, 
      status: status || undefined,
      format: format || undefined,
      country: country || undefined,
      excludeCN,
      sort, 
      yearStart: debouncedYearRange[0], 
      yearEnd: debouncedYearRange[1], 
      minScore: debouncedMinScore,
      page 
    }).then(data => { 
      setAnimeList(data || []); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, [genre, status, format, country, excludeCN, sort, debouncedYearRange, debouncedMinScore, page]);

  const resetFilters = () => {
    setGenre(''); setStatus(''); setFormat(''); setCountry('');
    setExcludeCN(false); setSort('POPULARITY_DESC');
    setYearRange([1990, 2026]); setMinScore(0); setPage(1);
  };

  return (
    <div className="animate-fade-in pb-20 flex gap-6">
      
      {/* ЛЕВАЯ ПАНЕЛЬ С ФИЛЬТРАМИ */}
      <div className="w-72 shrink-0 bg-[#0f0f17] border border-white/5 rounded-2xl p-5 h-fit sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-purple-500" />
            <h2 className="text-lg font-bold text-white">Фильтры</h2>
          </div>
          <button onClick={resetFilters} className="text-slate-500 hover:text-white transition" title="Сбросить">
            <RefreshCcw size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Жанры</p>
            <select value={genre} onChange={e => { setGenre(e.target.value); setPage(1); }} className="w-full bg-[#15151f] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
              <option value="">Все жанры</option>
              {GENRES.map(g => <option key={g.eng} value={g.eng}>{g.ru}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Статус</p>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-full bg-[#15151f] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
              <option value="">Любой</option>
              {STATUSES.map(s => <option key={s.eng} value={s.eng}>{s.ru}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Тип</p>
            <select value={format} onChange={e => { setFormat(e.target.value); setPage(1); }} className="w-full bg-[#15151f] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
              <option value="">Любой</option>
              {FORMATS.map(f => <option key={f.eng} value={f.eng}>{f.ru}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Страна</p>
            <select value={country} onChange={e => { setCountry(e.target.value); setPage(1); }} disabled={excludeCN} className="w-full bg-[#15151f] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50">
              <option value="">Все страны</option>
              {COUNTRIES.map(c => <option key={c.eng} value={c.eng}>{c.ru}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={excludeCN} onChange={e => { setExcludeCN(e.target.checked); setPage(1); }} className="w-4 h-4 rounded bg-[#15151f] border-white/10 accent-purple-500" />
            <span className="text-sm text-slate-300">Исключить Китай</span>
          </label>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Год выхода</span>
              <span className="font-bold text-purple-400">{yearRange[0]} – {yearRange[1]}</span>
            </div>
            <input 
              type="range" min="1990" max="2026" value={yearRange[1]} 
              onChange={e => { 
                const val = parseInt(e.target.value);
                setYearRange([yearRange[0], Math.max(val, yearRange[0])]); 
              }} 
              className="w-full accent-purple-500 relative z-20 pointer-events-auto" 
            />
            <input 
              type="range" min="1990" max="2026" value={yearRange[0]} 
              onChange={e => { 
                const val = parseInt(e.target.value);
                setYearRange([Math.min(val, yearRange[1]), yearRange[1]]); 
              }} 
              className="w-full accent-purple-500 -mt-3 relative z-10 pointer-events-auto" 
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Рейтинг</span>
              <span className="font-bold text-purple-400">от {minScore}</span>
            </div>
            <input type="range" min="0" max="100" value={minScore} onChange={e => { setMinScore(parseInt(e.target.value)); }} className="w-full accent-purple-500" />
          </div>
        </div>
      </div>

      {/* СЕТКА АНИМЕ */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span> Каталог (Стр. {page})
          </h3>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="bg-[#15151f] border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
            <option value="POPULARITY_DESC">Популярные</option>
            <option value="SCORE_DESC">По рейтингу</option>
            <option value="START_DATE_DESC">Новинки</option>
          </select>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {loading ? (
            Array.from({ length: 21 }).map((_, i) => <AnimeCardSkeleton key={i} />)
          ) : animeList.length === 0 ? (
            <div className="col-span-full text-center text-slate-400 mt-20">Ничего не найдено 😢</div>
          ) : (
            animeList.map(anime => <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />)
          )}
        </div>

        {!loading && animeList.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-2 px-5 py-2 bg-[#15151f] hover:bg-[#1f1f2e] border border-white/10 rounded-lg text-white font-medium disabled:opacity-30 transition"><ChevronLeft size={18} /> Назад</button>
            <span className="text-purple-400 font-bold px-4">Страница {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="flex items-center gap-2 px-5 py-2 bg-[#15151f] hover:bg-[#1f1f2e] border border-white/10 rounded-lg text-white font-medium transition">Вперед <ChevronRight size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
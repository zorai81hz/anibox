import { Link } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#0a0a0f] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-purple-500 text-2xl">✦</span>
            <h2 className="text-xl font-black text-white">AniBox</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">Твой ультимативный проводник в мире аниме. Огромная библиотека и удобный просмотр.</p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Навигация</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-purple-400 transition">Главная</a></li>
            <li><a href="#" className="hover:text-purple-400 transition">Каталог аниме</a></li>
            <li><a href="#" className="hover:text-purple-400 transition">Расписание выхода</a></li>
            <li><a href="#" className="hover:text-purple-400 transition">Подборки</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Популярные жанры</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-purple-400 transition">Фэнтези</a></li>
            <li><a href="#" className="hover:text-purple-400 transition">Экшен</a></li>
            <li><a href="#" className="hover:text-purple-400 transition">Романтика</a></li>
            <li><a href="#" className="hover:text-purple-400 transition">Комедия</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Поддержка</h3>
          <p className="text-slate-400 text-sm mb-2">По всем вопросам</p>
          <a href="mailto:support@anibox.pro" className="text-white hover:text-purple-400 transition text-sm font-medium">support@anibox.pro</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© 2026 AniBox. Все права защищены.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">Публичная оферта</a>
          <a href="#" className="hover:text-white transition">Политика конфиденциальности</a>
        </div>
      </div>
    </footer>
  );
}
import AnimeCard from '../AnimeCard';

export default function FavoritesTab({ library, onOpen }) {
  const favorites = Object.values(library.items).filter(item => item.isFavorite);

  if (favorites.length === 0) {
    return <div className="text-center py-20 text-slate-500">Вы пока не добавили ничего в избранное ❤️</div>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 animate-fade-in">
      {favorites.map(anime => (
        <AnimeCard key={anime.id} anime={anime} onOpen={onOpen} library={library} />
      ))}
    </div>
  );
}
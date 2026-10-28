export default function AnimeCardSkeleton() {
  return (
    <div className="bg-[#0f0f17] rounded-xl overflow-hidden border border-[#1f1f2e] animate-pulse">
      <div className="aspect-[2/3] bg-[#1a1a25] w-full" />
      <div className="p-2.5">
        <div className="h-3 bg-[#1a1a25] rounded w-3/4 mb-2" />
        <div className="h-2 bg-[#1a1a25] rounded w-1/2" />
      </div>
    </div>
  );
}
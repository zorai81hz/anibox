export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center z-[999] light:bg-[#f1f5f9]">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] light:drop-shadow-none">
          AniBox
        </h1>
      </div>
      <div className="w-48 h-1.5 bg-[#1f1f2e] rounded-full overflow-hidden light:bg-[#cbd5e1]">
        <div className="w-full h-full bg-purple-600 animate-pulse origin-left"></div>
      </div>
      <p className="text-slate-500 mt-4 text-sm font-medium">ЗАГРУЗКА...</p>
    </div>
  );
}
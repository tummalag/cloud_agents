export function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4">
      <div className="relative">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-700 border-t-orange-400" />
        <span className="absolute inset-0 flex items-center justify-center text-3xl">🌤️</span>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-white">Loading Dallas weather...</p>
        <p className="mt-1 text-sm text-slate-500">Fetching live data from Open-Meteo</p>
      </div>
    </div>
  )
}

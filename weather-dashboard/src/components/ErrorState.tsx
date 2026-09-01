interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4">
      <span className="text-6xl" aria-hidden="true">⚠️</span>
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-white">Unable to load weather</h2>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        Try Again
      </button>
    </div>
  )
}

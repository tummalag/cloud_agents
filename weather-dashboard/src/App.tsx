import { useCallback, useEffect, useState } from 'react'
import type { WeatherData } from './types/weather'
import { fetchDallasWeather } from './lib/weather'
import { CurrentWeather } from './components/CurrentWeather'
import { WeatherDetails } from './components/WeatherDetails'
import { HourlyForecast } from './components/HourlyForecast'
import { DailyForecast } from './components/DailyForecast'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchDallasWeather()
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWeather()
    const interval = setInterval(loadWeather, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadWeather])

  if (loading) return <LoadingState />
  if (error || !weather) return <ErrorState message={error ?? 'Unknown error'} onRetry={loadWeather} />

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-12">
        <header className="mb-8 animate-fade-in text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-400">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-green-400" />
            Live Weather
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Dallas, Texas
          </h1>
          <p className="mt-2 text-slate-400">
            {weather.location.latitude}°N, {Math.abs(weather.location.longitude)}°W · Central Time
          </p>
        </header>

        <main className="space-y-6">
          <CurrentWeather weather={weather} />
          <WeatherDetails weather={weather} />
          <HourlyForecast weather={weather} />
          <DailyForecast weather={weather} />
        </main>

        <footer className="mt-10 text-center text-xs text-slate-600">
          Data provided by{' '}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 underline hover:text-slate-400"
          >
            Open-Meteo
          </a>
          {' · '}Auto-refreshes every 10 minutes
        </footer>
      </div>
    </div>
  )
}

export default App

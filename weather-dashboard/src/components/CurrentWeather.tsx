import type { WeatherData } from '../types/weather'
import { formatTime } from '../lib/weather'
import { getWeatherCondition } from '../lib/weatherCodes'

interface CurrentWeatherProps {
  weather: WeatherData
}

export function CurrentWeather({ weather }: CurrentWeatherProps) {
  const { current } = weather
  const condition = getWeatherCondition(current.weatherCode)
  const lastUpdated = formatTime(weather.fetchedAt, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <section className="animate-fade-in rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium uppercase tracking-widest text-orange-400">
            Current Conditions
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 md:justify-start">
            <span className="text-7xl" aria-hidden="true">
              {condition.icon}
            </span>
            <div>
              <p className="text-6xl font-bold tracking-tight text-white">
                {Math.round(current.temperature)}°
              </p>
              <p className="text-lg text-slate-300">{condition.label}</p>
            </div>
          </div>
          <p className="mt-3 text-slate-400">
            Feels like {Math.round(current.apparentTemperature)}°F
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-sm text-slate-500">Last updated</p>
          <p className="text-lg font-medium text-slate-300">{lastUpdated}</p>
          <p className="mt-1 text-xs text-slate-600">Central Time</p>
        </div>
      </div>
    </section>
  )
}

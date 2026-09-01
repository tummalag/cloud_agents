import type { WeatherData } from '../types/weather'
import { getTodayHourlyIndices, formatTime } from '../lib/weather'
import { getWeatherCondition } from '../lib/weatherCodes'

interface HourlyForecastProps {
  weather: WeatherData
}

export function HourlyForecast({ weather }: HourlyForecastProps) {
  const indices = getTodayHourlyIndices(weather.hourly.time)
  const now = new Date()

  return (
    <section className="animate-fade-in rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md" style={{ animationDelay: '0.1s' }}>
      <h2 className="mb-4 text-lg font-semibold text-white">Today's Hourly Forecast</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {indices.map((index) => {
          const time = weather.hourly.time[index]
          const hour = new Date(time)
          const isPast = hour < now
          const condition = getWeatherCondition(weather.hourly.weatherCode[index])

          return (
            <div
              key={time}
              className={`flex min-w-[72px] flex-col items-center gap-2 rounded-xl px-3 py-3 ${
                isPast ? 'opacity-50' : 'bg-white/5'
              }`}
            >
              <span className="text-xs text-slate-400">
                {formatTime(time, { hour: 'numeric' })}
              </span>
              <span className="text-2xl" aria-hidden="true">
                {condition.icon}
              </span>
              <span className="text-sm font-semibold text-white">
                {Math.round(weather.hourly.temperature[index])}°
              </span>
              <span className="text-xs text-sky-400">
                {weather.hourly.precipitationProbability[index]}%
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

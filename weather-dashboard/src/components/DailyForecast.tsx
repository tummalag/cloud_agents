import type { WeatherData } from '../types/weather'
import { formatDate } from '../lib/weather'
import { getWeatherCondition } from '../lib/weatherCodes'

interface DailyForecastProps {
  weather: WeatherData
}

export function DailyForecast({ weather }: DailyForecastProps) {
  return (
    <section className="animate-fade-in rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md" style={{ animationDelay: '0.2s' }}>
      <h2 className="mb-4 text-lg font-semibold text-white">30-Day Forecast</h2>
      <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
        {weather.daily.time.map((day, index) => {
          const condition = getWeatherCondition(weather.daily.weatherCode[index])
          const isToday = index === 0
          const dayLabel = isToday
            ? 'Today'
            : formatDate(day, { weekday: 'short', month: 'short', day: 'numeric' })

          return (
            <div
              key={day}
              className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                isToday ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex w-36 items-center gap-3">
                <span className={`text-sm font-medium ${isToday ? 'text-orange-300' : 'text-slate-300'}`}>
                  {dayLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {condition.icon}
                </span>
                <span className="hidden text-sm text-slate-400 sm:inline">
                  {condition.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {weather.daily.precipitationSum[index] > 0 && (
                  <span className="text-sky-400">
                    {weather.daily.precipitationSum[index].toFixed(2)}"
                  </span>
                )}
                <span className="font-semibold text-white">
                  {Math.round(weather.daily.temperatureMax[index])}°
                </span>
                <span className="text-slate-500">
                  {Math.round(weather.daily.temperatureMin[index])}°
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

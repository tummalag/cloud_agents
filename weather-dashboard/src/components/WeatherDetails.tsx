import type { WeatherData } from '../types/weather'
import { formatTime } from '../lib/weather'
import { getWindDirection } from '../lib/weatherCodes'
import { StatCard } from './StatCard'

interface WeatherDetailsProps {
  weather: WeatherData
}

export function WeatherDetails({ weather }: WeatherDetailsProps) {
  const { current, daily } = weather
  const windDir = getWindDirection(current.windDirection)

  return (
    <section
      className="animate-fade-in grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
      style={{ animationDelay: '0.15s' }}
    >
      <StatCard
        label="Humidity"
        value={`${current.humidity}%`}
        icon="💧"
      />
      <StatCard
        label="Wind"
        value={`${Math.round(current.windSpeed)} mph`}
        subtext={windDir}
        icon="🌬️"
      />
      <StatCard
        label="Pressure"
        value={`${Math.round(current.pressure)} hPa`}
        icon="📊"
      />
      <StatCard
        label="Precipitation"
        value={`${current.precipitation.toFixed(2)}"`}
        subtext="Current"
        icon="🌧️"
      />
      <StatCard
        label="Sunrise"
        value={formatTime(daily.sunrise[0], { hour: 'numeric', minute: '2-digit' })}
        icon="🌅"
      />
      <StatCard
        label="Sunset"
        value={formatTime(daily.sunset[0], { hour: 'numeric', minute: '2-digit' })}
        icon="🌇"
      />
    </section>
  )
}

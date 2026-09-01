import type { WeatherData } from '../types/weather'

const DALLAS = {
  name: 'Dallas',
  state: 'Texas',
  latitude: 32.7767,
  longitude: -96.797,
  timezone: 'America/Chicago',
}

const FORECAST_DAYS = 30

interface OpenMeteoResponse {
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    pressure_msl: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    sunrise: string[]
    sunset: string[]
  }
}

interface EnsembleDailyResponse {
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
}

function buildForecastUrl(): string {
  const params = new URLSearchParams({
    latitude: String(DALLAS.latitude),
    longitude: String(DALLAS.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'pressure_msl',
    ].join(','),
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'sunrise',
      'sunset',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: DALLAS.timezone,
    forecast_days: '16',
  })

  return `https://api.open-meteo.com/v1/forecast?${params}`
}

function buildEnsembleUrl(): string {
  const params = new URLSearchParams({
    latitude: String(DALLAS.latitude),
    longitude: String(DALLAS.longitude),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
    ].join(','),
    models: 'ecmwf_ifs025',
    temperature_unit: 'fahrenheit',
    precipitation_unit: 'inch',
    timezone: DALLAS.timezone,
    forecast_days: String(FORECAST_DAYS),
  })

  return `https://ensemble-api.open-meteo.com/v1/ensemble?${params}`
}

function mapResponse(
  data: OpenMeteoResponse,
  extendedDaily: EnsembleDailyResponse['daily'],
): WeatherData {
  return {
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.pressure_msl,
    },
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      precipitationProbability: data.hourly.precipitation_probability,
      weatherCode: data.hourly.weather_code,
    },
    daily: {
      time: extendedDaily.time,
      weatherCode: extendedDaily.weather_code,
      temperatureMax: extendedDaily.temperature_2m_max,
      temperatureMin: extendedDaily.temperature_2m_min,
      precipitationSum: extendedDaily.precipitation_sum,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
    },
    location: DALLAS,
    fetchedAt: new Date().toISOString(),
  }
}

export async function fetchDallasWeather(): Promise<WeatherData> {
  const [forecastResponse, ensembleResponse] = await Promise.all([
    fetch(buildForecastUrl()),
    fetch(buildEnsembleUrl()),
  ])

  if (!forecastResponse.ok) {
    throw new Error(`Weather API error: ${forecastResponse.status} ${forecastResponse.statusText}`)
  }

  if (!ensembleResponse.ok) {
    throw new Error(`Extended forecast API error: ${ensembleResponse.status} ${ensembleResponse.statusText}`)
  }

  const forecastData: OpenMeteoResponse = await forecastResponse.json()
  const ensembleData: EnsembleDailyResponse = await ensembleResponse.json()

  return mapResponse(forecastData, ensembleData.daily)
}

export function formatTime(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    timeZone: DALLAS.timezone,
    ...options,
  })
}

export function formatDate(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: DALLAS.timezone,
    ...options,
  })
}

export function isToday(isoString: string): boolean {
  const date = new Date(isoString)
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DALLAS.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date) === formatter.format(now)
}

export function getTodayHourlyIndices(hourlyTimes: string[]): number[] {
  return hourlyTimes
    .map((time, index) => (isToday(time) ? index : -1))
    .filter((index) => index !== -1)
    .slice(0, 24)
}

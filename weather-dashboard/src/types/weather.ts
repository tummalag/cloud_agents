export interface WeatherData {
  current: {
    time: string
    temperature: number
    apparentTemperature: number
    humidity: number
    precipitation: number
    weatherCode: number
    windSpeed: number
    windDirection: number
    pressure: number
  }
  hourly: {
    time: string[]
    temperature: number[]
    precipitationProbability: number[]
    weatherCode: number[]
  }
  daily: {
    time: string[]
    weatherCode: number[]
    temperatureMax: number[]
    temperatureMin: number[]
    precipitationSum: number[]
    sunrise: string[]
    sunset: string[]
  }
  location: {
    name: string
    state: string
    latitude: number
    longitude: number
    timezone: string
  }
  fetchedAt: string
}

export interface WeatherCondition {
  label: string
  icon: string
}

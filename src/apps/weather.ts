import {
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react'

export const MONTREAL = {
  name: 'Montreal',
  latitude: 45.5019,
  longitude: -73.5674,
  timezone: 'America/Toronto',
} as const

export type Weather = {
  temperature: number
  feelsLike: number
  high: number | null
  low: number | null
  condition: string
  icon: LucideIcon
}

type OpenMeteoResponse = {
  current?: {
    temperature_2m: number
    apparent_temperature: number
    weather_code: number
  }
  daily?: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

const WMO: Record<number, { label: string; icon: LucideIcon }> = {
  0: { label: 'Clear', icon: Sun },
  1: { label: 'Mainly clear', icon: CloudSun },
  2: { label: 'Partly cloudy', icon: CloudSun },
  3: { label: 'Overcast', icon: CloudFog },
  45: { label: 'Fog', icon: CloudFog },
  48: { label: 'Rime fog', icon: CloudFog },
  51: { label: 'Light drizzle', icon: CloudDrizzle },
  53: { label: 'Drizzle', icon: CloudDrizzle },
  55: { label: 'Heavy drizzle', icon: CloudDrizzle },
  61: { label: 'Light rain', icon: CloudRain },
  63: { label: 'Rain', icon: CloudRain },
  65: { label: 'Heavy rain', icon: CloudRain },
  71: { label: 'Light snow', icon: CloudSnow },
  73: { label: 'Snow', icon: CloudSnow },
  75: { label: 'Heavy snow', icon: CloudSnow },
  77: { label: 'Snow grains', icon: CloudSnow },
  80: { label: 'Rain showers', icon: CloudRain },
  81: { label: 'Rain showers', icon: CloudRain },
  82: { label: 'Violent showers', icon: CloudLightning },
  85: { label: 'Snow showers', icon: CloudSnow },
  86: { label: 'Snow showers', icon: CloudSnow },
  95: { label: 'Thunderstorm', icon: CloudLightning },
  96: { label: 'Thunderstorm, hail', icon: CloudLightning },
  99: { label: 'Thunderstorm, hail', icon: CloudLightning },
}

const UNKNOWN = { label: 'Unknown', icon: CloudFog }

const describe = (code: number) => WMO[code] ?? UNKNOWN

export const parseWeather = (payload: OpenMeteoResponse): Weather | null => {
  const current = payload.current
  if (!current) return null

  const { label, icon } = describe(current.weather_code)
  const high = payload.daily?.temperature_2m_max?.[0]
  const low = payload.daily?.temperature_2m_min?.[0]

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    high: high === undefined ? null : Math.round(high),
    low: low === undefined ? null : Math.round(low),
    condition: label,
    icon,
  }
}

export const fetchWeather = async (signal: AbortSignal): Promise<Weather | null> => {
  const params = new URLSearchParams({
    latitude: String(MONTREAL.latitude),
    longitude: String(MONTREAL.longitude),
    current: 'temperature_2m,apparent_temperature,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: MONTREAL.timezone,
    forecast_days: '1',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
  if (!response.ok) throw new Error(`open-meteo responded ${response.status}`)

  return parseWeather(await response.json())
}

import { useEffect, useState } from 'react'

import { fetchWeather, type Weather } from '../../apps/weather'

type WeatherState = {
  weather: Weather | null
  failed: boolean
}

export function useWeather(refreshMs: number): WeatherState {
  const [state, setState] = useState<WeatherState>({ weather: null, failed: false })

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        setState({ weather: await fetchWeather(controller.signal), failed: false })
      } catch {
        if (controller.signal.aborted) return
        setState({ weather: null, failed: true })
      }
    }

    void load()
    const timer = setInterval(load, refreshMs)

    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [refreshMs])

  return state
}

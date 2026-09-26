import { useEffect, useState } from 'react'

import { MONTREAL } from '../../apps/weather'
import { useWeather } from './use-weather'

const REFRESH_MS = 15 * 60 * 1000

export function HeaderWeather() {
  const { weather } = useWeather(REFRESH_MS)
  const Icon = weather?.icon

  return (
    <span
      className="flex items-center gap-1.5"
      title={weather ? `${weather.condition} in ${MONTREAL.name}` : `Weather in ${MONTREAL.name}`}
    >
      {Icon ? (
        <>
          <Icon size={13} strokeWidth={2} className="text-ink-300" />
          <span className="text-[11px] text-ink-100 tabular-nums">{weather.temperature}°</span>
        </>
      ) : (
        <span className="text-[11px] text-ink-500">--°</span>
      )}
      <span className="text-[11px] text-ink-300">{MONTREAL.name}</span>
    </span>
  )
}

const formatter = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export function HeaderDate() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <time dateTime={now.toISOString().slice(0, 10)} className="text-[11px] text-ink-100">
      {formatter.format(now)}
    </time>
  )
}

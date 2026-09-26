import { MONTREAL } from '../../apps/weather'
import { useWeather } from './use-weather'

const REFRESH_MS = 15 * 60 * 1000

export function WeatherWidget() {
  const { weather, failed } = useWeather(REFRESH_MS)

  return (
    <section
      aria-label={`Weather in ${MONTREAL.name}`}
      className="glass w-56 rounded-panel px-4 py-3"
    >
      <header className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[11px] font-medium tracking-widest text-ink-300 uppercase">
          {MONTREAL.name}
        </h2>
        {weather && <span className="text-[10px] text-ink-500">live</span>}
      </header>

      {weather ? (
        <>
          <div className="flex items-center gap-3">
            <weather.icon size={30} strokeWidth={1.75} className="shrink-0 text-ink-100" />
            <span className="text-3xl leading-none font-light tracking-tight text-ink-100 tabular-nums">
              {weather.temperature}°
            </span>
          </div>
          <p className="mt-2 text-[11px] text-ink-300">{weather.condition}</p>
          <p className="mt-0.5 text-[10px] text-ink-500 tabular-nums">
            Feels {weather.feelsLike}°
            {weather.high !== null &&
              weather.low !== null &&
              ` · ${weather.low}° / ${weather.high}°`}
          </p>
        </>
      ) : (
        <p className="py-3 text-[11px] text-ink-500">
          {failed ? 'Weather unavailable' : 'Loading weather…'}
        </p>
      )}
    </section>
  )
}

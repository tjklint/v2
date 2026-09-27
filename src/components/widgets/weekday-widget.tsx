import { useEffect, useMemo, useState } from 'react'

import { formatDay, weekdayTotals, type WeekdayTotal } from '../../apps/contributions'
import { useContributions } from './use-contributions'
import { PendingPanel, WidgetPanel } from './widget-panel'

const LABEL = 'Contributions by weekday'

const SIZE = 120
const CENTER = SIZE / 2
const OUTER = 42
const INNER = 22
const STROKE = 8
const STUB = 4
const STEP = (Math.PI * 2) / 7

const point = (index: number, radius: number) => {
  const angle = -Math.PI / 2 + index * STEP
  return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius }
}

const number = (value: number) => value.toLocaleString('en-CA')

const percent = (day: WeekdayTotal) => `${Math.round(day.share * 100)}%`

export function WeekdayWidget() {
  const { data, failed } = useContributions()
  const days = useMemo(() => (data ? weekdayTotals(data) : []), [data])
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!data) {
    return <PendingPanel label={LABEL} title="By weekday" failed={failed} />
  }

  const total = days.reduce((sum, day) => sum + day.total, 0)
  const busiest = days.reduce((top, day) => (day.total > top.total ? day : top), days[0])
  const quietest = days.reduce((low, day) => (day.total < low.total ? day : low), days[0])
  const even = busiest.total === quietest.total

  const tone = (day: WeekdayTotal) => {
    if (total === 0) return 'stroke-white/15'
    if (even || day.total === busiest.total) return 'stroke-accent'
    if (day.total === quietest.total) return 'stroke-white/20'
    return 'stroke-white/40'
  }

  const reach = (day: WeekdayTotal) => {
    if (day.total === 0) return 0
    const ratio = busiest.total === 0 ? 0 : day.total / busiest.total
    return INNER + STUB + ratio * (OUTER - INNER - STUB)
  }

  const summary =
    total === 0
      ? 'Contributions by weekday, arranged like a clock face. Nothing recorded.'
      : `Contributions by weekday, drawn as a clock face with Monday at the top, each spoke as long as that day measures against the busiest one. ${days
          .map((day) => `${day.label} ${number(day.total)}`)
          .join(', ')}. Busiest day ${busiest.label}, quietest day ${quietest.label}.`

  return (
    <WidgetPanel label={LABEL} title="By weekday" meta={`since ${formatDay(data.from)}`}>
      <div className="flex shrink-0 items-center gap-3">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={summary}
          className="h-28 w-28 shrink-0"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={(INNER + OUTER) / 2}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.18}
            strokeWidth={0.6}
            strokeDasharray="2 4"
          />
          {days.map((day, index) => {
            const head = point(index, reach(day))
            const anchor = point(index, OUTER + 9)

            return (
              <g key={day.label}>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={head.x}
                  y2={head.y}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  className={`${tone(day)} transition-opacity duration-500 motion-reduce:transition-none ${
                    shown ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 45}ms` }}
                />
                <text
                  x={anchor.x}
                  y={anchor.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-ink-500 text-[7px] uppercase"
                >
                  {day.label.slice(0, 2)}
                </text>
              </g>
            )
          })}
        </svg>

        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-1">
          {days.map((day) => (
            <div key={day.label} className="flex items-baseline justify-between gap-1">
              <dt className="text-[10px] text-ink-500">{day.short}</dt>
              <dd className="text-[10px] text-ink-100 tabular-nums">{number(day.total)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-2.5 shrink-0 border-t border-white/8 pt-2 text-[10px] leading-4 text-ink-500">
        {total === 0
          ? 'No contributions in the recorded range.'
          : `Busiest ${busiest.label} ${percent(busiest)} · quietest ${quietest.label} ${percent(quietest)}.`}
      </p>
    </WidgetPanel>
  )
}

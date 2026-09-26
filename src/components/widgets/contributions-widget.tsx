import { useMemo } from 'react'

import type { Level, Week } from '../../apps/contributions'
import { useContributions } from './use-contributions'

const GAP = 1

const FILL: Record<Level, string> = {
  NONE: 'bg-white/8',
  FIRST_QUARTILE: 'bg-emerald-900',
  SECOND_QUARTILE: 'bg-emerald-700',
  THIRD_QUARTILE: 'bg-emerald-500',
  FOURTH_QUARTILE: 'bg-emerald-300',
}

const LEGEND: Level[] = [
  'NONE',
  'FIRST_QUARTILE',
  'SECOND_QUARTILE',
  'THIRD_QUARTILE',
  'FOURTH_QUARTILE',
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Year = { year: number; weeks: Week[]; count: number }

const groupByYear = (weeks: Week[]): Year[] => {
  const years: Year[] = []
  for (const week of weeks) {
    const year = Number(week.firstDay.slice(0, 4))
    const last = years.at(-1)
    if (last && last.year === year) last.weeks.push(week)
    else years.push({ year, weeks: [week], count: 0 })
  }
  for (const year of years) {
    year.count = year.weeks.flatMap((week) => week.days).reduce((sum, day) => sum + day.count, 0)
  }
  return years
}

export function ContributionsWidget() {
  const { data, failed } = useContributions()
  const years = useMemo(() => (data ? groupByYear(data.weeks) : []), [data])

  if (!data) {
    return (
      <section
        aria-label="GitHub contributions"
        className="glass flex w-full flex-col rounded-panel px-4 py-3"
      >
        <h2 className="text-[11px] font-medium tracking-widest text-ink-300 uppercase">
          Contributions
        </h2>
        <p className="mt-2 text-[11px] text-ink-500">{failed ? 'Unavailable' : 'Loading…'}</p>
      </section>
    )
  }

  return (
    <section
      aria-label="GitHub contributions"
      className="glass flex w-full flex-col rounded-panel px-4 py-3"
    >
      <header className="mb-3 flex shrink-0 items-baseline justify-between gap-4">
        <h2 className="text-[11px] font-medium tracking-widest text-ink-300 uppercase">
          Contributions
        </h2>
        <p className="text-[11px] text-ink-500 tabular-nums">
          <span className="text-ink-100">{data.totalContributions.toLocaleString('en-CA')}</span>{' '}
          over 3 years
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {years.map((year, index) => (
          <div key={year.year} className="flex gap-1.5">
            {index === 0 ? (
              <div className="flex w-[22px] shrink-0 flex-col justify-between py-px text-[8px] leading-none text-ink-500">
                {[1, 3, 5].map((day) => (
                  <span key={day}>{WEEKDAYS[day]}</span>
                ))}
              </div>
            ) : (
              <div className="w-[22px] shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between text-[9px] text-ink-500">
                <span className="tabular-nums text-ink-300">{year.year}</span>
                <span className="tabular-nums">{year.count.toLocaleString('en-CA')}</span>
              </div>

              <div
                className="flex"
                role="img"
                aria-label={`${year.count} contributions on GitHub in ${year.year}`}
              >
                {year.weeks.map((week) => (
                  <div
                    key={week.firstDay}
                    className="flex flex-col"
                    style={{ gap: GAP, width: 'calc((100% - 52px) / 53)' }}
                  >
                    {week.days.map((day) => (
                      <span
                        key={day.date}
                        title={`${day.count} on ${day.date}`}
                        className={`aspect-square w-full rounded-[1px] ${FILL[day.level]}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-3 flex shrink-0 items-center justify-end gap-1 text-[9px] text-ink-500">
        <span>Less</span>
        {LEGEND.map((level) => (
          <span
            key={level}
            title={level === 'NONE' ? 'none' : level.replace('_QUARTILE', ' ').toLowerCase().trim()}
            className={`h-2.5 w-2.5 rounded-[2px] ${FILL[level]}`}
          />
        ))}
        <span>More</span>
      </footer>
    </section>
  )
}

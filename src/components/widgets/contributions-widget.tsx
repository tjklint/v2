import type { Level } from '../../apps/contributions'
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

const title = {
  section: 'text-[11px] font-medium tracking-widest text-ink-300 uppercase',
}

export function ContributionsWidget() {
  const { data, failed } = useContributions()

  if (!data) {
    return (
      <section aria-label="GitHub contributions" className="glass w-full rounded-panel px-4 py-3">
        <h2 className={title.section}>Contributions</h2>
        <p className="mt-2 text-[11px] text-ink-500">{failed ? 'Unavailable' : 'Loading…'}</p>
      </section>
    )
  }

  return (
    <section aria-label="GitHub contributions" className="glass w-full rounded-panel px-4 py-3">
      <header className="mb-2.5 flex items-baseline justify-between gap-4">
        <h2 className={title.section}>Contributions</h2>
        <p className="text-[11px] text-ink-500 tabular-nums">
          <span className="text-ink-100">{data.totalContributions.toLocaleString('en-CA')}</span> in
          2 years
        </p>
      </header>

      <div className="flex gap-1.5">
        <div className="flex shrink-0 flex-col justify-between py-px text-[8px] leading-none text-ink-500">
          {[1, 3, 5].map((day) => (
            <span key={day}>{WEEKDAYS[day]}</span>
          ))}
        </div>

        <div
          className="flex flex-1"
          role="img"
          aria-label={`${data.totalContributions} contributions on GitHub over the last two years`}
        >
          {data.weeks.map((week) => (
            <div key={week.firstDay} className="flex min-w-0 flex-1 flex-col" style={{ gap: GAP }}>
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

      <footer className="mt-2.5 flex items-center justify-end gap-1 text-[9px] text-ink-500">
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

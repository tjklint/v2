import { useMemo } from 'react'

import { dateAt, formatDay, streakStats, type StreakStatus } from '../../apps/contributions'
import { useContributions } from './use-contributions'
import { PendingPanel, WidgetPanel } from './widget-panel'

const LABEL = 'Contribution streak'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

const boundary = (status: StreakStatus, today: number, lastDate: string, gap: number) => {
  if (status === 'live') return 'Consecutive days with at least one contribution, ending today.'
  if (status === 'pending')
    return `${formatDay(dateAt(today))} is not over yet, so the streak still stands through ${formatDay(lastDate)}.`
  if (status === 'ahead')
    return `GitHub counts in UTC, so its last day is ahead of your ${formatDay(dateAt(today))}. Counting through ${formatDay(lastDate)}.`
  return `Data stops at ${formatDay(lastDate)}, ${plural(gap, 'day')} ago. This is the last known streak.`
}

export function StreakWidget() {
  const { data, failed } = useContributions()
  const stats = useMemo(() => (data ? streakStats(data) : null), [data])
  const lastDate = stats?.lastDate ?? null
  const today = stats?.today ?? 0

  if (!data || !stats || !lastDate) {
    return <PendingPanel label={LABEL} title="Streak" failed={failed} />
  }

  const quiet = stats.contributions === 0
  const note = quiet
    ? `Nothing recorded between ${formatDay(data.from)} and ${formatDay(data.to)}.`
    : boundary(stats.status, today, lastDate, stats.gap)

  return (
    <WidgetPanel label={LABEL} title="Streak" meta={`through ${formatDay(lastDate)}`}>
      <div className="flex shrink-0 items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[30px] leading-none font-medium text-ink-100 tabular-nums">
            {stats.current}
          </p>
          <p className="mt-1 text-[10px] text-ink-300">
            {stats.current === 1 ? 'day' : 'days'} in the current streak
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[18px] leading-none text-ink-300 tabular-nums">{stats.longest}</p>
          <p className="mt-1 text-[10px] text-ink-500">longest streak</p>
        </div>
      </div>

      <div className="mt-3 shrink-0 border-t border-white/8 pt-2">
        <p className="text-[10px] leading-4 text-ink-300">{note}</p>
        {!quiet && stats.lastActive && (
          <p className="mt-1 text-[10px] leading-4 text-ink-500">
            Last contribution {formatDay(stats.lastActive)}.
          </p>
        )}
      </div>
    </WidgetPanel>
  )
}

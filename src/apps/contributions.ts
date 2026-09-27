export type Level =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE'

export type ContributionDay = {
  date: string
  count: number
  level: Level
}

export type Week = {
  firstDay: string
  days: ContributionDay[]
}

export type Contributions = {
  totalContributions: number
  from: string
  to: string
  weeks: Week[]
}

const LEVELS: Level[] = [
  'NONE',
  'FIRST_QUARTILE',
  'SECOND_QUARTILE',
  'THIRD_QUARTILE',
  'FOURTH_QUARTILE',
]

const isLevel = (value: unknown): value is Level => LEVELS.includes(value as Level)

export const parseContributions = (payload: unknown): Contributions | null => {
  const data = payload as Partial<Contributions> | null
  if (!data?.weeks?.length || typeof data.totalContributions !== 'number') return null

  const weeks = data.weeks
    .filter((week) => week?.firstDay && Array.isArray(week.days))
    .map((week) => ({
      firstDay: week.firstDay,
      days: week.days
        .filter((day) => day && typeof day.count === 'number' && isLevel(day.level))
        .map((day) => ({ date: day.date, count: day.count, level: day.level })),
    }))
    .filter((week) => week.days.length > 0)

  if (weeks.length === 0) return null

  return {
    totalContributions: data.totalContributions,
    from: data.from ?? weeks[0].firstDay,
    to: data.to ?? weeks[weeks.length - 1].days[weeks[weeks.length - 1].days.length - 1].date,
    weeks,
  }
}

export const fetchContributions = async (signal?: AbortSignal): Promise<Contributions | null> => {
  const response = await fetch(`${import.meta.env.BASE_URL}contributions.json`, { signal })
  if (!response.ok) return null
  return parseContributions(await response.json())
}

export const DAY_MS = 86_400_000

const MAX_DAYS = 4000

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

export const WEEKDAYS = [
  { label: 'Monday', short: 'Mon' },
  { label: 'Tuesday', short: 'Tue' },
  { label: 'Wednesday', short: 'Wed' },
  { label: 'Thursday', short: 'Thu' },
  { label: 'Friday', short: 'Fri' },
  { label: 'Saturday', short: 'Sat' },
  { label: 'Sunday', short: 'Sun' },
] as const

export const dayIndex = (date: string): number | null => {
  const match = ISO_DAY.exec(date)
  if (!match) return null
  const [, year, month, day] = match
  return Date.UTC(Number(year), Number(month) - 1, Number(day)) / DAY_MS
}

export const dateAt = (index: number): string => new Date(index * DAY_MS).toISOString().slice(0, 10)

export const localTodayIndex = (now: Date = new Date()): number =>
  Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY_MS

export const formatDay = (date: string): string =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })

const countsByDay = (data: Contributions): Map<number, number> => {
  const counts = new Map<number, number>()

  for (const week of data.weeks) {
    for (const day of week.days) {
      const index = dayIndex(day.date)
      if (index === null || !Number.isFinite(day.count)) continue
      counts.set(index, Math.max(counts.get(index) ?? 0, day.count))
    }
  }

  return counts
}

export type DayTotal = { index: number; date: string; count: number }

export const dailyTotals = (data: Contributions): DayTotal[] => {
  const counts = countsByDay(data)
  const indices = [...counts.keys()].sort((a, b) => a - b)
  const start = indices[0]
  if (start === undefined) return []

  const end = Math.min(indices[indices.length - 1], start + MAX_DAYS)
  const days: DayTotal[] = []

  for (let index = start; index <= end; index += 1) {
    days.push({ index, date: dateAt(index), count: counts.get(index) ?? 0 })
  }

  return days
}

export type StreakStatus = 'live' | 'pending' | 'ahead' | 'stale' | 'empty'

export type StreakStats = {
  current: number
  longest: number
  contributions: number
  activeDays: number
  lastActive: string | null
  lastDate: string | null
  today: number
  gap: number
  status: StreakStatus
}

export const streakStats = (data: Contributions, now: Date = new Date()): StreakStats => {
  const today = localTodayIndex(now)
  const days = dailyTotals(data)
  const empty: StreakStats = {
    current: 0,
    longest: 0,
    contributions: 0,
    activeDays: 0,
    lastActive: null,
    lastDate: null,
    today,
    gap: 0,
    status: 'empty',
  }

  if (days.length === 0) return empty

  let longest = 0
  let run = 0
  let contributions = 0
  let activeDays = 0
  let lastActive: string | null = null

  for (const day of days) {
    if (day.count > 0) {
      run += 1
      longest = Math.max(longest, run)
      activeDays += 1
      lastActive = day.date
    } else {
      run = 0
    }
    contributions += day.count
  }

  let current = 0
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count <= 0) break
    current += 1
  }

  const lastDate = days[days.length - 1].date
  const gap = today - days[days.length - 1].index
  const status: StreakStatus =
    gap === 0 ? 'live' : gap === 1 ? 'pending' : gap < 0 ? 'ahead' : 'stale'

  return { current, longest, contributions, activeDays, lastActive, lastDate, today, gap, status }
}

export type WeekdayTotal = { label: string; short: string; total: number; share: number }

export const weekdayTotals = (data: Contributions): WeekdayTotal[] => {
  const totals = [0, 0, 0, 0, 0, 0, 0]

  for (const week of data.weeks) {
    for (const day of week.days) {
      const index = dayIndex(day.date)
      if (index === null || !Number.isFinite(day.count)) continue
      totals[(new Date(index * DAY_MS).getUTCDay() + 6) % 7] += Math.max(0, day.count)
    }
  }

  const sum = totals.reduce((total, count) => total + count, 0)

  return WEEKDAYS.map((weekday, index) => ({
    ...weekday,
    total: totals[index],
    share: sum === 0 ? 0 : totals[index] / sum,
  }))
}

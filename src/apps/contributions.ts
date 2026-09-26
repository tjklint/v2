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

export type Contributions = {
  totalContributions: number
  from: string
  to: string
  weeks: { firstDay: string; days: ContributionDay[] }[]
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

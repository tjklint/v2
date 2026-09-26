const LOGIN = process.env.CONTRIBUTIONS_LOGIN ?? 'tjklint'
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
const OUTPUT = new URL('../public/contributions.json', import.meta.url)
const YEARS = 3

const QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          firstDay
          contributionDays { date contributionCount contributionLevel }
        }
      }
    }
  }
}`

const window = (from: Date, to: Date) => ({
  from: `${from.toISOString().slice(0, 10)}T00:00:00Z`,
  to: `${to.toISOString().slice(0, 10)}T23:59:59Z`,
})

const shiftYears = (date: Date, years: number) => {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + years)
  return next
}

const fetchYear = async (from: Date, to: Date) => {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'tjos-build',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: LOGIN, ...window(from, to) },
    }),
  })

  const payload = await response.json()
  const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar

  if (!calendar) throw new Error(JSON.stringify(payload?.errors ?? payload))

  return calendar
}

const main = async () => {
  if (!TOKEN) {
    console.log('no GITHUB_TOKEN, skipping contributions')
    return
  }

  const to = new Date()

  const windows = Array.from({ length: YEARS }, (_, i) => {
    const end = shiftYears(to, -(YEARS - 1 - i))
    const start = shiftYears(to, -(YEARS - i))
    start.setDate(start.getDate() + 1)
    return [start, end] as const
  })

  const calendars = await Promise.all(windows.map(([from, end]) => fetchYear(from, end)))

  const byWeek = new Map<string, Map<string, { date: string; count: number; level: string }>>()

  for (const calendar of calendars) {
    for (const week of calendar.weeks) {
      let days = byWeek.get(week.firstDay)
      if (!days) byWeek.set(week.firstDay, (days = new Map()))
      for (const day of week.contributionDays) {
        days.set(day.date, {
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel,
        })
      }
    }
  }

  const weeks = [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([firstDay, days]) => ({
      firstDay,
      days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)),
    }))

  const all = weeks.flatMap((week) => week.days)

  const payload = {
    totalContributions: all.reduce((sum, day) => sum + day.count, 0),
    from: all[0]?.date,
    to: all.at(-1)?.date,
    generatedAt: new Date().toISOString(),
    weeks,
  }

  await Bun.write(OUTPUT, `${JSON.stringify(payload)}\n`)
  console.log(
    `wrote ${weeks.length} weeks over ${YEARS} years, ${payload.totalContributions} contributions`,
  )
}

try {
  await main()
} catch (error) {
  console.log(`contributions fetch failed, continuing without it: ${error}`)
}

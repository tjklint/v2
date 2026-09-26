const LOGIN = process.env.CONTRIBUTIONS_LOGIN ?? 'tjklint'
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
const OUTPUT = new URL('../public/contributions.json', import.meta.url)

const QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
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
  const from = new Date(to)
  from.setFullYear(from.getFullYear() - 2)

  const middle = new Date(from)
  middle.setFullYear(middle.getFullYear() + 1)
  middle.setDate(middle.getDate() - 1)

  const [older, newer] = await Promise.all([fetchYear(from, middle), fetchYear(middle, to)])

  const weeks = [...older.weeks, ...newer.weeks].map((week) => ({
    firstDay: week.firstDay,
    days: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: day.contributionLevel,
    })),
  }))

  const payload = {
    totalContributions: older.totalContributions + newer.totalContributions,
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    weeks,
  }

  await Bun.write(OUTPUT, `${JSON.stringify(payload)}\n`)
  console.log(`wrote ${weeks.length} weeks, ${payload.totalContributions} contributions`)
}

try {
  await main()
} catch (error) {
  console.log(`contributions fetch failed, continuing without it: ${error}`)
}

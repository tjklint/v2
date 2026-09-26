export type Talk = {
  title: string
  kind?: string
  event: string
  date: string
  website?: string
  slides?: string
  video?: string
  repo?: string
}

export const TALKS: Talk[] = [
  {
    title: 'Rate Limiting: The Art of Saying No',
    event: 'MTL_Code',
    date: '2026-04-16',
    website: 'https://botpress.com/events',
    video: 'https://www.youtube.com/watch?v=ohf7ljqecVc',
  },
  {
    title: 'Changelogger: Building Enterprise-Grade AI Agents',
    kind: 'Workshop',
    event: 'CUCAI 2026',
    date: '2026-03-07',
    website:
      'https://cucai.ca/#:~:text=Learn%20More-,CUCAI%202026%20Speakers,-Meet%20the%20experts',
    repo: 'https://github.com/tjklint/cucai2026',
  },
  {
    title: 'The Myths & Insights of your (early) tech career',
    event: 'CUSEC 2026',
    date: '2026-01-10',
    website: 'https://2026.cusec.net',
    video: 'https://www.youtube.com/watch?v=zaQiIxiJw-g&t=346s',
  },
]

export const MORE_TALKS = 20

export const monthYear = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })

export type Site = {
  title: string
  url: string
  description: string
  featured: boolean
}

export const SITES: Site[] = [
  {
    title: 'Portfolio',
    url: 'https://tjklint.github.io/',
    description: 'Personal technical portfolio, built with React, TypeScript and SASS.',
    featured: true,
  },
  {
    title: 'notes',
    url: 'https://notes.tjklint.com/',
    description: 'Notes and writing.',
    featured: false,
  },
  {
    title: 'CanConf',
    url: 'https://tjklint.github.io/CanConf/',
    description: 'Canadian tech conferences, hackathons and events worth your time.',
    featured: true,
  },
  {
    title: 'techconf.ca',
    url: 'https://techconf.ca',
    description: 'Community-curated list of tech conferences around Canada.',
    featured: false,
  },
  {
    title: 'Capital Coach',
    url: 'https://tjklint.github.io/CapitalCoach/',
    description: 'Financial management for simple, effective planning.',
    featured: false,
  },
  {
    title: 'todork',
    url: 'https://tjklint.github.io/todork/',
    description: 'Todo app built with React and TypeScript.',
    featured: false,
  },
  {
    title: 'CUCAI 2026',
    url: 'https://tjklint.github.io/',
    description: 'CUCAI 2026 workshop site.',
    featured: false,
  },
  {
    title: 'Bell Geekfest 2023',
    url: 'https://tjklint.github.io/BellGeekfest2023/',
    description: 'Local tools for deleting your data from big companies. Finalist project.',
    featured: false,
  },
]

export const hostOf = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

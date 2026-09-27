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
    title: 'CanConf',
    url: 'https://tjklint.github.io/CanConf/',
    description: 'Canadian tech conferences, hackathons and events worth your time.',
    featured: true,
  },
  {
    title: 'todork',
    url: 'https://tjklint.github.io/todork/',
    description: 'Scans a codebase for TODO, FIXME and HACK comments. Written in Rust.',
    featured: false,
  },
  {
    title: 'CUSEC 2027',
    url: 'https://2027.cusec.net',
    description: "Canada's longest-running student-run software engineering conference.",
    featured: false,
  },
  {
    title: 'Planned',
    url: 'https://planned.com',
    description: 'AI operating system for events.',
    featured: false,
  },
  {
    title: 'notes',
    url: 'https://notes.tjklint.com/',
    description: 'Notes and writing.',
    featured: false,
  },
]

export const hostOf = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

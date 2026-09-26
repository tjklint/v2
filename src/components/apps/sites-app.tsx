import { ArrowUpRight, Star } from 'lucide-react'
import { useState } from 'react'

import { SITES, hostOf } from '../../apps/sites'

export function SitesApp() {
  const [active, setActive] = useState(SITES[0].url)
  const current = SITES.find((site) => site.url === active) ?? SITES[0]
  const featured = SITES.filter((site) => site.featured)
  const rest = SITES.filter((site) => !site.featured)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
        </span>
        <span className="flex-1 truncate rounded-md bg-white/6 px-2.5 py-1 font-mono text-[11px] text-ink-300">
          {current.url}
        </span>
        <button
          type="button"
          aria-label={`Open ${current.title} in a new tab`}
          onClick={() => window.open(current.url, '_blank', 'noopener,noreferrer')}
          className="rounded-md p-1 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
        >
          <ArrowUpRight size={14} strokeWidth={2.25} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-[11px] font-medium tracking-widest text-ink-500 uppercase">
          Bookmarks
        </p>
        <div className="grid grid-cols-2 gap-2">
          {featured.map((site) => (
            <button
              key={site.url}
              type="button"
              onClick={() => setActive(site.url)}
              className={`group rounded-xl border p-3 text-left transition-colors ${
                active === site.url
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/8 bg-white/4 hover:bg-white/8'
              }`}
            >
              <span className="mb-1.5 flex items-center gap-1.5">
                {site.featured && <Star size={11} strokeWidth={2.5} className="text-ink-300" />}
                <span className="text-[13px] font-medium text-ink-100">{site.title}</span>
              </span>
              <span className="block text-[11px] leading-relaxed text-ink-500">
                {site.description}
              </span>
              <span className="mt-2 block truncate font-mono text-[10px] text-ink-500 opacity-0 transition-opacity group-hover:opacity-100">
                {hostOf(site.url)}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-5 mb-3 text-[11px] font-medium tracking-widest text-ink-500 uppercase">
          All sites
        </p>
        <ul className="divide-y divide-white/6">
          {rest.map((site) => (
            <li key={site.url}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActive(site.url)}
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-white/4"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-ink-100">{site.title}</span>
                  <span className="block truncate text-[11px] text-ink-500">
                    {site.description}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-ink-500">
                  {hostOf(site.url)}
                </span>
                <ArrowUpRight
                  size={13}
                  strokeWidth={2.25}
                  className="shrink-0 text-ink-500 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { ArrowLeft, ArrowRight, House, RotateCw, Star } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'

import { SITES, hostOf } from '../../apps/sites'

const ZOOM = 0.7

const toUrl = (input: string) => (/^https?:\/\//i.test(input) ? input : `https://${input}`)

export function SitesApp() {
  const [trail, setTrail] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const [draft, setDraft] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [resolved, setResolved] = useState<string | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)

  const current = cursor >= 0 ? trail[cursor] : null
  const featured = SITES.filter((site) => site.featured)
  const rest = SITES.filter((site) => !site.featured)

  const go = (url: string) => {
    const next = [...trail.slice(0, cursor + 1), url]
    setTrail(next)
    setCursor(next.length - 1)
    setDraft(url)
    setResolved(null)
  }

  const step = (delta: number) => {
    const target = cursor + delta
    if (target < -1 || target >= trail.length) return
    setCursor(target)
    setDraft(trail[target])
    setResolved(null)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (draft.trim()) go(toUrl(draft.trim()))
  }

  const syncLocation = () => {
    try {
      const href = frame.current?.contentWindow?.location.href
      if (href && href !== current) setResolved(href)
    } catch {
      setResolved(null)
    }
  }

  const navButton =
    'rounded-md p-1 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 disabled:opacity-30 disabled:hover:bg-transparent focus-ring'

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/8 px-3 py-2">
        <button
          type="button"
          aria-label="Back"
          disabled={cursor < 0}
          onClick={() => step(-1)}
          className={navButton}
        >
          <ArrowLeft size={14} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          aria-label="Forward"
          disabled={cursor >= trail.length - 1}
          onClick={() => step(1)}
          className={navButton}
        >
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          aria-label="Reload"
          disabled={!current}
          onClick={() => {
            setResolved(null)
            setReloadKey((key) => key + 1)
          }}
          className={navButton}
        >
          <RotateCw size={14} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          aria-label="Home"
          onClick={() => {
            setCursor(-1)
            setDraft('')
            setResolved(null)
          }}
          className={navButton}
        >
          <House size={14} strokeWidth={2.25} />
        </button>

        <form onSubmit={submit} className="min-w-0 flex-1 px-1">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search or enter address"
            aria-label="Address"
            spellCheck={false}
            className="w-full truncate rounded-md bg-white/6 px-2.5 py-1 font-mono text-[11px] text-ink-100 placeholder:text-ink-500 focus-ring"
          />
        </form>

        {current && (
          <span className="shrink-0 font-mono text-[10px] text-ink-500">
            {hostOf(resolved ?? current)}
          </span>
        )}
      </div>

      {current ? (
        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <iframe
            key={`${current}-${reloadKey}`}
            ref={frame}
            src={current}
            title={resolved ?? current}
            onLoad={syncLocation}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
            style={{
              width: `${100 / ZOOM}%`,
              height: `${100 / ZOOM}%`,
              transform: `scale(${ZOOM})`,
              transformOrigin: 'top left',
            }}
            className="absolute top-0 left-0 border-0 bg-white"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-[11px] font-medium tracking-widest text-ink-500 uppercase">
            Bookmarks
          </p>
          <div className="grid grid-cols-2 gap-2">
            {featured.map((site) => (
              <button
                key={site.url}
                type="button"
                onClick={() => go(site.url)}
                className="group rounded-xl border border-white/8 bg-white/4 p-3 text-left transition-colors hover:bg-white/8"
              >
                <span className="mb-1.5 flex items-center gap-1.5">
                  <Star size={11} strokeWidth={2.5} className="text-ink-300" />
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
                <button
                  type="button"
                  onClick={() => go(site.url)}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-white/4"
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
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

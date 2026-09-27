import { Copy, Play, Video } from 'lucide-react'
import { useCallback, useState } from 'react'

import { MORE_TALKS, TALKS, monthYear, type Talk } from '../../apps/talks'

const FEATURED = TALKS.find((talk) => talk.video) ?? TALKS[0]
const REST = TALKS.filter((talk) => talk !== FEATURED)

const embedUrl = (video: string) => {
  const url = new URL(video)
  const id = url.hostname.endsWith('youtu.be')
    ? url.pathname.slice(1)
    : (url.searchParams.get('v') ?? url.pathname.split('/').pop())
  return `https://www.youtube-nocookie.com/embed/${id}`
}

const shortUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

const writeClipboard = async (value: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !('clipboard' in navigator)) return false

  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

const section = 'text-[11px] font-medium tracking-widest text-ink-300 uppercase'

const control =
  'focus-ring shrink-0 rounded-[3px] p-0.5 text-ink-500 transition-colors hover:bg-white/10 hover:text-ink-100'

type MetaProps = { talk: Talk; copy: (url: string) => void }

function Meta({ talk, copy }: MetaProps) {
  const video = talk.video

  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-ink-500">
      <span>{talk.event}</span>
      <span aria-hidden>·</span>
      <span className="tabular-nums">{monthYear(talk.date)}</span>
      {talk.kind && (
        <>
          <span aria-hidden>·</span>
          <span className="rounded bg-white/8 px-1.5 py-px text-ink-300">{talk.kind}</span>
        </>
      )}
      {video && (
        <button
          type="button"
          onClick={() => copy(video)}
          aria-label={`Copy the video link for ${talk.title}`}
          title="Copy the video link"
          className={control}
        >
          <Video size={11} strokeWidth={2.25} />
        </button>
      )}
    </p>
  )
}

export function SpeakingWidget() {
  const [copied, setCopied] = useState<'idle' | 'done' | 'blocked'>('idle')

  const copy = useCallback((url: string) => {
    setCopied('idle')
    writeClipboard(url).then((ok) => setCopied(ok ? 'done' : 'blocked'))
  }, [])

  return (
    <section
      aria-label="Speaking"
      className="glass flex h-full w-full flex-col rounded-panel px-4 py-3"
    >
      <header className="mb-2.5 shrink-0">
        <h2 className={section}>Speaking</h2>
      </header>

      <div className="flex flex-col gap-3">
        <div className="shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/50">
          {FEATURED.video ? (
            <iframe
              src={embedUrl(FEATURED.video)}
              title={FEATURED.title}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full border-0"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 p-4 text-center">
              <Play size={18} strokeWidth={2.25} className="text-ink-500" />
              <p className="text-[10px] text-ink-500">No recording yet</p>
            </div>
          )}
          <div className="border-t border-white/10 px-3 py-2">
            <p className="text-[12px] leading-snug text-ink-100">{FEATURED.title}</p>
            <Meta talk={FEATURED} copy={copy} />
          </div>
        </div>

        <ol className="flex shrink-0 flex-col gap-2.5">
          {REST.map((talk) => {
            const website = talk.website

            return (
              <li key={talk.title} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4ade80]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-1.5">
                    <p className="min-w-0 flex-1 text-[12px] leading-snug text-ink-100">
                      {talk.title}
                    </p>
                    {website && (
                      <button
                        type="button"
                        onClick={() => copy(website)}
                        aria-label={`Copy the link for ${talk.title}`}
                        title="Copy the link"
                        className={control}
                      >
                        <Copy size={11} strokeWidth={2.25} />
                      </button>
                    )}
                  </div>
                  {website && (
                    <p
                      title={website}
                      className="mt-0.5 truncate text-[10px] text-ink-500 select-all"
                    >
                      {shortUrl(website)}
                    </p>
                  )}
                  <Meta talk={talk} copy={copy} />
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-[16px] shrink-0 text-[10px] leading-4 text-ink-300"
      >
        {copied === 'done'
          ? 'Link copied to the clipboard.'
          : copied === 'blocked'
            ? 'Copy blocked — select the link text instead.'
            : ''}
      </p>

      <p className="mt-2 flex items-center gap-2 border-t border-white/8 pt-2.5 text-[10px] text-ink-500">
        <span className="h-px flex-1 bg-white/10" />
        <span className="tabular-nums">{MORE_TALKS}+ more talks</span>
        <span className="h-px flex-1 bg-white/10" />
      </p>
    </section>
  )
}

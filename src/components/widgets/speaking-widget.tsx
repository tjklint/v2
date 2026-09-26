import { ArrowUpRight, Play, Video } from 'lucide-react'

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

const section = 'text-[11px] font-medium tracking-widest text-ink-300 uppercase'

function Meta({ talk }: { talk: Talk }) {
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
      {talk.video && (
        <a
          href={talk.video}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${talk.title} on YouTube`}
          className="text-ink-500 transition-colors hover:text-ink-100"
        >
          <Video size={11} strokeWidth={2.25} />
        </a>
      )}
    </p>
  )
}

export function SpeakingWidget() {
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
            <Meta talk={FEATURED} />
          </div>
        </div>

        <ol className="flex shrink-0 flex-col gap-2.5">
          {REST.map((talk) => (
            <li key={talk.title} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4ade80]" />
              <div className="min-w-0">
                <a
                  href={talk.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1"
                >
                  <span className="text-[12px] leading-snug text-ink-100 underline-offset-2 group-hover:underline">
                    {talk.title}
                  </span>
                  <ArrowUpRight
                    size={11}
                    strokeWidth={2.5}
                    className="mt-0.5 shrink-0 text-ink-500 transition-colors group-hover:text-ink-300"
                  />
                </a>
                <Meta talk={talk} />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 flex items-center gap-2 border-t border-white/8 pt-2.5 text-[10px] text-ink-500">
        <span className="h-px flex-1 bg-white/10" />
        <span className="tabular-nums">{MORE_TALKS}+ more talks</span>
        <span className="h-px flex-1 bg-white/10" />
      </p>
    </section>
  )
}

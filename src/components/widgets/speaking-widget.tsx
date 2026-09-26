import { ArrowUpRight, Video } from 'lucide-react'

import { TALKS, monthYear } from '../../apps/talks'

export function SpeakingWidget() {
  return (
    <section aria-label="Speaking" className="glass w-72 rounded-panel px-4 py-3">
      <header className="mb-2.5">
        <h2 className="text-[11px] font-medium tracking-widest text-ink-300 uppercase">Speaking</h2>
      </header>

      <ol className="flex flex-col gap-2.5">
        {TALKS.map((talk) => (
          <li key={talk.title} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300/80" />
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
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-ink-500">
                  <span>{talk.event}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">{monthYear(talk.date)}</span>
                  {talk.kind && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="rounded bg-white/8 px-1.5 py-px text-ink-300">
                        {talk.kind}
                      </span>
                    </>
                  )}
                  {talk.video && (
                    <a
                      href={talk.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Watch ${talk.title}`}
                      className="text-ink-400 transition-colors hover:text-ink-100"
                    >
                      <Video size={11} strokeWidth={2.25} />
                    </a>
                  )}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

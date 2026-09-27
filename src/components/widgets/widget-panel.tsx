import type { ReactNode } from 'react'

type WidgetPanelProps = {
  label: string
  title: ReactNode
  meta?: ReactNode
  children: ReactNode
}

export function WidgetPanel({ label, title, meta, children }: WidgetPanelProps) {
  return (
    <section aria-label={label} className="glass flex w-full flex-col rounded-panel px-4 py-3">
      <header className="mb-3 flex shrink-0 items-baseline justify-between gap-4">
        <h2 className="text-[11px] font-medium tracking-widest text-ink-300 uppercase">{title}</h2>
        {meta ? <p className="shrink-0 text-[11px] text-ink-500 tabular-nums">{meta}</p> : null}
      </header>
      {children}
    </section>
  )
}

type PendingPanelProps = {
  label: string
  title: ReactNode
  failed: boolean
}

export function PendingPanel({ label, title, failed }: PendingPanelProps) {
  return (
    <WidgetPanel label={label} title={title}>
      <p className="text-[11px] text-ink-500">{failed ? 'Unavailable' : 'Loading…'}</p>
    </WidgetPanel>
  )
}

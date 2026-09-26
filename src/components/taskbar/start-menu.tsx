import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'

import { APPS } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'

export function StartMenu() {
  const toggle = useWindowStore((state) => state.toggle)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Start"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-100 transition-colors hover:bg-white/10 focus-ring"
      >
        <LayoutGrid size={17} strokeWidth={2.25} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Dismiss start menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="glass-deep absolute bottom-full left-0 z-50 mb-2 w-60 rounded-xl p-2">
            <p className="px-3 pt-1.5 pb-2 text-[11px] font-medium tracking-widest text-ink-500 uppercase">
              Installed
            </p>
            {APPS.map((app) => {
              const Icon = app.icon
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    toggle(app.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/8">
                    <Icon size={14} strokeWidth={2.25} className="text-ink-100" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-ink-100">{app.title}</span>
                    <span className="block truncate text-[11px] text-ink-500">{app.keywords}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

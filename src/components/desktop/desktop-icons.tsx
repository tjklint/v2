import { APPS } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'

export function DesktopIcons() {
  const launch = useWindowStore((state) => state.launch)

  return (
    <div className="pointer-events-none absolute top-[288px] left-6 z-10 flex w-24 flex-col items-center gap-1">
      {APPS.map((app) => {
        const Icon = app.icon

        return (
          <button
            key={app.id}
            type="button"
            onClick={() => launch(app.id)}
            title={`${app.title}.exe`}
            className="pointer-events-auto flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 transition-colors hover:bg-white/10 focus-ring"
          >
            <span className="glass-deep flex h-11 w-11 items-center justify-center rounded-lg">
              <Icon size={20} strokeWidth={2} className="text-ink-100" />
            </span>
            <span className="max-w-full truncate font-mono text-[10px] text-ink-300">
              {app.title.toLowerCase()}.exe
            </span>
          </button>
        )
      })}
    </div>
  )
}

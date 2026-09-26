import { APPS } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'
import { Search } from './search'
import { StartMenu } from './start-menu'

export function Taskbar() {
  const instances = useWindowStore((state) => state.instances)
  const focused = useWindowStore((state) => state.focused)
  const toggle = useWindowStore((state) => state.toggle)

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-5">
      <nav
        aria-label="Taskbar"
        className="glass pointer-events-auto flex items-center gap-2 rounded-2xl px-2.5 py-2"
      >
        <StartMenu />
        <Search />
        <span className="mx-0.5 h-6 w-px bg-white/10" />
        {APPS.map((app) => {
          const Icon = app.icon
          const running = instances[app.id].open
          const active = focused === app.id

          return (
            <button
              key={app.id}
              type="button"
              aria-label={app.title}
              aria-pressed={active}
              onClick={() => toggle(app.id)}
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
            >
              <Icon size={17} strokeWidth={2.25} />
              <span
                className={`absolute -bottom-1.5 h-1 rounded-full bg-ink-100 transition-all duration-200 ease-spring ${
                  running ? 'w-4 opacity-90' : 'w-0 opacity-0'
                } ${active ? '' : 'opacity-40'}`}
              />
            </button>
          )
        })}
      </nav>
    </footer>
  )
}

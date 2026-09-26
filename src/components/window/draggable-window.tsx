import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import Draggable from 'react-draggable'

import type { AppDefinition } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'

const DRAG_HANDLE = '.window-drag-handle'
const NO_DRAG = '.window-no-drag'

type DraggableWindowProps = {
  app: AppDefinition
  focused: boolean
  children: ReactNode
}

export function DraggableWindow({ app, focused, children }: DraggableWindowProps) {
  const position = useWindowStore((state) => state.instances[app.id].position)
  const focus = useWindowStore((state) => state.focus)
  const dismiss = useWindowStore((state) => state.dismiss)
  const reposition = useWindowStore((state) => state.reposition)

  const Icon = app.icon

  return (
    <Draggable
      handle={DRAG_HANDLE}
      cancel={NO_DRAG}
      bounds="parent"
      position={position}
      onStart={() => focus(app.id)}
      onStop={(_event, data) => reposition(app.id, { x: data.x, y: data.y })}
      defaultClassName="absolute top-0 left-0"
    >
      <section
        aria-label={app.title}
        style={{ opacity: focused ? 1 : 0.8 }}
        className="glass-deep pointer-events-auto flex w-[min(520px,calc(100vw-2rem))] flex-col overflow-hidden rounded-window transition-opacity duration-200"
      >
        <header
          style={{ cursor: focused ? 'grab' : 'default' }}
          className="window-drag-handle flex items-center gap-2.5 px-4 py-3 select-none"
        >
          <Icon size={15} strokeWidth={2.25} className="text-ink-300" />
          <h2 className="flex-1 text-[13px] font-medium tracking-wide text-ink-100">{app.title}</h2>
          <button
            type="button"
            aria-label={`Close ${app.title}`}
            onClick={() => dismiss(app.id)}
            className="window-no-drag rounded-md p-1 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100 focus-ring"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </header>
        <div className="h-[min(26rem,calc(100dvh-13rem))] overflow-hidden">{children}</div>
      </section>
    </Draggable>
  )
}

import { X } from 'lucide-react'
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import Draggable from 'react-draggable'

import type { AppDefinition, Size } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'

const DRAG_HANDLE = '.window-drag-handle'
const NO_DRAG = '.window-no-drag'

const MIN_SIZE: Size = { width: 360, height: 240 }

type DraggableWindowProps = {
  app: AppDefinition
  focused: boolean
  zIndex: number
  children: ReactNode
}

export function DraggableWindow({ app, focused, zIndex, children }: DraggableWindowProps) {
  const node = useRef<HTMLElement>(null)
  const position = useWindowStore((state) => state.instances[app.id].position)
  const size = useWindowStore((state) => state.instances[app.id].size)
  const focus = useWindowStore((state) => state.focus)
  const dismiss = useWindowStore((state) => state.dismiss)
  const reposition = useWindowStore((state) => state.reposition)
  const resize = useWindowStore((state) => state.resize)

  const [resizing, setResizing] = useState(false)
  const origin = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const Icon = app.icon

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    origin.current = { x: event.clientX, y: event.clientY, width: size.width, height: size.height }
    setResizing(true)
    focus(app.id)
  }

  const dragResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizing) return

    const parent = node.current?.parentElement?.getBoundingClientRect()
    const maxWidth = parent ? parent.width - position.x : Infinity
    const maxHeight = parent ? parent.height - position.y : Infinity

    const width = origin.current.width + event.clientX - origin.current.x
    const height = origin.current.height + event.clientY - origin.current.y

    resize(app.id, {
      width: Math.max(MIN_SIZE.width, Math.min(width, maxWidth)),
      height: Math.max(MIN_SIZE.height, Math.min(height, maxHeight)),
    })
  }

  const endResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    setResizing(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <Draggable
      nodeRef={node}
      handle={DRAG_HANDLE}
      cancel={NO_DRAG}
      bounds="parent"
      position={position}
      onStart={() => focus(app.id)}
      onStop={(_event, data) => reposition(app.id, { x: data.x, y: data.y })}
      defaultClassName="absolute top-0 left-0"
    >
      <section
        ref={node}
        aria-label={app.title}
        onPointerDown={() => focus(app.id)}
        style={{
          width: size.width,
          height: size.height,
          opacity: focused ? 1 : 0.8,
          zIndex,
        }}
        className="glass-deep pointer-events-auto flex flex-col overflow-hidden rounded-window transition-opacity duration-200"
      >
        <header
          style={{ cursor: focused ? 'grab' : 'default' }}
          className="window-drag-handle flex shrink-0 items-center gap-2.5 px-4 py-3 select-none"
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

        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

        <div
          role="separator"
          aria-label={`Resize ${app.title}`}
          onPointerDown={startResize}
          onPointerMove={dragResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          className="absolute right-0 bottom-0 h-4 w-4 cursor-nwse-resize touch-none"
        >
          <span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-ink-500/50" />
        </div>
      </section>
    </Draggable>
  )
}

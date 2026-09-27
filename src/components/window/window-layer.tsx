import type { ReactNode } from 'react'

import { APPS, type AppId } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'
import { DraggableWindow } from './draggable-window'

export type WindowLayerProps = {
  render: (id: AppId) => ReactNode
}

export function WindowLayer({ render }: WindowLayerProps) {
  const instances = useWindowStore((state) => state.instances)
  const focused = useWindowStore((state) => state.focused)

  const visible = APPS.filter((app) => instances[app.id].open)
  const stacked = [...visible].sort((a, b) => (focused === a.id ? 1 : focused === b.id ? -1 : 0))
  const rank = new Map(stacked.map((app, index) => [app.id, index]))

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[52px] bottom-[72px] z-30">
      {visible.map((app) => (
        <DraggableWindow
          key={app.id}
          app={app}
          focused={focused === app.id}
          zIndex={rank.get(app.id) ?? 0}
        >
          {render(app.id)}
        </DraggableWindow>
      ))}
    </div>
  )
}

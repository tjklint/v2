import { useEffect } from 'react'

import type { AppId } from '../../apps/registry'
import { installSoundFeedback } from '../../sound'
import { AppSurface } from '../apps/app-surface'
import { Header } from '../header/header'
import { Taskbar } from '../taskbar/taskbar'
import { Wallpaper } from '../wallpaper/wallpaper'
import { WidgetLayer } from '../widgets/widget-layer'
import { WindowLayer } from '../window/window-layer'

const surface = (id: AppId) => <AppSurface id={id} />

export function Os() {
  useEffect(() => installSoundFeedback(), [])

  return (
    <div className="relative h-full overflow-hidden">
      <Wallpaper />
      <Header />
      <WidgetLayer />
      <WindowLayer render={surface} />
      <Taskbar />
    </div>
  )
}

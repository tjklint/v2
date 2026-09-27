import type { AppId } from '../../apps/registry'
import { AppSurface } from '../apps/app-surface'
import { DesktopIcons } from '../desktop/desktop-icons'
import { Header } from '../header/header'
import { Taskbar } from '../taskbar/taskbar'
import { Wallpaper } from '../wallpaper/wallpaper'
import { WidgetLayer } from '../widgets/widget-layer'
import { WindowLayer } from '../window/window-layer'

const surface = (id: AppId) => <AppSurface id={id} />

export function Os() {
  return (
    <div className="relative h-full overflow-hidden">
      <Wallpaper />
      <DesktopIcons />
      <Header />
      <WidgetLayer />
      <WindowLayer render={surface} />
      <Taskbar />
    </div>
  )
}

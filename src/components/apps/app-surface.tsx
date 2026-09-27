import type { AppId } from '../../apps/registry'
import { AboutApp } from './about-app'
import { ArcadeApp } from './arcade-app'
import { FilesApp } from './files-app'
import { MonitorApp } from './monitor-app'
import { SettingsApp } from './settings-app'
import { SitesApp } from './sites-app'
import { TerminalApp } from './terminal-app'

const SURFACES: Record<AppId, () => React.JSX.Element> = {
  browser: SitesApp,
  terminal: TerminalApp,
  game: ArcadeApp,
  monitor: MonitorApp,
  files: FilesApp,
  about: AboutApp,
  settings: SettingsApp,
}

export function AppSurface({ id }: { id: AppId }) {
  const Surface = SURFACES[id]
  return <Surface />
}

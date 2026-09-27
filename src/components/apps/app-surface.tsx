import type { AppId } from '../../apps/registry'
import { ArcadeApp } from './arcade-app'
import { MonitorApp } from './monitor-app'
import { SettingsApp } from './settings-app'
import { SitesApp } from './sites-app'
import { TerminalApp } from './terminal-app'

const SURFACES: Record<AppId, () => React.JSX.Element> = {
  browser: SitesApp,
  terminal: TerminalApp,
  game: ArcadeApp,
  monitor: MonitorApp,
  settings: SettingsApp,
}

export function AppSurface({ id }: { id: AppId }) {
  const Surface = SURFACES[id]
  return <Surface />
}

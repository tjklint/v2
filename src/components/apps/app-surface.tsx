import type { AppId } from '../../apps/registry'
import { SitesApp } from './sites-app'
import { SnakeApp } from './snake-app'
import { TerminalApp } from './terminal-app'

const SURFACES: Record<AppId, () => React.JSX.Element> = {
  browser: SitesApp,
  terminal: TerminalApp,
  game: SnakeApp,
}

export function AppSurface({ id }: { id: AppId }) {
  const Surface = SURFACES[id]
  return <Surface />
}

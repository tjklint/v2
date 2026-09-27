import {
  Activity,
  Compass,
  Gamepad2,
  Settings as SettingsIcon,
  SquareTerminal,
  type LucideIcon,
} from 'lucide-react'

export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type AppId = 'browser' | 'terminal' | 'game' | 'monitor' | 'settings'

export type AppDefinition = {
  id: AppId
  title: string
  icon: LucideIcon
  keywords: string
  spawn: Point
  size: Size
  startsOpen?: boolean
}

export const APPS: readonly AppDefinition[] = [
  {
    id: 'browser',
    title: 'Sites',
    icon: Compass,
    keywords: 'browse web sites urls homepage',
    spawn: { x: 264, y: 140 },
    size: { width: 860, height: 560 },
    startsOpen: true,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: SquareTerminal,
    keywords: 'shell console zsh command line',
    spawn: { x: 264, y: 100 },
    size: { width: 560, height: 380 },
  },
  {
    id: 'game',
    title: 'Arcade',
    icon: Gamepad2,
    keywords: 'play game arcade snake breakout pong tetris cabinet',
    spawn: { x: 264, y: 100 },
    size: { width: 420, height: 620 },
  },
  {
    id: 'monitor',
    title: 'System',
    icon: Activity,
    keywords: 'cpu ram fps performance memory frames heap',
    spawn: { x: 700, y: 120 },
    size: { width: 420, height: 480 },
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: SettingsIcon,
    keywords: 'preferences appearance accent theme motion wallpaper',
    spawn: { x: 700, y: 120 },
    size: { width: 460, height: 540 },
  },
]

export const APP_IDS = APPS.map((app) => app.id)

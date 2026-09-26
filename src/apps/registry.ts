import { Compass, Gamepad2, SquareTerminal, type LucideIcon } from 'lucide-react'

export type Point = {
  x: number
  y: number
}

export type AppId = 'browser' | 'terminal' | 'game'

export type AppDefinition = {
  id: AppId
  title: string
  icon: LucideIcon
  keywords: string
  spawn: Point
}

export const APPS: readonly AppDefinition[] = [
  {
    id: 'browser',
    title: 'Sites',
    icon: Compass,
    keywords: 'browse web sites urls homepage',
    spawn: { x: 96, y: 88 },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: SquareTerminal,
    keywords: 'shell console zsh command line',
    spawn: { x: 300, y: 176 },
  },
  {
    id: 'game',
    title: 'Snake',
    icon: Gamepad2,
    keywords: 'play game arcade',
    spawn: { x: 168, y: 264 },
  },
]

export const APP_IDS = APPS.map((app) => app.id)

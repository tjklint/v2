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
    spawn: { x: 264, y: 20 },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: SquareTerminal,
    keywords: 'shell console zsh command line',
    spawn: { x: 264, y: 100 },
  },
  {
    id: 'game',
    title: 'Snake',
    icon: Gamepad2,
    keywords: 'play game arcade',
    spawn: { x: 264, y: 150 },
  },
]

export const APP_IDS = APPS.map((app) => app.id)

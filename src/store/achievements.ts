import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

export type Achievement = {
  id: string
  title: string
  hint: string
}

export const ACHIEVEMENTS = [
  { id: 'first-command', title: 'Hello, world', hint: 'Run your first command' },
  { id: 'first-pipe', title: 'Plumbing', hint: 'Join two commands with a pipe' },
  { id: 'first-redirect', title: 'Write it down', hint: 'Send output to a file with >' },
  { id: 'self-destruct', title: 'Permission denied', hint: 'Try to remove the root directory' },
  { id: 'no-exit', title: 'There is no exit', hint: 'Run exit' },
  { id: 'showoff', title: 'Screenshot bait', hint: 'Run neofetch' },
  { id: 'read-the-manual', title: 'Read the manual', hint: 'Run help' },
  { id: 'historian', title: 'Historian', hint: 'Run history' },
] as const satisfies readonly Achievement[]

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id']

export type Unlocks = Partial<Record<AchievementId, string>>

export type AchievementProgress = { unlocked: number; total: number; ratio: number }

type AchievementsState = {
  unlocks: Unlocks
}

type AchievementsStore = AchievementsState & {
  unlock: (id: AchievementId) => void
}

const INITIAL: AchievementsState = { unlocks: {} }

const attempt = <T>(run: () => T, fallback: T): T => {
  try {
    return run()
  } catch {
    return fallback
  }
}

const safeStorage: StateStorage = {
  getItem: (name) => attempt(() => window.localStorage.getItem(name), null),
  setItem: (name, value) =>
    attempt<void>(() => window.localStorage.setItem(name, value), undefined),
  removeItem: (name) => attempt<void>(() => window.localStorage.removeItem(name), undefined),
}

const sanitise = (value: unknown): Unlocks => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const unlocks: Unlocks = {}

  for (const achievement of ACHIEVEMENTS) {
    const at = source[achievement.id]
    if (typeof at === 'string') unlocks[achievement.id] = at
  }

  return unlocks
}

export const progress = (unlocks: Unlocks): AchievementProgress => {
  const unlocked = ACHIEVEMENTS.reduce(
    (count, achievement) => count + (unlocks[achievement.id] === undefined ? 0 : 1),
    0,
  )

  return { unlocked, total: ACHIEVEMENTS.length, ratio: unlocked / ACHIEVEMENTS.length }
}

export const isUnlocked = (unlocks: Unlocks, id: AchievementId) => unlocks[id] !== undefined

export const useAchievements = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      unlock: (id) => {
        const unlocks = get().unlocks
        if (isUnlocked(unlocks, id)) return
        set({ unlocks: { ...unlocks, [id]: new Date().toISOString() } })
      },
    }),
    {
      name: 'tjos:achievements',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ unlocks: state.unlocks }),
      merge: (persisted, current) => ({
        ...current,
        unlocks: sanitise((persisted as { unlocks?: unknown } | null | undefined)?.unlocks),
      }),
    },
  ),
)

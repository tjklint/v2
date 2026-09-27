import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

export const ACCENT_PRESETS = [
  { name: 'cyan', hex: '#22d3ee' },
  { name: 'violet', hex: '#7c5cff' },
  { name: 'coral', hex: '#ff6b9d' },
  { name: 'amber', hex: '#ffb454' },
  { name: 'neutral', hex: '#a8a8c2' },
] as const

export type AccentName = (typeof ACCENT_PRESETS)[number]['name']

type SettingsState = {
  accent: AccentName
  blooms: boolean
  reduceMotion: boolean
  showCelsius: boolean
  clock24h: boolean
}

type SettingsStore = SettingsState & {
  setAccent: (accent: AccentName) => void
  setBlooms: (blooms: boolean) => void
  setReduceMotion: (reduceMotion: boolean) => void
  setShowCelsius: (showCelsius: boolean) => void
  setClock24h: (clock24h: boolean) => void
}

const INITIAL: SettingsState = {
  accent: 'cyan',
  blooms: true,
  reduceMotion: false,
  showCelsius: true,
  clock24h: false,
}

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

export const accentHex = (accent: AccentName): string =>
  ACCENT_PRESETS.find((preset) => preset.name === accent)?.hex ?? ACCENT_PRESETS[0].hex

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...INITIAL,

      setAccent: (accent) => set({ accent }),
      setBlooms: (blooms) => set({ blooms }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setShowCelsius: (showCelsius) => set({ showCelsius }),
      setClock24h: (clock24h) => set({ clock24h }),
    }),
    {
      name: 'tjos:settings',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        accent: state.accent,
        blooms: state.blooms,
        reduceMotion: state.reduceMotion,
        showCelsius: state.showCelsius,
        clock24h: state.clock24h,
      }),
    },
  ),
)

const applyDocument = ({ accent, blooms, reduceMotion }: SettingsState) => {
  const root = document.documentElement
  root.style.setProperty('--color-accent', accentHex(accent))
  root.dataset.blooms = blooms ? 'on' : 'off'
  root.dataset.reduceMotion = reduceMotion ? 'on' : 'off'
}

applyDocument(useSettings.getState())

useSettings.subscribe((state, previous) => {
  if (
    state.accent === previous.accent &&
    state.blooms === previous.blooms &&
    state.reduceMotion === previous.reduceMotion
  ) {
    return
  }

  applyDocument(state)
})

import { create } from 'zustand'

import { APPS, APP_IDS, type AppId, type Point } from '../apps/registry'

type WindowInstance = {
  open: boolean
  position: Point
}

type WindowStore = {
  instances: Record<AppId, WindowInstance>
  focused: AppId | null
  launch: (id: AppId) => void
  dismiss: (id: AppId) => void
  toggle: (id: AppId) => void
  focus: (id: AppId) => void
  reposition: (id: AppId, position: Point) => void
}

const spawnPoints = Object.fromEntries(APPS.map((app) => [app.id, app.spawn])) as Record<
  AppId,
  Point
>

const topmostOpen = (instances: Record<AppId, WindowInstance>) =>
  [...APP_IDS].reverse().find((id) => instances[id].open) ?? null

export const useWindowStore = create<WindowStore>((set) => ({
  instances: Object.fromEntries(
    APP_IDS.map((id) => [id, { open: false, position: spawnPoints[id] }]),
  ) as Record<AppId, WindowInstance>,
  focused: null,

  launch: (id) =>
    set((state) => ({
      instances: { ...state.instances, [id]: { ...state.instances[id], open: true } },
      focused: id,
    })),

  dismiss: (id) =>
    set((state) => {
      const instances = { ...state.instances, [id]: { ...state.instances[id], open: false } }
      return { instances, focused: state.focused === id ? topmostOpen(instances) : state.focused }
    }),

  toggle: (id) =>
    set((state) => {
      const instance = state.instances[id]

      if (instance.open && state.focused !== id) {
        return { ...state, focused: id }
      }

      return {
        instances: { ...state.instances, [id]: { ...instance, open: !instance.open } },
        focused: instance.open ? null : id,
      }
    }),

  focus: (id) => set((state) => (state.focused === id ? state : { ...state, focused: id })),

  reposition: (id, position) =>
    set((state) => ({
      instances: { ...state.instances, [id]: { ...state.instances[id], position } },
    })),
}))

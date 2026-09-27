import { useMemo } from 'react'

import { playClick, playError, playOpen, playTick } from './sounds'

export type SoundKit = {
  click: () => void
  tick: () => void
  open: () => void
  error: () => void
}

export const useSound = (): SoundKit =>
  useMemo(() => ({ click: playClick, tick: playTick, open: playOpen, error: playError }), [])

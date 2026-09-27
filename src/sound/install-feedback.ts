import { playClick, playTick } from './sounds'

const NOOP = () => undefined

const MODIFIERS = new Set(['Alt', 'AltGraph', 'CapsLock', 'Control', 'Meta', 'Shift'])

let owner: (() => void) | null = null

export const installSoundFeedback = (): (() => void) => {
  if (owner || typeof window === 'undefined') return NOOP

  const held = new Set<string>()

  const onClick = () => playClick()

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (MODIFIERS.has(event.key) || held.has(event.code)) return

    held.add(event.code)
    playTick()
  }

  const onKeyUp = (event: KeyboardEvent) => held.delete(event.code)

  const onBlur = () => held.clear()

  const options = { capture: true, passive: true } as const

  window.addEventListener('click', onClick, options)
  window.addEventListener('keydown', onKeyDown, options)
  window.addEventListener('keyup', onKeyUp, options)
  window.addEventListener('blur', onBlur)

  const dispose = () => {
    window.removeEventListener('click', onClick, true)
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('keyup', onKeyUp, true)
    window.removeEventListener('blur', onBlur)
    held.clear()
    if (owner === dispose) owner = null
  }

  owner = dispose

  return dispose
}

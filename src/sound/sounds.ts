import { useSettings } from '../store/settings'

type Tone = {
  at: number
  duration: number
  peak: number
  type: OscillatorType
  from: number
  to: number
}

type Engine = {
  context: AudioContext
  master: GainNode
}

type AudioContextConstructor = new (options?: AudioContextOptions) => AudioContext

const audioScope = globalThis as typeof globalThis & {
  webkitAudioContext?: AudioContextConstructor
}

const ATTACK = 0.004
const TAIL = 0.02
const SILENCE = 0.0001
const RESTRAINT = 0.45

const CLICK: readonly Tone[] = [
  { at: 0, duration: 0.011, peak: 0.5, type: 'triangle', from: 1500, to: 640 },
]

const TICK: readonly Tone[] = [
  { at: 0, duration: 0.008, peak: 0.24, type: 'sine', from: 2700, to: 1200 },
]

const OPEN: readonly Tone[] = [
  { at: 0, duration: 0.09, peak: 0.3, type: 'sine', from: 523, to: 542 },
  { at: 0.05, duration: 0.12, peak: 0.22, type: 'sine', from: 784, to: 808 },
]

const REJECT: readonly Tone[] = [
  { at: 0, duration: 0.16, peak: 0.34, type: 'triangle', from: 300, to: 246 },
  { at: 0.11, duration: 0.22, peak: 0.28, type: 'triangle', from: 226, to: 182 },
]

const clamp = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

const attempt = <T>(run: () => T, fallback: T): T => {
  try {
    return run()
  } catch {
    return fallback
  }
}

let engine: Engine | null = null
let unsupported = false

const level = (): number => {
  const { soundEnabled, soundVolume, reduceMotion } = useSettings.getState()
  if (!soundEnabled) return 0
  return clamp(soundVolume) * (reduceMotion ? RESTRAINT : 1)
}

const createEngine = (): Engine | null => {
  const Ctor = globalThis.AudioContext ?? audioScope.webkitAudioContext

  if (!Ctor) {
    unsupported = true
    return null
  }

  return attempt<Engine | null>(() => {
    const context = new Ctor({ latencyHint: 'interactive' })
    const master = context.createGain()
    master.gain.value = 1
    master.connect(context.destination)
    return { context, master }
  }, null)
}

const activeEngine = (): Engine | null => {
  if (unsupported) return null
  if (engine?.context.state === 'closed') engine = null
  if (engine) return engine

  engine = createEngine()

  return engine
}

const wake = (context: AudioContext): void => {
  if (context.state !== 'suspended') return
  void context.resume().catch(() => undefined)
}

const schedule = (active: Engine, tone: Tone, volume: number): void => {
  const start = active.context.currentTime + tone.at
  const attack = Math.min(ATTACK, tone.duration / 2)
  const oscillator = active.context.createOscillator()
  const envelope = active.context.createGain()

  oscillator.type = tone.type
  oscillator.frequency.setValueAtTime(tone.from, start)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(tone.to, 1), start + tone.duration)

  envelope.gain.setValueAtTime(SILENCE, start)
  envelope.gain.exponentialRampToValueAtTime(Math.max(tone.peak * volume, SILENCE), start + attack)
  envelope.gain.exponentialRampToValueAtTime(SILENCE, start + tone.duration)

  oscillator.connect(envelope).connect(active.master)
  oscillator.start(start)
  oscillator.stop(start + tone.duration + TAIL)
}

const play = (tones: readonly Tone[]): void => {
  const volume = level()
  if (volume <= 0) return

  const active = activeEngine()
  if (!active) return

  attempt<void>(() => {
    wake(active.context)
    for (const tone of tones) schedule(active, tone, volume)
  }, undefined)
}

export const playClick = (): void => play(CLICK)

export const playTick = (): void => play(TICK)

export const playOpen = (): void => play(OPEN)

export const playError = (): void => play(REJECT)

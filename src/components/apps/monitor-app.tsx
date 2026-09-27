import { Activity, AppWindow, Cpu, MemoryStick, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { APPS, APP_IDS } from '../../apps/registry'
import { useWindowStore } from '../../store/windows'

const RING = 256
const WINDOW_MS = 1000
const MAX_DELTA_MS = 1000
const WARMUP_FRAMES = 8
const WARMUP_MS = 300
const PUBLISH_MS = 250
const GRAPH_MS = 400
const IDLE_POLL_MS = 1000
const HISTORY = 60
const SCALE_FLOOR = 60
const MB = 1024 * 1024

const TITLES = new Map(APPS.map((app) => [app.id, app.title] as const))

const PLATFORMS: [RegExp, string][] = [
  [/windows/i, 'Windows'],
  [/mac os x|macintosh/i, 'macOS'],
  [/android/i, 'Android'],
  [/iphone|ipad|ipod/i, 'iOS'],
  [/cros/i, 'ChromeOS'],
  [/linux|x11/i, 'Linux'],
]

type PerformanceHints = {
  memory?: {
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }
}

type NavigatorHints = {
  deviceMemory?: number
  userAgentData?: { platform?: string }
}

type Heap = {
  used: number
  total: number
  limit: number
}

type Environment = {
  cores: number | null
  deviceMemory: number | null
  pixelRatio: number | null
  platform: string | null
}

type Readout = {
  fps: number | null
  frameMs: number | null
  lowMs: number | null
  peak: number
  frames: number
  heap: Heap | null
  elapsed: number
}

type Timeline = {
  deltas: Float64Array
  stamps: Float64Array
  head: number
  count: number
  last: number
  published: number
  graphed: number
  frames: number
}

type Box = {
  width: number
  height: number
  dpr: number
}

type MetricProps = {
  label: string
  value: string
  unit?: string
  reason?: string
  tone?: string
  compact?: boolean
}

type RowProps = {
  label: string
  value: string
  reason?: string
  tone?: string
}

type SectionProps = {
  icon: LucideIcon
  title: string
  meta?: string
  children: ReactNode
}

const INITIAL: Readout = {
  fps: null,
  frameMs: null,
  lowMs: null,
  peak: SCALE_FLOOR,
  frames: 0,
  heap: null,
  elapsed: 0,
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const positive = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null

const createTimeline = (): Timeline => ({
  deltas: new Float64Array(RING),
  stamps: new Float64Array(RING),
  head: 0,
  count: 0,
  last: 0,
  published: 0,
  graphed: 0,
  frames: 0,
})

const readHeap = (): Heap | null => {
  const memory = (performance as Performance & PerformanceHints).memory
  if (!memory) return null

  const used = positive(memory.usedJSHeapSize)
  const total = positive(memory.totalJSHeapSize)
  const limit = positive(memory.jsHeapSizeLimit)
  if (used === null || total === null || limit === null) return null

  return { used, total, limit }
}

const readEnvironment = (): Environment => {
  const hints = navigator as Navigator & NavigatorHints
  const platform =
    hints.userAgentData?.platform ??
    PLATFORMS.find(([pattern]) => pattern.test(navigator.userAgent))?.[1] ??
    navigator.platform

  return {
    cores: positive(navigator.hardwareConcurrency),
    deviceMemory: positive(hints.deviceMemory),
    pixelRatio: positive(window.devicePixelRatio),
    platform: platform || null,
  }
}

const formatUptime = (ms: number) => {
  const total = Math.floor(Math.max(0, ms) / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (value: number) => String(value).padStart(2, '0')

  if (hours > 0) return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
  if (minutes > 0) return `${minutes}m ${pad(seconds)}s`
  return `${seconds}s`
}

const formatBytes = (bytes: number) => `${(bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0)} MB`

const measure = (
  track: Timeline,
  now: number,
  mountedAt: number,
  history: readonly (number | null)[],
): Readout => {
  let peak = SCALE_FLOOR
  for (const value of history) if (value !== null && value > peak) peak = value

  const base = {
    peak,
    frames: track.frames,
    heap: readHeap(),
    elapsed: now - mountedAt,
  }

  const count = track.count
  const oldest = (track.head - count + RING) % RING
  const span = count > 0 ? (now - track.stamps[oldest]) / 1000 : 0

  if (count < WARMUP_FRAMES || span < WARMUP_MS / 1000) {
    return { ...base, fps: null, frameMs: null, lowMs: null }
  }

  const sorted = new Float64Array(count)
  let total = 0
  for (let index = 0; index < count; index += 1) {
    const delta = track.deltas[(oldest + index) % RING]
    sorted[index] = delta
    total += delta
  }
  sorted.sort()

  return {
    ...base,
    fps: count / span,
    frameMs: total / count,
    lowMs: sorted[clamp(Math.ceil(count * 0.01) - 1, 0, count - 1)],
  }
}

const drawGraph = (
  canvas: HTMLCanvasElement,
  box: Box,
  history: readonly (number | null)[],
  peak: number,
) => {
  const context = canvas.getContext('2d')
  if (!context) return

  const { width, height, dpr } = box
  const floor = height - 1
  const usable = height - 3

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)

  context.fillStyle = 'rgba(238, 238, 245, 0.16)'
  context.fillRect(0, floor - (SCALE_FLOOR / peak) * usable, width, 1)
  context.fillStyle = 'rgba(238, 238, 245, 0.08)'
  context.fillRect(0, floor, width, 1)

  const slot = width / HISTORY
  const bar = Math.max(1, slot - 1)

  for (let index = 0; index < history.length; index += 1) {
    const value = history[index]
    if (value === null) continue

    const size = clamp((value / peak) * usable, 1, usable)
    context.fillStyle =
      value >= 50
        ? 'rgba(34, 211, 238, 0.9)'
        : value >= 30
          ? 'rgba(255, 180, 84, 0.9)'
          : 'rgba(255, 107, 157, 0.9)'
    context.fillRect(index * slot, floor - size, bar, size)
  }
}

const Metric = ({ label, value, unit, reason, tone, compact = false }: MetricProps) => (
  <div className="min-w-0 rounded-md border border-white/8 bg-white/4 px-2 py-1.5">
    <p className="truncate text-[9px] tracking-[0.08em] text-ink-500 uppercase">{label}</p>
    {reason ? (
      <p className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-[13px] text-ink-300">—</span>
        <span className="truncate text-[9px] text-ink-500">{reason}</span>
      </p>
    ) : (
      <p
        className={`mt-0.5 truncate font-mono tabular-nums ${compact ? 'text-[12px]' : 'text-[16px]'} ${tone ?? 'text-ink-100'}`}
      >
        {value}
        {unit ? <span className="ml-0.5 text-[9px] text-ink-500">{unit}</span> : null}
      </p>
    )}
  </div>
)

const Row = ({ label, value, reason, tone }: RowProps) => (
  <div className="flex items-baseline justify-between gap-3 py-[3px]">
    <dt className="truncate text-[10px] text-ink-500">{label}</dt>
    <dd className="truncate text-right font-mono text-[11px] tabular-nums">
      {reason ? (
        <span className="text-ink-300">
          — <span className="text-ink-500">{reason}</span>
        </span>
      ) : (
        <span className={tone ?? 'text-ink-100'}>{value}</span>
      )}
    </dd>
  </div>
)

const Section = ({ icon: Icon, title, meta, children }: SectionProps) => (
  <section className="mt-2.5 rounded-panel border border-white/8 bg-white/3 p-2.5">
    <header className="mb-1.5 flex items-center gap-1.5">
      <Icon size={11} strokeWidth={2.25} className="text-ink-500" />
      <h3 className="flex-1 truncate text-[10px] font-medium tracking-[0.12em] text-ink-300 uppercase">
        {title}
      </h3>
      {meta ? <span className="shrink-0 font-mono text-[9px] text-ink-500">{meta}</span> : null}
    </header>
    {children}
  </section>
)

export function MonitorApp() {
  const focused = useWindowStore((state) => state.focused)
  const openCount = useWindowStore((state) =>
    APP_IDS.reduce((total, id) => total + (state.instances[id].open ? 1 : 0), 0),
  )
  const openNames = useWindowStore((state) =>
    APP_IDS.filter((id) => state.instances[id].open)
      .map((id) => TITLES.get(id) ?? id)
      .join(' · '),
  )

  const [environment] = useState(readEnvironment)
  const [mountedAt] = useState(() => performance.now())
  const [readout, setReadout] = useState<Readout>(INITIAL)

  const sampler = useRef<Timeline | null>(null)
  sampler.current ??= createTimeline()

  const latest = useRef<Readout>(INITIAL)
  const history = useRef<(number | null)[]>([])
  const scale = useRef(SCALE_FLOOR)
  const box = useRef<Box>({ width: 0, height: 0, dpr: 1 })
  const stage = useRef<HTMLDivElement>(null)
  const graph = useRef<HTMLCanvasElement>(null)

  const sampling = focused === 'monitor'

  const commit = useCallback((next: Readout) => {
    latest.current = next
    setReadout(next)
  }, [])

  const redraw = useCallback(() => {
    const canvas = graph.current
    if (!canvas) return
    drawGraph(canvas, box.current, history.current, scale.current)
  }, [])

  useEffect(() => {
    const track = sampler.current
    if (!sampling || !track) return

    let frame = 0
    track.last = performance.now()
    track.published = track.last
    track.graphed = track.last

    const tick = (now: number) => {
      const delta = now - track.last
      track.last = now

      if (delta > 0 && delta <= MAX_DELTA_MS && !document.hidden) {
        track.deltas[track.head] = delta
        track.stamps[track.head] = now
        track.head = (track.head + 1) % RING
        track.count = Math.min(track.count + 1, RING)
        track.frames += 1
      } else {
        track.head = 0
        track.count = 0
      }

      let oldest = (track.head - track.count + RING) % RING
      while (track.count > 0 && now - track.stamps[oldest] >= WINDOW_MS) {
        track.count -= 1
        oldest = (track.head - track.count + RING) % RING
      }

      if (now - track.published >= PUBLISH_MS) {
        track.published = now
        commit(measure(track, now, mountedAt, history.current))
      }

      if (now - track.graphed >= GRAPH_MS) {
        track.graphed = now
        history.current.push(latest.current.fps)
        if (history.current.length > HISTORY) history.current.shift()

        let peak = SCALE_FLOOR
        for (const value of history.current) if (value !== null && value > peak) peak = value
        scale.current = peak
        redraw()
      }

      frame = requestAnimationFrame(tick)
    }

    const resume = () => {
      if (document.hidden) return
      track.head = 0
      track.count = 0
      track.last = performance.now()
    }

    document.addEventListener('visibilitychange', resume)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [commit, mountedAt, redraw, sampling, sampler])

  useEffect(() => {
    if (sampling) return

    const tick = () => {
      if (document.hidden) return
      commit({ ...latest.current, heap: readHeap(), elapsed: performance.now() - mountedAt })
    }

    const timer = window.setInterval(tick, IDLE_POLL_MS)
    return () => window.clearInterval(timer)
  }, [commit, mountedAt, sampling])

  useEffect(() => {
    const node = stage.current
    const canvas = graph.current
    if (!node || !canvas) return

    const sync = () => {
      const rect = node.getBoundingClientRect()
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2)
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      if (box.current.width === width && box.current.height === height && box.current.dpr === dpr) {
        return
      }

      box.current = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      redraw()
    }

    const observer = new ResizeObserver(sync)
    observer.observe(node)
    window.addEventListener('resize', sync)
    sync()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [redraw])

  const heap = readout.heap
  const heapRatio = heap ? clamp((heap.used / heap.limit) * 100, 0, 100) : null
  const fpsTone =
    readout.fps === null
      ? undefined
      : readout.fps >= 50
        ? 'text-cyan-bloom'
        : readout.fps >= 30
          ? 'text-amber-bloom'
          : 'text-coral-bloom'
  const stale = sampling ? 'warming up' : 'idle'
  const focusedTitle = focused === null ? null : (TITLES.get(focused) ?? focused)

  const graphLabel = sampling
    ? `Frame rate history, last ${Math.round((GRAPH_MS * HISTORY) / 1000)} seconds. ${
        readout.fps === null
          ? 'Collecting samples'
          : `Now ${readout.fps.toFixed(0)} frames per second`
      }, ${
        readout.lowMs === null
          ? 'worst frame not measured yet'
          : `one percent low ${readout.lowMs.toFixed(1)} milliseconds`
      }, vertical scale to ${Math.round(readout.peak)} frames per second.`
    : `Frame rate history paused because this window is not focused. ${
        readout.fps === null
          ? 'No samples collected yet'
          : `Last reading ${readout.fps.toFixed(0)} frames per second`
      }.`

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase ${
              sampling
                ? 'border-cyan-bloom/40 bg-cyan-bloom/10 text-cyan-bloom'
                : 'border-white/10 bg-white/5 text-ink-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${sampling ? 'animate-pulse bg-cyan-bloom' : 'bg-ink-500'}`}
            />
            {sampling ? 'Sampling' : 'Idle'}
          </span>
          <span className="font-mono text-[10px] text-ink-300 tabular-nums">
            {formatUptime(readout.elapsed)}
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <Metric
            label="FPS"
            value={readout.fps?.toFixed(0) ?? ''}
            unit="fps"
            reason={readout.fps === null ? stale : undefined}
            tone={fpsTone}
          />
          <Metric
            label="Frame"
            value={readout.frameMs?.toFixed(2) ?? ''}
            unit="ms"
            reason={readout.frameMs === null ? stale : undefined}
            tone={fpsTone}
          />
          <Metric
            label="1% low"
            value={readout.lowMs?.toFixed(1) ?? ''}
            unit="ms"
            reason={readout.lowMs === null ? stale : undefined}
            tone={fpsTone}
          />
        </div>

        <Section
          icon={Activity}
          title="Frame history"
          meta={`${Math.round((GRAPH_MS * HISTORY) / 1000)}s · scale ${Math.round(readout.peak)} fps`}
        >
          <div
            ref={stage}
            className="relative h-24 w-full overflow-hidden rounded-md bg-ink-950/60"
          >
            <canvas
              ref={graph}
              role="img"
              aria-label={graphLabel}
              className="absolute inset-0 h-full w-full"
            />
            {!sampling && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-950/50">
                <span className="text-[9px] tracking-[0.1em] text-ink-300 uppercase">
                  Sampling paused
                </span>
              </div>
            )}
          </div>
        </Section>

        <Section
          icon={MemoryStick}
          title="JS heap"
          meta={heapRatio === null ? 'unavailable' : `${heapRatio.toFixed(0)}% of limit`}
        >
          {heap && heapRatio !== null ? (
            <>
              <div
                role="meter"
                aria-label="JS heap used"
                aria-valuenow={Math.round(heapRatio)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  style={{ width: `${Math.max(heapRatio, 1)}%` }}
                  className="h-full rounded-full bg-violet-bloom transition-[width] duration-700 ease-out"
                />
              </div>
              <dl>
                <Row label="Used" value={formatBytes(heap.used)} />
                <Row label="Allocated" value={formatBytes(heap.total)} />
                <Row label="Limit" value={formatBytes(heap.limit)} />
              </dl>
            </>
          ) : (
            <dl>
              <Row label="Used" value="" reason="Chromium only" />
            </dl>
          )}
        </Section>

        <Section icon={AppWindow} title="Session" meta={`${openCount} open`}>
          <dl>
            <Row label="Windows open" value={`${openCount} / ${APP_IDS.length}`} />
            <Row label="Open apps" value={openNames || '—'} tone="text-ink-300" />
            <Row
              label="Focused app"
              value={focusedTitle ?? '—'}
              reason={focusedTitle === null ? 'none' : undefined}
            />
            <Row
              label="Sampling"
              value={sampling ? 'full rate' : '1 Hz idle'}
              tone={sampling ? 'text-cyan-bloom' : 'text-ink-300'}
            />
            <Row label="Frames sampled" value={readout.frames.toLocaleString()} />
          </dl>
        </Section>

        <Section icon={Cpu} title="Environment">
          <div className="grid grid-cols-2 gap-1.5">
            <Metric
              compact
              label="Cores"
              value={environment.cores === null ? '' : `${environment.cores} threads`}
              reason={environment.cores === null ? 'unavailable' : undefined}
            />
            <Metric
              compact
              label="Device memory"
              value={environment.deviceMemory === null ? '' : `${environment.deviceMemory} GB`}
              reason={environment.deviceMemory === null ? 'Chromium only' : undefined}
            />
            <Metric
              compact
              label="Pixel ratio"
              value={environment.pixelRatio === null ? '' : `${environment.pixelRatio}×`}
              reason={environment.pixelRatio === null ? 'unavailable' : undefined}
            />
            <Metric
              compact
              label="Platform"
              value={environment.platform ?? ''}
              reason={environment.platform === null ? 'unknown' : undefined}
            />
          </div>
        </Section>
      </div>
    </div>
  )
}

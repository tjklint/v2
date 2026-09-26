import { useEffect, useState } from 'react'

export type SystemLoad = {
  cpu: number
  ram: number
}

const FRAME_MS = 1000 / 60
const WINDOW_MS = 1000
const IDLE_FLOOR = 3

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const heapPercent = (): number | null => {
  const memory = (
    performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
  ).memory

  if (!memory?.jsHeapSizeLimit) return null
  return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
}

const smooth = (previous: number, next: number) =>
  previous + (next - previous) * (next > previous ? 0.45 : 0.12)

export function useSystemLoad(): SystemLoad {
  const [load, setLoad] = useState<SystemLoad>({ cpu: IDLE_FLOOR, ram: 0 })

  useEffect(() => {
    let frame = 0
    let current: SystemLoad = { cpu: IDLE_FLOOR, ram: 0 }
    let previous = performance.now()
    let opened = previous
    let busy = 0

    const tick = () => {
      const now = performance.now()
      const delta = now - previous
      previous = now

      if (now - opened >= WINDOW_MS) {
        if (!document.hidden) {
          const utilization = clamp(busy / (now - opened), 0, 1)
          const next = {
            cpu: Math.round(smooth(current.cpu, IDLE_FLOOR + utilization * (97 - IDLE_FLOOR))),
            ram: Math.round(smooth(current.ram, heapPercent() ?? utilization * 70)),
          }

          current = next
          setLoad(next)
        }

        busy = 0
        opened = now
      }

      busy += Math.max(0, delta - FRAME_MS)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return load
}

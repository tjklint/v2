import { useEffect, useState } from 'react'

export type SystemLoad = {
  cpu: number
  ram: number
}

const FRAME_MS = 1000 / 60
const WINDOW_MS = 1000
const CPU_IDLE = 3
const RAM_IDLE = 2

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
  const [load, setLoad] = useState<SystemLoad>({ cpu: CPU_IDLE, ram: RAM_IDLE })

  useEffect(() => {
    let frame = 0
    let current: SystemLoad = { cpu: CPU_IDLE, ram: RAM_IDLE }
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
            cpu: Math.round(smooth(current.cpu, CPU_IDLE + utilization * (97 - CPU_IDLE))),
            ram: Math.round(
              smooth(current.ram, Math.max(RAM_IDLE, heapPercent() ?? utilization * 70)),
            ),
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

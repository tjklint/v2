import { useSystemLoad } from './use-system-load'

type GaugeProps = {
  label: string
  value: number
  tone: string
}

function Gauge({ label, value, tone }: GaugeProps) {
  return (
    <span
      role="meter"
      aria-label={`${label} usage`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      title={`${label} ${value}%`}
      className="flex items-center gap-1.5"
    >
      <span className="text-[10px] tracking-wide text-ink-500">{label}</span>
      <span className="h-1 w-6 overflow-hidden rounded-full bg-white/12">
        <span
          style={{ width: `${Math.max(value, 2)}%` }}
          className={`block h-full rounded-full ${tone} transition-[width] duration-700 ease-out`}
        />
      </span>
      <span className="w-6 text-right text-[11px] text-ink-100 tabular-nums">{value}%</span>
    </span>
  )
}

export function SystemMonitor() {
  const { cpu, ram } = useSystemLoad()

  return (
    <div className="flex items-center gap-3">
      <Gauge label="CPU" value={cpu} tone="bg-sky-300" />
      <Gauge label="RAM" value={ram} tone="bg-violet-300" />
    </div>
  )
}

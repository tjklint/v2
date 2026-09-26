import { HeaderDate, HeaderWeather } from './header-status'
import { SystemMonitor } from './system-monitor'

export function Header() {
  return (
    <header className="glass-bar absolute inset-x-0 top-0 z-40 flex h-[52px] items-center justify-between px-6 select-none">
      <h1 className="font-pixel text-[15px] leading-none tracking-[0.15em] text-ink-100 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
        TJOS
      </h1>

      <div className="flex items-center gap-5">
        <SystemMonitor />
        <span className="h-3.5 w-px bg-white/12" />
        <HeaderWeather />
        <span className="h-3.5 w-px bg-white/12" />
        <HeaderDate />
      </div>
    </header>
  )
}

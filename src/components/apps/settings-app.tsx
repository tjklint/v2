import { Check, Clock, Flower2, Palette, Sparkles, Volume2, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { playClick } from '../../sound'
import { ACCENT_PRESETS, accentHex, useSettings } from '../../store/settings'

type SectionProps = {
  icon: LucideIcon
  title: string
  meta?: ReactNode
  children: ReactNode
}

type ToggleProps = {
  label: string
  hint: string
  checked: boolean
  onChange: (next: boolean) => void
}

type SliderProps = {
  label: string
  hint: string
  value: number
  disabled?: boolean
  onChange: (next: number) => void
}

const Section = ({ icon: Icon, title, meta, children }: SectionProps) => (
  <section className="mt-2.5 rounded-panel border border-white/8 bg-white/3 p-2.5">
    <header className="mb-1.5 flex items-center gap-1.5">
      <Icon size={11} strokeWidth={2.25} className="text-ink-500" />
      <h3 className="flex-1 truncate text-[10px] font-medium tracking-[0.12em] text-ink-300 uppercase">
        {title}
      </h3>
      {meta ? (
        <span className="shrink-0 font-mono text-[9px] text-ink-500 tabular-nums">{meta}</span>
      ) : null}
    </header>
    {children}
  </section>
)

const Toggle = ({ label, hint, checked, onChange }: ToggleProps) => {
  const accent = useSettings((state) => state.accent)
  const tint = accentHex(accent)

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] text-ink-100">{label}</span>
        <span className="mt-0.5 block text-[10px] leading-snug text-ink-500">{hint}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[10px] text-ink-300 tabular-nums">
          {checked ? 'On' : 'Off'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className="focus-ring relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200"
          style={{
            backgroundColor: checked ? tint : 'rgba(238, 238, 245, 0.08)',
            borderColor: checked ? tint : 'rgba(238, 238, 245, 0.16)',
          }}
        >
          <span
            className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-ink-100 transition-[left] duration-200 ease-spring ${
              checked ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
      </span>
    </div>
  )
}

const Slider = ({ label, hint, value, disabled = false, onChange }: SliderProps) => {
  const accent = useSettings((state) => state.accent)
  const tint = accentHex(accent)

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] text-ink-100">{label}</span>
        <span className="mt-0.5 block text-[10px] leading-snug text-ink-500">{hint}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[10px] text-ink-300 tabular-nums">
          {Math.round(value * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          className={`focus-ring h-1.5 w-20 cursor-pointer rounded-full bg-white/12 ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
          style={{ accentColor: tint }}
        />
      </span>
    </div>
  )
}

export function SettingsApp() {
  const accent = useSettings((state) => state.accent)
  const blooms = useSettings((state) => state.blooms)
  const reduceMotion = useSettings((state) => state.reduceMotion)
  const showCelsius = useSettings((state) => state.showCelsius)
  const clock24h = useSettings((state) => state.clock24h)
  const soundEnabled = useSettings((state) => state.soundEnabled)
  const soundVolume = useSettings((state) => state.soundVolume)
  const setAccent = useSettings((state) => state.setAccent)
  const setBlooms = useSettings((state) => state.setBlooms)
  const setReduceMotion = useSettings((state) => state.setReduceMotion)
  const setShowCelsius = useSettings((state) => state.setShowCelsius)
  const setClock24h = useSettings((state) => state.setClock24h)
  const setSoundEnabled = useSettings((state) => state.setSoundEnabled)
  const setSoundVolume = useSettings((state) => state.setSoundVolume)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-3">
        <Section
          icon={Palette}
          title="Accent"
          meta={<span style={{ color: 'var(--color-accent)' }}>{accent}</span>}
        >
          <div className="grid grid-cols-5 gap-1.5">
            {ACCENT_PRESETS.map((preset) => {
              const selected = preset.name === accent

              return (
                <button
                  key={preset.name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAccent(preset.name)}
                  className={`focus-ring flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-1.5 transition-colors ${
                    selected
                      ? 'border-white/30 bg-white/10'
                      : 'border-white/8 bg-white/3 hover:bg-white/6'
                  }`}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-black/20"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {selected ? <Check size={12} strokeWidth={3} className="text-ink-950" /> : null}
                  </span>
                  <span className="w-full truncate text-center text-[9px] text-ink-300">
                    {preset.name}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>

        <Section icon={Flower2} title="Wallpaper" meta={blooms ? '4 blooms' : 'plain'}>
          <Toggle
            label="Background blooms"
            hint="Four coloured glows drifting behind the desktop"
            checked={blooms}
            onChange={setBlooms}
          />
        </Section>

        <Section icon={Sparkles} title="Motion">
          <Toggle
            label="Reduce motion"
            hint="Hold window and widget animation still"
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </Section>

        <Section icon={Volume2} title="Sound" meta={soundEnabled ? 'active' : 'muted'}>
          <Toggle
            label="Interface sounds"
            hint="Clicks, key ticks and window chimes"
            checked={soundEnabled}
            onChange={(next) => {
              setSoundEnabled(next)
              if (next) playClick()
            }}
          />
          <Slider
            label="Volume"
            hint="Master level for every sound"
            value={soundVolume}
            disabled={!soundEnabled}
            onChange={setSoundVolume}
          />
        </Section>

        <Section icon={Clock} title="Clock and units">
          <Toggle
            label="24 hour clock"
            hint="Show 18:00 instead of 6:00 PM"
            checked={clock24h}
            onChange={setClock24h}
          />
          <Toggle
            label="Celsius"
            hint="Report temperatures in °C instead of °F"
            checked={showCelsius}
            onChange={setShowCelsius}
          />
        </Section>
      </div>
    </div>
  )
}

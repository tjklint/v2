import { Code, Copy, Cpu, Globe, Heart, Mail, Package, Users, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

const OS_NAME = 'TJOS'
const PACKAGE = 'tjklint-portfolio'
const VERSION = '0.1.0'
const POKES = 5
const EGG_LINE = 'No serial number, no activation, no updater — it runs in this tab.'
const UNAVAILABLE = 'unavailable'

type NavigatorHints = {
  deviceMemory?: number
  userAgentData?: { platform?: string }
}

type Facts = {
  platform: string | null
  browser: string | null
  cores: number | null
  deviceMemory: number | null
  pixelRatio: number | null
  screen: string
  language: string | null
  timeZone: string | null
}

type Contact = {
  label: string
  kind: string
  value: string
  Icon: LucideIcon
}

type Copied = {
  label: string
  ok: boolean
}

type Package = {
  name: string
  version: string
}

type SectionProps = {
  icon: LucideIcon
  title: string
  meta?: string
  children: ReactNode
}

type RowProps = {
  label: string
  value: string | null
  tone?: string
}

type PackageListProps = {
  label: string
  first?: boolean
  items: readonly Package[]
}

const PLATFORMS: [RegExp, string][] = [
  [/windows/i, 'Windows'],
  [/mac os x|macintosh/i, 'macOS'],
  [/android/i, 'Android'],
  [/iphone|ipad|ipod/i, 'iOS'],
  [/cros/i, 'ChromeOS'],
  [/linux|x11/i, 'Linux'],
]

const ENGINES: [RegExp, string][] = [
  [/edg\//i, 'Edge'],
  [/opr\/|opera/i, 'Opera'],
  [/firefox\//i, 'Firefox'],
  [/chrome\/|crios\//i, 'Chrome'],
  [/safari\//i, 'Safari'],
]

const CONTACTS: readonly Contact[] = [
  { label: 'GitHub', kind: 'link', value: 'https://github.com/tjklint', Icon: Code },
  {
    label: 'LinkedIn',
    kind: 'profile',
    value: 'https://www.linkedin.com/in/timothy-klint/',
    Icon: Users,
  },
  { label: 'Email', kind: 'address', value: 'timothyjklint@gmail.com', Icon: Mail },
]

const RUNTIME: readonly Package[] = [
  { name: '@fontsource-variable/inter', version: '^5.3.0' },
  { name: '@fontsource/press-start-2p', version: '^5.3.0' },
  { name: 'lucide-react', version: '1.48.0' },
  { name: 'react', version: '^19.3.0' },
  { name: 'react-dom', version: '^19.3.0' },
  { name: 'react-draggable', version: '4.7.2' },
  { name: 'zustand', version: '5.0.15' },
]

const TOOLING: readonly Package[] = [
  { name: '@tailwindcss/vite', version: '4.3.3' },
  { name: '@types/react', version: '^19.3.0' },
  { name: '@types/react-dom', version: '^19.3.0' },
  { name: '@vitejs/plugin-react', version: '^4.3.4' },
  { name: 'oxfmt', version: '0.70.0' },
  { name: 'oxlint', version: '1.85.0' },
  { name: 'tailwindcss', version: '4.3.3' },
  { name: 'typescript', version: '^7.0.2' },
  { name: 'vite', version: '^6.0.11' },
]

const positive = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null

const readFacts = (): Facts => {
  const hints = navigator as Navigator & NavigatorHints
  const timeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null
    } catch {
      return null
    }
  })()

  return {
    platform:
      hints.userAgentData?.platform ??
      PLATFORMS.find(([pattern]) => pattern.test(navigator.userAgent))?.[1] ??
      (navigator.platform || null),
    browser: ENGINES.find(([pattern]) => pattern.test(navigator.userAgent))?.[1] ?? null,
    cores: positive(navigator.hardwareConcurrency),
    deviceMemory: positive(hints.deviceMemory),
    pixelRatio: positive(window.devicePixelRatio),
    screen: `${window.screen.width} × ${window.screen.height}`,
    language: navigator.language || (navigator.languages?.[0] ?? null),
    timeZone,
  }
}

const writeClipboard = async (value: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !('clipboard' in navigator)) return false

  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

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

const Row = ({ label, value, tone }: RowProps) => (
  <div className="flex items-baseline justify-between gap-3 py-[3px]">
    <dt className="truncate text-[10px] text-ink-500">{label}</dt>
    <dd className="min-w-0 truncate text-right font-mono text-[11px] tabular-nums">
      {value === null || value === '' ? (
        <span className="text-ink-500">{UNAVAILABLE}</span>
      ) : (
        <span className={tone ?? 'text-ink-100'}>{value}</span>
      )}
    </dd>
  </div>
)

const PackageList = ({ label, first = false, items }: PackageListProps) => (
  <div className={first ? undefined : 'mt-2'}>
    <p className="mb-1 text-[9px] tracking-[0.1em] text-ink-500 uppercase">{label}</p>
    <ul className="grid grid-cols-2 gap-1">
      {items.map((item) => (
        <li
          key={item.name}
          className="min-w-0 rounded-md border border-white/8 bg-white/4 px-1.5 py-1"
        >
          <span className="block truncate font-mono text-[10px] text-ink-100">{item.name}</span>
          <span className="block font-mono text-[9px] text-ink-500 tabular-nums">
            {item.version}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

export function AboutApp() {
  const [facts] = useState(readFacts)
  const [viewport, setViewport] = useState(() => `${window.innerWidth} × ${window.innerHeight}`)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [pokes, setPokes] = useState(0)
  const [copied, setCopied] = useState<Copied | null>(null)

  const found = pokes >= POKES

  useEffect(() => {
    const resize = () => setViewport(`${window.innerWidth} × ${window.innerHeight}`)
    const connect = () => setOnline(true)
    const disconnect = () => setOnline(false)

    window.addEventListener('resize', resize)
    window.addEventListener('online', connect)
    window.addEventListener('offline', disconnect)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('online', connect)
      window.removeEventListener('offline', disconnect)
    }
  }, [])

  const copy = useCallback((label: string, value: string) => {
    setCopied(null)
    writeClipboard(value).then((ok) => setCopied({ label, ok }))
  }, [])

  return (
    <div className="h-full overflow-y-auto overscroll-contain px-3 py-3">
      <header className="rounded-panel border border-white/8 bg-white/3 p-3">
        <h3 className="font-pixel text-[17px] leading-none tracking-[0.15em] text-ink-100 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)]">
          {OS_NAME}
        </h3>
        <p className="mt-2.5 text-[11px] leading-snug text-ink-300">
          A desktop metaphor served as static files and rendered in your browser. One tab, no
          install, no account.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            onClick={() => setPokes((count) => Math.min(count + 1, POKES))}
            title="Poke the version number"
            className="focus-ring rounded-md border border-white/10 bg-white/6 px-1.5 py-0.5 font-mono text-[10px] text-ink-300 tabular-nums transition-colors hover:bg-white/12 hover:text-ink-100"
          >
            version {VERSION}
          </button>
          <span className="font-mono text-[9px] text-ink-500">{PACKAGE}</span>
        </div>
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 min-h-[32px] text-[10px] leading-4 text-ink-300 transition-opacity duration-200 ${
            found ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {found ? EGG_LINE : ''}
        </p>
      </header>

      <Section icon={Cpu} title="System" meta="measured in this tab">
        <dl>
          <Row label="Platform" value={facts.platform} />
          <Row label="Browser" value={facts.browser} />
          <Row
            label="Logical processors"
            value={facts.cores === null ? null : `${facts.cores} threads`}
          />
          <Row
            label="Device memory"
            value={facts.deviceMemory === null ? null : `${facts.deviceMemory} GB`}
          />
          <Row
            label="Pixel ratio"
            value={facts.pixelRatio === null ? null : `${facts.pixelRatio}×`}
          />
          <Row label="Screen" value={`${facts.screen} px`} />
          <Row label="Viewport" value={`${viewport} px`} />
          <Row label="Language" value={facts.language} />
          <Row label="Time zone" value={facts.timeZone} />
          <Row
            label="Network"
            value={online ? 'online' : 'offline'}
            tone={online ? 'text-ink-100' : 'text-amber-bloom'}
          />
        </dl>
      </Section>

      <Section
        icon={Package}
        title="Dependencies"
        meta={`${RUNTIME.length} runtime · ${TOOLING.length} tooling`}
      >
        <PackageList label="Shipped to the browser" first items={RUNTIME} />
        <PackageList label="Build and type tooling" items={TOOLING} />
      </Section>

      <Section icon={Heart} title="Credits">
        <p className="text-[11px] leading-relaxed text-ink-300">
          TJOS is the portfolio of <span className="text-ink-100">TJ Klint</span> — software
          engineer at Planned, Montreal, Quebec. Windows, shell and games are React, TypeScript and
          Tailwind, published as static files and measured live in the sheet above.
        </p>
        <dl className="mt-1.5 border-t border-white/8 pt-1">
          <Row label="Author" value="TJ Klint" />
          <Row label="Licence" value="MIT" />
          <Row label="Served from" value="tjklint.github.io" />
        </dl>
      </Section>

      <Section icon={Globe} title="Contact" meta="copies, never opens">
        <ul className="space-y-1">
          {CONTACTS.map((contact) => (
            <li
              key={contact.label}
              className="flex items-center gap-2 rounded-md border border-white/8 bg-white/4 px-2 py-1.5"
            >
              <contact.Icon size={12} strokeWidth={2} className="shrink-0 text-ink-500" />
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] tracking-[0.1em] text-ink-500 uppercase">
                  {contact.label}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] break-all text-ink-100 select-all">
                  {contact.value}
                </span>
              </span>
              <button
                type="button"
                onClick={() => copy(contact.label, contact.value)}
                aria-label={`Copy the ${contact.label} ${contact.kind}`}
                className="focus-ring shrink-0 rounded-md p-1 text-ink-300 transition-colors hover:bg-white/10 hover:text-ink-100"
              >
                <Copy size={12} strokeWidth={2.25} />
              </button>
            </li>
          ))}
        </ul>
        <p
          role="status"
          aria-live="polite"
          className="mt-1.5 min-h-[16px] text-[10px] leading-4 text-ink-300"
        >
          {copied === null
            ? ''
            : copied.ok
              ? `${copied.label} copied to the clipboard`
              : 'Copy blocked — select the text instead'}
        </p>
      </Section>
    </div>
  )
}

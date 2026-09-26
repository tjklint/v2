const BLOOMS = [
  { color: 'var(--color-violet-bloom)', top: '-12%', left: '8%', size: '58vmax' },
  { color: 'var(--color-cyan-bloom)', top: '22%', left: '58%', size: '46vmax' },
  { color: 'var(--color-coral-bloom)', top: '62%', left: '18%', size: '42vmax' },
  { color: 'var(--color-amber-bloom)', top: '68%', left: '72%', size: '38vmax' },
] as const

export function Wallpaper() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      {BLOOMS.map((bloom) => (
        <div
          key={bloom.color}
          className="absolute rounded-full opacity-60 blur-[120px] will-change-transform"
          style={{
            background: bloom.color,
            top: bloom.top,
            left: bloom.left,
            width: bloom.size,
            height: bloom.size,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-b from-ink-950/40 via-transparent to-ink-950/80" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--color-white)_1px,transparent_1px),linear-gradient(90deg,var(--color-white)_1px,transparent_1px)] [background-size:64px_64px]" />
    </div>
  )
}

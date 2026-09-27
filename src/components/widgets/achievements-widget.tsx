import { Check, Lock, Trophy } from 'lucide-react'

import { ACHIEVEMENTS, isUnlocked, progress, useAchievements } from '../../store/achievements'
import { WidgetPanel } from './widget-panel'

const LABEL = 'Achievements'

const unlockedOn = (at: string) => {
  const date = new Date(at)
  if (Number.isNaN(date.getTime())) return 'unlocked'
  return `unlocked ${date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`
}

export function AchievementsWidget() {
  const unlocks = useAchievements((state) => state.unlocks)
  const { unlocked, total, ratio } = progress(unlocks)

  return (
    <WidgetPanel
      label={LABEL}
      title={
        <span className="flex items-center gap-1.5">
          <Trophy size={11} strokeWidth={2.25} aria-hidden className="text-ink-500" />
          Achievements
        </span>
      }
      meta={
        <>
          <span className="text-ink-100">{unlocked}</span> of {total}
        </>
      }
    >
      <div
        role="meter"
        aria-label="Achievements unlocked"
        aria-valuenow={unlocked}
        aria-valuemin={0}
        aria-valuemax={total}
        className="mb-3 h-1 shrink-0 overflow-hidden rounded-full bg-white/12"
      >
        <div
          style={{ width: `${unlocked === 0 ? 0 : Math.max(ratio * 100, 3)}%` }}
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
        />
      </div>

      <ul className="flex shrink-0 flex-col gap-1.5">
        {ACHIEVEMENTS.map((achievement) => {
          const at = unlocks[achievement.id]
          const open = isUnlocked(unlocks, achievement.id)

          return (
            <li key={achievement.id} className="flex items-start gap-2">
              <span
                aria-hidden
                className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                  open
                    ? 'border-accent/60 bg-accent/15 text-ink-100'
                    : 'border-white/10 bg-white/4 text-ink-500'
                }`}
              >
                {open ? <Check size={10} strokeWidth={3} /> : <Lock size={9} strokeWidth={2.5} />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[11px] leading-tight ${
                    open ? 'text-ink-100' : 'text-ink-300'
                  }`}
                >
                  {achievement.title}
                </span>
                <span className="block truncate text-[9px] leading-tight text-ink-500">
                  {open && at ? unlockedOn(at) : achievement.hint}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </WidgetPanel>
  )
}

import { AchievementsWidget } from './achievements-widget'
import { CalendarWidget } from './calendar-widget'
import { ContributionsWidget } from './contributions-widget'
import { SpeakingWidget } from './speaking-widget'
import { StreakWidget } from './streak-widget'
import { WeekdayWidget } from './weekday-widget'

export function WidgetLayer() {
  return (
    <>
      <div className="pointer-events-none absolute top-[68px] left-0 z-20 px-6">
        <div className="pointer-events-auto">
          <CalendarWidget />
        </div>
      </div>

      <div className="pointer-events-none absolute top-[68px] right-0 z-20 flex max-h-[calc(100dvh-9.75rem)] w-[24rem] max-w-[calc(100vw-3rem)] flex-col gap-6 overflow-y-auto px-6">
        <div className="pointer-events-auto flex shrink-0 flex-col">
          <ContributionsWidget />
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col">
          <StreakWidget />
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col">
          <WeekdayWidget />
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col">
          <AchievementsWidget />
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col">
          <SpeakingWidget />
        </div>
      </div>
    </>
  )
}

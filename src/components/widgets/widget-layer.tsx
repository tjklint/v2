import { CalendarWidget } from './calendar-widget'
import { ContributionsWidget } from './contributions-widget'
import { SpeakingWidget } from './speaking-widget'

export function WidgetLayer() {
  return (
    <>
      <div className="pointer-events-none absolute top-[68px] left-0 z-20 px-6">
        <div className="pointer-events-auto">
          <CalendarWidget />
        </div>
      </div>

      <div className="pointer-events-none absolute top-[68px] right-0 bottom-[88px] z-20 flex w-1/2 flex-col items-stretch justify-between gap-6 overflow-y-auto px-6">
        <div className="pointer-events-auto shrink-0">
          <ContributionsWidget />
        </div>
        <div className="pointer-events-auto shrink-0">
          <SpeakingWidget />
        </div>
      </div>
    </>
  )
}

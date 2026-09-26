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

      <div className="pointer-events-none absolute top-[68px] right-0 bottom-[88px] z-20 flex flex-col items-end justify-between gap-6 px-6">
        <div className="pointer-events-auto">
          <ContributionsWidget />
        </div>
        <div className="pointer-events-auto">
          <SpeakingWidget />
        </div>
      </div>
    </>
  )
}

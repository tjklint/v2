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

      <div className="pointer-events-none absolute top-[68px] right-0 bottom-[88px] z-20 flex w-[24rem] max-w-[calc(100vw-3rem)] flex-col gap-6 overflow-y-auto px-6">
        <div className="pointer-events-auto flex min-h-0 flex-[1_0_18rem] flex-col">
          <ContributionsWidget />
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col">
          <SpeakingWidget />
        </div>
      </div>
    </>
  )
}

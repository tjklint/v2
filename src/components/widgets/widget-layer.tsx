import { CalendarWidget } from './calendar-widget'

export function WidgetLayer() {
  return (
    <div className="pointer-events-none absolute top-[60px] left-0 z-20 flex flex-col items-start gap-2.5 px-6">
      <div className="pointer-events-auto flex flex-col gap-2.5">
        <CalendarWidget />
      </div>
    </div>
  )
}

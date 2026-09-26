const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear()

const buildMonth = (today: Date) => {
  const year = today.getFullYear()
  const month = today.getMonth()
  const first = new Date(year, month, 1)
  const offset = first.getDay()
  const days = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= days; day += 1) cells.push(day)

  while (cells.length % 7 !== 0) cells.push(null)

  return {
    label: `${MONTHS[month]} ${year}`,
    weeks: Array.from({ length: cells.length / 7 }, (_, index) =>
      cells.slice(index * 7, index * 7 + 7),
    ),
  }
}

export function CalendarWidget() {
  const today = new Date()
  const { label, weeks } = buildMonth(today)

  return (
    <section aria-label="Calendar" className="glass w-56 rounded-panel px-4 py-3">
      <header className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[13px] font-medium text-ink-100">{label}</h2>
        <span className="text-[10px] text-ink-500 tabular-nums">
          {today.toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric' })}
        </span>
      </header>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {WEEKDAYS.map((day, index) => (
          <span key={index} className="pb-1 text-[9px] text-ink-500">
            {day}
          </span>
        ))}
        {weeks.map((week, index) => (
          <div key={index} className="col-span-7 grid grid-cols-7">
            {week.map((day, position) => {
              if (day === null) return <span key={position} className="h-6" />

              const isToday = sameDay(new Date(today.getFullYear(), today.getMonth(), day), today)

              return (
                <span
                  key={position}
                  className={`flex h-6 items-center justify-center text-[10px] tabular-nums ${
                    isToday ? 'rounded-md bg-ink-100 font-medium text-ink-950' : 'text-ink-300'
                  }`}
                >
                  {day}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

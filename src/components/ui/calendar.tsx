import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// A tiny, fully-themed month calendar (no external dep) so the picker follows
// the app palette instead of the browser's native date-input chrome.

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

interface CalendarProps {
  /** currently selected date */
  value: Date
  /** earliest selectable day (inclusive); earlier days are disabled */
  min?: Date
  /** first-of-month of the displayed month (controlled) */
  month: Date
  onMonthChange: (month: Date) => void
  onSelect: (date: Date) => void
}

export function Calendar({ value, min, month, onMonthChange, onSelect }: CalendarProps) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstWeekday = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const minDay = min ? startOfDay(min) : null

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const navBtn =
    'hover:bg-muted flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors'

  return (
    <div className="w-64 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" className={navBtn} onClick={() => onMonthChange(new Date(year, m - 1, 1))}>
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-foreground text-sm font-medium">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" aria-label="Next month" className={navBtn} onClick={() => onMonthChange(new Date(year, m + 1, 1))}>
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-muted-foreground text-center text-[11px] font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />
          const date = new Date(year, m, d)
          const disabled = minDay ? startOfDay(date).getTime() < minDay.getTime() : false
          const selected = sameDay(date, value)
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={cn(
                'flex size-8 items-center justify-center rounded-md text-sm transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : disabled
                    ? 'text-faint cursor-not-allowed opacity-40'
                    : 'hover:bg-muted cursor-pointer',
              )}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

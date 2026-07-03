import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

// Stage 7 (micro-interaction). Quick-select chips (+1d / +7d / +30d) or a
// themed calendar. Rendered only while extending, so state is fresh each open.

const DAY = 24 * 60 * 60 * 1000

const firstOfMonth = (ms: number) => {
  const d = new Date(ms)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
// Expire at the end of the chosen day, so "today" stays in the future.
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime()

interface Props {
  currentExpiresAt: number
  onCancel: () => void
  onConfirm: (newExpiresAt: number) => void
}

export function ExtendExpiryModal({ currentExpiresAt, onCancel, onConfirm }: Props) {
  // Capture "now" once on open so render stays pure (React 19 purity rule).
  const [now] = useState(() => Date.now())
  const base = Math.max(currentExpiresAt, now)
  const [target, setTarget] = useState<number>(base + 7 * DAY)
  const [viewMonth, setViewMonth] = useState<Date>(() => firstOfMonth(base + 7 * DAY))
  const [showCal, setShowCal] = useState(false)

  const quick = [
    { label: '+1 day', value: base + 1 * DAY },
    { label: '+7 days', value: base + 7 * DAY },
    { label: '+30 days', value: base + 30 * DAY },
  ]

  const pickQuick = (value: number) => {
    setTarget(value)
    setViewMonth(firstOfMonth(value))
    setShowCal(false)
  }

  const dateLabel = new Date(target).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Extend expiry</DialogTitle>
          <DialogDescription className="font-sans">
            Choose a new expiry date for this transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {quick.map((q) => (
            <Button
              key={q.label}
              type="button"
              variant={target === q.value ? 'default' : 'outline'}
              onClick={() => pickQuick(q.value)}
              className="flex-1"
            >
              {q.label}
            </Button>
          ))}
        </div>

        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs">Or pick a date</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCal((s) => !s)}
              aria-expanded={showCal}
              className="border-input bg-background hover:bg-muted flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-3 text-left text-sm shadow-xs transition-colors"
            >
              <CalendarDays className="text-muted-foreground size-4 shrink-0" />
              <span className="text-foreground flex-1">{dateLabel}</span>
            </button>

            {/* Floats above the trigger so it doesn't push the modal open;
                absolute → the box shrinks to the calendar's width. */}
            {showCal && (
              <div className="bg-popover absolute bottom-full left-0 z-50 mb-2 rounded-md border shadow-lg">
                <Calendar
                  value={new Date(target)}
                  min={new Date(now)}
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  onSelect={(d) => {
                    setTarget(endOfDay(d))
                    setShowCal(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onConfirm(target)}>
            Extend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

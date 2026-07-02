import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Stage 7 (micro-interaction). Quick-select chips (+1d / +7d / +30d) or a date
// input. Rendered only while extending, so internal state is fresh each open.

const DAY = 24 * 60 * 60 * 1000

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

  const quick = [
    { label: '+1 day', value: base + 1 * DAY },
    { label: '+7 days', value: base + 7 * DAY },
    { label: '+30 days', value: base + 30 * DAY },
  ]

  const asDateInput = (ms: number) => new Date(ms).toISOString().slice(0, 10)

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
              onClick={() => setTarget(q.value)}
              className={cn('flex-1')}
            >
              {q.label}
            </Button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expiry-date" className="text-muted-foreground text-xs">
            Or pick a date
          </Label>
          <Input
            id="expiry-date"
            type="date"
            value={asDateInput(target)}
            min={asDateInput(now)}
            onChange={(e) => setTarget(new Date(e.target.value).getTime())}
          />
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

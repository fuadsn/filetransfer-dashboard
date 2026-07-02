import { useState } from 'react'

// Stage 7 (micro-interaction). Quick-select chips (+1d / +7d) or a date input.
// Scaffolded and functional; polish the transitions / validation as time allows.

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

  // yyyy-MM-dd for the date input
  const asDateInput = (ms: number) => new Date(ms).toISOString().slice(0, 10)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-ink">Extend expiry</h3>
        <p className="mt-1 text-sm text-muted">Choose a new expiry date for this transfer.</p>

        <div className="mt-4 flex gap-2">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => setTarget(q.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                target === q.value
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border text-muted hover:bg-surface-2'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-muted">
          Or pick a date
          <input
            type="date"
            value={asDateInput(target)}
            min={asDateInput(now)}
            onChange={(e) => setTarget(new Date(e.target.value).getTime())}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(target)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Extend
          </button>
        </div>
      </div>
    </div>
  )
}

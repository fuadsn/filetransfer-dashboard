import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { attentionReasons } from '../lib/attention'
import { relativeExpiry } from '../lib/format'
import { Avatar } from './Avatar'

// The differentiating feature: a distinct grouped section, not a buried badge.
// Visually warm but not loud — a calm "here's what to look at" panel.

interface Props {
  transfers: Transfer[]
  onOpen: (id: string) => void
}

export function NeedsAttentionSection({ transfers, onOpen }: Props) {
  const flagged = transfers
    .map((t) => ({ transfer: t, reasons: attentionReasons(t) }))
    .filter((x) => x.reasons.length > 0)

  if (flagged.length === 0) return null

  return (
    <section className="mb-6 rounded-xl border border-attention-border bg-attention-soft p-4">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-attention">⚠</span>
        <h2 className="text-sm font-semibold text-attention">
          Needs attention · {flagged.length}
        </h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {flagged.map(({ transfer, reasons }) => {
          const sender = memberById(transfer.senderId)
          return (
            <button
              key={transfer.id}
              type="button"
              onClick={() => onOpen(transfer.id)}
              className="flex items-start gap-3 rounded-lg border border-attention-border/60 bg-surface p-3 text-left transition-shadow hover:shadow-sm"
            >
              <Avatar member={sender} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{transfer.title}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {reasons.map((r) => (
                    <span
                      key={r.kind}
                      className="rounded-full bg-attention-soft px-2 py-0.5 text-[11px] font-medium text-attention"
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted">{relativeExpiry(transfer.expiresAt)}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

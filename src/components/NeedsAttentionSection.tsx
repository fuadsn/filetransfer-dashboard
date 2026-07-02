import { AlertTriangle } from 'lucide-react'
import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { attentionReasons } from '../lib/attention'
import { expiryLabel } from '../lib/format'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'

// The differentiating feature: a distinct grouped section, not a buried badge.
// Warm amber (blue's complement) — noticeable but not loud.

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
    <section className="border-attention-border bg-attention-soft mb-6 rounded-xl border p-4">
      <div className="text-attention mb-3 flex items-center gap-2 px-1">
        <AlertTriangle className="size-4" />
        <h2 className="text-sm font-semibold">Needs attention · {flagged.length}</h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {flagged.map(({ transfer, reasons }) => {
          const sender = memberById(transfer.senderId)
          return (
            <button
              key={transfer.id}
              type="button"
              onClick={() => onOpen(transfer.id)}
              className={cn(
                'border-attention-border/60 bg-card flex items-start gap-3 rounded-lg border p-3 text-left transition-shadow hover:shadow-sm',
                'focus-visible:ring-ring outline-none focus-visible:ring-2',
              )}
            >
              <Avatar member={sender} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-foreground font-title truncate text-sm font-semibold">
                  {transfer.title}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {reasons.map((r) => (
                    <Badge
                      key={r.kind}
                      variant="outline"
                      className="bg-attention-soft text-attention border-transparent text-[11px] font-medium"
                    >
                      {r.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                {expiryLabel(transfer)}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

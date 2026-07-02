import { AlertTriangle, PanelLeftClose } from 'lucide-react'
import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { attentionReasons } from '../lib/attention'
import { expiryLabel } from '../lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'

interface Props {
  transfers: Transfer[]
  open: boolean
  onToggle: () => void
  onOpen: (id: string) => void
}

// Collapsible left sidebar: brand + the "Needs attention" panel. Inline on
// large screens (width collapses), an overlay drawer on small ones.
export function Sidebar({ transfers, open, onToggle, onOpen }: Props) {
  const flagged = transfers
    .map((t) => ({ transfer: t, reasons: attentionReasons(t) }))
    .filter((x) => x.reasons.length > 0)

  return (
    <aside
      className={cn(
        'bg-card border-border z-40 flex flex-col',
        // mobile: fixed overlay drawer
        'fixed inset-y-0 left-0 w-80 border-r transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full',
        // desktop: sticky in-flow, collapse by width
        'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:transition-[width] lg:duration-200',
        open ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden lg:border-r-0',
      )}
    >
      <div className="flex h-full w-80 flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="min-w-0">
            <div className="font-title text-foreground truncate font-semibold">
              Team Cloud
            </div>
            <div className="text-muted-foreground text-xs">Workspace</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Collapse sidebar">
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="text-attention mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4" />
            <h2 className="text-sm font-semibold">Needs attention · {flagged.length}</h2>
          </div>

          {flagged.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing needs attention right now — you're all caught up.
            </p>
          ) : (
            <div className="space-y-2">
              {flagged.map(({ transfer, reasons }) => {
                const sender = memberById(transfer.senderId)
                return (
                  <button
                    key={transfer.id}
                    type="button"
                    onClick={() => onOpen(transfer.id)}
                    className="border-attention-border/60 bg-attention-soft/40 hover:bg-attention-soft focus-visible:ring-ring block w-full rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar member={sender} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground font-title truncate text-sm font-semibold">
                          {transfer.title}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-xs">
                          {expiryLabel(transfer)}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {reasons.map((r) => (
                            <Badge
                              key={r.kind}
                              variant="outline"
                              className="bg-attention-soft text-attention border-transparent text-[10px]"
                            >
                              {r.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

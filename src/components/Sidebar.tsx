import { Fragment } from 'react'
import { AlertTriangle, PanelRightClose, Star } from 'lucide-react'
import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { attentionReasons } from '../lib/attention'
import { expiryLabel } from '../lib/format'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'
import { AttentionSkeleton } from './States'

interface Props {
  transfers: Transfer[]
  open: boolean
  loading: boolean
  onToggle: () => void
  onOpen: (id: string) => void
}

// Collapsible left sidebar: brand + the "Needs attention" panel. Inline on
// large screens (width collapses), an overlay drawer on small ones.
// A post-disable access attempt is a security red flag — it outranks any
// time-based urgency.
const isCritical = (reasons: ReturnType<typeof attentionReasons>) =>
  reasons.some((r) => r.kind === 'denied_after_disable')

export function Sidebar({ transfers, open, loading, onToggle, onOpen }: Props) {
  const flagged = transfers
    .map((t) => ({ transfer: t, reasons: attentionReasons(t) }))
    .filter((x) => x.reasons.length > 0)
    // Critical (security) first, then most-imminent expiry — an attention feed
    // surfaces the biggest emergencies at the top.
    .sort((a, b) => {
      const ca = isCritical(a.reasons) ? 0 : 1
      const cb = isCritical(b.reasons) ? 0 : 1
      if (ca !== cb) return ca - cb
      return a.transfer.expiresAt - b.transfer.expiresAt
    })

  return (
    <aside
      className={cn(
        'bg-card border-border z-40 flex flex-col',
        // mobile: fixed overlay drawer on the right
        'fixed inset-y-0 right-0 w-80 border-l transition-transform duration-200',
        open ? 'translate-x-0' : 'translate-x-full',
        // desktop: sticky in-flow, collapse by width
        'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:transition-[width] lg:duration-200',
        open ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden lg:border-l-0',
      )}
    >
      <div className="flex h-full w-80 flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="min-w-0">
            {loading ? (
              <div className="space-y-1.5 py-0.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : (
              <>
                <div className="font-title text-foreground truncate font-semibold">
                  Team Cloud
                </div>
                <div className="text-muted-foreground text-xs">Workspace</div>
              </>
            )}
          </div>
          {loading ? (
            <Skeleton className="size-9 rounded-md" />
          ) : (
            <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Collapse sidebar">
              <PanelRightClose className="size-4" />
            </Button>
          )}
        </div>

        <Separator />

        {/* Section header — its own banded compartment, divided from the list */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          {loading ? (
            <>
              <Skeleton className="size-4 shrink-0 rounded" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="ml-auto h-5 w-6 rounded-full" />
            </>
          ) : (
            <>
              <AlertTriangle className="text-attention size-4 shrink-0" />
              <h2 className="text-foreground text-sm font-semibold">Needs attention</h2>
              <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                {flagged.length}
              </span>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? (
            <AttentionSkeleton />
          ) : flagged.length === 0 ? (
            <p className="text-muted-foreground px-1 pt-1 text-sm">
              Nothing needs attention right now — you're all caught up.
            </p>
          ) : (
            <div className="divide-border divide-y">
              {flagged.map(({ transfer, reasons }) => {
                const sender = memberById(transfer.senderId)
                const expiry = expiryLabel(transfer)
                const critical = isCritical(reasons)
                return (
                  <button
                    key={transfer.id}
                    type="button"
                    onClick={() => onOpen(transfer.id)}
                    className={cn(
                      'hover:bg-muted focus-visible:ring-ring block w-full border-l-2 px-2.5 py-3 text-left transition-colors outline-none focus-visible:ring-2',
                      // critical (security) rows carry a red accent bar
                      critical ? 'border-destructive' : 'border-transparent',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* avatar + carried-over star (favorited context) */}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <Avatar member={sender} size={26} />
                        {transfer.favorited && (
                          <Star className="text-expiring size-3 fill-current" aria-label="Starred" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground font-title truncate text-sm font-medium">
                          {transfer.title}
                        </div>
                        {/* date + reasons share a line when they fit; the whole
                            reason group drops to its own line rather than
                            breaking mid-group. Date muted; critical reason red. */}
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
                          {expiry !== '—' && (
                            <span className="text-muted-foreground whitespace-nowrap">{expiry}</span>
                          )}
                          {reasons.length > 0 && (
                            <span>
                              {reasons.map((r, i) => (
                                <Fragment key={r.kind}>
                                  {i > 0 && <span className="text-faint"> · </span>}
                                  <span
                                    className={cn(
                                      r.kind === 'denied_after_disable'
                                        ? 'text-destructive font-semibold'
                                        : 'text-attention',
                                    )}
                                  >
                                    {r.label}
                                  </span>
                                </Fragment>
                              ))}
                            </span>
                          )}
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

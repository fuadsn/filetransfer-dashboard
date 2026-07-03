import { Fragment } from 'react'
import { AlertTriangle, ShieldAlert, Star } from 'lucide-react'
import type { Transfer } from '../types'
import type { AttentionReason } from '../lib/attention'
import { attentionReasons } from '../lib/attention'
import { memberById } from '../data/mockData'
import { expiryLabel } from '../lib/format'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'
import { AttentionSkeleton } from './States'

// Platform-aware modifier symbol for the collapse-shortcut hint.
const MOD_KEY =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent) ? '⌘' : 'Ctrl'

interface Props {
  transfers: Transfer[]
  open: boolean
  loading: boolean
  onToggle: () => void
  onOpen: (id: string) => void
}

interface Flagged {
  transfer: Transfer
  reasons: AttentionReason[]
}

// Critical (security) reasons get their own section above the time-based ones.
const isCritical = (reasons: AttentionReason[]) => reasons.some((r) => r.severity === 'critical')

const bySoonestExpiry = (a: Flagged, b: Flagged) => a.transfer.expiresAt - b.transfer.expiresAt

export function Sidebar({ transfers, open, loading, onToggle, onOpen }: Props) {
  const flagged: Flagged[] = transfers
    .map((t) => ({ transfer: t, reasons: attentionReasons(t) }))
    .filter((x) => x.reasons.length > 0)

  const critical = flagged.filter((x) => isCritical(x.reasons)).sort(bySoonestExpiry)
  const attention = flagged.filter((x) => !isCritical(x.reasons)).sort(bySoonestExpiry)

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
        <div className="min-w-0 px-4 py-4">
          {loading ? (
            <div className="space-y-1.5 py-0.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : (
            <>
              <div className="font-title text-foreground truncate font-semibold">Team Cloud</div>
              <div className="text-muted-foreground text-xs">Workspace</div>
            </>
          )}
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <>
              <SectionHeaderSkeleton />
              <div className="p-3">
                <AttentionSkeleton />
              </div>
            </>
          ) : (
            <>
              {/* Security — critical, red scheme, pinned above */}
              {critical.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <ShieldAlert className="text-destructive size-4 shrink-0" />
                    <h2 className="text-foreground text-sm font-semibold">Security</h2>
                    <span className="bg-destructive/15 text-destructive ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                      {critical.length}
                    </span>
                  </div>
                  <div className="divide-border divide-y">
                    {critical.map((f) => (
                      <AttentionItem key={f.transfer.id} flagged={f} onOpen={onOpen} />
                    ))}
                  </div>
                </section>
              )}

              {/* Needs attention — time-based warnings, amber */}
              {attention.length > 0 && (
                <section>
                  <div
                    className={cn(
                      'flex items-center gap-2 border-b px-4 py-3',
                      // top line to separate it from the Security section above
                      critical.length > 0 && 'border-t',
                    )}
                  >
                    <AlertTriangle className="text-attention size-4 shrink-0" />
                    <h2 className="text-foreground text-sm font-semibold">Needs attention</h2>
                    <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                      {attention.length}
                    </span>
                  </div>
                  <div className="divide-border divide-y">
                    {attention.map((f) => (
                      <AttentionItem key={f.transfer.id} flagged={f} onOpen={onOpen} />
                    ))}
                  </div>
                </section>
              )}

              {flagged.length === 0 && (
                <>
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <AlertTriangle className="text-attention size-4 shrink-0" />
                    <h2 className="text-foreground text-sm font-semibold">Needs attention</h2>
                    <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                      0
                    </span>
                  </div>
                  <p className="text-muted-foreground p-4 text-sm">
                    Nothing needs attention right now — you're all caught up.
                  </p>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer — doubles as a collapse control and teaches the shortcut */}
        <button
          type="button"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2 border-t px-4 py-3 text-xs transition-colors"
        >
          <span>Hide sidebar</span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="border-border bg-background rounded border px-1.5 py-0.5 text-[11px] font-medium">
              {MOD_KEY}
            </kbd>
            <kbd className="border-border bg-background rounded border px-1.5 py-0.5 text-[11px] font-medium">
              B
            </kbd>
          </span>
        </button>
      </div>
    </aside>
  )
}

function AttentionItem({ flagged, onOpen }: { flagged: Flagged; onOpen: (id: string) => void }) {
  const { transfer, reasons } = flagged
  const sender = memberById(transfer.senderId)
  const expiry = expiryLabel(transfer)
  return (
    <button
      type="button"
      onClick={() => onOpen(transfer.id)}
      className="hover:bg-muted focus-visible:ring-ring block w-full cursor-pointer px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2"
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
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs">
            {expiry !== '—' && (
              <span className="text-muted-foreground whitespace-nowrap">{expiry}</span>
            )}
            {expiry !== '—' && reasons.length > 0 && <span className="text-faint">·</span>}
            {reasons.length > 0 && (
              <span>
                {reasons.map((r, i) => (
                  <Fragment key={r.kind}>
                    {i > 0 && <span className="text-faint"> · </span>}
                    <span
                      className={r.severity === 'critical' ? 'text-destructive' : 'text-attention'}
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
}

function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center gap-2 border-b px-4 py-3">
      <Skeleton className="size-4 shrink-0 rounded" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="ml-auto h-5 w-6 rounded-full" />
    </div>
  )
}

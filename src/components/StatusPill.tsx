import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

/** Status dot — live statuses (active / expiring) emit a soft ping pulse. */
function StatusDot({ live }: { live: boolean }) {
  return (
    <span className="relative flex size-1.5 items-center justify-center">
      {live && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
      )}
      <span className="relative inline-flex size-1.5 rounded-full bg-current" />
    </span>
  )
}

export function StatusPill({ status }: { status: TransferStatus }) {
  const { label, fg, bg, border, live } = statusMeta(status)
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase',
        fg,
        bg,
        border,
      )}
    >
      <StatusDot live={live} />
      {label}
    </Badge>
  )
}

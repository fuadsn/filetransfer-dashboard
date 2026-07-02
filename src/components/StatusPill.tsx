import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

// `security` = the transfer has a critical (security) issue; the pill goes red
// to flag it, regardless of the underlying time-based status.
export function StatusPill({
  status,
  security = false,
}: {
  status: TransferStatus
  security?: boolean
}) {
  const { label, fg, bg, dot } = statusMeta(status)
  return (
    <Badge
      variant="outline"
      className={cn(
        // Notion-tag look: borderless soft-tint fill, tight radius, medium weight.
        'gap-1.5 rounded border-transparent px-2 py-0.5 text-[11px] font-medium',
        // text + dot (bg-current) share the color; the fill is its soft tint
        security ? 'text-destructive bg-destructive/10' : cn(fg, bg),
      )}
    >
      {/* dot stays solid (the live indicator); label is full-strength in light
          mode to pop, softened only in dark */}
      <span className={cn('inline-flex size-1.5 shrink-0 rounded-full bg-current', dot)} />
      <span className="dark:opacity-80">{label}</span>
    </Badge>
  )
}

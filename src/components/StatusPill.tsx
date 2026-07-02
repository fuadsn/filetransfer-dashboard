import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

export function StatusPill({ status }: { status: TransferStatus }) {
  const { label, fg, bg, dot } = statusMeta(status)
  return (
    <Badge
      variant="outline"
      className={cn(
        // Notion-tag look: borderless soft-tint fill, tight radius, medium weight.
        'gap-1.5 rounded border-transparent px-2 py-0.5 text-[11px] font-medium',
        // text + dot (bg-current) share the status color; the fill is its soft tint
        fg,
        bg,
      )}
    >
      {/* dot stays solid (the live indicator); label is full-strength in light
          mode to pop, softened only in dark */}
      <span className={cn('inline-flex size-1.5 shrink-0 rounded-full bg-current', dot)} />
      <span className="dark:opacity-80">{label}</span>
    </Badge>
  )
}

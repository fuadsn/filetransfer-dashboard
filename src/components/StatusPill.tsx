import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

export function StatusPill({ status }: { status: TransferStatus }) {
  const { label, fg, bg, border, dot } = statusMeta(status)
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        // text, dot (bg-current) and border all share the status color
        fg,
        bg,
        border,
      )}
    >
      {/* dot stays solid (the indicator); label is full-strength in light mode
          to pop, softened only in dark */}
      <span className={cn('inline-flex size-1.5 shrink-0 rounded-full bg-current', dot)} />
      <span className="dark:opacity-70">{label}</span>
    </Badge>
  )
}

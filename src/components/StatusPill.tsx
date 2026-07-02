import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

export function StatusPill({ status }: { status: TransferStatus }) {
  const { label, fg, bg } = statusMeta(status)
  return (
    <Badge variant="outline" className={cn('gap-1.5 rounded-full border-transparent', fg, bg)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  )
}

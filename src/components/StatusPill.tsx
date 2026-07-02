import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

export function StatusPill({ status }: { status: TransferStatus }) {
  const { label, fg, bg } = statusMeta(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${fg} ${bg}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

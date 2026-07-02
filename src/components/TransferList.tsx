import type { Transfer } from '../types'
import { Card } from '@/components/ui/card'
import { TransferRow } from './TransferRow'

interface Props {
  transfers: Transfer[]
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function TransferList({ transfers, onOpen, onToggleFavorite }: Props) {
  return (
    <Card className="gap-0 overflow-hidden py-0 [&>*:last-child]:border-b-0">
      {/* Column headers anchor the grid — widths mirror TransferRow exactly. */}
      <div className="text-faint bg-muted/40 flex items-center gap-4 border-b px-5 py-2.5 text-[11px] font-medium tracking-wide uppercase">
        <span className="w-10 shrink-0" aria-hidden />
        <span className="flex-1">Transfer</span>
        <span className="hidden w-28 shrink-0 sm:block">Shared with</span>
        <span className="w-32 shrink-0">Status</span>
        <span className="w-28 shrink-0 text-right">Expires</span>
        <span className="size-8 shrink-0" aria-hidden />
      </div>
      {transfers.map((t) => (
        <TransferRow
          key={t.id}
          transfer={t}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </Card>
  )
}

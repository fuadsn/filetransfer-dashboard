import type { Transfer } from '../types'
import { TransferRow } from './TransferRow'

interface Props {
  transfers: Transfer[]
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function TransferList({ transfers, onOpen, onToggleFavorite }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {transfers.map((t) => (
        <TransferRow
          key={t.id}
          transfer={t}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

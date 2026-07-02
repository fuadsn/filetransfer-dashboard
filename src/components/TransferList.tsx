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

import { AnimatePresence, motion } from 'motion/react'
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
    // border-b-0 targets the row inside the last wrapper (motion.div is the
    // direct child now, so the selector reaches one level deeper).
    <Card className="gap-0 overflow-hidden py-0 [&>*:last-child>*]:border-b-0">
      {/* Column headers anchor the grid — widths mirror TransferRow exactly.
          "Transfer" spans from the avatar column (no leading spacer). */}
      <div className="text-muted-foreground bg-muted/40 flex items-center gap-4 border-b px-5 py-2.5 text-[11px] font-semibold tracking-wide uppercase">
        <span className="flex-1">Transfer</span>
        <span className="hidden w-28 shrink-0 lg:block">Shared with</span>
        <span className="hidden w-32 shrink-0 sm:block">Status</span>
        <span className="hidden w-28 shrink-0 text-right sm:block">Expires</span>
        <span className="size-8 shrink-0" aria-hidden />
      </div>
      {/* Rows animate on filter/search purely by clipping height (no fade):
          leaving rows collapse, entering rows expand, and the rest reflow into
          place — so the list grows/shrinks smoothly and the page scroll eases
          instead of snapping to the top. */}
      <AnimatePresence initial={false}>
        {transfers.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <TransferRow transfer={t} onOpen={onOpen} onToggleFavorite={onToggleFavorite} />
          </motion.div>
        ))}
      </AnimatePresence>
    </Card>
  )
}

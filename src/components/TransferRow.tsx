import { Star } from 'lucide-react'
import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { deriveStatus, expiryLabel, formatBytes, totalSize } from '../lib/format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Avatar, AvatarStack } from './Avatar'
import { StatusPill } from './StatusPill'

interface TransferRowProps {
  transfer: Transfer
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function TransferRow({ transfer, onOpen, onToggleFavorite }: TransferRowProps) {
  const status = deriveStatus(transfer)
  const sender = memberById(transfer.senderId)
  const recipients = transfer.recipientIds.map(memberById).filter(Boolean) as NonNullable<
    ReturnType<typeof memberById>
  >[]
  const inactive = status === 'expired' || status === 'disabled'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(transfer.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(transfer.id)
        }
      }}
      className={cn(
        'group hover:bg-muted focus-visible:ring-ring flex w-full cursor-pointer items-center gap-4 border-b px-5 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset',
        // Signal inactivity with a faint background tint, not reduced opacity,
        // so text keeps full contrast (WCAG).
        inactive && 'bg-muted/30',
      )}
    >
      <Avatar member={sender} size={40} />

      <div className="min-w-0 flex-1">
        <span className="text-foreground font-title block truncate font-semibold">
          {transfer.title}
        </span>
        <div className="text-muted-foreground mt-0.5 truncate text-sm">
          {sender?.name} · {transfer.files.length} file
          {transfer.files.length === 1 ? '' : 's'} · {formatBytes(totalSize(transfer))}
        </div>
      </div>

      <div className="hidden w-28 shrink-0 sm:block">
        <AvatarStack members={recipients} />
      </div>

      <div className="w-32 shrink-0">
        <StatusPill status={status} />
      </div>

      <div
        className={cn(
          'w-28 shrink-0 text-right text-sm whitespace-nowrap',
          // urgency carries into the countdown so it scans instantly
          status === 'expiring' ? 'text-expiring font-medium' : 'text-muted-foreground',
        )}
      >
        {expiryLabel(transfer)}
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label={transfer.favorited ? 'Unfavorite' : 'Favorite'}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(transfer.id)
        }}
        className={cn(
          // Always visible on every row for consistency: filled gold when
          // favorited, muted outline otherwise (brightens on hover).
          'size-8 shrink-0',
          transfer.favorited ? 'text-expiring hover:text-expiring' : 'text-faint hover:text-foreground',
        )}
      >
        <Star className={cn('size-4', transfer.favorited && 'fill-current')} />
      </Button>
    </div>
  )
}

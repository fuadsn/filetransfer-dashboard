import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { deriveStatus, formatBytes, relativeExpiry, totalSize } from '../lib/format'
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
  const dimmed = status === 'expired' || status === 'disabled'

  return (
    <button
      type="button"
      onClick={() => onOpen(transfer.id)}
      className={`group flex w-full items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors hover:bg-surface-2 ${
        dimmed ? 'opacity-70' : ''
      }`}
    >
      <Avatar member={sender} size={40} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-ink">{transfer.title}</span>
        </div>
        <div className="mt-0.5 truncate text-sm text-muted">
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

      <div className="w-24 shrink-0 text-right text-sm text-muted">
        {relativeExpiry(transfer.expiresAt)}
      </div>

      <button
        type="button"
        aria-label={transfer.favorited ? 'Unfavorite' : 'Favorite'}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(transfer.id)
        }}
        className={`shrink-0 rounded-md p-1 text-lg leading-none transition-transform hover:scale-110 ${
          transfer.favorited ? 'text-expiring' : 'text-faint opacity-0 group-hover:opacity-100'
        }`}
      >
        {transfer.favorited ? '★' : '☆'}
      </button>
    </button>
  )
}

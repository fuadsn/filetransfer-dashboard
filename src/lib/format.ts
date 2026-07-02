import { File, FileArchive, FileText, Image, Video, type LucideIcon } from 'lucide-react'
import type { FileType, Transfer, TransferStatus } from '../types'

// Threshold at which an active transfer is considered "expiring soon".
export const EXPIRING_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

/**
 * Derive the live status from the transfer + the current clock.
 * Manual `disabled` wins over everything; then time-based expiry.
 */
export function deriveStatus(t: Transfer, now: number = Date.now()): TransferStatus {
  if (t.disabled) return 'disabled'
  if (now >= t.expiresAt) return 'expired'
  if (t.expiresAt - now <= EXPIRING_WINDOW_MS) return 'expiring'
  return 'active'
}

// --- Presentation metadata --------------------------------------------------

interface StatusMeta {
  label: string
  /** Tailwind utility classes bound to index.css tokens. */
  fg: string
  bg: string
  border: string
  /** "live" statuses pulse their dot; terminal ones stay static. */
  live: boolean
}

export function statusMeta(status: TransferStatus): StatusMeta {
  switch (status) {
    case 'active':
      return { label: 'Active', fg: 'text-active', bg: 'bg-active-soft', border: 'border-active/20', live: true }
    case 'expiring':
      return { label: 'Expiring soon', fg: 'text-expiring', bg: 'bg-expiring-soft', border: 'border-expiring/25', live: true }
    case 'expired':
      return { label: 'Expired', fg: 'text-expired', bg: 'bg-expired-soft', border: 'border-expired/20', live: false }
    case 'disabled':
      return { label: 'Disabled', fg: 'text-disabled', bg: 'bg-disabled-soft', border: 'border-disabled/20', live: false }
  }
}

/** Maps a file type to a lucide icon + label. */
export function fileTypeMeta(type: FileType): { Icon: LucideIcon; label: string } {
  switch (type) {
    case 'pdf':
      return { Icon: FileText, label: 'PDF' }
    case 'image':
      return { Icon: Image, label: 'Image' }
    case 'video':
      return { Icon: Video, label: 'Video' }
    case 'zip':
      return { Icon: FileArchive, label: 'Archive' }
    case 'doc':
      return { Icon: FileText, label: 'Document' }
    default:
      return { Icon: File, label: 'File' }
  }
}

// --- Formatting -------------------------------------------------------------

/** 1024-based, GB-scale aware. e.g. 1500 -> "1.5 KB", 2_400_000_000 -> "2.2 GB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function totalSize(t: Transfer): number {
  return t.files.reduce((sum, f) => sum + f.sizeBytes, 0)
}

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/**
 * Human relative time for an expiry moment.
 * Future -> "in 3 days" / "2h left"; past -> "expired 4d ago".
 */
export function relativeExpiry(expiresAt: number, now: number = Date.now()): string {
  const diff = expiresAt - now
  if (diff <= 0) return `expired ${shortDuration(-diff)} ago`
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / MIN))}m left`
  if (diff < DAY) return `${Math.round(diff / HOUR)}h left`
  return `in ${Math.round(diff / DAY)} day${Math.round(diff / DAY) === 1 ? '' : 's'}`
}

/** Generic "x ago" for activity timestamps. */
export function relativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp
  if (diff < MIN) return 'just now'
  return `${shortDuration(diff)} ago`
}

function shortDuration(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MIN))}m`
  if (ms < DAY) return `${Math.round(ms / HOUR)}h`
  return `${Math.round(ms / DAY)}d`
}

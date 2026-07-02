// ---------------------------------------------------------------------------
// Data model — the single source of truth for every screen.
// Get this shape right once; revisiting it mid-build is the expensive mistake.
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string
  name: string
  email: string
  /** Static placeholder photo (pravatar). Falls back to initials if it fails. */
  avatarUrl: string
  /** Hex used as the avatar background while the photo loads / if it fails. */
  avatarColor: string
}

export type FileType = 'pdf' | 'image' | 'video' | 'zip' | 'doc' | 'other'

export interface FileItem {
  id: string
  name: string
  sizeBytes: number
  type: FileType
}

/**
 * Status is DERIVED, not a free-choice enum (see README design note):
 *   - 'expiring' / 'expired' are computed from `expiresAt` vs. now
 *   - 'disabled' is the ONLY manually-set status (sender killed the link)
 *   - 'active'   is the default
 * Use deriveStatus() in lib/format.ts — never trust a stored `status` field,
 * because it would drift out of date the moment the clock moves.
 */
export type TransferStatus = 'active' | 'expiring' | 'expired' | 'disabled'

export type ActivityAction =
  | 'sent'
  | 'viewed'
  | 'downloaded'
  | 'extended_expiry'
  | 'disabled'
  | 'access_denied' // recipient tried to open a disabled link → feeds needs-attention #2

export interface ActivityEvent {
  id: string
  actorId: string
  action: ActivityAction
  /** epoch ms */
  timestamp: number
}

export interface Transfer {
  id: string
  title: string
  senderId: string
  recipientIds: string[]
  files: FileItem[]
  /** epoch ms */
  createdAt: number
  /** epoch ms */
  expiresAt: number
  /** Manual kill-switch set by the sender. Drives the 'disabled' status. */
  disabled: boolean
  favorited: boolean
  activity: ActivityEvent[]
}

// --- localStorage overrides -------------------------------------------------
// The mock generator produces the baseline; the user's session mutations
// (favorite, disable, extend-expiry) are layered on top and persisted.
// Keeping overrides separate from base data means a data regen never wipes
// the user's changes, and the persisted blob stays small.
export interface TransferOverride {
  favorited?: boolean
  disabled?: boolean
  /** epoch ms — new expiry after an "extend expiry" action */
  expiresAt?: number
}

export type OverrideMap = Record<string, TransferOverride>

import type { Transfer } from '../types'
import { EXPIRING_WINDOW_MS } from './format'

// ---------------------------------------------------------------------------
// "Needs attention" — the single highest-leverage product decision.
// A transfer needs attention if ANY rule fires. Each fired rule carries a
// short reason so the UI can explain *why* a row is surfaced, not just badge it.
// ---------------------------------------------------------------------------

const STALE_WINDOW_MS = 48 * 60 * 60 * 1000 // 48h

export type AttentionReasonKind = 'expiring' | 'denied_after_disable' | 'stale_no_activity'

export interface AttentionReason {
  kind: AttentionReasonKind
  label: string
}

/**
 * Returns the reasons a transfer needs attention (empty array = no attention).
 * Pure function of transfer + now, so it re-evaluates correctly on every render.
 */
export function attentionReasons(t: Transfer, now: number = Date.now()): AttentionReason[] {
  const reasons: AttentionReason[] = []

  // 1) Expires within 24h and still active (not already expired, not disabled).
  if (!t.disabled && t.expiresAt > now && t.expiresAt - now <= EXPIRING_WINDOW_MS) {
    reasons.push({ kind: 'expiring', label: 'Expires within 24h' })
  }

  // 2) Disabled, but a recipient tried to access it afterwards.
  if (t.disabled) {
    const deniedAfterDisable = t.activity.some((a) => a.action === 'access_denied')
    if (deniedAfterDisable) {
      reasons.push({ kind: 'denied_after_disable', label: 'Access attempted after disabling' })
    }
  }

  // 3) Sent into the void — no viewed/downloaded activity 48h+ after sending.
  if (!t.disabled && now - t.createdAt >= STALE_WINDOW_MS) {
    const hasEngagement = t.activity.some(
      (a) => a.action === 'viewed' || a.action === 'downloaded',
    )
    if (!hasEngagement) {
      reasons.push({ kind: 'stale_no_activity', label: 'No activity in 48h+' })
    }
  }

  return reasons
}

export function needsAttention(t: Transfer, now: number = Date.now()): boolean {
  return attentionReasons(t, now).length > 0
}

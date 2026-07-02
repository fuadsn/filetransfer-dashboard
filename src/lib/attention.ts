import type { Transfer } from '../types'
import { EXPIRING_WINDOW_MS } from './format'

// ---------------------------------------------------------------------------
// "Needs attention" — the single highest-leverage product decision.
// A transfer needs attention if ANY rule fires. Each fired rule carries a
// short reason (and a severity) so the UI can explain *why* a row is surfaced.
//
// severity 'critical' = a security red flag (unauthorized access, sensitive
// data on a live link). These get the red treatment and the sidebar Security
// section. 'warning' = ordinary time-based housekeeping (amber).
// ---------------------------------------------------------------------------

const STALE_WINDOW_MS = 48 * 60 * 60 * 1000 // 48h

// Words that mark a transfer as carrying sensitive/regulated content.
const SENSITIVE = /payroll|salary|wire|bank|invoice|tax|nda|contract|legal|confidential|investor|ssn|passport/i

function isSensitive(t: Transfer): boolean {
  return SENSITIVE.test(t.title) || t.files.some((f) => SENSITIVE.test(f.name))
}

export type AttentionSeverity = 'critical' | 'warning'

export type AttentionReasonKind =
  | 'expiring'
  | 'denied_after_disable'
  | 'sensitive_exposed'
  | 'stale_no_activity'

export interface AttentionReason {
  kind: AttentionReasonKind
  label: string
  severity: AttentionSeverity
}

/**
 * Returns the reasons a transfer needs attention (empty array = no attention).
 * Pure function of transfer + now, so it re-evaluates correctly on every render.
 */
export function attentionReasons(t: Transfer, now: number = Date.now()): AttentionReason[] {
  const reasons: AttentionReason[] = []
  const live = !t.disabled && t.expiresAt > now

  // SECURITY — critical ------------------------------------------------------

  // Disabled, but a recipient tried to access it afterwards.
  if (t.disabled && t.activity.some((a) => a.action === 'access_denied')) {
    reasons.push({
      kind: 'denied_after_disable',
      label: 'Access attempted after disabling',
      severity: 'critical',
    })
  }

  // Sensitive/regulated content reachable through a still-live link.
  if (live && isSensitive(t)) {
    reasons.push({
      kind: 'sensitive_exposed',
      label: 'Sensitive data on a live link',
      severity: 'critical',
    })
  }

  // HOUSEKEEPING — warning ---------------------------------------------------

  // Expires within 24h and still active.
  if (live && t.expiresAt - now <= EXPIRING_WINDOW_MS) {
    reasons.push({ kind: 'expiring', label: 'Expires within 24h', severity: 'warning' })
  }

  // Sent into the void — no viewed/downloaded activity 48h+ after sending.
  if (!t.disabled && now - t.createdAt >= STALE_WINDOW_MS) {
    const hasEngagement = t.activity.some(
      (a) => a.action === 'viewed' || a.action === 'downloaded',
    )
    if (!hasEngagement) {
      reasons.push({ kind: 'stale_no_activity', label: 'No activity in 48h+', severity: 'warning' })
    }
  }

  return reasons
}

export function needsAttention(t: Transfer, now: number = Date.now()): boolean {
  return attentionReasons(t, now).length > 0
}

/** True if the transfer has any critical (security) reason. */
export function hasSecurityIssue(t: Transfer, now: number = Date.now()): boolean {
  return attentionReasons(t, now).some((r) => r.severity === 'critical')
}

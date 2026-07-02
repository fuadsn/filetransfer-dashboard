import { useState } from 'react'
import type { ActivityAction, Transfer } from '../types'
import { memberById } from '../data/mockData'
import { attentionReasons } from '../lib/attention'
import { deriveStatus, fileTypeMeta, formatBytes, relativeExpiry, relativeTime } from '../lib/format'
import { Avatar } from './Avatar'
import { StatusPill } from './StatusPill'

interface Props {
  transfer: Transfer
  onBack: () => void
  onToggleFavorite: (id: string) => void
  onDisable: (id: string) => void
  onExtendClick: (id: string) => void
}

const actionVerb: Record<ActivityAction, string> = {
  sent: 'sent this transfer',
  viewed: 'viewed',
  downloaded: 'downloaded',
  extended_expiry: 'extended the expiry',
  disabled: 'disabled the link',
  access_denied: 'was denied access (link disabled)',
}

export function TransferDetail({ transfer, onBack, onToggleFavorite, onDisable, onExtendClick }: Props) {
  const status = deriveStatus(transfer)
  const sender = memberById(transfer.senderId)
  const reasons = attentionReasons(transfer)
  const locked = status === 'expired' || status === 'disabled'

  const [copied, setCopied] = useState(false)
  const copyLink = () => {
    const url = `https://cloud.studio.co/t/${transfer.id}`
    void navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const activity = [...transfer.activity].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-medium text-muted hover:text-ink"
      >
        ← Back to dashboard
      </button>

      {/* Header */}
      <div className={`rounded-xl border border-border bg-surface p-5 ${locked ? 'opacity-90' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <StatusPill status={status} />
              <button
                type="button"
                onClick={() => onToggleFavorite(transfer.id)}
                className={`text-lg leading-none ${transfer.favorited ? 'text-expiring' : 'text-faint'}`}
                aria-label="Toggle favorite"
              >
                {transfer.favorited ? '★' : '☆'}
              </button>
            </div>
            <h1 className="text-xl font-semibold text-ink">{transfer.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Avatar member={sender} size={24} />
              <span>{sender?.name}</span>
              <span>·</span>
              <span>{new Date(transfer.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span className={status === 'expiring' ? 'font-medium text-expiring' : ''}>
                {relativeExpiry(transfer.expiresAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Locked-state explainer — expired vs disabled read differently */}
        {locked && (
          <div className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
            {status === 'disabled'
              ? 'This link was disabled by the sender. Recipients can no longer access it. Actions are unavailable.'
              : 'This transfer has expired. Extend the expiry to make it available again.'}
          </div>
        )}

        {reasons.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {reasons.map((r) => (
              <span
                key={r.kind}
                className="rounded-full bg-attention-soft px-2.5 py-0.5 text-xs font-medium text-attention"
              >
                ⚠ {r.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions — Copy link + Extend expiry are the two primary (PRD §4.2) */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            disabled={status === 'disabled'}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
          >
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={() => onExtendClick(transfer.id)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2"
          >
            Extend expiry
          </button>
          {!transfer.disabled && (
            <button
              type="button"
              onClick={() => onDisable(transfer.id)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-disabled hover:bg-disabled-soft"
            >
              Disable link
            </button>
          )}
        </div>
      </div>

      {/* Files */}
      <section className="mt-5 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          Files · {transfer.files.length}
        </h2>
        <ul className="divide-y divide-border">
          {transfer.files.map((f) => {
            const meta = fileTypeMeta(f.type)
            return (
              <li key={f.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl" title={meta.label}>
                  {meta.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{f.name}</span>
                <span className="shrink-0 text-sm text-muted">{formatBytes(f.sizeBytes)}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Recipients + activity */}
      <section className="mt-5 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Recipients &amp; activity</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {transfer.recipientIds.map((id) => {
            const m = memberById(id)
            return (
              <span
                key={id}
                className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-1 pr-3 text-sm text-ink"
              >
                <Avatar member={m} size={22} />
                {m?.name}
              </span>
            )
          })}
        </div>

        <ol className="space-y-3">
          {activity.map((a) => {
            const actor = memberById(a.actorId)
            return (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <Avatar member={actor} size={26} />
                <div>
                  <span className="text-ink">
                    <span className="font-medium">{actor?.name}</span> {actionVerb[a.action]}
                  </span>
                  <div className="text-xs text-faint">{relativeTime(a.timestamp)}</div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

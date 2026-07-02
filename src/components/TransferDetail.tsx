import { useState } from 'react'
import { AlertTriangle, ArrowLeft, Ban, Check, Copy, Star } from 'lucide-react'
import type { ActivityAction, Transfer } from '../types'
import { memberById } from '../data/mockData'
import { attentionReasons } from '../lib/attention'
import { deriveStatus, expiryLabel, fileTypeMeta, formatBytes, relativeTime } from '../lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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
      <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground mb-4">
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Button>

      {/* Header */}
      <Card className={cn(locked && 'opacity-90')}>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <StatusPill status={status} />
              </div>
              <h1 className="text-foreground font-title text-xl font-semibold tracking-tight">
                {transfer.title}
              </h1>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                <Avatar member={sender} size={24} />
                <span>{sender?.name}</span>
                <span>·</span>
                <span>{new Date(transfer.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className={cn(status === 'expiring' && 'text-expiring font-medium')}>
                  {expiryLabel(transfer)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(transfer.id)}
              aria-label="Toggle favorite"
              className={transfer.favorited ? 'text-expiring hover:text-expiring' : 'text-faint'}
            >
              <Star className={cn('size-5', transfer.favorited && 'fill-current')} />
            </Button>
          </div>

          {/* Locked-state explainer — expired vs disabled read differently */}
          {locked && (
            <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
              {status === 'disabled'
                ? 'This link was disabled by the sender. Recipients can no longer access it. Actions are unavailable.'
                : 'This transfer has expired. Extend the expiry to make it available again.'}
            </div>
          )}

          {reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r) => (
                <Badge
                  key={r.kind}
                  variant="outline"
                  className="bg-attention-soft text-attention border-transparent"
                >
                  <AlertTriangle className="size-3" />
                  {r.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions — Copy link + Extend expiry are the two primary (PRD §4.2) */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyLink} disabled={status === 'disabled'}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="outline" onClick={() => onExtendClick(transfer.id)}>
              Extend expiry
            </Button>
            {!transfer.disabled && (
              <Button
                variant="outline"
                onClick={() => onDisable(transfer.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Ban className="size-4" />
                Disable link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-sm">Files · {transfer.files.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {transfer.files.map((f) => {
              const { Icon, label } = fileTypeMeta(f.type)
              return (
                <li key={f.id} className="flex items-center gap-3 py-2.5">
                  <Icon className="text-muted-foreground size-5 shrink-0" aria-label={label} />
                  <span className="text-foreground min-w-0 flex-1 truncate text-sm">{f.name}</span>
                  <span className="text-muted-foreground shrink-0 text-sm">
                    {formatBytes(f.sizeBytes)}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Recipients + activity */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-sm">Recipients &amp; activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {transfer.recipientIds.map((id) => {
              const m = memberById(id)
              return (
                <span
                  key={id}
                  className="bg-muted text-foreground flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm"
                >
                  <Avatar member={m} size={22} />
                  {m?.name}
                </span>
              )
            })}
          </div>

          <Separator className="mb-4" />

          <ol className="space-y-3">
            {activity.map((a) => {
              const actor = memberById(a.actorId)
              return (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <Avatar member={actor} size={26} />
                  <div>
                    <span className="text-foreground">
                      <span className="font-medium">{actor?.name}</span> {actionVerb[a.action]}
                    </span>
                    <div className="text-faint text-xs">{relativeTime(a.timestamp)}</div>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

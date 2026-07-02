import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TransferStatus } from '../types'
import { statusMeta } from '../lib/format'

// Animation periods (ms) — keep in sync with the @keyframes durations in index.css.
const DOT_PERIOD_MS: Record<string, number> = {
  'animate-blink-soft': 2400,
  'animate-blink-fast': 850,
  'animate-throb': 1100,
}

export function StatusPill({ status }: { status: TransferStatus }) {
  const { label, fg, bg, dot } = statusMeta(status)

  // Sync every same-status dot to a shared phase: a negative animation-delay of
  // (mount time mod period) makes each dot seek to where it would be had they
  // all started at the same instant — so identical pills pulse in lockstep.
  const [mount] = useState(() => Date.now())
  const period = DOT_PERIOD_MS[dot]
  const dotStyle = period ? { animationDelay: `${-(mount % period) / 1000}s` } : undefined

  return (
    <Badge
      variant="outline"
      className={cn(
        // Notion-tag look: borderless soft-tint fill, tight radius, medium weight.
        'gap-1.5 rounded border-transparent px-2 py-0.5 text-[11px] font-medium',
        // text + dot (bg-current) share the status color; the fill is its soft tint
        fg,
        bg,
      )}
    >
      {/* dot stays solid (the live indicator); label is full-strength in light
          mode to pop, softened only in dark */}
      <span
        className={cn('inline-flex size-1.5 shrink-0 rounded-full bg-current', dot)}
        style={dotStyle}
      />
      <span className="dark:opacity-80">{label}</span>
    </Badge>
  )
}

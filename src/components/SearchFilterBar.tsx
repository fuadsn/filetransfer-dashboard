import { Search, X } from 'lucide-react'
import type { TransferStatus } from '../types'
import { teamMembers } from '../data/mockData'
import { statusMeta } from '../lib/format'
import { isFilterActive } from '../lib/filter'
import type { UiState } from '../lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// Stage 4. Search + combinable member/status filters with a visible "clear all".

const STATUSES: TransferStatus[] = ['active', 'expiring', 'expired', 'disabled']

interface Props {
  ui: UiState
  onChange: (next: UiState) => void
}

export function SearchFilterBar({ ui, onChange }: Props) {
  const active = isFilterActive(ui)

  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={ui.search}
          onChange={(e) => onChange({ ...ui, search: e.target.value })}
          placeholder="Search transfers, people, files…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {teamMembers.map((m) => {
          const on = ui.memberId === m.id
          return (
            <Button
              key={m.id}
              type="button"
              size="sm"
              variant={on ? 'default' : 'outline'}
              onClick={() => onChange({ ...ui, memberId: on ? null : m.id })}
              className="h-7 rounded-full px-3 text-xs"
            >
              {m.name.split(' ')[0]}
            </Button>
          )
        })}

        <Separator orientation="vertical" className="mx-1 !h-4" />

        {STATUSES.map((s) => {
          const on = ui.status === s
          return (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={on ? 'secondary' : 'outline'}
              onClick={() => onChange({ ...ui, status: on ? null : s })}
              className="h-7 rounded-full px-3 text-xs"
            >
              {statusMeta(s).label}
            </Button>
          )
        })}

        {active && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange({ search: '', memberId: null, status: null })}
            className="text-primary h-7 gap-1 px-2 text-xs"
          >
            <X className="size-3" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}

import type { TransferStatus } from '../types'
import { teamMembers } from '../data/mockData'
import { statusMeta } from '../lib/format'
import { isFilterActive } from '../lib/filter'
import type { UiState } from '../lib/storage'

// Stage 4. Search + combinable member/status filters with a visible "clear all".
// Chips animate via a simple scale/opacity transition on mount — refine as needed.

const STATUSES: TransferStatus[] = ['active', 'expiring', 'expired', 'disabled']

interface Props {
  ui: UiState
  onChange: (next: UiState) => void
}

export function SearchFilterBar({ ui, onChange }: Props) {
  const active = isFilterActive(ui)

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <span className="text-faint">🔍</span>
        <input
          value={ui.search}
          onChange={(e) => onChange({ ...ui, search: e.target.value })}
          placeholder="Search transfers, people, files…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Member filter */}
        {teamMembers.map((m) => {
          const on = ui.memberId === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ ...ui, memberId: on ? null : m.id })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                on
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border bg-surface text-muted hover:bg-surface-2'
              }`}
            >
              {m.name.split(' ')[0]}
            </button>
          )
        })}

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Status filter */}
        {STATUSES.map((s) => {
          const on = ui.status === s
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...ui, status: on ? null : s })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                on ? 'border-ink bg-ink text-canvas' : 'border-border bg-surface text-muted hover:bg-surface-2'
              }`}
            >
              {statusMeta(s).label}
            </button>
          )
        })}

        {active && (
          <button
            type="button"
            onClick={() => onChange({ search: '', memberId: null, status: null })}
            className="ml-1 text-xs font-medium text-brand hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}

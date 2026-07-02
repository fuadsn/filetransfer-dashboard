import { useMemo } from 'react'
import type { Transfer } from '../types'
import { deriveStatus } from '../lib/format'
import { filterTransfers, isFilterActive } from '../lib/filter'
import type { UiState } from '../lib/storage'
import { NeedsAttentionSection } from './NeedsAttentionSection'
import { SearchFilterBar } from './SearchFilterBar'
import { EmptyState, NoResultsState, SkeletonRows } from './States'
import { TransferList } from './TransferList'

interface Props {
  transfers: Transfer[]
  ui: UiState
  onUiChange: (next: UiState) => void
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
  loading: boolean
}

export function Dashboard({ transfers, ui, onUiChange, onOpen, onToggleFavorite, loading }: Props) {
  const filtered = useMemo(() => {
    const list = filterTransfers(transfers, ui)
    // Live transfers first (soonest-expiring at top), then expired, then
    // disabled at the bottom — so actionable rows lead and the time column
    // reads in order within the live group.
    const group = (t: Transfer) => {
      const s = deriveStatus(t)
      return s === 'disabled' ? 2 : s === 'expired' ? 1 : 0
    }
    return [...list].sort((a, b) => {
      const ga = group(a)
      const gb = group(b)
      if (ga !== gb) return ga - gb
      // expired group: most-recently expired first; otherwise soonest first
      return ga === 1 ? b.expiresAt - a.expiresAt : a.expiresAt - b.expiresAt
    })
  }, [transfers, ui])

  const filtersOn = isFilterActive(ui)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-foreground font-title text-2xl font-semibold tracking-tight">
          Transfers
        </h1>
        <p className="text-muted-foreground font-sans text-sm">
          Files your team has sent and received — status, expiry, and what needs attention.
        </p>
      </header>

      {loading ? (
        <SkeletonRows />
      ) : transfers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Needs-attention only makes sense against the unfiltered set */}
          {!filtersOn && <NeedsAttentionSection transfers={transfers} onOpen={onOpen} />}

          <SearchFilterBar ui={ui} onChange={onUiChange} />

          {filtered.length === 0 ? (
            <NoResultsState
              query={ui.search}
              onClear={() => onUiChange({ search: '', memberId: null, status: null })}
            />
          ) : (
            <>
              <div className="mb-2 px-1 text-xs text-faint">
                {filtered.length} transfer{filtered.length === 1 ? '' : 's'}
              </div>
              <TransferList
                transfers={filtered}
                onOpen={onOpen}
                onToggleFavorite={onToggleFavorite}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

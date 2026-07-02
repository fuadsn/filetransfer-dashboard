import { useMemo } from 'react'
import type { Transfer } from '../types'
import { deriveStatus } from '../lib/format'
import { filterTransfers } from '../lib/filter'
import type { UiState } from '../lib/storage'
import { SearchFilterBar } from './SearchFilterBar'
import { EmptyState, NoResultsState, SearchSkeleton, SkeletonRows } from './States'
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
    // While searching, keep the fuzzy relevance order (title matches first,
    // then name, then file) so the best hit leads. Only the unsearched list
    // gets the status sort below.
    if (ui.search.trim()) return list
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
      return ga === 1 ? b.expiresAt - a.expiresAt : a.expiresAt - b.expiresAt
    })
  }, [transfers, ui])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-8">
      {loading ? (
        <>
          <SearchSkeleton />
          <SkeletonRows />
        </>
      ) : transfers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <SearchFilterBar ui={ui} onChange={onUiChange} />

          {filtered.length === 0 ? (
            <NoResultsState
              query={ui.search}
              onClear={() =>
                onUiChange({ search: '', memberId: null, status: null, favoritesOnly: false })
              }
            />
          ) : (
            <>
              <div className="text-faint mb-2 px-1 text-xs">
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

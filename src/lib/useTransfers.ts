import { useCallback, useEffect, useMemo, useState } from 'react'
import type { OverrideMap, Transfer } from '../types'
import { generateTransfers } from '../data/mockData'
import { loadOverrides, saveOverrides } from './storage'

// ---------------------------------------------------------------------------
// The state backbone. Owns the baseline transfers + the persisted override map,
// and exposes the mutation actions the UI needs. Merging happens in a memo so
// components always see base data with the user's session changes applied.
//
// NOTE: baseline is generated once on mount so relative timestamps are stable
// for the session (they don't jitter on every render).
// ---------------------------------------------------------------------------

export interface TransfersApi {
  transfers: Transfer[]
  toggleFavorite: (id: string) => void
  setDisabled: (id: string, disabled: boolean) => void
  extendExpiry: (id: string, newExpiresAt: number) => void
}

export function useTransfers(): TransfersApi {
  // Generated once — see note above.
  const [base] = useState<Transfer[]>(() => generateTransfers())
  const [overrides, setOverrides] = useState<OverrideMap>(() => loadOverrides())

  // Persist whenever overrides change.
  useEffect(() => {
    saveOverrides(overrides)
  }, [overrides])

  const transfers = useMemo(
    () =>
      base.map((t) => {
        const o = overrides[t.id]
        if (!o) return t
        return {
          ...t,
          favorited: o.favorited ?? t.favorited,
          disabled: o.disabled ?? t.disabled,
          expiresAt: o.expiresAt ?? t.expiresAt,
        }
      }),
    [base, overrides],
  )

  const patch = useCallback((id: string, delta: OverrideMap[string]) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...delta } }))
  }, [])

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = transfers.find((t) => t.id === id)
      patch(id, { favorited: !(current?.favorited ?? false) })
    },
    [transfers, patch],
  )

  const setDisabled = useCallback((id: string, disabled: boolean) => patch(id, { disabled }), [patch])

  const extendExpiry = useCallback(
    (id: string, newExpiresAt: number) => patch(id, { expiresAt: newExpiresAt }),
    [patch],
  )

  return { transfers, toggleFavorite, setDisabled, extendExpiry }
}

import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { deriveStatus } from './format'
import type { UiState } from './storage'

// Pure filter/search over the transfer list. Search spans title + sender name
// + file names (PRD §4.3); member + status filters are combinable with search.
export function filterTransfers(transfers: Transfer[], ui: UiState): Transfer[] {
  const q = ui.search.trim().toLowerCase()

  return transfers.filter((t) => {
    if (ui.memberId) {
      const involved = t.senderId === ui.memberId || t.recipientIds.includes(ui.memberId)
      if (!involved) return false
    }

    if (ui.status && deriveStatus(t) !== ui.status) return false

    if (q) {
      const sender = memberById(t.senderId)?.name.toLowerCase() ?? ''
      const haystack = [t.title.toLowerCase(), sender, ...t.files.map((f) => f.name.toLowerCase())]
      if (!haystack.some((h) => h.includes(q))) return false
    }

    return true
  })
}

export function isFilterActive(ui: UiState): boolean {
  return ui.search.trim() !== '' || ui.memberId !== null || ui.status !== null
}

import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { deriveStatus } from './format'
import type { UiState } from './storage'

// Pure filter/search over the transfer list. Search spans title + sender name
// + file names (PRD §4.3); member + status filters are combinable with search.
//
// The text query is fuzzy (Fuse.js) and TIERED by priority: title first, then
// sender name, then file names — so a match on the title always outranks a
// match on a filename. Each field gets its own threshold: titles are long and
// descriptive so a looser match helps, but names are short, so we match them
// tighter — close spelling variants ("aisha" ↔ "aysha") still hit, unrelated
// names don't. Member + status filters stay exact.

const shared: Pick<IFuseOptions<Transfer>, 'ignoreLocation'> = { ignoreLocation: true }

const TITLE_OPTIONS: IFuseOptions<Transfer> = {
  ...shared,
  threshold: 0.4,
  keys: [{ name: 'title', getFn: (t) => t.title }],
}

const NAME_OPTIONS: IFuseOptions<Transfer> = {
  ...shared,
  threshold: 0.28, // tighter: short names shouldn't over-match
  keys: [{ name: 'sender', getFn: (t) => memberById(t.senderId)?.name ?? '' }],
}

const FILE_OPTIONS: IFuseOptions<Transfer> = {
  ...shared,
  threshold: 0.4,
  keys: [{ name: 'files', getFn: (t) => t.files.map((f) => f.name) }],
}

// Rebuilding indices on every keystroke is wasteful; cache them and only
// rebuild when the underlying transfer list identity changes (a
// favorite/disable/extend mutation), not when the query changes.
let cachedTransfers: Transfer[] | null = null
let cachedIndices: { title: Fuse<Transfer>; name: Fuse<Transfer>; file: Fuse<Transfer> } | null =
  null

function getIndices(transfers: Transfer[]) {
  if (cachedIndices === null || cachedTransfers !== transfers) {
    cachedIndices = {
      title: new Fuse(transfers, TITLE_OPTIONS),
      name: new Fuse(transfers, NAME_OPTIONS),
      file: new Fuse(transfers, FILE_OPTIONS),
    }
    cachedTransfers = transfers
  }
  return cachedIndices
}

/**
 * Fuzzy search returning transfers in priority order (title → name → file
 * matches), each transfer appearing once at its highest-priority tier.
 */
function fuzzySearch(transfers: Transfer[], query: string): Transfer[] {
  const { title, name, file } = getIndices(transfers)
  const seen = new Set<string>()
  const ordered: Transfer[] = []
  for (const index of [title, name, file]) {
    for (const { item } of index.search(query)) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        ordered.push(item)
      }
    }
  }
  return ordered
}

export function filterTransfers(transfers: Transfer[], ui: UiState): Transfer[] {
  const q = ui.search.trim()

  // Fuzzy-match the text query first (falls through to the full list when empty).
  const matched = q ? fuzzySearch(transfers, q) : transfers

  // Then apply the exact, combinable favorites + member + status filters.
  return matched.filter((t) => {
    if (ui.favoritesOnly && !t.favorited) return false

    if (ui.memberId) {
      const involved = t.senderId === ui.memberId || t.recipientIds.includes(ui.memberId)
      if (!involved) return false
    }

    if (ui.status && deriveStatus(t) !== ui.status) return false

    return true
  })
}

export function isFilterActive(ui: UiState): boolean {
  return (
    ui.search.trim() !== '' || ui.memberId !== null || ui.status !== null || ui.favoritesOnly
  )
}

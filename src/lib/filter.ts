import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Transfer } from '../types'
import { memberById } from '../data/mockData'
import { deriveStatus } from './format'
import type { UiState } from './storage'

// Pure filter/search over the transfer list.
//
// Order of operations matters: the exact, combinable pill filters
// (favorites / member / status) GATE the data FIRST, then the fuzzy text query
// runs only over that narrowed subset — so fuzzy search never reaches past the
// pills you've selected.
//
// The text query is fuzzy (Fuse.js). Results rank by MATCH QUALITY first (a
// near-exact hit wins), with field priority — title > name > file — used only
// to break ties between equally-good matches. So "aysha" ranks Aisha (a strong
// name match) above a row whose title merely fuzzes close. Every field shares
// the same threshold so each gets an equal chance to match.

const THRESHOLD = 0.35

const makeOptions = (
  name: string,
  getFn: (t: Transfer) => string | string[],
): IFuseOptions<Transfer> => ({
  ignoreLocation: true, // match anywhere in the field, not just near the start
  threshold: THRESHOLD,
  includeScore: true, // needed to rank across fields by quality
  keys: [{ name, getFn }],
})

const TITLE_OPTIONS = makeOptions('title', (t) => t.title)
const NAME_OPTIONS = makeOptions('sender', (t) => memberById(t.senderId)?.name ?? '')
const FILE_OPTIONS = makeOptions('files', (t) => t.files.map((f) => f.name))

// Exact pill filters — no fuzziness. These decide which transfers even reach
// the text search.
function matchesPills(t: Transfer, ui: UiState): boolean {
  if (ui.favoritesOnly && !t.favorited) return false
  // Within a category the pills are OR-combined (any selected member/status
  // matches); categories AND together.
  if (ui.memberIds.length > 0) {
    const involved = ui.memberIds.some(
      (id) => t.senderId === id || t.recipientIds.includes(id),
    )
    if (!involved) return false
  }
  if (ui.statuses.length > 0 && !ui.statuses.includes(deriveStatus(t))) return false
  return true
}

// Rebuilding indices on every keystroke is wasteful; cache them and only
// rebuild when the scoped subset would actually differ — i.e. the transfer
// list identity changes (a favorite/disable/extend mutation) or a pill filter
// changes. A keystroke alone reuses the cached indices.
let cachedTransfers: Transfer[] | null = null
let cachedScopeKey: string | null = null
let cachedIndices: { title: Fuse<Transfer>; name: Fuse<Transfer>; file: Fuse<Transfer> } | null =
  null

function scopeKey(ui: UiState): string {
  // Sorted so selection order doesn't cause redundant index rebuilds.
  const members = [...ui.memberIds].sort().join(',')
  const statuses = [...ui.statuses].sort().join(',')
  return `${members}|${statuses}|${ui.favoritesOnly ? 1 : 0}`
}

function getIndices(scoped: Transfer[], transfers: Transfer[], key: string) {
  if (cachedIndices === null || cachedTransfers !== transfers || cachedScopeKey !== key) {
    cachedIndices = {
      title: new Fuse(scoped, TITLE_OPTIONS),
      name: new Fuse(scoped, NAME_OPTIONS),
      file: new Fuse(scoped, FILE_OPTIONS),
    }
    cachedTransfers = transfers
    cachedScopeKey = key
  }
  return cachedIndices
}

/**
 * Fuzzy search over an already-scoped subset. Each transfer keeps its single
 * best hit across fields; results sort by score (lower = better match), with
 * field tier (title 0 → name 1 → file 2) breaking ties. So the strongest match
 * always leads, and title wins only when matches are equally good.
 */
function fuzzySearch(scoped: Transfer[], transfers: Transfer[], ui: UiState, query: string) {
  const { title, name, file } = getIndices(scoped, transfers, scopeKey(ui))
  const best = new Map<string, { item: Transfer; score: number; tier: number }>()
  ;[title, name, file].forEach((index, tier) => {
    for (const { item, score } of index.search(query)) {
      const s = score ?? 1
      const prev = best.get(item.id)
      if (!prev || s < prev.score || (s === prev.score && tier < prev.tier)) {
        best.set(item.id, { item, score: s, tier })
      }
    }
  })
  return [...best.values()]
    .sort((a, b) => a.score - b.score || a.tier - b.tier)
    .map((h) => h.item)
}

export function filterTransfers(transfers: Transfer[], ui: UiState): Transfer[] {
  // 1. Exact pill filters gate the data first.
  const scoped = transfers.filter((t) => matchesPills(t, ui))

  // 2. Fuzzy text query runs only over that scoped subset.
  const q = ui.search.trim()
  return q ? fuzzySearch(scoped, transfers, ui, q) : scoped
}

export function isFilterActive(ui: UiState): boolean {
  return (
    ui.search.trim() !== '' ||
    ui.memberIds.length > 0 ||
    ui.statuses.length > 0 ||
    ui.favoritesOnly
  )
}

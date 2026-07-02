import type { OverrideMap } from '../types'

// ---------------------------------------------------------------------------
// localStorage persistence. Two independent blobs:
//   - transfer overrides (favorite / disable / extended expiry)
//   - UI state (last-used search + filters)
// Everything is defensively parsed so a corrupt/absent value never crashes boot.
// ---------------------------------------------------------------------------

const OVERRIDES_KEY = 'tcw:overrides:v1'
const UI_KEY = 'tcw:ui:v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / privacy-mode failures — persistence is best-effort
  }
}

export function loadOverrides(): OverrideMap {
  return read<OverrideMap>(OVERRIDES_KEY, {})
}

export function saveOverrides(overrides: OverrideMap): void {
  write(OVERRIDES_KEY, overrides)
}

export interface UiState {
  search: string
  memberId: string | null
  status: string | null
  favoritesOnly: boolean
}

export const defaultUiState: UiState = {
  search: '',
  memberId: null,
  status: null,
  favoritesOnly: false,
}

export function loadUiState(): UiState {
  return { ...defaultUiState, ...read<Partial<UiState>>(UI_KEY, {}) }
}

export function saveUiState(state: UiState): void {
  write(UI_KEY, state)
}

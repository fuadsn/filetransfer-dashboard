# Short note — decisions, trade-offs, AI tools

> Rough draft for the submission note.

## Decisions

- **The transfer is the unit, not the file.** Every screen is organized around a
  transfer (a sender, recipients, a set of files, a lifecycle) — the file list is
  a detail *inside* it.
- **Status is derived, never stored.** `active / expiring / expired` are computed
  from `expiresAt` vs. the clock on every render; only `disabled` is a stored,
  manual state (the sender killed the link). A stored status enum would go stale
  the instant time moved. → `deriveStatus()` in `src/lib/format.ts`.
- **User actions are layered over the mock baseline.** Favorites, disables, and
  extended expiries are stored as an override map in `localStorage` and merged on
  top of the generated data (`src/lib/useTransfers.ts`). Regenerating mock data
  never wipes the user's changes. UI state (search, filters, sidebar, theme) is
  persisted too, so a refresh feels like a real app.
- **Fuzzy, tiered search that respects the filters.** The pill filters
  (starred / member / status) gate the set *first*, then a Fuse.js query runs
  over that subset, tiered title → sender → file so the strongest hit leads.
  → `src/lib/filter.ts`.

## Trade-offs

- **Sidebar is app-level** (visible on the detail route too) — doubles as quick
  nav, at the cost of being slightly redundant on the detail page.
- **Client-side routing** (`BrowserRouter`) gives real, deep-linkable
  `/transfers/:id` URLs; a static host would need an SPA fallback in production
  (dev/preview already handle it).
- **No list virtualization.** Every transfer renders a real DOM row (with its
  animated mount/exit via Motion). At 10 rows that's effortless and keeps the
  code simple — no windowing library, no measured row heights, no scroll math.
  It also means the whole list animates and re-flows smoothly on filter/search.
  The cost is that it wouldn't scale: a few thousand rows would bog down layout
  and the enter/exit animations. The fix at that point is windowing (e.g.
  `@tanstack/virtual` / `react-window`) to render only the visible slice — a
  deliberate deferral, since it adds complexity this dataset doesn't warrant.

## AI tools used

- Built with **Claude Code** (Anthropic) as the primary tool, used iteratively:
  scaffolding the data model + mock generator, building the screens/components,
  wiring shadcn/ui + Tailwind v4, and running many rounds of design refinement
  (theming, status pills, the sidebar Security/Needs-attention split,
  micro-interactions, accessibility fixes).

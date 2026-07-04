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
- **Fuzzy, tiered search that respects the filters.** Two stages: the exact pill
  filters narrow the set first, then the typo-tolerant Fuse.js query runs only
  over what's left. Pills **stack** — Starred / Member / Status combine with
  **AND**, while Member and Status are multi-select **OR** within (e.g. "starred,
  Maya *or* Diego, expiring *or* expired"), all persisted. Text is **tiered**
  title → sender → files, so the strongest hit leads. → `src/lib/filter.ts`.

## Trade-offs

- **Sidebar is app-level** (visible on the detail route too) — doubles as quick
  nav, at the cost of being slightly redundant on the detail page.
- **Client-side routing** (`BrowserRouter`) gives real, deep-linkable
  `/transfers/:id` URLs; a static host would need an SPA fallback in production
  (dev/preview already handle it).
- **No list virtualization.** Every row is a real DOM node, so the whole list
  animates and re-flows smoothly on filter/search — simpler, and fine for 10
  rows. It wouldn't scale to thousands; the fix there is windowing (react-window
  / `@tanstack/virtual`), a deliberate deferral this dataset doesn't warrant.

## AI tools used

- Built with **Claude Code** (Anthropic) as the primary tool, used iteratively:
  scaffolding the data model + mock generator, building the screens/components,
  wiring shadcn/ui + Tailwind v4, and running many rounds of design refinement
  (theming, status pills, the sidebar Security/Needs-attention split,
  micro-interactions, accessibility fixes).

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
- **"Needs attention" complements the list — it doesn't mirror it.** Flagged
  transfers live in a right sidebar with three parts: an **At a glance** metrics
  summary (counts by reason, soonest deadline, bytes at risk), a **Security**
  section (critical post-disable access attempts, red, always pinned as rows),
  and a **filter-aware Needs attention** section that surfaces items *hidden by
  the current filter* (and lists them when unfiltered). Severity ranks security
  above time-based warnings, and each row explains *why*. → `src/lib/attention.ts`,
  `src/components/Sidebar.tsx`.
- **User actions are layered over the mock baseline.** Favorites, disables, and
  extended expiries are stored as an override map in `localStorage` and merged on
  top of the generated data (`src/lib/useTransfers.ts`). Regenerating mock data
  never wipes the user's changes. UI state (search, filters, sidebar, theme) is
  persisted too, so a refresh feels like a real app.
- **Fuzzy, tiered search that respects the filters.** The pill filters
  (starred / member / status) gate the set *first*, then a Fuse.js query runs
  over that subset, tiered title → sender → file so the strongest hit leads.
  → `src/lib/filter.ts`.
- **One token system, one visual identity across themes.** Built on shadcn/ui;
  all colors are semantic tokens in `src/index.css` bridged via `@theme inline`.
  A single **purple-gray + mauve** palette powers both modes — dark and light are
  the same identity, inverted. Status hues are muted *into* the palette so pills
  read as part of the theme, not stickers on top.

## Trade-offs

- **Signal over richness on "security."** An earlier rule flagged any
  sensitive-keyword file on a live link as critical — it turned normal *Active*
  transfers red (crying wolf). Cut it: red/critical is reserved for real security
  *events* (post-disable access). Fewer items, but every one is real. With mock
  data there's genuinely one such event; a fuller Security section would come
  from event-based mock scenarios, not property heuristics.
- **Sidebar is app-level** (visible on the detail route too) — doubles as quick
  nav, at the cost of being slightly redundant on the detail page.
- **Client-side routing** (`BrowserRouter`) gives real, deep-linkable
  `/transfers/:id` URLs; a static host would need an SPA fallback in production
  (dev/preview already handle it).
- **No list virtualization** — fine for 10 transfers; wouldn't scale to thousands
  without it.
- **A few extra deps** (Fuse, Motion) add bundle weight — a deliberate call for
  search quality and interaction polish at this scale.
- **A pure 4-color theme isn't possible** — the UI needs a danger red and four
  distinct status hues that the base palette doesn't contain, so those are
  derived/added as muted members of the family.

## AI tools used

- Built with **Claude Code** (Anthropic) as the primary tool, used iteratively:
  scaffolding the data model + mock generator, building the screens/components,
  wiring shadcn/ui + Tailwind v4, and running many rounds of design refinement
  (theming, status pills, the sidebar Security/Needs-attention split,
  micro-interactions, accessibility fixes).
- **Human-directed throughout** — I made the product and design calls, reviewed
  each change, and redirected when something read wrong (e.g. contrast on dimmed
  rows, the false-positive red pills, the light-mode palette). The AI handled
  implementation, refactors, and kept `build` + `lint` green each iteration.

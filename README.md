# Team Cloud Workspace

A shared workspace where a team sees file **transfers** sent to and from each
other — status, expiry, who sent what, and what needs attention. The unit of the
product is the **transfer**, not the file.

Mock data only — no backend, no auth, no real upload.

## Run

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # typecheck + production build
bun run lint
```

Stack: **Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui** (Radix
primitives) · **react-router** · **Fuse.js** (fuzzy search) · **Motion**
(interactions) · **sonner** (toasts) · **lucide-react** · **Montserrat**.

---

## Short note — decisions, trade-offs, AI tools

> Rough draft for the submission note.

### Decisions

- **The transfer is the unit, not the file.** Every screen is organized around a
  transfer (a sender, recipients, a set of files, a lifecycle) — the file list is
  a detail *inside* it.
- **Status is derived, never stored.** `active / expiring / expired` are computed
  from `expiresAt` vs. the clock on every render; only `disabled` is a stored,
  manual state (the sender killed the link). A stored status enum would go stale
  the instant time moved. → `deriveStatus()` in `src/lib/format.ts`.
- **"Needs attention" is the headline, and it's split by severity.** Flagged
  transfers live in a dedicated right sidebar, in two sections:
  **Security** (critical — a post-disable access attempt; red) pinned above
  **Needs attention** (time-based warnings — expiring <24h, sent-into-the-void
  48h+; amber). Security **bypasses time** to the top; everything else sorts by
  soonest expiry. Each row explains *why* with a reason label. → `src/lib/attention.ts`,
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

### Trade-offs

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

### AI tools used

- Built with **Claude Code** (Anthropic) as the primary tool, used iteratively:
  scaffolding the data model + mock generator, building the screens/components,
  wiring shadcn/ui + Tailwind v4, and running many rounds of design refinement
  (theming, status pills, the sidebar Security/Needs-attention split,
  micro-interactions, accessibility fixes).
- **Human-directed throughout** — I made the product and design calls, reviewed
  each change, and redirected when something read wrong (e.g. contrast on dimmed
  rows, the false-positive red pills, the light-mode palette). The AI handled
  implementation, refactors, and kept `build` + `lint` green each iteration.

---

## Micro-interactions

- **Copy link** → button flips to `Copied ✓` for ~1.5s (`TransferDetail`).
- **Disable link** → optimistic status flip + **Undo** toast (`App` + sonner).
- **Favorite** → instant toggle, persisted, star **pops** on favoriting
  (`src/lib/useFavoritePop.ts`, Motion).
- **Filter / search** → chips toggle; rows **fade + reflow** as the list changes
  (Motion `AnimatePresence` / `layout` in `TransferList`).
- **Extend expiry** → modal with `+1d / +7d / +30d` quick-chips or a date input.
- **Theme switch** → circular reveal from the toggle via the View Transitions API.
- **Status dots** pulse per status (soft/fast blink, throb) and are **phase-synced**
  across same-status pills.

## States

Loading (full-shell **skeleton** — sidebar, search, and rows), **empty**,
**no-results** (echoes the query), plus muted **expired** and **disabled**
treatments on the detail screen. → `src/components/States.tsx`.

## Architecture

```
src/
  types.ts               Data model — Transfer, FileItem, TeamMember, overrides
  data/mockData.ts       5 members + generateTransfers() (time-relative, hand-authored)
  lib/
    format.ts            deriveStatus, statusMeta, formatBytes, relative time
    attention.ts         attention rules → reasons (+ severity), hasSecurityIssue
    filter.ts            fuzzy tiered search (Fuse) gated by pill filters
    storage.ts           localStorage read/write (overrides + UI state)
    useTransfers.ts      state backbone: base data + overrides + mutations
    useTheme.ts          light/dark (.dark class) + View-Transition reveal
    useFavoritePop.ts    the favorite star pop animation
    utils.ts             cn() — shadcn class merge helper
  components/
    ui/                  shadcn/ui primitives (button, card, dialog, sonner, …)
    Sidebar.tsx          collapsible right sidebar — Security + Needs attention
    Dashboard.tsx        search/filter + list + states (centered main column)
    SearchFilterBar.tsx  fuzzy search + starred/member/status filters
    TransferList.tsx     column headers + animated rows
    TransferRow.tsx      one transfer row
    StatusPill.tsx       status pill with synced pulsing dot
    Avatar.tsx           photo avatar + initials fallback + stack
    States.tsx           skeleton / empty / no-results
    TransferDetail.tsx   detail screen + actions
    ExtendExpiryModal.tsx / ThemeToggle.tsx
  App.tsx                shell: routes ("/" · "/transfers/:id"), sidebar, overlays
  index.css              design tokens (both themes) + animations
```

Data model, mock generator, needs-attention logic, search/filter, all states,
the detail screen + actions, micro-interactions, and localStorage persistence
are complete. Both **dark and light** themes ship; layout is **responsive**
(sidebar becomes an overlay drawer on mobile).

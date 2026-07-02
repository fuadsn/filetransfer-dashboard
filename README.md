# Team Cloud Workspace

A shared workspace where a team sees file **transfers** sent to and from each
other — status, expiry, who sent what, and what needs attention. The unit of the
product is the _transfer_, not the file.

Mock data only — no backend, no auth, no real upload.

## Run

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # typecheck + production build
bun run lint
```

Stack: **Vite + React 19 + TypeScript + Tailwind v4**.

## Design decisions (worth reading before scoring)

- **Status is derived, not stored.** `expiring` / `expired` are computed from
  `expiresAt` vs. the current clock every render; `disabled` is the _only_
  manually-set status (the sender killed the link). A stored status enum would
  drift out of date the moment the clock moved. See `deriveStatus()` in
  `src/lib/format.ts`.
- **"Needs attention" is the headline feature.** A transfer is surfaced in a
  distinct pinned section (not a buried badge) when _any_ of: (1) expires within
  24h and still active, (2) disabled but a recipient tried to access it,
  (3) sent 48h+ ago with zero activity. Each fired rule carries a reason label so
  the UI explains _why_. See `src/lib/attention.ts`.
- **Overrides are layered, not baked in.** Mock data is the baseline; the user's
  favorite / disable / extend-expiry actions are stored separately in
  `localStorage` and merged on top (`src/lib/useTransfers.ts`). Regenerating the
  mock data never wipes the user's changes, and the persisted blob stays tiny.
- **Semantic design tokens.** Colors live once in `@theme` (`src/index.css`) with
  semantic names (`surface`, `muted`, `attention`…), so a dark-mode / rebrand
  pass is one file, not forty.

## Architecture

```
src/
  types.ts               Data model — Transfer, FileItem, TeamMember, overrides
  data/mockData.ts       5 members + generateTransfers() (time-relative, hand-authored)
  lib/
    format.ts            deriveStatus, statusMeta, formatBytes, relative time
    attention.ts         needs-attention rules → reasons
    filter.ts            search + combinable member/status filters
    storage.ts           localStorage read/write (overrides + UI state)
    useTransfers.ts      state backbone: base data + overrides + mutations
  components/
    Dashboard.tsx        list + needs-attention + search/filter + states
    NeedsAttentionSection.tsx
    SearchFilterBar.tsx
    TransferList.tsx / TransferRow.tsx
    StatusPill.tsx / Avatar.tsx
    States.tsx           skeleton / empty / no-results
    TransferDetail.tsx   detail screen + actions
    ExtendExpiryModal.tsx / Toast.tsx
  App.tsx                view routing (dashboard | detail) + overlays
```

## Build order / status

Built in a demo-able sequence — the app runs and shows data at every checkpoint.

- [x] **1. Data model + mock generator** — 10 transfers / 5 members, distribution
      5 active · 2 expiring · 2 expired · 1 disabled, ≥2 zero-activity, varied
      file types & KB→GB sizes.
- [x] **2. Dashboard shell** — list renders sender, files, status pill, expiry.
- [x] **3. Needs-attention logic + section** — pinned, grouped, with reasons.
- [x] **4. Search + filter** — text search (title/sender/files) + member/status
      chips, combinable, "clear all", persisted.
- [x] **5. States** — loading skeleton, empty, no-results (+ expired/disabled
      treatments in detail).
- [x] **6. Transfer detail + actions** — files, recipients, activity feed,
      Copy link + Extend expiry (+ Disable, Favorite).
- [x] **7. Micro-interactions + persistence** — copy→"Copied ✓", disable→undo
      toast, favorite (persisted), extend-expiry modal with quick-select chips.

### TODO — polish pass (stage 8)
- [ ] Screenshots + short screen recording for submission.
- [ ] Responsive mobile pass (rows collapse gracefully < 640px).
- [x] **Dark mode** — black + blue hero theme with a complementing cool-white
      light mode. Two token sets in `src/index.css` swapped via `data-theme` on
      `<html>`; persisted + FOUC-free (`src/lib/useTheme.ts`, boot script in
      `index.html`), toggle top-right.
- [ ] Fill in "AI tools used" section below.

## AI tools used

<!-- TODO: list the tools/models used and how, per submission requirements. -->

# File Transfer Dashboard

A shared workspace where a team sees file **transfers** sent to and from each
other — status, expiry, who sent what, and what needs attention. The unit of the
product is the **transfer**, not the file.

Mock data only — no backend, no auth, no real upload.

## Run

Requires [Bun](https://bun.sh) (npm also works — swap `bun` for `npm run`).

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # typecheck + production build
bun run preview  # serve the production build
bun run lint
```

Stack: **Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui** (Radix
primitives) · **react-router** · **Fuse.js** (fuzzy search) · **Motion**
(interactions) · **sonner** (toasts) · **lucide-react** · **Montserrat**.

---

## Short note

Decisions, trade-offs, and AI tools used are in **[NOTES.md](NOTES.md)**.

---

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
    TransferDetail.tsx   detail screen + actions + file list
    FilePreview.tsx      in-app image / video / PDF preview modal
    ExtendExpiryModal.tsx / ThemeToggle.tsx
  App.tsx                shell: routes ("/" · "/transfers/:id"), sidebar, overlays
  index.css              design tokens (both themes) + animations
```

Data model, mock generator, needs-attention logic, search/filter, all states,
the detail screen + actions, file preview, micro-interactions, and localStorage
persistence are complete. Both **dark and light** themes ship; layout is
**responsive** (rows collapse and the sidebar becomes an overlay drawer on
mobile).

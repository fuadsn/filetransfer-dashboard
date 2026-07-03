import { useEffect, useRef } from 'react'
import { Search, Star, X } from 'lucide-react'
import type { TransferStatus } from '../types'
import { teamMembers } from '../data/mockData'
import { statusMeta } from '../lib/format'
import { isFilterActive } from '../lib/filter'
import type { UiState } from '../lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Stage 4. Search + combinable favorites / member / status filters with a
// visible "clear all". Status filters use the same pill language as the table.

const STATUSES: TransferStatus[] = ['active', 'expiring', 'expired', 'disabled']

function isTypingTarget(el: EventTarget | null): boolean {
  return (
    el instanceof HTMLElement &&
    (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
  )
}

interface Props {
  ui: UiState
  onChange: (next: UiState) => void
}

const CLEARED: UiState = { search: '', memberIds: [], statuses: [], favoritesOnly: false }

// Multi-select toggle: add the value if absent, remove it if present.
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function SearchFilterBar({ ui, onChange }: Props) {
  const active = isFilterActive(ui)
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" or ⌘/Ctrl-K focuses search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      } else if (e.key === '/' && !isTypingTarget(e.target)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="mb-4 space-y-3">
      <div className="group relative">
        <Search className="text-muted-foreground group-focus-within:text-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 transition-colors" />
        <Input
          ref={inputRef}
          value={ui.search}
          onChange={(e) => onChange({ ...ui, search: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && ui.search) {
              e.preventDefault()
              onChange({ ...ui, search: '' })
            }
          }}
          placeholder="Search transfers, people, files…"
          className="h-11 rounded-lg pr-14 pl-10 text-sm"
        />
        <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center">
          {ui.search ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onChange({ ...ui, search: '' })
                inputRef.current?.focus()
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1 transition-colors"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="text-muted-foreground border-border bg-muted pointer-events-none hidden rounded border px-1.5 py-0.5 text-[11px] font-medium sm:inline-block">
              /
            </kbd>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Starred filter */}
        <Button
          type="button"
          size="sm"
          variant={ui.favoritesOnly ? 'default' : 'outline'}
          onClick={() => onChange({ ...ui, favoritesOnly: !ui.favoritesOnly })}
          // The selected (default) variant has no border while unselected
          // (outline) does — reserve a transparent border so the width never
          // shifts. active:scale gives a tactile button-press feel.
          className={cn(
            'h-7 gap-1.5 rounded-full px-3 text-xs transition-transform active:scale-95',
            ui.favoritesOnly && 'border border-transparent',
          )}
        >
          <Star className={cn('size-3.5', ui.favoritesOnly && 'fill-current')} />
          Starred
        </Button>

        <Separator orientation="vertical" className="mx-1 !h-4" />

        {/* Member filter */}
        {teamMembers.map((m) => {
          const on = ui.memberIds.includes(m.id)
          return (
            <Button
              key={m.id}
              type="button"
              size="sm"
              variant={on ? 'default' : 'outline'}
              aria-pressed={on}
              onClick={() => onChange({ ...ui, memberIds: toggle(ui.memberIds, m.id) })}
              className={cn(
                'h-7 rounded-full px-3 text-xs transition-transform active:scale-95',
                on && 'border border-transparent',
              )}
            >
              {m.name.split(' ')[0]}
            </Button>
          )
        })}

        <Separator orientation="vertical" className="mx-1 !h-4" />

        {/* Status filter — same pill language as the table; selected = ringed */}
        {STATUSES.map((s) => {
          const on = ui.statuses.includes(s)
          const meta = statusMeta(s)
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...ui, statuses: toggle(ui.statuses, s) })}
              // Outer button is a transparent, padded hit area — it enlarges the
              // clickable box without growing the visible pill inside it.
              className="focus-visible:ring-primary group -my-0.5 cursor-pointer rounded-md px-1 py-1.5 outline-none focus-visible:ring-2"
            >
              <span
                className={cn(
                  // The visible pill stays compact (px-2 py-1).
                  'inline-flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[11px] font-medium transition-all group-active:scale-95',
                  meta.bg,
                  meta.fg,
                  // selected gets a thin ring in its own status color;
                  // unselected gets a subtle ring on hover for affordance
                  on
                    ? cn(meta.ring, 'ring-offset-background ring-1 ring-offset-1')
                    : 'group-hover:ring-border group-hover:ring-1',
                )}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-current" />
                {meta.label}
              </span>
            </button>
          )
        })}

        {active && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange(CLEARED)}
            // ghost text style, but full-strength foreground at rest so it's
            // clearly legible without hovering; hover adds a subtle tint
            className="text-foreground hover:text-foreground hover:bg-muted h-7 gap-1 px-2 text-xs font-medium"
          >
            <X className="size-3" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { TransferStatus } from '../types'
import { teamMembers } from '../data/mockData'
import { statusMeta } from '../lib/format'
import { isFilterActive } from '../lib/filter'
import type { UiState } from '../lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// Stage 4. Search + combinable member/status filters with a visible "clear all".

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
        {teamMembers.map((m) => {
          const on = ui.memberId === m.id
          return (
            <Button
              key={m.id}
              type="button"
              size="sm"
              variant={on ? 'default' : 'outline'}
              onClick={() => onChange({ ...ui, memberId: on ? null : m.id })}
              className="h-7 rounded-full px-3 text-xs"
            >
              {m.name.split(' ')[0]}
            </Button>
          )
        })}

        <Separator orientation="vertical" className="mx-1 !h-4" />

        {STATUSES.map((s) => {
          const on = ui.status === s
          return (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={on ? 'secondary' : 'outline'}
              onClick={() => onChange({ ...ui, status: on ? null : s })}
              className="h-7 rounded-full px-3 text-xs"
            >
              {statusMeta(s).label}
            </Button>
          )
        })}

        {active && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange({ search: '', memberId: null, status: null })}
            className="text-primary h-7 gap-1 px-2 text-xs"
          >
            <X className="size-3" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}

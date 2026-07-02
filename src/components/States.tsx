import { Inbox, Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Stage 5. Loading skeleton, empty, and no-results — cheap, high-signal states.

export function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </Card>
  )
}

/** Zero data at all — onboarding tone with a CTA. */
export function EmptyState() {
  return (
    <Card className="items-center border-dashed px-6 py-16 text-center">
      <div className="bg-muted text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-full">
        <Inbox className="size-7" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">No transfers yet</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        When your team sends or receives files, they'll show up here — with status, expiry, and
        what needs your attention.
      </p>
      <Button className="mt-5">
        <Plus className="size-4" />
        New transfer
      </Button>
    </Card>
  )
}

/** Filters/search matched nothing — distinct from EmptyState, echoes the query. */
export function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <Card className="items-center px-6 py-16 text-center">
      <div className="bg-muted text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-full">
        <SearchX className="size-7" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">No matches</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        {query ? (
          <>
            Nothing matches “<span className="text-foreground font-medium">{query}</span>”.
          </>
        ) : (
          'No transfers match the active filters.'
        )}
      </p>
      <Button variant="outline" className="mt-5" onClick={onClear}>
        Clear search &amp; filters
      </Button>
    </Card>
  )
}

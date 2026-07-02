// Stage 5. Loading skeleton, empty, and no-results — cheap, high-signal states.
// Kept in one file since they're small and share visual language.

export function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-surface-2" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-surface-2" />
          </div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-surface-2" />
          <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  )
}

/** Zero data at all — onboarding tone with a CTA. */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="mb-4 text-4xl">📦</div>
      <h3 className="text-lg font-semibold text-ink">No transfers yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">
        When your team sends or receives files, they'll show up here — with status, expiry, and
        what needs your attention.
      </p>
      <button
        type="button"
        className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        New transfer
      </button>
    </div>
  )
}

/** Filters/search matched nothing — distinct from EmptyState, echoes the query. */
export function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center">
      <div className="mb-4 text-4xl">🔍</div>
      <h3 className="text-lg font-semibold text-ink">No matches</h3>
      <p className="mt-1 text-sm text-muted">
        {query ? (
          <>
            Nothing matches “<span className="font-medium text-ink">{query}</span>”.
          </>
        ) : (
          'No transfers match the active filters.'
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2"
      >
        Clear search &amp; filters
      </button>
    </div>
  )
}

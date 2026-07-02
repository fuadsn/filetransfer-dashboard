import { useEffect } from 'react'

// Minimal toast for confirm/undo affordances (e.g. disable-link → undo).
// Single-toast model is enough for this scaffold; swap for a queue if needed.

export interface ToastState {
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface Props {
  toast: ToastState | null
  onDismiss: () => void
  /** auto-dismiss after ms; 0 disables */
  duration?: number
}

export function Toast({ toast, onDismiss, duration = 4000 }: Props) {
  useEffect(() => {
    if (!toast || duration === 0) return
    const id = setTimeout(onDismiss, duration)
    return () => clearTimeout(id)
  }, [toast, duration, onDismiss])

  if (!toast) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-lg bg-ink px-4 py-3 text-sm text-canvas shadow-lg">
        <span>{toast.message}</span>
        {toast.actionLabel && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.()
              onDismiss()
            }}
            className="font-semibold text-brand underline underline-offset-2 hover:opacity-80"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

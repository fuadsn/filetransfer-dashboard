import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

// Theme is applied via the `.dark` class on <html> (shadcn/ui convention). The
// initial value is set by the inline boot script in index.html (prevents a
// flash) and mirrored here so the toggle can flip + persist it. Light is default.
//
// Switching uses the View Transitions API: the incoming theme is revealed by a
// circle expanding outward from the toggle button (origin passed in). Browsers
// without the API (or users who prefer reduced motion) just flip instantly.

export type Theme = 'light' | 'dark'
export interface RevealOrigin {
  x: number
  y: number
}
const KEY = 'tcw:theme'

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { ready: Promise<void> }
}

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme())

  // Persist only; the class is toggled synchronously in `toggle` so the view
  // transition snapshot captures the right theme.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // best-effort persistence
    }
  }, [theme])

  const toggle = useCallback((origin?: RevealOrigin) => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    const doc = document as ViewTransitionDoc
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const commit = () => {
      document.documentElement.classList.toggle('dark', next === 'dark')
      setTheme(next)
    }

    if (!doc.startViewTransition || reduce) {
      commit()
      return
    }

    const transition = doc.startViewTransition(() => {
      flushSync(commit)
    })

    void transition.ready.then(() => {
      // Origin: the toggle button (falls back to viewport center); radius
      // reaches the farthest corner from there.
      const x = origin?.x ?? window.innerWidth / 2
      const y = origin?.y ?? window.innerHeight / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }, [])

  return { theme, toggle }
}

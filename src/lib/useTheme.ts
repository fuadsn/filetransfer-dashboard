import { useCallback, useEffect, useState } from 'react'

// Theme is applied via `data-theme` on <html>. The initial value is set by the
// inline boot script in index.html (prevents a flash), and mirrored here so the
// toggle can flip it and persist the choice. Dark (black + blue) is the default.

export type Theme = 'light' | 'dark'
const KEY = 'tcw:theme'

function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme
  return attr === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // best-effort persistence
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}

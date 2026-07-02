import { useCallback, useEffect, useState } from 'react'

// Theme is applied via the `.dark` class on <html> (shadcn/ui convention). The
// initial value is set by the inline boot script in index.html (prevents a
// flash) and mirrored here so the toggle can flip + persist it. Dark is default.

export type Theme = 'light' | 'dark'
const KEY = 'tcw:theme'

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
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

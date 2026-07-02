import type { Theme } from '../lib/useTheme'

interface Props {
  theme: Theme
  onToggle: () => void
}

// Fixed, always-available control. Sun/moon emoji keeps it dependency-free.
export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-base shadow-sm transition-colors hover:bg-surface-2"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

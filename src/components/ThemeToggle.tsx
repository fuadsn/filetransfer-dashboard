import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Theme } from '../lib/useTheme'

interface Props {
  theme: Theme
  onToggle: () => void
}

// Fixed, always-available control.
export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="bg-card rounded-full shadow-sm"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

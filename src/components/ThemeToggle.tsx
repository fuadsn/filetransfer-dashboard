import { Button } from '@/components/ui/button'
import type { RevealOrigin, Theme } from '../lib/useTheme'

interface Props {
  theme: Theme
  onToggle: (origin?: RevealOrigin) => void
}

// Fixed, always-available control.
export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={(e) => {
        // Reveal the new theme from the center of this button.
        const r = e.currentTarget.getBoundingClientRect()
        onToggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="bg-card rounded-full shadow-sm"
    >
      <SunMoon />
    </Button>
  )
}

// A single icon that morphs sun ⇆ moon on theme change. The disc grows and a
// masked cutout slides in to carve the crescent (moon), while the rays retract
// and fade (sun). All motion is CSS, keyed off the `.dark` class on <html> —
// see `.sun-and-moon` in index.css. Shows the *current* theme: sun in light,
// moon in dark.
function SunMoon() {
  return (
    <svg
      className="sun-and-moon size-4"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <mask className="moon" id="theme-toggle-moon">
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <circle cx="24" cy="10" r="6" fill="black" />
      </mask>
      <circle
        className="sun"
        cx="12"
        cy="12"
        r="6"
        fill="currentColor"
        stroke="none"
        mask="url(#theme-toggle-moon)"
      />
      <g className="sun-beams">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </svg>
  )
}

import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useTheme } from '@/lib/useTheme'

// shadcn's Sonner wrapper, adapted to our own useTheme hook instead of
// next-themes so toasts follow the light/dark black+blue theme.
function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

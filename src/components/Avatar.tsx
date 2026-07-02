import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { TeamMember } from '../types'

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface AvatarProps {
  member: TeamMember | undefined
  size?: number
  ring?: boolean
  className?: string
}

// Domain wrapper over shadcn's Avatar: renders the member's static photo, and
// Radix's Fallback shows initials on the colored circle while loading / on error.
export function Avatar({ member, size = 32, ring = false, className }: AvatarProps) {
  if (!member) return null
  return (
    <UiAvatar
      title={member.name}
      className={cn(ring && 'ring-card ring-2', className)}
      style={{ width: size, height: size }}
    >
      <AvatarImage src={member.avatarUrl} alt={member.name} />
      <AvatarFallback
        className="font-semibold text-white"
        style={{ backgroundColor: member.avatarColor, fontSize: size * 0.4 }}
      >
        {initials(member.name)}
      </AvatarFallback>
    </UiAvatar>
  )
}

/** Overlapping avatar stack for recipient lists. */
export function AvatarStack({ members, max = 3 }: { members: TeamMember[]; max?: number }) {
  const shown = members.slice(0, max)
  const extra = members.length - shown.length
  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {shown.map((m) => (
          <Avatar key={m.id} member={m} size={40} className="border-background border-2" />
        ))}
      </div>
      {extra > 0 && <span className="text-muted-foreground ml-2 text-xs">+{extra}</span>}
    </div>
  )
}

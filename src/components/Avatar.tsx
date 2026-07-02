import { useState } from 'react'
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
}

export function Avatar({ member, size = 32, ring = false }: AvatarProps) {
  // If the photo can't load (e.g. offline), fall back to initials on the
  // colored background. Instances are keyed by member at call sites, so this
  // per-instance flag tracks one person.
  const [failed, setFailed] = useState(false)

  if (!member) return null

  const showPhoto = member.avatarUrl && !failed

  return (
    <div
      title={member.name}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${
        ring ? 'ring-2 ring-surface' : ''
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: member.avatarColor,
        fontSize: size * 0.4,
      }}
    >
      {showPhoto ? (
        <img
          key={member.id}
          src={member.avatarUrl}
          alt={member.name}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(member.name)
      )}
    </div>
  )
}

/** Overlapping avatar stack for recipient lists. */
export function AvatarStack({ members, max = 3 }: { members: TeamMember[]; max?: number }) {
  const shown = members.slice(0, max)
  const extra = members.length - shown.length
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((m) => (
          <Avatar key={m.id} member={m} size={24} ring />
        ))}
      </div>
      {extra > 0 && <span className="ml-2 text-xs text-muted">+{extra}</span>}
    </div>
  )
}

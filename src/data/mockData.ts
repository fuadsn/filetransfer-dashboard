import type { ActivityEvent, FileItem, TeamMember, Transfer } from '../types'

// ---------------------------------------------------------------------------
// Mock data. Every screen depends on this — it is intentionally hand-authored
// (not random) so the demo is stable and every scoring path is represented.
//
// Timestamps are RELATIVE to `now`, computed at generation time, so statuses
// stay correct no matter when the app is opened:
//   distribution : 5 active · 2 expiring · 2 expired · 1 disabled
//   needs-attention coverage : expiring (t6, t7), stale/no-activity (t4, t7),
//                              denied-after-disable (t10)
//   >=2 transfers with zero recipient activity : t4, t7
//   file types : pdf · image · video · zip · doc · other, KB → GB sizes
// ---------------------------------------------------------------------------

// Static placeholder faces from pravatar.cc — a fixed `img` index per member
// keeps each person's photo stable across reloads. avatarColor is the fallback
// (shown while loading, or if the image can't be fetched offline).
const pravatar = (n: number) => `https://i.pravatar.cc/120?img=${n}`

export const teamMembers: TeamMember[] = [
  { id: 'u1', name: 'Maya Chen', email: 'maya@studio.co', avatarUrl: pravatar(47), avatarColor: '#4f46e5' },
  { id: 'u2', name: 'Diego Ramos', email: 'diego@studio.co', avatarUrl: pravatar(12), avatarColor: '#0ea5e9' },
  { id: 'u3', name: 'Priya Nair', email: 'priya@studio.co', avatarUrl: pravatar(44), avatarColor: '#db2777' },
  { id: 'u4', name: 'Sam Whitfield', email: 'sam@studio.co', avatarUrl: pravatar(13), avatarColor: '#059669' },
  { id: 'u5', name: 'Aisha Bello', email: 'aisha@studio.co', avatarUrl: pravatar(49), avatarColor: '#d97706' },
]

export function memberById(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id)
}

// time helpers ---------------------------------------------------------------
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/**
 * Build the baseline 10 transfers. `disabled` and `favorited` here are the
 * mock defaults; the user's persisted overrides are layered on top elsewhere.
 */
export function generateTransfers(now: number = Date.now()): Transfer[] {
  // `url` points at a real bundled asset under public/samples/ for the
  // previewable types (image / video / pdf); omit it and the file shows a
  // "no preview available" state. Displayed sizes are cosmetic and need not
  // match the actual asset byte size.
  const file = (
    id: string,
    name: string,
    sizeBytes: number,
    type: FileItem['type'],
    url?: string,
  ): FileItem => ({ id, name, sizeBytes, type, ...(url ? { url } : {}) })
  const sample = (name: string) => `${import.meta.env.BASE_URL}samples/${name}`
  const ev = (
    id: string,
    actorId: string,
    action: ActivityEvent['action'],
    timestamp: number,
  ): ActivityEvent => ({ id, actorId, action, timestamp })

  return [
    // 1 — active, engaged, favorited
    {
      id: 't1',
      title: 'Q3 Brand Refresh — final deliverables',
      senderId: 'u1',
      recipientIds: ['u2', 'u4'],
      files: [
        file('f1a', 'brand-guidelines-v4.pdf', 8_400_000, 'pdf', sample('brand-guidelines-v4.pdf')),
        file('f1b', 'logo-lockups.zip', 46_200_000, 'zip'),
        file('f1c', 'hero-banner.png', 3_100_000, 'image', sample('hero-banner.png')),
      ],
      createdAt: now - 2 * DAY,
      expiresAt: now + 5 * DAY,
      disabled: false,
      favorited: true,
      activity: [
        ev('a1a', 'u1', 'sent', now - 2 * DAY),
        ev('a1b', 'u2', 'viewed', now - 2 * DAY + 3 * HOUR),
        ev('a1c', 'u4', 'downloaded', now - 1 * DAY),
      ],
    },
    // 2 — active, video + image
    {
      id: 't2',
      title: 'Podcast ep. 47 — master + cover art',
      senderId: 'u3',
      recipientIds: ['u1'],
      files: [
        file('f2a', 'ep47-master.mp4', 1_240_000_000, 'video', sample('ep47-master.mp4')),
        file('f2b', 'ep47-cover.jpg', 820_000, 'image', sample('ep47-cover.jpg')),
      ],
      createdAt: now - 1 * DAY,
      expiresAt: now + 6 * DAY,
      disabled: false,
      favorited: false,
      activity: [
        ev('a2a', 'u3', 'sent', now - 1 * DAY),
        ev('a2b', 'u1', 'viewed', now - 20 * HOUR),
      ],
    },
    // 3 — active, confidential deck
    {
      id: 't3',
      title: 'Investor update deck (confidential)',
      senderId: 'u1',
      recipientIds: ['u4', 'u5'],
      files: [file('f3a', 'investor-update-jul.pdf', 5_600_000, 'pdf', sample('investor-update-jul.pdf'))],
      createdAt: now - 5 * HOUR,
      expiresAt: now + 10 * DAY,
      disabled: false,
      favorited: false,
      activity: [
        ev('a3a', 'u1', 'sent', now - 5 * HOUR),
        ev('a3b', 'u4', 'viewed', now - 4 * HOUR),
      ],
    },
    // 4 — active BUT no recipient activity, 3 days old → NEEDS ATTENTION (stale)
    {
      id: 't4',
      title: 'Onboarding docs for new hires',
      senderId: 'u4',
      recipientIds: ['u2', 'u3', 'u5'],
      files: [
        file('f4a', 'onboarding-handbook.pdf', 12_800_000, 'pdf', sample('onboarding-handbook.pdf')),
        file('f4b', 'benefits-overview.docx', 340_000, 'doc'),
      ],
      createdAt: now - 3 * DAY,
      expiresAt: now + 4 * DAY,
      disabled: false,
      favorited: false,
      activity: [ev('a4a', 'u4', 'sent', now - 3 * DAY)],
    },
    // 5 — active, signed contract
    {
      id: 't5',
      title: 'Legal contract — NDA countersigned',
      senderId: 'u5',
      recipientIds: ['u1'],
      files: [file('f5a', 'nda-countersigned.pdf', 1_900_000, 'pdf', sample('nda-countersigned.pdf'))],
      createdAt: now - 6 * HOUR,
      expiresAt: now + 14 * DAY,
      disabled: false,
      favorited: false,
      activity: [
        ev('a5a', 'u5', 'sent', now - 6 * HOUR),
        ev('a5b', 'u1', 'downloaded', now - 2 * HOUR),
      ],
    },
    // 6 — EXPIRING (<24h), large RAWs → NEEDS ATTENTION (expiring)
    {
      id: 't6',
      title: 'Client photoshoot — RAW selects',
      senderId: 'u2',
      recipientIds: ['u3'],
      files: [
        file('f6a', 'shoot-raws-batch1.zip', 4_600_000_000, 'zip'),
        file('f6b', 'contact-sheet.jpg', 2_400_000, 'image', sample('contact-sheet.jpg')),
      ],
      createdAt: now - 20 * HOUR,
      expiresAt: now + 8 * HOUR,
      disabled: false,
      favorited: true,
      activity: [
        ev('a6a', 'u2', 'sent', now - 20 * HOUR),
        ev('a6b', 'u3', 'viewed', now - 15 * HOUR),
      ],
    },
    // 7 — EXPIRING (<24h) AND no activity, 2 days old → NEEDS ATTENTION (expiring + stale)
    {
      id: 't7',
      title: 'Wire transfer confirmation',
      senderId: 'u5',
      recipientIds: ['u4'],
      files: [file('f7a', 'wire-confirmation-8841.pdf', 210_000, 'pdf', sample('wire-confirmation-8841.pdf'))],
      createdAt: now - 2 * DAY,
      expiresAt: now + 3 * HOUR,
      disabled: false,
      favorited: false,
      activity: [ev('a7a', 'u5', 'sent', now - 2 * DAY)],
    },
    // 8 — EXPIRED, had engagement
    {
      id: 't8',
      title: 'Old campaign assets (spring)',
      senderId: 'u3',
      recipientIds: ['u1', 'u2'],
      files: [
        file('f8a', 'spring-campaign-assets.zip', 780_000_000, 'zip'),
        file('f8c', 'spring-campaign-hero.jpg', 2_700_000, 'image', sample('spring-campaign-hero.jpg')),
        file('f8b', 'usage-notes.txt', 4_200, 'other'),
      ],
      createdAt: now - 10 * DAY,
      expiresAt: now - 4 * DAY,
      disabled: false,
      favorited: false,
      activity: [
        ev('a8a', 'u3', 'sent', now - 10 * DAY),
        ev('a8b', 'u1', 'downloaded', now - 9 * DAY),
        ev('a8c', 'u2', 'viewed', now - 8 * DAY),
      ],
    },
    // 9 — EXPIRED, single view
    {
      id: 't9',
      title: 'Draft press release v2',
      senderId: 'u1',
      recipientIds: ['u5'],
      files: [
        file('f9a', 'press-release-v2.docx', 96_000, 'doc'),
        file('f9b', 'press-release-v2.pdf', 88_000, 'pdf', sample('press-release-v2.pdf')),
      ],
      createdAt: now - 6 * DAY,
      expiresAt: now - 1 * DAY,
      disabled: false,
      favorited: false,
      activity: [
        ev('a9a', 'u1', 'sent', now - 6 * DAY),
        ev('a9b', 'u5', 'viewed', now - 5 * DAY),
      ],
    },
    // 10 — DISABLED with a post-disable access attempt → NEEDS ATTENTION (denied)
    {
      id: 't10',
      title: 'Payroll spreadsheet (November)',
      senderId: 'u4',
      recipientIds: ['u1'],
      files: [
        file('f10a', 'payroll-nov.xlsx', 1_100_000, 'doc'),
        file('f10b', 'payroll-summary-nov.pdf', 180_000, 'pdf', sample('payroll-summary-nov.pdf')),
      ],
      createdAt: now - 3 * DAY,
      expiresAt: now + 2 * DAY, // still within window, but manually disabled
      disabled: true,
      favorited: false,
      activity: [
        ev('a10a', 'u4', 'sent', now - 3 * DAY),
        ev('a10b', 'u1', 'viewed', now - 3 * DAY + 2 * HOUR),
        ev('a10c', 'u4', 'disabled', now - 1 * DAY),
        ev('a10d', 'u1', 'access_denied', now - 6 * HOUR),
      ],
    },
  ]
}

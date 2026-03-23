import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'
import { STANCE_STYLES, stanceDisplayBadge } from '@/lib/utils/stances'

export type ActivityItem =
  | {
      type: 'vote'
      politician_id: string
      politician_name: string
      politician_slug: string
      politician_party: string
      politician_image_url: string | null
      bill_name: string
      bill_number: string
      vote: string
      date: string
    }
  | {
      type: 'stance'
      politician_id: string
      politician_name: string
      politician_slug: string
      politician_party: string
      politician_image_url: string | null
      issue_name: string
      issue_slug: string
      stance: string
      date: string
    }

function relativeDate(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr + 'T00:00:00')
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function VoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    </svg>
  )
}

function StanceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function RecentActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-[var(--codex-border)] py-10 text-center">
        <p className="mb-2 text-sm text-[var(--codex-sub)]">
          No recent activity
        </p>
        <p className="text-xs text-[var(--codex-faint)]">
          Follow politicians to see their votes and stance updates here
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div
        className="absolute left-[19px] top-0 bottom-0 w-px"
        style={{ background: 'var(--codex-border)' }}
      />

      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={`${item.type}-${item.politician_id}-${item.date}-${i}`} className="relative flex gap-3 py-3 first:pt-0 last:pb-0">
            {/* Avatar (overlays the timeline line) */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className="h-[38px] w-[38px] overflow-hidden rounded-full border-2"
                style={{ borderColor: partyColor(item.politician_party), background: 'var(--codex-card)' }}
              >
                <AvatarImage
                  src={item.politician_image_url}
                  alt={item.politician_name}
                  size={34}
                  fallbackColor={partyColor(item.politician_party)}
                  party={item.politician_party}
                />
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {item.type === 'vote' ? (
                    <VoteActivityContent item={item} />
                  ) : (
                    <StanceActivityContent item={item} />
                  )}
                </div>
                <span className="flex-shrink-0 pt-0.5 text-[11px] text-[var(--codex-faint)]">
                  {relativeDate(item.date)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VoteActivityContent({
  item,
}: {
  item: Extract<ActivityItem, { type: 'vote' }>
}) {
  const voteColors: Record<string, { color: string; bg: string }> = {
    yea: { color: '#22C55E', bg: '#22C55E18' },
    nay: { color: '#EF4444', bg: '#EF444418' },
    abstain: { color: '#9CA3AF', bg: '#9CA3AF18' },
    not_voting: { color: '#9CA3AF', bg: '#9CA3AF18' },
  }
  const vc = voteColors[item.vote] ?? voteColors.abstain

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--codex-faint)]">
        <VoteIcon />
        <span>Voted</span>
      </div>
      <div className="mt-0.5 text-[13px] leading-snug text-[var(--codex-text)]">
        <Link
          href={`/politicians/${item.politician_slug}`}
          className="font-medium no-underline hover:underline"
          style={{ color: partyColor(item.politician_party) }}
        >
          {item.politician_name}
        </Link>
        {' voted '}
        <span
          className="inline-block rounded-sm px-1.5 py-px text-[10px] font-semibold uppercase"
          style={{ color: vc.color, background: vc.bg }}
        >
          {item.vote}
        </span>
        {' on '}
        <span className="text-[var(--codex-sub)]">
          {item.bill_name}
          {item.bill_number ? ` (${item.bill_number})` : ''}
        </span>
      </div>
    </div>
  )
}

function StanceActivityContent({
  item,
}: {
  item: Extract<ActivityItem, { type: 'stance' }>
}) {
  const badge = stanceDisplayBadge(item.stance, item.politician_party)

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--codex-faint)]">
        <StanceIcon />
        <span>Stance Update</span>
      </div>
      <div className="mt-0.5 text-[13px] leading-snug text-[var(--codex-text)]">
        <Link
          href={`/politicians/${item.politician_slug}`}
          className="font-medium no-underline hover:underline"
          style={{ color: partyColor(item.politician_party) }}
        >
          {item.politician_name}
        </Link>
        {' '}
        <span
          className="inline-block rounded-sm px-1.5 py-px text-[10px] font-semibold border"
          style={badge.style}
        >
          {badge.label}
        </span>
        {' '}
        <Link
          href={`/issues/${item.issue_slug}`}
          className="text-[var(--codex-sub)] no-underline hover:underline"
        >
          {item.issue_name}
        </Link>
      </div>
    </div>
  )
}

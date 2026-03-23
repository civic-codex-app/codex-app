'use client'

import Link from 'next/link'
import { PartyIcon } from '@/components/icons/party-icons'
import { AvatarImage } from '@/components/ui/avatar-image'
import { IssueIcon } from '@/components/icons/issue-icon'
import { stanceDisplayBadge } from '@/lib/utils/stances'
import { partyColor } from '@/lib/constants/parties'

export interface ActivityItemProps {
  type: 'vote' | 'stance'
  politician: {
    name: string
    slug: string
    party: string
    image_url: string | null
  }
  date: string
  details:
    | {
        kind: 'vote'
        billName: string | null
        billNumber: string | null
        billId: string | null
        vote: string
      }
    | {
        kind: 'stance'
        issueName: string
        issueSlug: string
        issueIcon: string | null
        stance: string
      }
  isFollowed?: boolean
}

function relativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  const diffMo = Math.floor(diffDay / 30)
  return `${diffMo}mo ago`
}

export function ActivityItem({ type, politician, date, details, isFollowed }: ActivityItemProps) {
  const pColor = partyColor(politician.party)

  return (
    <div
      className="flex gap-3 rounded-lg border px-4 py-3 transition-colors"
      style={{
        borderColor: isFollowed ? pColor + '40' : 'var(--codex-border)',
        backgroundColor: isFollowed ? pColor + '06' : 'transparent',
      }}
    >
      {/* Avatar */}
      <Link
        href={`/politicians/${politician.slug}`}
        className="flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: 40, height: 40 }}
      >
        <AvatarImage
          src={politician.image_url}
          alt={politician.name}
          size={40}
          fallbackColor={pColor}
          party={politician.party}
        />
      </Link>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <PartyIcon party={politician.party} size={14} />
            <Link
              href={`/politicians/${politician.slug}`}
              className="font-medium text-[var(--codex-text)] no-underline hover:underline"
            >
              {politician.name}
            </Link>
          </div>
          <span className="flex-shrink-0 text-xs text-[var(--codex-faint)]">
            {relativeTime(date)}
          </span>
        </div>

        {/* Action description */}
        <div className="mt-1 text-sm text-[var(--codex-sub)]">
          {type === 'vote' && details.kind === 'vote' && (
            <span>
              voted{' '}
              <span
                className="font-medium"
                style={{
                  color:
                    details.vote === 'yea'
                      ? '#22C55E'
                      : details.vote === 'nay'
                        ? '#EF4444'
                        : 'var(--codex-sub)',
                }}
              >
                {details.vote === 'yea'
                  ? 'Yea'
                  : details.vote === 'nay'
                    ? 'Nay'
                    : details.vote === 'abstain'
                      ? 'Abstain'
                      : 'Not Voting'}
              </span>{' '}
              on{' '}
              {details.billId ? (
                <Link
                  href={`/bills/${details.billId}`}
                  className="text-[var(--codex-text)] no-underline hover:underline"
                >
                  {details.billNumber ?? details.billName ?? 'a bill'}
                </Link>
              ) : (
                <span className="text-[var(--codex-text)]">
                  {details.billNumber ?? details.billName ?? 'a bill'}
                </span>
              )}
              {details.billNumber && details.billName && (
                <span className="text-[var(--codex-faint)]"> — {details.billName}</span>
              )}
            </span>
          )}

          {type === 'stance' && details.kind === 'stance' && (() => {
            const badge = stanceDisplayBadge(details.stance)
            return (
              <span className="flex flex-wrap items-center gap-1.5">
                <span>stance on</span>
                <span className="inline-flex items-center gap-1">
                  {details.issueIcon && (
                    <IssueIcon icon={details.issueIcon} size={14} className="inline-block" />
                  )}
                  <Link
                    href={`/issues/${details.issueSlug}`}
                    className="text-[var(--codex-text)] no-underline hover:underline"
                  >
                    {details.issueName}
                  </Link>
                </span>
                <span>updated to</span>
                <span
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={badge.style}
                >
                  {badge.label}
                </span>
              </span>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

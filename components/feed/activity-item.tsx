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
      className="flex overflow-hidden rounded-xl transition-colors"
      style={{
        border: `1.5px solid ${pColor}22`,
        backgroundColor: `${pColor}08`,
      }}
    >
      {/* Avatar */}
      <Link
        href={`/politicians/${politician.slug}`}
        className="w-[52px] flex-shrink-0 self-stretch overflow-hidden bg-[var(--poli-card)]"
      >
        <AvatarImage
          src={politician.image_url}
          alt={politician.name}
          size={104}
          fallbackColor={pColor}
          party={politician.party}
          className="h-full w-full object-cover object-top"
        />
      </Link>

      {/* Content */}
      <div className="min-w-0 flex-1 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            {politician.image_url && <PartyIcon party={politician.party} size={12} />}
            <Link
              href={`/politicians/${politician.slug}`}
              className="font-semibold text-[var(--poli-text)] no-underline hover:underline"
            >
              {politician.name}
            </Link>
          </div>
          <span className="flex-shrink-0 text-[11px] text-[var(--poli-faint)]">
            {relativeTime(date)}
          </span>
        </div>

        {/* Action description */}
        <div className="mt-1 text-sm text-[var(--poli-sub)]">
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
                        : 'var(--poli-sub)',
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
                  className="text-[var(--poli-text)] no-underline hover:underline"
                >
                  {details.billNumber ?? details.billName ?? 'a bill'}
                </Link>
              ) : (
                <span className="text-[var(--poli-text)]">
                  {details.billNumber ?? details.billName ?? 'a bill'}
                </span>
              )}
              {details.billNumber && details.billName && (
                <span className="text-[var(--poli-faint)]"> — {details.billName}</span>
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
                    className="text-[var(--poli-text)] no-underline hover:underline"
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

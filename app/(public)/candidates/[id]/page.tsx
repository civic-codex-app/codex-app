import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartyIcon } from '@/components/icons/party-icons'
import { IssueIcon } from '@/components/icons/issue-icon'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  running: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Running' },
  withdrawn: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Withdrawn' },
  won: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Won' },
  lost: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Lost' },
}

const STANCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  supports: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Favors' },
  opposes: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Opposes' },
  mixed: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Mixed' },
  unknown: { bg: 'bg-[var(--codex-badge-bg)]', text: 'text-[var(--codex-faint)]', label: 'Unknown' },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('candidates')
    .select('name, party')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Not Found | Poli' }

  return {
    title: `${data.name} | Poli`,
    description: `${partyLabel(data.party)} candidate`,
  }
}

export default async function CandidateProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select(`
      *,
      race:race_id (
        id, name, slug, state, district, chamber,
        elections:elections (id, name, slug, election_date)
      ),
      politician:politician_id (id, slug)
    `)
    .eq('id', id)
    .single()

  if (!candidate) notFound()

  // If the candidate has a linked politician profile, redirect there
  if (candidate.politician) {
    redirect(`/politicians/${(candidate.politician as any).slug}`)
  }

  const race = candidate.race as any
  const election = race?.elections as any
  const color = partyColor(candidate.party)
  const status = STATUS_CONFIG[candidate.status] ?? STATUS_CONFIG.running

  const electionDate = election?.election_date
    ? new Date(election.election_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // Fetch candidate stances
  const { data: stances } = await supabase
    .from('candidate_issues')
    .select('*, issues:issue_id(id, name, slug, icon, category)')
    .eq('candidate_id', candidate.id)
    .order('created_at')

  const candidateStances = (stances ?? []) as any[]

  // Compute alignment
  const alignment = candidateStances.length > 0
    ? computeAlignment(candidate.party, candidateStances)
    : -1
  const alignMeta = alignment >= 0 ? alignmentMeta(alignment, candidate.party) : null

  // Stance breakdown
  const supports = candidateStances.filter((s: any) => ['strongly_supports', 'supports', 'leans_support'].includes(s.stance)).length
  const opposes = candidateStances.filter((s: any) => ['strongly_opposes', 'opposes', 'leans_oppose'].includes(s.stance)).length
  const mixed = candidateStances.filter((s: any) => ['mixed', 'neutral'].includes(s.stance)).length
  const totalStances = supports + opposes + mixed

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[900px] px-6 md:px-10">
        {/* Back link */}
        {race && (
          <Link
            href={`/elections/${race.slug}`}
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
          >
            &larr; Back to {race.name}
          </Link>
        )}

        {/* Header section */}
        <div className="mb-8 flex items-start gap-5">
          {/* Avatar */}
          <div
            className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[var(--codex-card)] md:h-28 md:w-28"
            style={{ border: `3px solid ${color}44` }}
          >
            <AvatarImage
              src={candidate.image_url || ''}
              alt={candidate.name}
              size={128}
              fallbackColor={color}
            />
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="mb-2 text-[clamp(24px,4vw,42px)] font-bold leading-[1.1]">
              {candidate.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <PartyIcon party={candidate.party} size={16} />
              <span
                className={`rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] ${status.bg} ${status.text}`}
              >
                {status.label}
              </span>
              {candidate.is_incumbent && (
                <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                  Incumbent
                </span>
              )}
              <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                Challenger
              </span>
            </div>
          </div>
        </div>

        {/* Alignment + stance summary */}
        {totalStances > 0 && (
          <div className="mb-8 rounded-md border border-[var(--codex-border)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--codex-sub)]">
                Party Alignment
              </span>
              {alignMeta && (
                <span
                  className="rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: alignMeta.color, background: alignMeta.bgColor }}
                >
                  {alignMeta.label}
                </span>
              )}
            </div>

            {/* Gauge bar */}
            {alignment >= 0 && (
              <div className="relative mb-2">
                <div className="h-2 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${alignment}%`,
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-baseline justify-between">
              {alignment >= 0 && (
                <span className="text-2xl font-bold" style={{ color }}>
                  {alignment}%
                </span>
              )}
              <span className="text-[11px] text-[var(--codex-faint)]">
                {supports} for · {mixed} mixed · {opposes} against
              </span>
            </div>

            {/* Mini stance bar */}
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
              {supports > 0 && (
                <div style={{ width: `${(supports / totalStances) * 100}%`, background: '#3B82F6', opacity: 0.6 }} />
              )}
              {mixed > 0 && (
                <div style={{ width: `${(mixed / totalStances) * 100}%`, background: '#A855F7', opacity: 0.6 }} />
              )}
              {opposes > 0 && (
                <div style={{ width: `${(opposes / totalStances) * 100}%`, background: '#EF4444', opacity: 0.6 }} />
              )}
            </div>
          </div>
        )}

        {/* Race info */}
        {race && (
          <section className="mb-8">
            <div className="mb-2 text-sm font-semibold text-[var(--codex-sub)]">
              Race
            </div>
            <div className="rounded-md border border-[var(--codex-border)] p-4">
              <Link
                href={`/elections/${race.slug}`}
                className="text-lg font-semibold transition-colors hover:text-[var(--codex-text)]"
              >
                {race.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--codex-faint)]">
                {race.state && (
                  <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                    {race.state}
                    {race.district ? ` - District ${race.district}` : ''}
                  </span>
                )}
                {race.chamber && (
                  <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                    {race.chamber}
                  </span>
                )}
                {electionDate && <span>{electionDate}</span>}
              </div>
            </div>
          </section>
        )}

        {/* Bio */}
        {candidate.bio && (
          <section className="mb-8">
            <div className="mb-2 text-sm font-semibold text-[var(--codex-sub)]">
              About
            </div>
            <p className="text-[15px] leading-[1.7] text-[var(--codex-sub)]">
              {candidate.bio}
            </p>
          </section>
        )}

        {/* Issues & Stances */}
        {candidateStances.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
              Issues & Stances
            </h2>
            <div className="space-y-3">
              {candidateStances.map((s: any) => {
                const sc = STANCE_COLORS[s.stance] ?? STANCE_COLORS.unknown
                return (
                  <div
                    key={s.id}
                    className="rounded-md border border-[var(--codex-border)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/issues/${s.issues?.slug}`}
                        className="flex items-center gap-2 text-sm font-medium hover:text-[var(--codex-text)]"
                      >
                        {s.issues?.icon && <IssueIcon icon={s.issues.icon} size={16} className="text-[var(--codex-sub)]" />}
                        {s.issues?.name}
                      </Link>
                      <span className={`rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em] ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                    {s.summary && (
                      <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--codex-sub)]">{s.summary}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Campaign website */}
        {candidate.website_url && (
          <section className="mb-10">
            <div className="mb-2 text-sm font-semibold text-[var(--codex-sub)]">
              Links
            </div>
            <a
              href={candidate.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md border border-[var(--codex-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-[13px] font-medium no-underline transition-all hover:bg-[var(--codex-hover)]"
              style={{ color: color, borderColor: `${color}33` }}
            >
              <span>Campaign Website</span>
              <span className="text-base font-semibold" style={{ color: `${color}88` }}>
                &rarr;
              </span>
            </a>
          </section>
        )}

        <Footer />
      </div>
    </>
  )
}

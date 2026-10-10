import Link from 'next/link'
import { Card, Chip, SectionLabel } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import { Face } from '@/components/app/face'
import { money } from '@/components/politicians/money-card'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { countdown } from '@/lib/utils/next-election'

export interface RaceCandidate {
  id: string
  name: string
  party: string
  status: string
  is_incumbent: boolean
  image_url: string | null
  politician: { id: string; slug: string; image_url: string | null; chamber: string } | null
}

export interface RaceFinance {
  cycle: string
  total_raised: number | null
  cash_on_hand: number | null
  source: string | null
}

const OFFICE: Record<string, string> = {
  senate: 'U.S. Senate',
  house: 'U.S. House',
  governor: 'Governor',
  presidential: 'President',
}

function href(c: RaceCandidate) {
  return c.politician ? `/politicians/${c.politician.slug}` : `/candidates/${c.id}`
}

function photo(c: RaceCandidate) {
  return c.image_url || c.politician?.image_url || null
}

function isMajor(c: { party: string }) {
  return c.party === 'democrat' || c.party === 'republican'
}

function PersonRow({ c, last, note }: { c: RaceCandidate; last: boolean; note?: string }) {
  return (
    <Link href={href(c)} className={`flex min-h-[56px] items-center gap-3 no-underline ${last ? '' : 'border-b border-[var(--poli-border)]'}`}>
      {photo(c) ? (
        <Face src={photo(c)} alt={c.name} size={40} party={c.party} />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--poli-badge-bg)]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(c.party) }} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-[var(--poli-text)]">{c.name}</span>
        <span className="block text-[12.5px] text-[var(--poli-sub)]">
          {partyLabel(c.party)}
          {c.is_incumbent ? ' · incumbent' : ''}
          {note ? ` · ${note}` : ''}
        </span>
      </span>
    </Link>
  )
}

/**
 * A race as a head-to-head: the two nominees face to face, their money
 * beneath them when both have comparable FEC totals, and everyone else
 * behind a row.
 *
 * Money appears only when BOTH leading candidates hold a campaign_finance row
 * for this election's cycle AND the office they already hold is the office
 * on the ballot. campaign_finance is keyed by politician, not by campaign, so
 * a House member running for Senate carries House-committee totals that say
 * nothing about the Senate race; showing them beside an opponent's Senate
 * numbers would be a confident comparison of two different things.
 *
 * The head-to-head itself exists only once the race has been reconciled
 * against the state's certified candidate listing (`confirmed`). Before
 * that, "running" is everyone who filed with the FEC, primary losers
 * included, and the page lists them under "Filed with the FEC" and says so.
 */
export function RaceView({
  race,
  electionDate,
  incumbent,
  candidates,
  finance,
  comparison,
  unverified,
  confirmed,
}: {
  race: { name: string; slug: string; state: string; chamber: string; district: string | null; description: string | null }
  electionDate: string | null
  incumbent: { id: string; name: string; slug: string; party: string; image_url: string | null } | null
  candidates: RaceCandidate[]
  /** By politician id; only same-office politicians, only this cycle. */
  finance: Record<string, RaceFinance>
  comparison: React.ReactNode
  unverified: boolean
  /** races.ballot_confirmed_at is set: statuses come from the state's certified listing. */
  confirmed: boolean
}) {
  const running = candidates.filter((c) => c.status === 'running')
  const major = running.filter(isMajor)
  const leads = !confirmed ? [] : major.length >= 2 ? major.slice(0, 2) : running.slice(0, 2)
  const others = confirmed ? running.filter((c) => !leads.includes(c)) : []
  const filed = confirmed ? [] : running
  const lost = candidates.filter((c) => c.status === 'lost')
  const withdrawn = candidates.filter((c) => c.status === 'withdrawn')
  const incumbentRunning = incumbent ? running.some((c) => c.politician?.id === incumbent.id) : running.some((c) => c.is_incumbent)
  const openSeat = running.length > 0 && !incumbentRunning
  const c = electionDate ? countdown(electionDate) : null
  const office = OFFICE[race.chamber] ?? CHAMBER_LABELS[race.chamber as ChamberKey] ?? race.chamber
  const where = race.district ? `${race.state}-${race.district}` : race.state

  const fin = leads.map((l) => (l.politician ? finance[l.politician.id] ?? null : null))
  const showMoney = leads.length === 2 && fin.every((f) => f && f.total_raised !== null)
  const maxRaised = Math.max(...fin.map((f) => f?.total_raised ?? 0), 1)
  const maxCash = Math.max(...fin.map((f) => f?.cash_on_hand ?? 0), 1)
  const through = fin[0]?.source?.match(/through (\d{4})-(\d{2})-(\d{2})/)
  const throughLabel = through
    ? new Date(Date.UTC(+through[1], +through[2] - 1, +through[3])).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    : null

  return (
    <>
      <header className="mb-3 px-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">
            {office} · {where}
          </span>
          {running.length > 0 && <Chip>{!confirmed ? 'Nominees not confirmed' : openSeat ? 'Open seat' : 'Incumbent running'}</Chip>}
        </div>
        <h1 className="mt-2 font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">{race.name}</h1>
        {c && (
          <p className="mt-1 text-[14px] text-[var(--poli-sub)]">
            {c.long} · {c.days} {c.days === 1 ? 'day' : 'days'}
          </p>
        )}
      </header>

      {incumbent && (
        <Card flush className="mb-3 flex items-center gap-3 px-3.5 py-3">
          <Face src={incumbent.image_url} alt={incumbent.name} size={44} party={incumbent.party} />
          <p className="text-[14px] leading-[1.4] text-[var(--poli-sub)]">
            <Link href={`/politicians/${incumbent.slug}`} className="font-semibold text-[var(--poli-text)] no-underline">
              {incumbent.name}
            </Link>{' '}
            ({partyLabel(incumbent.party)}) {incumbentRunning ? (confirmed ? 'is running again.' : 'filed to run again.') : 'is not on the ballot for this seat.'}
          </p>
        </Card>
      )}

      {leads.length === 2 && (
        <Card className="mb-3">
          <div className="grid grid-cols-2 gap-3">
            {leads.map((l) => (
              <Link key={l.id} href={href(l)} className="flex flex-col items-center text-center no-underline">
                {photo(l) ? (
                  <Face src={photo(l)} alt={l.name} size={64} party={l.party} />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--poli-badge-bg)]">
                    <span className="h-3 w-3 rounded-full" style={{ background: partyColor(l.party) }} />
                  </span>
                )}
                <span className="mt-2 text-[16px] font-semibold leading-[1.2] text-[var(--poli-text)]">{l.name}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--poli-sub)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: partyColor(l.party) }} />
                  {partyLabel(l.party)}
                  {l.is_incumbent ? ' · incumbent' : ''}
                </span>
              </Link>
            ))}
          </div>

          {showMoney && (
            <>
              {(
                [
                  ['Raised', (f: RaceFinance | null) => f?.total_raised ?? 0, maxRaised],
                  ['Cash on hand', (f: RaceFinance | null) => f?.cash_on_hand ?? 0, maxCash],
                ] as const
              ).map(([label, get, max], i) => (
                <div key={label} className={`mt-3.5 ${i === 0 ? 'border-t border-[var(--poli-border)] pt-3' : ''}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">{label}</div>
                  <div className="mt-1.5 grid grid-cols-2 gap-3">
                    {leads.map((l, k) => (
                      <div key={l.id}>
                        <div className="text-[20px] font-bold tabular-nums text-[var(--poli-text)]">{money(get(fin[k]))}</div>
                        <div className="mt-1 h-2 rounded-full bg-[var(--poli-badge-bg)]">
                          <div className="h-2 rounded-full" style={{ width: `${Math.round((get(fin[k]) / max) * 100)}%`, background: partyColor(l.party) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="mt-3.5 border-t border-[var(--poli-border)] pt-3 text-[12.5px] text-[var(--poli-sub)]">
                FEC filings, {fin[0]?.cycle} cycle{throughLabel ? ` through ${throughLabel}` : ''}
              </p>
            </>
          )}
        </Card>
      )}

      {(filed.length > 0 || others.length > 0 || lost.length > 0 || withdrawn.length > 0 || (leads.length > 0 && leads.length < 2)) && (
        <Card flush className="mb-3 px-4">
          {filed.length > 0 && (
            <div className={lost.length > 0 || withdrawn.length > 0 ? 'border-b border-[var(--poli-border)]' : ''}>
              <div className="pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Filed with the FEC</div>
              {filed.map((o, i) => <PersonRow key={o.id} c={o} last={i === filed.length - 1} />)}
            </div>
          )}
          {leads.length === 1 && (
            <div className="border-b border-[var(--poli-border)]">
              <div className="pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">On the ballot</div>
              <PersonRow c={leads[0]} last />
            </div>
          )}
          {others.length > 0 && (
            <Disclosure title="Also on the ballot" trailing={<span className="text-[13px] font-semibold text-[var(--poli-sub)]">{others.length}</span>} last={lost.length === 0 && withdrawn.length === 0}>
              {others.map((o, i) => <PersonRow key={o.id} c={o} last={i === others.length - 1} />)}
            </Disclosure>
          )}
          {lost.length > 0 && (
            <Disclosure title="Lost the primary" trailing={<span className="text-[13px] font-semibold text-[var(--poli-sub)]">{lost.length}</span>} last={withdrawn.length === 0}>
              {lost.map((o, i) => <PersonRow key={o.id} c={o} last={i === lost.length - 1} />)}
            </Disclosure>
          )}
          {withdrawn.length > 0 && (
            <Disclosure title="Not on the ballot" meta="Filed, then withdrew or did not qualify" trailing={<span className="text-[13px] font-semibold text-[var(--poli-sub)]">{withdrawn.length}</span>} last>
              {withdrawn.map((o, i) => <PersonRow key={o.id} c={o} last={i === withdrawn.length - 1} />)}
            </Disclosure>
          )}
        </Card>
      )}

      {candidates.length === 0 && (
        <Card className="mb-3">
          {/* Describes our data, not the world's: asserting nobody has
              announced would be a claim we cannot support. */}
          <p className="text-[15px] font-semibold text-[var(--poli-text)]">No candidates on record yet</p>
          <p className="mt-1 text-[13.5px] text-[var(--poli-sub)]">We don&rsquo;t have a candidate list for this race.</p>
        </Card>
      )}

      {filed.length > 0 && (
        <p className="mb-3 px-1 text-[13px] leading-[1.5] text-[var(--poli-sub)]">
          Everyone who filed with the FEC for this seat. Poli hasn&rsquo;t checked {STATE_NAMES[race.state] ?? race.state}&rsquo;s certified ballot yet, so this can include candidates who lost their primary.
        </p>
      )}

      {unverified && candidates.length > 0 && (
        <p className="mb-3 px-1 text-[12px] leading-relaxed text-[var(--poli-faint)]">
          This candidate list has not been checked against state filing records, so challengers may be missing.
        </p>
      )}

      {race.description && (
        <p className="mb-4 px-1 text-[14px] leading-[1.55] text-[var(--poli-sub)]">{race.description}</p>
      )}

      {comparison && (
        <section className="mb-5">
          <SectionLabel>Where they stand</SectionLabel>
          {comparison}
        </section>
      )}
    </>
  )
}

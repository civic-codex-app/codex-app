'use client'

import { useState, useEffect, useCallback } from 'react'

interface OverviewData {
  totalEvents: number
  todayEvents: number
  totalUsers: number
  newUsers: number
}

interface TopEvent {
  event_name: string
  event_count: number
}

interface DailyUser {
  day: string
  authenticated_users: number
  anonymous_sessions: number
  total_events: number
}

interface TopPage {
  page_path: string
  view_count: number
  unique_users: number
}

interface TopPolitician {
  slug: string
  party: string
  view_count: number
  unique_viewers: number
}

interface TopSearch {
  query: string
  search_count: number
  avg_results: number
}

interface QuizStage {
  stage: string
  user_count: number
}

interface RecentEvent {
  id: string
  event_name: string
  event_data: Record<string, unknown>
  user_id: string | null
  session_id: string | null
  page_path: string | null
  created_at: string
}

interface TopCity {
  city: string
  count: number
}

interface AnalyticsData {
  overview: OverviewData
  topEvents: TopEvent[]
  dailyUsers: DailyUser[]
  topPages: TopPage[]
  topPoliticians: TopPolitician[]
  topSearches: TopSearch[]
  quizFunnel: QuizStage[]
  recentActivity: RecentEvent[]
  topCities: TopCity[]
}

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page Views',
  politician_viewed: 'Politician Views',
  search_performed: 'Searches',
  quiz_started: 'Quiz Started',
  quiz_completed: 'Quiz Completed',
  quiz_question_answered: 'Quiz Answers',
  quiz_result_viewed: 'Results Viewed',
  quiz_cta_signup_clicked: 'Signup CTA Clicks',
  quiz_results_shared: 'Results Shared',
  poll_voted: 'Poll Votes',
  politician_followed: 'Follows',
  bill_followed: 'Bill Follows',
}

function formatEventName(name: string): string {
  return EVENT_LABELS[name] || name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function partyDot(party: string | null): string {
  if (party === 'democrat') return '#2563EB'
  if (party === 'republican') return '#DC2626'
  if (party === 'independent') return '#8B5CF6'
  return '#9CA3AF'
}

/** Inline SVG sparkline for daily data */
function Sparkline({ data, color = '#3B82F6' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const w = 120
  const h = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - (v / max) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} className="inline-block" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Bar chart for quiz funnel */
function FunnelBar({ stages }: { stages: QuizStage[] }) {
  if (stages.length === 0) return <p className="text-[13px] text-[var(--poli-faint)]">No quiz data yet</p>
  const max = Math.max(...stages.map(s => s.user_count), 1)

  const labels: Record<string, string> = {
    started: 'Started',
    completed: 'Completed',
    result_viewed: 'Viewed Results',
    signup_after_quiz: 'Signed Up',
  }

  return (
    <div className="space-y-2">
      {stages.map((s) => {
        const pct = (s.user_count / max) * 100
        return (
          <div key={s.stage}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-[var(--poli-sub)]">{labels[s.stage] ?? s.stage}</span>
              <span className="font-medium text-[var(--poli-text)]">{s.user_count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--poli-border)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [liveTab, setLiveTab] = useState<'activity' | 'searches'>('activity')

  const fetchData = useCallback(async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const json = await res.json()
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(days)
  }, [days, fetchData])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchData(days), 60000)
    return () => clearInterval(interval)
  }, [days, fetchData])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--poli-text)] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-red-400">{error}</p>
        <button onClick={() => fetchData(days)} className="mt-4 text-[13px] text-[var(--poli-sub)] underline">
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const { overview, topEvents, dailyUsers, topPages, topPoliticians, topSearches, quizFunnel, recentActivity, topCities } = data

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--poli-text)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--poli-sub)]">
            User activity and engagement tracking
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                days === p.days
                  ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
                  : 'text-[var(--poli-sub)] hover:text-[var(--poli-text)]'
              }`}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Events Today', value: overview.todayEvents, color: '#3B82F6' },
          { label: `Events (${days}d)`, value: overview.totalEvents, color: '#8B5CF6' },
          { label: 'Total Users', value: overview.totalUsers, color: '#22C55E' },
          { label: `New Users (${days}d)`, value: overview.newUsers, color: '#EAB308' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5"
          >
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--poli-sub)]">
              {card.label}
            </div>
            <div className="text-3xl font-bold" style={{ color: card.color }}>
              {formatNumber(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Activity Chart */}
      {dailyUsers.length > 0 && (
        <div className="mb-8 rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Daily Activity
          </h2>
          <DailyChart data={dailyUsers} />
        </div>
      )}

      {/* Two-column grid */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Top Events */}
        <div className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Top Events
          </h2>
          <div className="space-y-2">
            {topEvents.slice(0, 12).map((e) => {
              const maxCount = topEvents[0]?.event_count ?? 1
              const pct = (e.event_count / maxCount) * 100
              return (
                <div key={e.event_name} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="truncate text-[var(--poli-text)]">{formatEventName(e.event_name)}</span>
                      <span className="ml-2 shrink-0 font-medium tabular-nums text-[var(--poli-sub)]">
                        {formatNumber(e.event_count)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--poli-border)]">
                      <div
                        className="h-full rounded-full bg-[#3B82F6]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {topEvents.length === 0 && (
              <p className="text-[13px] text-[var(--poli-faint)]">No events recorded yet</p>
            )}
          </div>
        </div>

        {/* Quiz Funnel */}
        <div className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Quiz Funnel
          </h2>
          <FunnelBar stages={quizFunnel} />

          <h2 className="mb-3 mt-8 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Top Politicians Viewed
          </h2>
          <div className="space-y-1.5">
            {topPoliticians.slice(0, 8).map((p, i) => (
              <div key={p.slug} className="flex items-center gap-2 text-[13px]">
                <span className="w-4 shrink-0 text-right text-[var(--poli-faint)]">{i + 1}</span>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: partyDot(p.party) }}
                />
                <span className="min-w-0 flex-1 truncate text-[var(--poli-text)]">
                  {p.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--poli-sub)]">
                  {formatNumber(p.view_count)}
                </span>
              </div>
            ))}
            {topPoliticians.length === 0 && (
              <p className="text-[13px] text-[var(--poli-faint)]">No politician views yet</p>
            )}
          </div>
        </div>

        {/* Top Pages */}
        <div className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Top Pages
          </h2>
          <div className="space-y-1.5">
            {topPages.slice(0, 12).map((p, i) => (
              <div key={p.page_path} className="flex items-center gap-2 text-[13px]">
                <span className="w-4 shrink-0 text-right text-[var(--poli-faint)]">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--poli-text)]">
                  {p.page_path}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--poli-sub)]">
                  {formatNumber(p.view_count)}
                </span>
                <span className="shrink-0 text-[11px] text-[var(--poli-faint)]">
                  ({p.unique_users} unique)
                </span>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="text-[13px] text-[var(--poli-faint)]">No page views yet</p>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Visitor Locations
          </h2>
          <div className="space-y-1.5">
            {topCities.slice(0, 12).map((c, i) => {
              const maxCount = topCities[0]?.count ?? 1
              const pct = (c.count / maxCount) * 100
              return (
                <div key={c.city} className="flex items-center gap-2 text-[13px]">
                  <span className="w-4 shrink-0 text-right text-[var(--poli-faint)]">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[var(--poli-text)]">{c.city}</span>
                      <span className="ml-2 shrink-0 tabular-nums text-[var(--poli-sub)]">{c.count}</span>
                    </div>
                    <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[var(--poli-border)]">
                      <div
                        className="h-full rounded-full bg-[#22C55E]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {topCities.length === 0 && (
              <p className="text-[13px] text-[var(--poli-faint)]">No location data yet (available on deployed app)</p>
            )}
          </div>
        </div>

        {/* Live Feed / Searches Toggle */}
        <div className="rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-5">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => setLiveTab('activity')}
              className={`text-[12px] font-medium uppercase tracking-[0.15em] transition-colors ${
                liveTab === 'activity' ? 'text-[var(--poli-text)]' : 'text-[var(--poli-faint)]'
              }`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            >
              Live Activity
            </button>
            <button
              onClick={() => setLiveTab('searches')}
              className={`text-[12px] font-medium uppercase tracking-[0.15em] transition-colors ${
                liveTab === 'searches' ? 'text-[var(--poli-text)]' : 'text-[var(--poli-faint)]'
              }`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            >
              Top Searches
            </button>
          </div>

          {liveTab === 'activity' ? (
            <div className="max-h-[400px] space-y-1 overflow-y-auto">
              {recentActivity.slice(0, 30).map((e) => (
                <div key={e.id} className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[12px] hover:bg-[var(--poli-hover)]">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[var(--poli-text)]">
                      {formatEventName(e.event_name)}
                    </span>
                    {e.page_path && (
                      <span className="ml-1.5 font-mono text-[11px] text-[var(--poli-faint)]">
                        {e.page_path}
                      </span>
                    )}
                    {e.event_data && Object.keys(e.event_data).length > 0 && (
                      <div className="mt-0.5 text-[11px] text-[var(--poli-faint)]">
                        {Object.entries(e.event_data)
                          .filter(([k]) => !k.startsWith('_')) // hide internal geo fields from detail view
                          .slice(0, 3)
                          .map(([k, v]) => (
                          <span key={k} className="mr-2">
                            {k}: <span className="text-[var(--poli-sub)]">{String(v)}</span>
                          </span>
                        ))}
                        {/* Show city inline if available */}
                        {typeof e.event_data._city === 'string' && (
                          <span className="mr-2">
                            from <span className="text-[var(--poli-sub)]">{e.event_data._city}{typeof e.event_data._region === 'string' ? `, ${e.event_data._region}` : ''}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-[var(--poli-faint)]">
                    {timeAgo(e.created_at)}
                  </span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="py-4 text-center text-[13px] text-[var(--poli-faint)]">No activity yet</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {topSearches.slice(0, 15).map((s, i) => (
                <div key={s.query} className="flex items-center gap-2 text-[13px]">
                  <span className="w-4 shrink-0 text-right text-[var(--poli-faint)]">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[var(--poli-text)]">&ldquo;{s.query}&rdquo;</span>
                  <span className="shrink-0 tabular-nums text-[var(--poli-sub)]">{s.search_count}x</span>
                  <span className="shrink-0 text-[11px] text-[var(--poli-faint)]">
                    avg {s.avg_results ?? 0} results
                  </span>
                </div>
              ))}
              {topSearches.length === 0 && (
                <p className="py-4 text-center text-[13px] text-[var(--poli-faint)]">No searches yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Pure SVG daily activity chart */
function DailyChart({ data }: { data: DailyUser[] }) {
  if (data.length === 0) return null

  const maxEvents = Math.max(...data.map(d => d.total_events), 1)
  const maxUsers = Math.max(...data.map(d => d.authenticated_users + d.anonymous_sessions), 1)

  const w = 800
  const h = 160
  const padding = { top: 10, right: 10, bottom: 24, left: 40 }
  const chartW = w - padding.left - padding.right
  const chartH = h - padding.top - padding.bottom

  const barWidth = Math.max(2, (chartW / data.length) * 0.7)
  const gap = (chartW / data.length) * 0.3

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Y-axis labels */}
      {[0, 0.5, 1].map((frac) => {
        const y = padding.top + chartH * (1 - frac)
        const val = Math.round(maxEvents * frac)
        return (
          <g key={frac}>
            <line
              x1={padding.left} y1={y}
              x2={w - padding.right} y2={y}
              stroke="var(--poli-border)" strokeWidth="0.5"
            />
            <text
              x={padding.left - 6} y={y + 3}
              textAnchor="end"
              fontSize="9" fill="var(--poli-faint)"
            >
              {formatNumber(val)}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + i * (barWidth + gap)
        const barH = (d.total_events / maxEvents) * chartH
        const authH = (d.authenticated_users / Math.max(d.authenticated_users + d.anonymous_sessions, 1)) * barH

        return (
          <g key={d.day}>
            {/* Anonymous portion */}
            <rect
              x={x} y={padding.top + chartH - barH}
              width={barWidth} height={barH}
              rx={1}
              fill="#3B82F6" opacity={0.25}
            />
            {/* Authenticated portion */}
            <rect
              x={x} y={padding.top + chartH - authH}
              width={barWidth} height={authH}
              rx={1}
              fill="#3B82F6"
            />

            {/* X-axis label (every few days) */}
            {(i === 0 || i === data.length - 1 || i % Math.max(1, Math.floor(data.length / 6)) === 0) && (
              <text
                x={x + barWidth / 2}
                y={h - 4}
                textAnchor="middle"
                fontSize="8" fill="var(--poli-faint)"
              >
                {new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <rect x={w - 140} y={4} width={8} height={8} rx={1} fill="#3B82F6" />
      <text x={w - 128} y={12} fontSize="9" fill="var(--poli-sub)">Logged-in</text>
      <rect x={w - 70} y={4} width={8} height={8} rx={1} fill="#3B82F6" opacity={0.25} />
      <text x={w - 58} y={12} fontSize="9" fill="var(--poli-sub)">Anonymous</text>
    </svg>
  )
}

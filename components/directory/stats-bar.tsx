import { DonkeyIcon, ElephantIcon, StarIcon } from '@/components/icons/party-icons'
import type { Politician } from '@/lib/types/politician'

interface StatsBarProps {
  politicians: Politician[]
}

export function StatsBar({ politicians }: StatsBarProps) {
  const stats = [
    { label: 'Total Officials', value: politicians.length, icon: null, color: null },
    {
      label: 'Democrat',
      value: politicians.filter((p) => p.party === 'democrat').length,
      icon: <DonkeyIcon size={16} color="#2563EB" />,
      color: '#2563EB',
    },
    {
      label: 'Republican',
      value: politicians.filter((p) => p.party === 'republican').length,
      icon: <ElephantIcon size={16} color="#DC2626" />,
      color: '#DC2626',
    },
    {
      label: 'Independent',
      value: politicians.filter((p) => p.party === 'independent').length,
      icon: <StarIcon size={16} color="#7C3AED" />,
      color: '#7C3AED',
    },
  ]

  return (
    <div className="mb-12 grid animate-fade-up grid-cols-2 gap-px bg-[var(--poli-border)] md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-[var(--poli-card)] p-5 transition-colors">
          <div className="mb-2.5 flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] text-[var(--poli-sub)]">
            {s.icon}
            {s.label}
          </div>
          <div className="text-[34px] font-bold" style={s.color ? { color: s.color } : undefined}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}

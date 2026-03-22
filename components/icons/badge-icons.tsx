interface IconProps {
  size?: number
  className?: string
}

function I({ size = 20, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

/** Ballot box — first_vote */
export function BallotIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
      <path d="m9 12 2 2 4-4" />
    </I>
  )
}

/** Graduation cap — informed_voter */
export function GraduationCapIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" />
    </I>
  )
}

/** Brain — issue_expert */
export function BrainIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 2a5 5 0 0 1 5 5c0 .7-.2 1.4-.5 2h.5a4 4 0 0 1 0 8h-.5c.3.6.5 1.3.5 2a5 5 0 0 1-5 5 5 5 0 0 1-5-5c0-.7.2-1.4.5-2H7a4 4 0 0 1 0-8h.5C7.2 8.4 7 7.7 7 7a5 5 0 0 1 5-5z" />
      <path d="M12 2v20" />
    </I>
  )
}

/** Scroll — bill_watcher */
export function ScrollIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
    </I>
  )
}

/** Flame — civic_regular */
export function FlameIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </I>
  )
}

/** Trophy — civic_champion */
export function TrophyIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </I>
  )
}

/** Handshake / Users — networker */
export function NetworkIcon(p: IconProps) {
  return (
    <I {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </I>
  )
}

/** Star — dedicated */
export function StarIcon(p: IconProps) {
  return (
    <I {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </I>
  )
}

/** Lock — for unearned badges */
export function LockIcon(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </I>
  )
}

/** Map badge ID to its icon component */
const BADGE_ICON_MAP: Record<string, React.FC<IconProps>> = {
  first_vote: BallotIcon,
  informed_voter: GraduationCapIcon,
  issue_expert: BrainIcon,
  bill_watcher: ScrollIcon,
  civic_regular: FlameIcon,
  civic_champion: TrophyIcon,
  networker: NetworkIcon,
  dedicated: StarIcon,
}

export function BadgeIcon({ badgeId, ...props }: IconProps & { badgeId: string }) {
  const Component = BADGE_ICON_MAP[badgeId] ?? StarIcon
  return <Component {...props} />
}

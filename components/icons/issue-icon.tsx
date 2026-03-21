import {
  Briefcase,
  HeartPulse,
  Globe,
  GraduationCap,
  Shield,
  Leaf,
  Scale,
  Landmark,
  Cpu,
  Users,
  Target,
  HardHat,
  Home,
  Zap,
  type LucideProps,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  briefcase: Briefcase,
  'heart-pulse': HeartPulse,
  globe: Globe,
  'graduation-cap': GraduationCap,
  shield: Shield,
  leaf: Leaf,
  scale: Scale,
  landmark: Landmark,
  cpu: Cpu,
  users: Users,
  target: Target,
  'hard-hat': HardHat,
  home: Home,
  zap: Zap,
}

interface IssueIconProps extends LucideProps {
  icon?: string | null
}

export function IssueIcon({ icon, ...props }: IssueIconProps) {
  if (!icon) return null
  const Icon = ICON_MAP[icon]
  if (!Icon) return <span className="text-lg">{icon}</span>
  return <Icon {...props} />
}

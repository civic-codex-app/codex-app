import { BottomTabs } from '@/components/layout/bottom-tabs'
import { BackToTop } from '@/components/ui/back-to-top'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen transition-colors duration-400">
      <main id="main-content" className="pb-[72px] sm:pb-0">
        {children}
      </main>
      <BackToTop />
      <BottomTabs />
    </div>
  )
}

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BottomTabs } from '@/components/layout/bottom-tabs'
import { BackToTop } from '@/components/ui/back-to-top'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { ThemeInit } from '@/components/layout/theme-init'

/**
 * The chrome lives here, not in the pages.
 *
 * All 31 public pages used to render <Header /> and <Footer /> themselves —
 * seven of them two or three times, once per early-return branch. Three costs:
 *
 *  - Header is a client component that resolves the session in an effect, so
 *    it unmounted and remounted on every navigation and re-resolved each time.
 *    The avatar visibly popped in on every page.
 *  - Every loading.tsx would have to re-render the header itself or the nav
 *    bar would vanish during each navigation, which is the loudest "this is a
 *    web page" signal there is.
 *  - position: sticky dies inside a transformed ancestor, so page transitions
 *    cannot animate a subtree that contains the header.
 *
 * Footer carries no width of its own — it relied on each page's
 * max-w-[1200px] container — so it is wrapped here to keep the same measure.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen transition-colors duration-400">
      <ThemeInit />
      <AnalyticsProvider />
      <Header />
      <main id="main-content" className="pb-[72px] sm:pb-0">
        {children}
      </main>
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <Footer />
      </div>
      <BackToTop />
      <BottomTabs />
    </div>
  )
}

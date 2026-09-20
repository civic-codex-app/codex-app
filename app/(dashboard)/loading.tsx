import { SkeletonBlock, SkeletonScreen } from '@/components/ui/skeleton'

/**
 * Loading placeholder for the whole (dashboard) route group — /dashboard,
 * /following, /account, /ballot-scorecard and /onboarding all render through
 * this one file.
 *
 * It is deliberately just the page header and one panel, because that is the
 * most these five pages actually share. Below the header they have nothing in
 * common: measured signed in at 390px, the first content block is a 575px
 * engagement panel on /dashboard, a 218px empty state on /following and a
 * 764px settings form on /account. Worse, each of those changes by hundreds of
 * pixels depending on whether the account has any data — a new account sees
 * "No priority issues set" where an established one sees a list.
 *
 * An earlier version drew three detailed sections here: an engagement panel,
 * rows from components/directory/politician-card.tsx, and a bordered list. It
 * matched none of the five. The rows were PoliticianCard, which /dashboard does
 * not use; its section order was /dashboard's two sections swapped; and it
 * missed Quick Links entirely, a 655px block sitting near the fold.
 *
 * The header, though, is exact. /dashboard, /following and /account all render
 *   h1  text-3xl   -> a 36px line box, mb-2
 *   p   text-sm    -> a 20px line box, mb-10
 * so content starts at y=181 on all three, and this skeleton puts it there.
 *
 * The rule when a placeholder cannot fit every case: err SHORT. Too short only
 * grows more page below the fold, which the reader is not looking at. Too tall
 * yanks what they are already reading up the screen when the content lands.
 * The same reasoning governs app/(public)/compare/loading.tsx.
 *
 * Known divergence: /ballot-scorecard's h1 wraps to two lines at 390px and its
 * subtitle to two, so its content starts lower than this reserves. That is the
 * short direction, which is the tolerable one.
 *
 * If /dashboard ever deserves its own placeholder it wants its own file at
 * app/(dashboard)/dashboard/loading.tsx — it is `force-dynamic` with about ten
 * sequential Supabase round-trips, so it is the slowest of the five — but it
 * needs measuring against a populated account, not an empty one.
 *
 * Chrome is not drawn here: app/(dashboard)/layout.tsx already supplies the
 * header, the secondary nav, the mobile tab bar, and the
 * `mx-auto max-w-[1200px] px-6 py-8 md:px-10 md:py-10` <main> this sits inside.
 */
export default function DashboardLoading() {
  return (
    <SkeletonScreen label="Loading your account">
      {/* h1: text-3xl, a 36px line box, then mb-2 */}
      <SkeletonBlock className="mb-2 h-9 w-[190px]" />
      {/* subtitle: text-sm, a 20px line box, then mb-10 */}
      <SkeletonBlock className="mb-10 h-5 w-[260px] max-w-full" />

      {/* One neutral panel. Every page in the group opens with a bordered
          block; none of them opens with the same one, so this reserves a
          modest amount of room rather than pretending to know which. */}
      <div className="rounded-lg border border-[var(--poli-border)] p-5">
        <SkeletonBlock className="mb-4 h-5 w-[150px]" />
        <SkeletonBlock className="mb-3 h-4 w-full" />
        <SkeletonBlock className="mb-3 h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </SkeletonScreen>
  )
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * The homepage's personalised strip, in one round trip.
 *
 * The homepage used to read the auth cookie in its server component to build
 * this. Reading cookies opts a route out of static rendering unconditionally —
 * at the point of the `cookies()` call, not at the point a user is found — so
 * the page was dynamic for 100% of traffic, signed-out visitors included, and
 * its `revalidate = 1800` never applied.
 *
 * Everything personal about the homepage is here: the representatives for the
 * visitor's state, whether they have taken the quiz, and which issues they
 * follow (used only to sort followed topics first).
 */
export async function GET() {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { signedIn: false, hasQuizAnswers: false, representatives: [], followedIssueIds: [] },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  }

  // Service role past this point: the id comes from the verified session, and
  // `profiles` is closed to anon.
  const supabase = createServiceRoleClient()
  const [{ data: profile }, { data: issueFollows }] = await Promise.all([
    supabase.from('profiles').select('state, quiz_answers').eq('id', user.id).maybeSingle(),
    supabase.from('issue_follows').select('issue_id').eq('user_id', user.id),
  ])

  let representatives: unknown[] = []
  if (profile?.state) {
    const { data: reps } = await supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, title, image_url')
      .eq('state', profile.state)
      .in('chamber', ['senate', 'house', 'governor'])
      .order('chamber')
      .limit(20)
    representatives = reps ?? []
  }

  const quizAnswers = profile?.quiz_answers as Record<string, string> | null | undefined

  return NextResponse.json(
    {
      signedIn: true,
      hasQuizAnswers: !!quizAnswers && Object.keys(quizAnswers).length > 0,
      representatives,
      followedIssueIds: (issueFollows ?? []).map((f: { issue_id: string }) => f.issue_id),
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  )
}

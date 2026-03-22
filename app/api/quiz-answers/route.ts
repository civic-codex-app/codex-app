import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * GET /api/quiz-answers
 * Returns the authenticated user's quiz_answers from their profile.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createServiceRoleClient()
    const { data, error } = await admin
      .from('profiles')
      .select('quiz_answers')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Failed to fetch quiz answers:', error)
      return NextResponse.json({ error: 'Failed to fetch quiz answers' }, { status: 500 })
    }

    return NextResponse.json({ answers: data?.quiz_answers ?? {} })
  } catch (err) {
    console.error('Quiz answers GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/quiz-answers
 * Updates the authenticated user's quiz_answers in their profile.
 * Body: { answers: Record<string, string> }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const answers = body?.answers

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'answers object is required' }, { status: 400 })
    }

    const admin = createServiceRoleClient()
    const { error } = await admin
      .from('profiles')
      .update({ quiz_answers: answers })
      .eq('id', user.id)

    if (error) {
      console.error('Failed to save quiz answers:', error)
      return NextResponse.json({ error: 'Failed to save quiz answers' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Quiz answers POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

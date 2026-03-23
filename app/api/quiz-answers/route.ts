import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'
import { z } from 'zod'
import { STANCE_NUMERIC } from '@/lib/utils/stances'

const stanceKeys = Object.keys(STANCE_NUMERIC) as [string, ...string[]]

const QuizAnswersSchema = z
  .record(
    z.string().regex(/^[a-z0-9-]+$/).max(100),
    z.enum(stanceKeys),
  )
  .refine(obj => Object.keys(obj).length <= 20, { message: 'Too many answers' })

/**
 * GET /api/quiz-answers
 * Returns the authenticated user's quiz_answers from their profile.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, WRITE_OP)
  if (!limited.success) return limited.response

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
  const limited = rateLimit(request, WRITE_OP)
  if (!limited.success) return limited.response

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = QuizAnswersSchema.safeParse(body?.answers ?? {})

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 })
    }

    const admin = createServiceRoleClient()
    const { error } = await admin
      .from('profiles')
      .update({ quiz_answers: parsed.data })
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

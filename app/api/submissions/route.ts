import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { z } from 'zod'

const SUBMISSION_TYPES = ['contact', 'suggest_politician', 'update_politician', 'report_error', 'submit_tip'] as const

const baseSchema = z.object({
  type: z.enum(SUBMISSION_TYPES),
  data: z.record(z.unknown()),
  // Honeypot — must be empty
  website: z.string().max(0).optional(),
  // Timestamp check
  _ts: z.number(),
})

const dataSchemas: Record<string, z.ZodType> = {
  contact: z.object({
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(5000),
  }),
  suggest_politician: z.object({
    politician_name: z.string().min(1).max(200),
    state: z.string().max(2).optional(),
    party: z.string().max(50).optional(),
    office: z.string().max(200).optional(),
    source_url: z.string().url().max(500).optional().or(z.literal('')),
    notes: z.string().max(2000).optional(),
  }),
  update_politician: z.object({
    politician_id: z.string().uuid().optional(),
    politician_name: z.string().min(1).max(200),
    field_to_update: z.string().min(1).max(100),
    current_value: z.string().max(500).optional(),
    suggested_value: z.string().min(1).max(500),
    source_url: z.string().url().max(500).optional().or(z.literal('')),
  }),
  report_error: z.object({
    page_url: z.string().max(500),
    description: z.string().min(1).max(2000),
  }),
  submit_tip: z.object({
    politician_name: z.string().max(200).optional(),
    tip_text: z.string().min(1).max(5000),
    source_url: z.string().url().max(500).optional().or(z.literal('')),
  }),
}

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in to submit' }, { status: 401 })
  }

  // Rate limit: check recent submissions from this user
  const serviceClient = createServiceRoleClient()
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count } = await serviceClient
    .from('public_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', fiveMinAgo)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a few minutes.' }, { status: 429 })
  }

  // Parse body
  let body: z.infer<typeof baseSchema>
  try {
    const raw = await request.json()
    body = baseSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
  }

  // Honeypot check
  if (body.website && body.website.length > 0) {
    // Bot detected — return success silently
    return NextResponse.json({ success: true })
  }

  // Time check — reject if form submitted too fast (< 2 seconds)
  const elapsed = Date.now() - body._ts
  if (elapsed < 2000) {
    return NextResponse.json({ success: true }) // silent reject
  }

  // Validate data payload per type
  const dataSchema = dataSchemas[body.type]
  if (!dataSchema) {
    return NextResponse.json({ error: 'Unknown submission type' }, { status: 400 })
  }

  let validatedData: Record<string, unknown>
  try {
    validatedData = dataSchema.parse(body.data) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  // Get user profile for name/email
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  // Insert
  const { error } = await serviceClient.from('public_submissions').insert({
    type: body.type,
    user_id: user.id,
    name: profile?.display_name ?? user.email?.split('@')[0] ?? 'Unknown',
    email: user.email ?? profile?.email ?? '',
    data: validatedData,
  })

  if (error) {
    console.error('Failed to insert submission:', error.message)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

/**
 * Seed script for polls data.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node supabase/seed_polls.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// 30 days from now
const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

const POLLS = [
  {
    title: 'Do you approve of the job the President is doing?',
    description:
      'Rate your approval of the current administration on a four-point scale.',
    poll_type: 'approval',
    status: 'active',
    ends_at: endsAt,
    options: [
      { label: 'Strongly Approve', sort_order: 1 },
      { label: 'Approve', sort_order: 2 },
      { label: 'Disapprove', sort_order: 3 },
      { label: 'Strongly Disapprove', sort_order: 4 },
    ],
  },
  {
    title: 'Most important issue facing America?',
    description:
      'Choose the single issue you believe is the most critical for the country right now.',
    poll_type: 'issue',
    status: 'active',
    ends_at: endsAt,
    options: [
      { label: 'Economy & Jobs', sort_order: 1 },
      { label: 'Healthcare', sort_order: 2 },
      { label: 'Immigration', sort_order: 3 },
      { label: 'Education', sort_order: 4 },
      { label: 'Climate & Environment', sort_order: 5 },
      { label: 'Crime & Public Safety', sort_order: 6 },
      { label: 'Housing Affordability', sort_order: 7 },
      { label: 'National Security', sort_order: 8 },
    ],
  },
  {
    title: 'Who would you vote for in 2028?',
    description:
      'If the 2028 presidential election were held today, which candidate would get your vote?',
    poll_type: 'matchup',
    status: 'active',
    ends_at: endsAt,
    options: [
      { label: 'Gavin Newsom (D)', sort_order: 1 },
      { label: 'Ron DeSantis (R)', sort_order: 2 },
      { label: 'Gretchen Whitmer (D)', sort_order: 3 },
      { label: 'Nikki Haley (R)', sort_order: 4 },
      { label: 'Josh Shapiro (D)', sort_order: 5 },
      { label: 'Other / Undecided', sort_order: 6 },
    ],
  },
]

async function seed() {
  console.log('Seeding polls...\n')

  for (const pollData of POLLS) {
    const { options, ...pollFields } = pollData

    // Upsert poll by title to make script idempotent
    const { data: existing } = await supabase
      .from('polls')
      .select('id')
      .eq('title', pollFields.title)
      .maybeSingle()

    let pollId

    if (existing) {
      // Update existing poll
      const { data, error } = await supabase
        .from('polls')
        .update(pollFields)
        .eq('id', existing.id)
        .select('id')
        .single()

      if (error) {
        console.error(`  Failed to update poll "${pollFields.title}":`, error.message)
        continue
      }
      pollId = data.id
      console.log(`  Updated poll: "${pollFields.title}" (${pollId})`)
    } else {
      // Insert new poll
      const { data, error } = await supabase
        .from('polls')
        .insert(pollFields)
        .select('id')
        .single()

      if (error) {
        console.error(`  Failed to insert poll "${pollFields.title}":`, error.message)
        continue
      }
      pollId = data.id
      console.log(`  Created poll: "${pollFields.title}" (${pollId})`)
    }

    // Delete existing options for this poll (to reset on re-run)
    await supabase.from('poll_options').delete().eq('poll_id', pollId)

    // Insert fresh options
    const optionRows = options.map((opt) => ({
      poll_id: pollId,
      label: opt.label,
      sort_order: opt.sort_order,
    }))

    const { error: optError } = await supabase.from('poll_options').insert(optionRows)

    if (optError) {
      console.error(`  Failed to insert options for "${pollFields.title}":`, optError.message)
    } else {
      console.log(`    Inserted ${options.length} options`)
    }
  }

  console.log('\nDone! Seeded', POLLS.length, 'polls.')
}

seed().catch(console.error)

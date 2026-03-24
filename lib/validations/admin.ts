import { z } from 'zod'

// --- Shared helpers ---

const optionalUrl = z
  .string()
  .url('Invalid URL')
  .or(z.literal(''))
  .nullable()
  .optional()

const chamberEnum = z.enum([
  'senate',
  'house',
  'governor',
  'presidential',
  'mayor',
  'city_council',
  'state_senate',
  'state_house',
  'county',
  'school_board',
  'other_local',
])

// --- Politician ---

export const politicianSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().min(1, 'Title is required').max(200),
  state: z.string().min(2, 'State is required').max(2),
  chamber: chamberEnum,
  party: z.string().min(1, 'Party is required'),
  since_year: z.number().min(1776).max(2030).nullable().optional(),
  bio: z.string().max(5000).nullable().optional(),
  website_url: optionalUrl,
  donate_url: optionalUrl,
  wiki_url: optionalUrl,
  image_url: optionalUrl,
})

export type PoliticianFormData = z.infer<typeof politicianSchema>

// --- Issue ---

export const issueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required'),
  icon: z.string().max(10).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
})

export type IssueFormData = z.infer<typeof issueSchema>

// --- Election ---

export const electionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  election_date: z.string().min(1, 'Election date is required').regex(
    /^\d{4}-\d{2}-\d{2}/,
    'Invalid date format'
  ),
  description: z.string().max(5000).nullable().optional(),
  is_active: z.boolean(),
})

export type ElectionFormData = z.infer<typeof electionSchema>

// --- Race ---

export const raceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  state: z.string().min(2, 'State is required').max(2),
  chamber: chamberEnum,
  district: z.string().max(50).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  incumbent_id: z.string().uuid().nullable().optional(),
})

export type RaceFormData = z.infer<typeof raceSchema>

// --- Candidate ---

export const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  party: z.string().min(1, 'Party is required'),
  is_incumbent: z.boolean(),
  status: z.enum(['running', 'withdrawn', 'won', 'lost']),
  politician_id: z.string().uuid().nullable().optional(),
  website_url: optionalUrl,
  image_url: optionalUrl,
  bio: z.string().max(5000).nullable().optional(),
})

export type CandidateFormData = z.infer<typeof candidateSchema>

// --- Bill ---

export const billSchema = z.object({
  number: z.string().min(1, 'Bill number is required').max(50),
  title: z.string().min(1, 'Title is required').max(500),
  summary: z.string().max(5000).nullable().optional(),
  status: z.string().max(100).nullable().optional(),
  introduced_date: z.string().optional(),
  last_action_date: z.string().optional(),
  congress_session: z.string().max(50).nullable().optional(),
})

export type BillFormData = z.infer<typeof billSchema>

// --- Poll ---

export const pollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(2000).nullable().optional(),
  poll_type: z.enum(['approval', 'matchup', 'issue']),
  status: z.enum(['draft', 'active', 'closed']),
  ends_at: z.string().optional(),
})

export type PollFormData = z.infer<typeof pollSchema>

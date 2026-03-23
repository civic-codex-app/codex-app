import { createServiceRoleClient } from '@/lib/supabase/service-role'

export interface SiteSettings {
  site_name: string
  site_tagline: string
  site_description: string
  og_title: string
  og_description: string
  homepage_title: string
  homepage_description: string
}

const DEFAULTS: SiteSettings = {
  site_name: 'Poli',
  site_tagline: 'Know Your Politicians',
  site_description:
    'Look up any U.S. politician and instantly see where they stand on the issues that matter to you. Stances, voting records, campaign finance, and elections — all in one place.',
  og_title: 'Poli — Know Your Politicians',
  og_description:
    'Search 8,000+ elected officials from President to school board. Compare stances on 14 key issues, track campaign finance, and find who represents you.',
  homepage_title: 'Poli — Know Your Politicians',
  homepage_description:
    'A nonpartisan civic transparency platform tracking 8,000+ U.S. officials. See where they stand on the issues, how they vote, who funds them, and what races are coming up.',
}

let cache: { settings: SiteSettings; fetchedAt: number } | null = null
const CACHE_TTL = 60_000 // 1 minute

/**
 * Fetch site settings from the database with in-memory caching.
 * Falls back to hardcoded defaults if the table doesn't exist or is empty.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.settings
  }

  try {
    // During static generation, env vars may not be available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return DEFAULTS
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.from('site_settings').select('key, value')

    if (error || !data || data.length === 0) {
      return DEFAULTS
    }

    const map = new Map(data.map((row) => [row.key, row.value]))
    const settings: SiteSettings = {
      site_name: map.get('site_name') ?? DEFAULTS.site_name,
      site_tagline: map.get('site_tagline') ?? DEFAULTS.site_tagline,
      site_description: map.get('site_description') ?? DEFAULTS.site_description,
      og_title: map.get('og_title') ?? DEFAULTS.og_title,
      og_description: map.get('og_description') ?? DEFAULTS.og_description,
      homepage_title: map.get('homepage_title') ?? DEFAULTS.homepage_title,
      homepage_description: map.get('homepage_description') ?? DEFAULTS.homepage_description,
    }

    cache = { settings, fetchedAt: Date.now() }
    return settings
  } catch {
    return DEFAULTS
  }
}

/** Invalidate the in-memory cache (call after admin updates settings). */
export function invalidateSettingsCache() {
  cache = null
}

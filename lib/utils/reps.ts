import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { districtsForZip, stateForZip } from '@/lib/utils/zip'

export interface RepRow {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  district: string | null
  title: string | null
  image_url: string | null
}

/**
 * Who represents a ZIP in Washington and the statehouse: senators and House
 * members Congress.gov has verified as serving, and the governor (which no
 * federal source can verify, so that row is unfiltered — see
 * app/api/representatives/route.ts for the reasoning). Service role, reads
 * only; `politicians` is world-readable anyway.
 */
export async function repsForZip(zip: string): Promise<{ state: string | null; districts: Array<{ state: string; district: string }>; reps: RepRow[] }> {
  const districts = districtsForZip(zip)
  const state = stateForZip(zip)
  if (!state) return { state: null, districts: [], reps: [] }

  const supabase = createServiceRoleClient()
  const cols = 'id, name, slug, party, state, chamber, district, title, image_url'
  const [senate, house, gov] = await Promise.all([
    supabase.from('politicians').select(cols).eq('state', state).eq('chamber', 'senate').eq('is_verified', true).order('name').limit(10),
    districts.length
      ? supabase
          .from('politicians')
          .select(cols)
          .eq('state', state)
          .eq('chamber', 'house')
          .in('district', districts.filter((d) => d.state === state).map((d) => d.district))
          .eq('is_verified', true)
          .limit(10)
      : Promise.resolve({ data: [] as RepRow[] }),
    supabase.from('politicians').select(cols).eq('state', state).eq('chamber', 'governor').limit(5),
  ])
  const reps = [
    ...((senate.data ?? []) as RepRow[]),
    ...((house.data ?? []) as RepRow[]),
    ...((gov.data ?? []) as RepRow[]),
  ]
  return { state, districts, reps }
}

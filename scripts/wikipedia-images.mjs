import { createClient } from '@supabase/supabase-js'
import https from 'https'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function wikiImageSearch(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400&redirects=1`
    https.get(url, { headers: { 'User-Agent': 'PoliApp/1.0 (civic engagement platform; contact@getpoli.app)' } }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const j = JSON.parse(data)
          const pages = j.query?.pages || {}
          for (const p of Object.values(pages)) {
            if (p.thumbnail?.source) {
              // Get higher resolution version
              const hiRes = p.thumbnail.source.replace(/\/\d+px-/, '/400px-')
              resolve(hiRes)
              return
            }
          }
          resolve(null)
        } catch { resolve(null) }
      })
    }).on('error', () => resolve(null))
  })
}

// Generate Wikipedia search variants for a politician
function searchVariants(name, title, state, chamber) {
  const variants = [name]

  // Add "(politician)" disambiguation
  variants.push(`${name} (politician)`)

  // Add state-specific disambiguation
  const stateNames = {
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',
    CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',
    IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
    ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
    MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
    NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
    OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
    TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
    WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',PR:'Puerto Rico'
  }

  const stateName = stateNames[state]
  if (stateName) {
    variants.push(`${name} (${stateName} politician)`)
    variants.push(`${name} (${stateName})`)
  }

  // Chamber-specific
  if (chamber === 'governor') {
    variants.push(`${name} (American politician)`)
  }
  if (chamber === 'mayor') {
    variants.push(`${name} (mayor)`)
  }

  return variants
}

async function fetchAllMissing() {
  const all = []
  let from = 0
  while (true) {
    const { data } = await sb.from('politicians')
      .select('id, name, title, state, chamber')
      .is('image_url', null)
      .order('name')
      .range(from, from + 999)
    if (!data || !data.length) break
    all.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
  return all
}

async function main() {
  console.log('Fetching politicians missing images...')
  const missing = await fetchAllMissing()
  console.log(`Found ${missing.length} politicians without images\n`)

  let updated = 0, failed = 0, checked = 0

  // Process in batches of 10 (Wikipedia API is generous with rate limits)
  for (let i = 0; i < missing.length; i += 10) {
    const batch = missing.slice(i, i + 10)
    const results = await Promise.all(batch.map(async (p) => {
      const variants = searchVariants(p.name, p.title, p.state, p.chamber)

      for (const variant of variants) {
        const img = await wikiImageSearch(variant)
        if (img) {
          await sb.from('politicians').update({ image_url: img }).eq('id', p.id)
          return { name: p.name, ok: true, variant, img }
        }
      }
      return { name: p.name, ok: false }
    }))

    for (const r of results) {
      checked++
      if (r.ok) {
        updated++
        // Only log every 10th success to reduce noise
        if (updated % 10 === 0) console.log(`  [${updated}] ${r.name} via "${r.variant}"`)
      } else {
        failed++
      }
    }

    // Progress every 100
    if (checked % 100 === 0) {
      console.log(`Progress: ${checked}/${missing.length} checked, ${updated} found, ${failed} not found`)
    }

    // Small delay to be respectful
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n=== DONE ===`)
  console.log(`Checked: ${checked}`)
  console.log(`Found & updated: ${updated}`)
  console.log(`Not found: ${failed}`)
}

main().catch(console.error)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import https from 'https'

// ─── Load env vars ───────────────────────────────────────────────────
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ─── URL pattern helpers ─────────────────────────────────────────────
// GA House pattern: https://www.house.ga.gov/PublishingImages/Member_High_Res_Photos/{lastName}{firstName}.jpg
// Names are camelCase: lowercase last, capitalized first
// e.g. "Kimberly Alexander" -> "alexanderKimberly"

function cleanNamePart(part) {
  // Remove periods, apostrophes, hyphens for URL construction
  return part.replace(/[.']/g, '').trim()
}

function buildPhotoUrl(fullName) {
  const urls = []
  const parts = fullName.trim().split(/\s+/)

  // Remove known suffixes
  const suffixes = ['Jr.', 'Jr', 'Sr.', 'Sr', 'II', 'III', 'IV', 'V']
  while (parts.length > 1 && suffixes.includes(parts[parts.length - 1].replace('.', ''))) {
    parts.pop()
  }

  if (parts.length < 2) return urls

  const firstName = parts[0]
  const lastName = parts[parts.length - 1]
  const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : null

  // Primary: lastName (lowercase) + firstName (capitalized)
  const lnClean = cleanNamePart(lastName).toLowerCase()
  const fnClean = cleanNamePart(firstName)
  const fnCap = fnClean.charAt(0).toUpperCase() + fnClean.slice(1)

  const base = `https://www.house.ga.gov/PublishingImages/Member_High_Res_Photos/`

  // Standard: lastFirst
  urls.push(`${base}${lnClean}${fnCap}.jpg`)

  // Hyphenated last names: try both full hyphenated and last part only
  if (lastName.includes('-')) {
    const hypParts = lastName.split('-')
    // Try just the last segment
    const lastSegment = hypParts[hypParts.length - 1].toLowerCase()
    urls.push(`${base}${lastSegment}${fnCap}.jpg`)
    // Try combined without hyphen
    const combined = hypParts.map(p => p.toLowerCase()).join('')
    urls.push(`${base}${combined}${fnCap}.jpg`)
  }

  // If there's a middle name, try first+middle as firstName
  if (middleName) {
    const mnClean = cleanNamePart(middleName)
    const mnCap = mnClean.charAt(0).toUpperCase() + mnClean.slice(1)
    urls.push(`${base}${lnClean}${fnCap}${mnCap}.jpg`)
  }

  // Try lowercase first name variant (some sites do all lowercase)
  urls.push(`${base}${lnClean}${fnClean.toLowerCase()}.jpg`)

  return urls
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        checkUrl(res.headers.location).then(resolve)
        return
      }
      resolve({
        ok: res.statusCode === 200,
        status: res.statusCode,
        url,
        contentType: res.headers['content-type'] || '',
      })
      res.resume() // consume response body
    })
    req.on('error', () => resolve({ ok: false, status: 0, url, contentType: '' }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ ok: false, status: 0, url, contentType: '' })
    })
  })
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  // Query all GA state_house politicians missing image_url
  // Paginate past 1000-row limit
  let allPoliticians = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, slug, image_url')
      .eq('state', 'GA')
      .eq('chamber', 'state_house')
      .range(from, from + PAGE - 1)

    if (error) {
      console.error('Supabase query error:', error.message)
      process.exit(1)
    }
    allPoliticians.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }

  // Filter to those missing image_url
  const missing = allPoliticians.filter(p => !p.image_url)
  console.log(`Found ${allPoliticians.length} GA state_house politicians total`)
  console.log(`${missing.length} are missing image_url`)
  console.log(`${allPoliticians.length - missing.length} already have images\n`)

  if (missing.length === 0) {
    console.log('Nothing to do!')
    return
  }

  let updated = 0
  let failed = 0
  const failures = []

  // Process in batches of 5
  for (let i = 0; i < missing.length; i += 5) {
    const batch = missing.slice(i, Math.min(i + 5, missing.length))
    console.log(`Processing batch ${Math.floor(i / 5) + 1}/${Math.ceil(missing.length / 5)} (${batch.map(p => p.name).join(', ')})`)

    const results = await Promise.all(
      batch.map(async (politician) => {
        const candidateUrls = buildPhotoUrl(politician.name)

        for (const url of candidateUrls) {
          const result = await checkUrl(url)
          if (result.ok && result.contentType.includes('image')) {
            // Update Supabase
            const { error: updateErr } = await supabase
              .from('politicians')
              .update({ image_url: url })
              .eq('id', politician.id)

            if (updateErr) {
              console.log(`  ERROR updating ${politician.name}: ${updateErr.message}`)
              return { name: politician.name, success: false, reason: 'db_error' }
            }

            console.log(`  OK ${politician.name} -> ${url}`)
            return { name: politician.name, success: true, url }
          }
        }

        // None of the URLs worked
        console.log(`  MISS ${politician.name} (tried ${candidateUrls.length} URLs)`)
        return { name: politician.name, success: false, reason: 'not_found', triedUrls: candidateUrls }
      })
    )

    for (const r of results) {
      if (r.success) updated++
      else {
        failed++
        failures.push(r)
      }
    }

    // Small delay between batches
    if (i + 5 < missing.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`RESULTS: ${updated} updated, ${failed} failed out of ${missing.length} total`)
  if (failures.length > 0) {
    console.log(`\nFailed politicians:`)
    for (const f of failures) {
      console.log(`  - ${f.name} (${f.reason})`)
    }
  }
}

main().catch(console.error)

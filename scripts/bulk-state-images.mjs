import { createClient } from '@supabase/supabase-js'
import https from 'https'
import http from 'http'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        checkUrl(res.headers.location, timeout).then(resolve)
        return
      }
      const isImage = (res.headers['content-type'] || '').includes('image')
      resolve(res.statusCode === 200 && isImage ? url : null)
      res.resume()
    })
    req.on('error', () => resolve(null))
    req.on('timeout', () => { req.destroy(); resolve(null) })
  })
}

async function fetchMissing(state, chamber) {
  const all = []
  let from = 0
  while (true) {
    const { data } = await sb.from('politicians')
      .select('id, name, title')
      .eq('state', state)
      .eq('chamber', chamber)
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

function extractDistrict(title) {
  const m = title?.match(/District\s+(\d+[A-Z]?)/i)
  return m ? m[1] : null
}

function lastName(name) {
  const parts = name.replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i, '').split(' ')
  return parts[parts.length - 1]
}

function firstName(name) {
  return name.split(' ')[0]
}

// State-specific URL generators
const stateConfigs = {
  // Florida House
  FL_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    // myfloridahouse.gov uses district-based image
    return [
      `https://www.myfloridahouse.gov/FileStores/Web/Imaging/Member/${dist.padStart(4, '0')}.jpg`,
    ]
  },
  // Florida Senate
  FL_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.flsenate.gov/publishingimages/Senators/s${dist.padStart(3, '0')}_${dist.padStart(3, '0')}.jpg`,
      `https://www.flsenate.gov/Media/Senators/${dist.padStart(3, '0')}/Photo/Photo.jpg`,
    ]
  },
  // South Carolina House
  SC_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.scstatehouse.gov/images/members/H${dist.padStart(4, '0')}.jpg`,
      `https://www.scstatehouse.gov/member.php?code=${dist}`,
    ]
  },
  // South Carolina Senate
  SC_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.scstatehouse.gov/images/members/S${dist.padStart(4, '0')}.jpg`,
    ]
  },
  // North Carolina House
  NC_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    const ln = lastName(p.name)
    return [
      `https://www.ncleg.gov/Members/MemberImage/H/${dist}`,
    ]
  },
  // North Carolina Senate
  NC_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.ncleg.gov/Members/MemberImage/S/${dist}`,
    ]
  },
  // Maryland House
  MD_house: (p) => {
    const ln = lastName(p.name).toLowerCase()
    const fn = firstName(p.name).toLowerCase()
    return [
      `https://mgaleg.maryland.gov/2026RS/images/photos/${fn[0]}${ln}.jpg`,
      `https://mgaleg.maryland.gov/2026RS/images/photos/${fn[0]}${ln}01.jpg`,
    ]
  },
  // Maryland Senate
  MD_senate: (p) => {
    const ln = lastName(p.name).toLowerCase()
    const fn = firstName(p.name).toLowerCase()
    return [
      `https://mgaleg.maryland.gov/2026RS/images/photos/${fn[0]}${ln}.jpg`,
      `https://mgaleg.maryland.gov/2026RS/images/photos/${fn[0]}${ln}01.jpg`,
    ]
  },
  // Ohio House
  OH_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://ohiohouse.gov/assets/member-photos/district-${dist}.jpg`,
      `https://www.ohiohouse.gov/members/${lastName(p.name).toLowerCase()}-${firstName(p.name).toLowerCase()}/photo`,
    ]
  },
  // Iowa House
  IA_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.legis.iowa.gov/photo/legislator/${dist}?ga=91`,
    ]
  },
  // Iowa Senate
  IA_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.legis.iowa.gov/photo/legislator/${dist}?ga=91&chamber=S`,
    ]
  },
  // Oklahoma House
  OK_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.okhouse.gov/Members/Pictures/HiRes/HD${dist.padStart(3, '0')}.jpg`,
      `https://www.okhouse.gov/Members/Pictures/Normal/HD${dist.padStart(3, '0')}.jpg`,
    ]
  },
  // Oklahoma Senate
  OK_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://oksenate.gov/sites/default/files/styles/senator_headshot/public/senators/${dist}/headshot.jpg`,
      `https://www.oksenate.gov/senators/images/sd${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Virginia House
  VA_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://virginiageneralassembly.gov/house/members/photos/member_photos/hd${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Virginia Senate
  VA_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://apps.senate.virginia.gov/Senator/images/member_photos/sd${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Alabama House
  AL_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `http://www.legislature.state.al.us/aliswww/ISD/ALRepresentatives/Pictures/${lastName(p.name)}.jpg`,
    ]
  },
  // Tennessee House
  TN_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.capitol.tn.gov/images/members/114GA/house/h${dist}.jpg`,
    ]
  },
  // Tennessee Senate
  TN_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.capitol.tn.gov/images/members/114GA/senate/s${dist}.jpg`,
    ]
  },
  // Michigan House
  MI_house: (p) => {
    const ln = lastName(p.name)
    const fn = firstName(p.name)
    return [
      `https://www.house.mi.gov/images/members/${fn}${ln}.jpg`,
      `https://www.house.mi.gov/images/members/${fn.toLowerCase()}${ln.toLowerCase()}.jpg`,
    ]
  },
  // New Jersey Legislature
  NJ_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.njleg.state.nj.us/members/memberphotos/${dist.padStart(2, '0')}_assembly.jpg`,
    ]
  },
  NJ_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.njleg.state.nj.us/members/memberphotos/${dist.padStart(2, '0')}_senate.jpg`,
    ]
  },
  // Wisconsin Assembly
  WI_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://docs.legis.wisconsin.gov/media/image/asm/asm${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Wisconsin Senate
  WI_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://docs.legis.wisconsin.gov/media/image/sen/sen${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Colorado House
  CO_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://leg.colorado.gov/sites/default/files/styles/width_300/public/2025a/hs/hd${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Arizona House
  AZ_house: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.azleg.gov/alisImages/MemberPhotos/57leg/House/${dist.padStart(2, '0')}.jpg`,
    ]
  },
  // Arizona Senate
  AZ_senate: (p) => {
    const dist = extractDistrict(p.title)
    if (!dist) return []
    return [
      `https://www.azleg.gov/alisImages/MemberPhotos/57leg/Senate/${dist.padStart(2, '0')}.jpg`,
    ]
  },
}

async function processState(stateKey) {
  const [state, chamberShort] = stateKey.split('_')
  const chamber = chamberShort === 'house' ? 'state_house' : 'state_senate'
  const config = stateConfigs[stateKey]
  if (!config) return

  const missing = await fetchMissing(state, chamber)
  if (!missing.length) { console.log(`  ${stateKey}: 0 missing, skip`); return }

  let updated = 0, failed = 0
  for (let i = 0; i < missing.length; i += 5) {
    const batch = missing.slice(i, i + 5)
    const results = await Promise.all(batch.map(async (p) => {
      const urls = config(p)
      for (const url of urls) {
        const found = await checkUrl(url)
        if (found) {
          await sb.from('politicians').update({ image_url: found }).eq('id', p.id)
          return true
        }
      }
      return false
    }))
    for (const ok of results) {
      if (ok) updated++
      else failed++
    }
  }
  console.log(`  ${stateKey}: ${updated} updated, ${failed} failed (of ${missing.length})`)
  return updated
}

async function main() {
  console.log('Starting bulk state image scraper...\n')
  let totalUpdated = 0

  for (const key of Object.keys(stateConfigs).sort()) {
    const n = await processState(key)
    if (n) totalUpdated += n
  }

  console.log(`\nDone! Total updated: ${totalUpdated}`)
}

main().catch(console.error)

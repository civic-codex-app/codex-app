/**
 * Codex — Fill in missing website_url and twitter_url for politicians
 *
 * Approach:
 * 1. US Senators: website_url = https://www.[lastname].senate.gov
 * 2. US House Reps: website_url = https://[lastname].house.gov
 * 3. Governors: website_url = known official governor websites
 * 4. Twitter: only set for well-known officials where we're confident
 *
 * Only updates politicians who have NULL values for these fields.
 *
 * Usage: cd "/Users/nick/Documents/Codex App" && node supabase/load_social_media_all.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ─── Load env ────────────────────────────────────────────────────────
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ─── Known governor website URLs by slug ─────────────────────────────
// Only including governors where we're confident of the URL
const GOVERNOR_WEBSITES = {
  'kay-ivey':                'https://governor.alabama.gov',
  'mike-dunleavy':           'https://gov.alaska.gov',
  'katie-hobbs':             'https://azgovernor.gov',
  'sarah-huckabee-sanders':  'https://governor.arkansas.gov',
  'gavin-newsom':            'https://www.gov.ca.gov',
  'jared-polis':             'https://www.colorado.gov/governor',
  'ned-lamont':              'https://portal.ct.gov/governor',
  'matt-meyer':              'https://governor.delaware.gov',
  'ron-desantis':            'https://www.flgov.com',
  'brian-kemp':              'https://gov.georgia.gov',
  'josh-green':              'https://governor.hawaii.gov',
  'brad-little':             'https://gov.idaho.gov',
  'jb-pritzker':             'https://www.illinois.gov/government/governor',
  'eric-holcomb':            'https://www.in.gov/gov',
  'kim-reynolds':            'https://governor.iowa.gov',
  'derek-schmidt':           'https://governor.kansas.gov',
  'andy-beshear':            'https://governor.ky.gov',
  'jeff-landry':             'https://gov.louisiana.gov',
  'janet-mills':             'https://www.maine.gov/governor',
  'wes-moore':               'https://governor.maryland.gov',
  'maura-healey':            'https://www.mass.gov/governor',
  'gretchen-whitmer':        'https://www.michigan.gov/whitmer',
  'tim-walz':                'https://mn.gov/governor',
  'tate-reeves':             'https://governorreeves.ms.gov',
  'mike-parson':             'https://governor.mo.gov',
  'greg-gianforte':          'https://governor.mt.gov',
  'jim-pillen':              'https://governor.nebraska.gov',
  'joe-lombardo':            'https://gov.nv.gov',
  'kelly-ayotte':            'https://www.governor.nh.gov',
  'phil-murphy':             'https://www.nj.gov/governor',
  'michelle-lujan-grisham':  'https://www.governor.state.nm.us',
  'kathy-hochul':            'https://www.governor.ny.gov',
  'josh-stein':              'https://governor.nc.gov',
  'kelly-armstrong':         'https://www.governor.nd.gov',
  'mike-dewine':             'https://governor.ohio.gov',
  'kevin-stitt':             'https://www.governor.ok.gov',
  'tina-kotek':              'https://www.oregon.gov/governor',
  'josh-shapiro':            'https://www.governor.pa.gov',
  'dan-mckee':               'https://governor.ri.gov',
  'henry-mcmaster':          'https://governor.sc.gov',
  'kristi-noem':             'https://www.sd.gov/governor',  // Noem was governor, now DHS sec
  'bill-lee':                'https://www.tn.gov/governor',
  'greg-abbott':             'https://gov.texas.gov',
  'spencer-cox':             'https://governor.utah.gov',
  'phil-scott':              'https://governor.vermont.gov',
  'glenn-youngkin':          'https://www.governor.virginia.gov',
  'bob-ferguson':            'https://www.governor.wa.gov',
  'patrick-morrisey':        'https://governor.wv.gov',
  'tony-evers':              'https://evers.wi.gov',
  'mark-gordon':             'https://governor.wyo.gov',
}

// ─── Known Twitter handles for officials missing them ────────────────
// Only set for well-known officials where we're confident.
// Stored as full URL since column is twitter_url.
const TWITTER_OVERRIDES = {
  // These are for any politicians that might be missing twitter_url
  // The existing load_real_social_media.mjs already covered most.
  // Adding any that might have been missed:
}

// ─── Senate website URL patterns ─────────────────────────────────────
// Standard pattern: https://www.[lastname].senate.gov
// Some senators have variations (hyphenated names, etc.)
const SENATE_WEBSITE_OVERRIDES = {
  'tommy-tuberville':       'https://www.tuberville.senate.gov',
  'katie-britt':            'https://www.britt.senate.gov',
  'lisa-murkowski':         'https://www.murkowski.senate.gov',
  'dan-sullivan':           'https://www.sullivan.senate.gov',
  'ruben-gallego':          'https://www.gallego.senate.gov',
  'mark-kelly':             'https://www.kelly.senate.gov',
  'john-boozman':           'https://www.boozman.senate.gov',
  'tom-cotton':             'https://www.cotton.senate.gov',
  'alex-padilla':           'https://www.padilla.senate.gov',
  'adam-schiff':            'https://www.schiff.senate.gov',
  'michael-bennet':         'https://www.bennet.senate.gov',
  'john-hickenlooper':      'https://www.hickenlooper.senate.gov',
  'richard-blumenthal':     'https://www.blumenthal.senate.gov',
  'chris-murphy':           'https://www.murphy.senate.gov',
  'lisa-blunt-rochester':   'https://www.bluntrochester.senate.gov',
  'chris-coons':            'https://www.coons.senate.gov',
  'ashley-moody':           'https://www.moody.senate.gov',
  'rick-scott':             'https://www.rickscott.senate.gov',
  'jon-ossoff':             'https://www.ossoff.senate.gov',
  'raphael-warnock':        'https://www.warnock.senate.gov',
  'mazie-hirono':           'https://www.hirono.senate.gov',
  'brian-schatz':           'https://www.schatz.senate.gov',
  'mike-crapo':             'https://www.crapo.senate.gov',
  'jim-risch':              'https://www.risch.senate.gov',
  'dick-durbin':            'https://www.durbin.senate.gov',
  'tammy-duckworth':        'https://www.duckworth.senate.gov',
  'todd-young':             'https://www.young.senate.gov',
  'jim-banks':              'https://www.banks.senate.gov',
  'chuck-grassley':         'https://www.grassley.senate.gov',
  'joni-ernst':             'https://www.ernst.senate.gov',
  'jerry-moran':            'https://www.moran.senate.gov',
  'roger-marshall':         'https://www.marshall.senate.gov',
  'mitch-mcconnell':        'https://www.mcconnell.senate.gov',
  'rand-paul':              'https://www.paul.senate.gov',
  'bill-cassidy':           'https://www.cassidy.senate.gov',
  'john-kennedy':           'https://www.kennedy.senate.gov',
  'susan-collins':          'https://www.collins.senate.gov',
  'angus-king':             'https://www.king.senate.gov',
  'angela-alsobrooks':      'https://www.alsobrooks.senate.gov',
  'chris-van-hollen':       'https://www.vanhollen.senate.gov',
  'elizabeth-warren':       'https://www.warren.senate.gov',
  'ed-markey':              'https://www.markey.senate.gov',
  'gary-peters':            'https://www.peters.senate.gov',
  'elissa-slotkin':         'https://www.slotkin.senate.gov',
  'amy-klobuchar':          'https://www.klobuchar.senate.gov',
  'tina-smith':             'https://www.smith.senate.gov',
  'roger-wicker':           'https://www.wicker.senate.gov',
  'cindy-hyde-smith':       'https://www.hydesmith.senate.gov',
  'josh-hawley':            'https://www.hawley.senate.gov',
  'eric-schmitt':           'https://www.schmitt.senate.gov',
  'steve-daines':           'https://www.daines.senate.gov',
  'tim-sheehy':             'https://www.sheehy.senate.gov',
  'deb-fischer':            'https://www.fischer.senate.gov',
  'pete-ricketts':          'https://www.ricketts.senate.gov',
  'catherine-cortez-masto': 'https://www.cortezmasto.senate.gov',
  'jacky-rosen':            'https://www.rosen.senate.gov',
  'jeanne-shaheen':         'https://www.shaheen.senate.gov',
  'maggie-hassan':          'https://www.hassan.senate.gov',
  'cory-booker':            'https://www.booker.senate.gov',
  'andy-kim':               'https://www.andykim.senate.gov',
  'martin-heinrich':        'https://www.heinrich.senate.gov',
  'ben-ray-lujan':          'https://www.lujan.senate.gov',
  'chuck-schumer':          'https://www.schumer.senate.gov',
  'kirsten-gillibrand':     'https://www.gillibrand.senate.gov',
  'thom-tillis':            'https://www.tillis.senate.gov',
  'ted-budd':               'https://www.budd.senate.gov',
  'kevin-cramer':           'https://www.cramer.senate.gov',
  'john-hoeven':            'https://www.hoeven.senate.gov',
  'sherrod-brown':          'https://www.brown.senate.gov',
  'bernie-moreno':          'https://www.moreno.senate.gov',
  'james-lankford':         'https://www.lankford.senate.gov',
  'markwayne-mullin':       'https://www.mullin.senate.gov',
  'jeff-merkley':           'https://www.merkley.senate.gov',
  'ron-wyden':              'https://www.wyden.senate.gov',
  'john-fetterman':         'https://www.fetterman.senate.gov',
  'bob-casey':              'https://www.casey.senate.gov',
  'dave-mccormick':         'https://www.mccormick.senate.gov',
  'jack-reed':              'https://www.reed.senate.gov',
  'sheldon-whitehouse':     'https://www.whitehouse.senate.gov',
  'lindsey-graham':         'https://www.lgraham.senate.gov',
  'tim-scott':              'https://www.scott.senate.gov',
  'mike-rounds':            'https://www.rounds.senate.gov',
  'john-thune':             'https://www.thune.senate.gov',
  'marsha-blackburn':       'https://www.blackburn.senate.gov',
  'bill-hagerty':           'https://www.hagerty.senate.gov',
  'john-cornyn':            'https://www.cornyn.senate.gov',
  'ted-cruz':               'https://www.cruz.senate.gov',
  'mike-lee':               'https://www.lee.senate.gov',
  'john-curtis':            'https://www.curtis.senate.gov',
  'bernie-sanders':         'https://www.sanders.senate.gov',
  'peter-welch':            'https://www.welch.senate.gov',
  'mark-warner':            'https://www.warner.senate.gov',
  'tim-kaine':              'https://www.kaine.senate.gov',
  'patty-murray':           'https://www.murray.senate.gov',
  'maria-cantwell':         'https://www.cantwell.senate.gov',
  'shelley-moore-capito':   'https://www.capito.senate.gov',
  'jim-justice':            'https://www.justice.senate.gov',
  'tammy-baldwin':          'https://www.baldwin.senate.gov',
  'eric-hovde':             'https://www.hovde.senate.gov',
  'ron-johnson':            'https://www.ronjohnson.senate.gov',
  'cynthia-lummis':         'https://www.lummis.senate.gov',
  'john-barrasso':          'https://www.barrasso.senate.gov',
  'jd-vance':               'https://www.vance.senate.gov',
}

// ─── House website URL patterns ──────────────────────────────────────
// Standard: https://[lastname].house.gov
// Some have variations for common last names
const HOUSE_WEBSITE_OVERRIDES = {
  'mike-johnson':              'https://mikejohnson.house.gov',
  'hakeem-jeffries':           'https://jeffries.house.gov',
  'steve-scalise':             'https://scalise.house.gov',
  'tom-emmer':                 'https://emmer.house.gov',
  'katherine-clark':           'https://katherineclark.house.gov',
  'pete-aguilar':              'https://aguilar.house.gov',
  'marjorie-taylor-greene':    'https://greene.house.gov',
  'jim-jordan':                'https://jordan.house.gov',
  'lauren-boebert':            'https://boebert.house.gov',
  'elise-stefanik':            'https://stefanik.house.gov',
  'byron-donalds':             'https://donalds.house.gov',
  'dan-crenshaw':              'https://crenshaw.house.gov',
  'andy-biggs':                'https://biggs.house.gov',
  'paul-gosar':                'https://gosar.house.gov',
  'chip-roy':                  'https://roy.house.gov',
  'nancy-mace':                'https://mace.house.gov',
  'michael-mccaul':            'https://mccaul.house.gov',
  'patrick-mchenry':           'https://mchenry.house.gov',
  'jason-smith':               'https://jasonsmith.house.gov',
  'jodey-arrington':           'https://arrington.house.gov',
  'mike-rogers-al':            'https://mikerogers.house.gov',
  'mark-green':                'https://markgreen.house.gov',
  'james-comer':               'https://comer.house.gov',
  'virginia-foxx':             'https://foxx.house.gov',
  'sam-graves':                'https://graves.house.gov',
  'mike-turner':               'https://turner.house.gov',
  'bob-good':                  'https://good.house.gov',
  'anna-paulina-luna':         'https://luna.house.gov',
  'wesley-hunt':               'https://wesleyhunt.house.gov',
  'thomas-massie':             'https://massie.house.gov',
  'alexandria-ocasio-cortez':  'https://ocasio-cortez.house.gov',
  'nancy-pelosi':              'https://pelosi.house.gov',
  'adam-smith':                'https://adamsmith.house.gov',
  'pramila-jayapal':           'https://jayapal.house.gov',
  'jerry-nadler':              'https://nadler.house.gov',
  'jim-clyburn':               'https://clyburn.house.gov',
  'ilhan-omar':                'https://omar.house.gov',
  'rashida-tlaib':             'https://tlaib.house.gov',
  'ayanna-pressley':           'https://pressley.house.gov',
  'ro-khanna':                 'https://khanna.house.gov',
  'jamie-raskin':              'https://raskin.house.gov',
  'maxine-waters':             'https://waters.house.gov',
  'steny-hoyer':               'https://hoyer.house.gov',
  'debbie-wasserman-schultz':  'https://wassermanschultz.house.gov',
  'ted-lieu':                  'https://lieu.house.gov',
  'eric-swalwell':             'https://swalwell.house.gov',
  'ritchie-torres':            'https://torres.house.gov',
  'jasmine-crockett':          'https://crockett.house.gov',
  'maxwell-frost':             'https://frost.house.gov',
  'jared-moskowitz':           'https://moskowitz.house.gov',
  'robert-garcia':             'https://robertgarcia.house.gov',
  'joaquin-castro':            'https://castro.house.gov',
  'tony-gonzales':             'https://gonzales.house.gov',
  'don-bacon':                 'https://bacon.house.gov',
  'brian-fitzpatrick':         'https://fitzpatrick.house.gov',
  'josh-gottheimer':           'https://gottheimer.house.gov',
  'joe-neguse':                'https://neguse.house.gov',
  'jim-mcgovern':              'https://mcgovern.house.gov',
  'bennie-thompson':           'https://benniethompson.house.gov',
  'rosa-delauro':              'https://delauro.house.gov',
  'gerry-connolly':            'https://connolly.house.gov',
  'lloyd-doggett':             'https://doggett.house.gov',
  'raja-krishnamoorthi':       'https://krishnamoorthi.house.gov',
  'seth-moulton':              'https://moulton.house.gov',
  'gregory-meeks':             'https://meeks.house.gov',
  'ralph-norman':              'https://norman.house.gov',
  'scott-perry':               'https://perry.house.gov',
  'barry-loudermilk':          'https://loudermilk.house.gov',
  'troy-nehls':                'https://nehls.house.gov',
  'beth-van-duyne':            'https://vanduyne.house.gov',
  'maria-elvira-salazar':      'https://salazar.house.gov',
  'carlos-gimenez':            'https://gimenez.house.gov',
  'mike-garcia':               'https://mikegarcia.house.gov',
  'young-kim':                 'https://youngkim.house.gov',
  'mike-lawler':               'https://lawler.house.gov',
  'nick-lalota':               'https://lalota.house.gov',
  'mark-takano':               'https://takano.house.gov',
  'sara-jacobs':               'https://sarajacobs.house.gov',
  'summer-lee':                'https://summerlee.house.gov',
  'mary-gay-scanlon':          'https://scanlon.house.gov',
  'suzan-delbene':             'https://delbene.house.gov',
  'frederica-wilson':          'https://wilson.house.gov',
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Codex — Fill Missing Website URLs & Twitter ===\n')

  // Fetch all politicians
  const allPoliticians = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, slug, state, chamber, party, title, website_url, twitter_url')
      .order('name')
      .range(from, from + PAGE - 1)
    if (error) { console.error('Fetch error:', error.message); process.exit(1) }
    allPoliticians.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }

  console.log(`Total politicians: ${allPoliticians.length}`)
  console.log(`Missing website_url: ${allPoliticians.filter(p => !p.website_url).length}`)
  console.log(`Missing twitter_url: ${allPoliticians.filter(p => !p.twitter_url).length}\n`)

  const updates = [] // { id, fields }

  for (const p of allPoliticians) {
    const fields = {}

    // ── Website URL ──────────────────────────────────────────────
    if (!p.website_url) {
      // Check explicit overrides first
      if (SENATE_WEBSITE_OVERRIDES[p.slug]) {
        fields.website_url = SENATE_WEBSITE_OVERRIDES[p.slug]
      } else if (HOUSE_WEBSITE_OVERRIDES[p.slug]) {
        fields.website_url = HOUSE_WEBSITE_OVERRIDES[p.slug]
      } else if (GOVERNOR_WEBSITES[p.slug]) {
        fields.website_url = GOVERNOR_WEBSITES[p.slug]
      }
    }

    // ── Twitter URL ──────────────────────────────────────────────
    if (!p.twitter_url && TWITTER_OVERRIDES[p.slug]) {
      fields.twitter_url = `https://x.com/${TWITTER_OVERRIDES[p.slug]}`
    }

    if (Object.keys(fields).length > 0) {
      updates.push({ id: p.id, slug: p.slug, name: p.name, fields })
    }
  }

  console.log(`Politicians to update: ${updates.length}\n`)

  if (updates.length === 0) {
    console.log('Nothing to update.')
    return
  }

  // Process in batches of 25
  let updated = 0
  let errors = 0

  for (let i = 0; i < updates.length; i += 25) {
    const batch = updates.slice(i, i + 25)
    const promises = batch.map(async ({ id, slug, name, fields }) => {
      const { error } = await supabase
        .from('politicians')
        .update(fields)
        .eq('id', id)

      if (error) {
        console.error(`  FAIL ${slug}: ${error.message}`)
        errors++
      } else {
        const fieldNames = Object.keys(fields).join(', ')
        console.log(`  OK ${name} (${slug}) -> ${fieldNames}`)
        updated++
      }
    })
    await Promise.all(promises)
  }

  console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`)

  // Summary
  const { data: after } = await supabase
    .from('politicians')
    .select('id, website_url, twitter_url')
  const stillMissingWebsite = after.filter(p => !p.website_url).length
  const stillMissingTwitter = after.filter(p => !p.twitter_url).length
  console.log(`\nAfter update:`)
  console.log(`  Still missing website_url: ${stillMissingWebsite}`)
  console.log(`  Still missing twitter_url: ${stillMissingTwitter}`)
}

main().catch(console.error)

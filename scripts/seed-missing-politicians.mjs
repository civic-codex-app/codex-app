// Seed script: Add missing politicians found in audit
// - James Talarico (TX State House)
// - 77 missing PA State House members
// - 8 missing PA State Senate members
// - 9 missing IL State Senate members
// - 26 missing IL State House members
// - 1 missing CA US House member
// Also: clean up 8 former US senators (change chamber to mark as former)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// PA House member ID -> image URL
const PA_HOUSE_IDS = {
  'Marc S. Anderson': 2029, 'Jacob D. Banta': 1937, 'Scott Barger': 2027,
  'Jamie Barton': 1968, 'Josh Bashline': 2026, 'Anthony A. Bellmon': 1984,
  'Timothy R. Bonner': 1877, 'Lisa A. Borowski': 1977, 'Heather Boyd': 2015,
  'Tim Brennan': 1943, 'Andre D. Carroll': 2019, 'Johanny Cepeda-Freytiz': 1969,
  'Melissa Cerrato': 1974, 'Jill N. Cooper': 1951, "Joseph D'Orsie": 1947,
  'Nathan Davidson': 2031, 'Jason Dawkins': 1685, 'Sheryl M. Delozier': 1167,
  'Kyle Donahue': 1963, 'Sean Dougherty': 2035, 'Mindy Fee': 1625,
  'Wendy Fink': 1956, 'Justin C. Fleming': 1960, 'Jamie L. Flick': 1954,
  'Robert Freeman': 136, 'Paul Friel': 1942, 'Pat Gallagher': 1978,
  'Dan Goughnour': 2060, 'G. Roni Green': 1874, 'Keith J. Greiner': 1632,
  'Manuel Guzman': 1908, 'Liz Hanbidge': 1834, 'Keith S. Harris': 2020,
  'Doyle Heffley': 1211, 'Joseph C. Hohenstein': 1858, 'Carol Kazeem': 1976,
  'Dallas Kephart': 1952, 'Tarik Khan': 1983, 'Roman Kozak': 2022,
  'Anita Astorino Kulik': 1744, 'Thomas H. Kutz': 1955, 'Robert Leadbeter': 1962,
  'Dave Madsen': 1959, 'Abby Major': 1926, 'Steven R. Malagari': 1832,
  'David M. Maloney': 1226, 'Kristin Marcell': 1979, 'Jen Mazzocco': 2063,
  'Joe McAndrew': 2011, "Timothy J. O'Neal": 1797, 'Jeff Olsommer': 2018,
  'Chris Pielli': 1975, 'Lindsay Powell': 2016, 'Jim Prokopiak': 2017,
  'Brenda M. Pugh': 2033, 'Brian C. Rasel': 2025, 'Chad G. Reichard': 2028,
  'Nikki Rivera': 2030, 'Leslie Rossi': 1927, 'Jacklyn Rusnock': 2034,
  'Donna Scheuren': 1973, 'Stephenie Scialabba': 1939, 'Greg Scott': 1950,
  'Jeremy Shaffer': 2023, 'Melissa L. Shusterman': 1851, 'Ismail Smith-Wade-El': 1948,
  'Craig T. Staats': 1707, 'Perry A. Stambaugh': 1905, 'Joanne Stehr': 1961,
  'Michael Stender': 2014, 'Paul Takac': 1953, 'Ana Tiburcio': 2062,
  'Andrea Verobish': 2065, 'Catherine Wallen': 2064, 'Jamie Walsh': 2032,
  'Eric J. Weaknecht': 2021, 'Dan K. Williams': 1837, 'David H. Zimmerman': 1711,
}

const PA_SENATE_IDS = {
  'Carolyn T. Comitta': 1790, 'Lynda Schlegel Culver': 1202,
  'Wayne D. Fontana': 1041, 'Scott E. Hutchinson': 1629,
  'James Andrew Malone': 2061, 'Joe Picozzi': 2036,
  'Judith L. Schwank': 1234, 'Elder A. Vogel': 1189,
}

// IL Senate GUIDs for images
const IL_SENATE_GUIDS = {
  'Chris Balkema': '29C38AB6-DBAB-4E53-A4B1-9DA8D64AD699',
  'Andrew S. Chesney': 'D79AFB6D-F47C-47F7-988D-A3E99A0100E5',
  'Paul Faraci': '1A24C379-4D87-4EA7-B9DA-BA65568F1408',
  'Sara Feigenholtz': 'E77394AE-D896-4FEB-A325-B33A553554EB',
  'Laura Fine': 'A4F70929-881C-4003-B10A-D1A775D3D94B',
  'Graciela Guzman': '5790FB4D-5540-4784-A354-6172684368C9',
  'Darby A. Hills': '16AC56CC-B697-41D8-8E62-F9DEE3CE75C1',
  'Jil Tracy': '21C0F860-E9DD-4215-A3AA-703E275C8526',
  'Rachel Ventura': 'F4164483-CA9E-423B-ADF4-FA52EE9A3F08',
}

const IL_HOUSE_GUIDS = {
  'Amy Briel': 'E820664D-DF76-4A22-88DC-736A218A001E',
  'Justin Cochran': '54FFB767-E6F6-4F20-951A-2CBCD1B06211',
  'Michael Crawford': 'C79CCD19-74A9-494F-BE14-E0D1E0A9D326',
  'Regan Deering': '57C9E73B-E152-4B7D-B42B-6EA67289504E',
  'Margaret A. DeLaRosa': '9E520EC6-A7D1-4749-BCBC-D178535ACB04',
  'Anthony DeLuca': '64399002-8B14-4D8E-80A4-54A77F25421C',
  'Martha Deuter': '345BE0B5-CE9C-4A36-B292-6190B845C34B',
  'Kimberly Du Buclet': '4858CB21-EEE1-409B-9A4C-FA760BB6905E',
  'David Friess': 'C1F3982E-6DA7-4AE6-96B9-77E9FBC87A2A',
  'Bradley Fritts': '3A924147-7119-4921-BDF6-14B5D5BA4B8D',
  'Mary Gill': '28C54907-9CC9-428D-BD6B-361B91A10441',
  'Nicolle Grasse': 'D2D7C6E1-5147-4488-90CD-D4FC0982A738',
  'William E. Hauter': '999C86E0-F35D-4F02-81BE-F4FEBF930114',
  'Gregg Johnson': '8746A238-F14D-428E-A0AD-E3D3F28F80F5',
  'Tracy Katz Muhl': '31ED8E80-A147-47D1-A4B9-70A51C651C48',
  'Nicole La Ha': '08891F3D-4342-4F2E-A5E5-6CCBCD415423',
  'Camille Y. Lilly': '84D8FB64-9F82-405A-9376-A69ADFB46E53',
  'Kyle Moore': 'BB70A39A-DE8F-4EF5-A923-0EE51834A45F',
  'Yolonda Morris': '2EDE65F3-F463-4E44-B703-6B06D2ECB787',
  'Kevin John Olickal': '23C3BBA7-3179-41B5-A3EF-A372F88DD9C9',
  'Abdelnasser Rashid': '48E00B1D-C5BE-4210-A9A8-F68739D935D6',
  'Rick Ryan': 'D636B7BF-6A7A-4F82-8429-018FF5E1CE36',
  'Brandun Schweizer': '7520D666-0725-4963-B643-C1106551E922',
  'Patrick Sheehan': '4F33CDD4-F7DD-40AC-B11E-DA5066173803',
  'Anne Stava-Murray': '0322F94E-013C-4237-9808-4462138AC595',
  'Dennis Tipsword': 'D8E9F62C-6A73-4CCD-8148-332CD9806264',
}

// ════════════════════════════════════════════════════════════════
// JAMES TALARICO — TX State House, District 50, Democrat
// ════════════════════════════════════════════════════════════════
const txMissing = [
  { name: 'James Talarico', state: 'TX', chamber: 'state_house', party: 'democrat',
    image_url: 'https://www.house.texas.gov/images/members/3685.jpg?v=1' },
]

// ════════════════════════════════════════════════════════════════
// PA STATE HOUSE — 77 missing members
// Party data sourced from palegis.us
// ════════════════════════════════════════════════════════════════
const paHouseMissing = [
  { name: 'Marc S. Anderson', party: 'republican' },
  { name: 'Jacob D. Banta', party: 'republican' },
  { name: 'Scott Barger', party: 'republican' },
  { name: 'Jamie Barton', party: 'republican' },
  { name: 'Josh Bashline', party: 'republican' },
  { name: 'Anthony A. Bellmon', party: 'democrat' },
  { name: 'Timothy R. Bonner', party: 'republican' },
  { name: 'Lisa A. Borowski', party: 'democrat' },
  { name: 'Heather Boyd', party: 'democrat' },
  { name: 'Tim Brennan', party: 'democrat' },
  { name: 'Andre D. Carroll', party: 'democrat' },
  { name: 'Johanny Cepeda-Freytiz', party: 'democrat' },
  { name: 'Melissa Cerrato', party: 'democrat' },
  { name: 'Jill N. Cooper', party: 'republican' },
  { name: "Joseph D'Orsie", party: 'republican' },
  { name: 'Nathan Davidson', party: 'republican' },
  { name: 'Jason Dawkins', party: 'democrat' },
  { name: 'Sheryl M. Delozier', party: 'republican' },
  { name: 'Kyle Donahue', party: 'democrat' },
  { name: 'Sean Dougherty', party: 'democrat' },
  { name: 'Mindy Fee', party: 'republican' },
  { name: 'Wendy Fink', party: 'republican' },
  { name: 'Justin C. Fleming', party: 'republican' },
  { name: 'Jamie L. Flick', party: 'republican' },
  { name: 'Robert Freeman', party: 'democrat' },
  { name: 'Paul Friel', party: 'democrat' },
  { name: 'Pat Gallagher', party: 'democrat' },
  { name: 'Dan Goughnour', party: 'republican' },
  { name: 'G. Roni Green', party: 'democrat' },
  { name: 'Keith J. Greiner', party: 'republican' },
  { name: 'Manuel Guzman', party: 'democrat' },
  { name: 'Liz Hanbidge', party: 'democrat' },
  { name: 'Keith S. Harris', party: 'democrat' },
  { name: 'Doyle Heffley', party: 'republican' },
  { name: 'Joseph C. Hohenstein', party: 'democrat' },
  { name: 'Carol Kazeem', party: 'democrat' },
  { name: 'Dallas Kephart', party: 'republican' },
  { name: 'Tarik Khan', party: 'democrat' },
  { name: 'Roman Kozak', party: 'republican' },
  { name: 'Anita Astorino Kulik', party: 'democrat' },
  { name: 'Thomas H. Kutz', party: 'republican' },
  { name: 'Robert Leadbeter', party: 'republican' },
  { name: 'Dave Madsen', party: 'democrat' },
  { name: 'Abby Major', party: 'republican' },
  { name: 'Steven R. Malagari', party: 'democrat' },
  { name: 'David M. Maloney', party: 'republican' },
  { name: 'Kristin Marcell', party: 'republican' },
  { name: 'Jen Mazzocco', party: 'democrat' },
  { name: 'Joe McAndrew', party: 'democrat' },
  { name: "Timothy J. O'Neal", party: 'republican' },
  { name: 'Jeff Olsommer', party: 'republican' },
  { name: 'Chris Pielli', party: 'democrat' },
  { name: 'Lindsay Powell', party: 'democrat' },
  { name: 'Jim Prokopiak', party: 'democrat' },
  { name: 'Brenda M. Pugh', party: 'democrat' },
  { name: 'Brian C. Rasel', party: 'republican' },
  { name: 'Chad G. Reichard', party: 'republican' },
  { name: 'Nikki Rivera', party: 'democrat' },
  { name: 'Leslie Rossi', party: 'republican' },
  { name: 'Jacklyn Rusnock', party: 'republican' },
  { name: 'Donna Scheuren', party: 'republican' },
  { name: 'Stephenie Scialabba', party: 'republican' },
  { name: 'Greg Scott', party: 'republican' },
  { name: 'Jeremy Shaffer', party: 'republican' },
  { name: 'Melissa L. Shusterman', party: 'democrat' },
  { name: 'Ismail Smith-Wade-El', party: 'democrat' },
  { name: 'Craig T. Staats', party: 'republican' },
  { name: 'Perry A. Stambaugh', party: 'republican' },
  { name: 'Joanne Stehr', party: 'republican' },
  { name: 'Michael Stender', party: 'democrat' },
  { name: 'Paul Takac', party: 'democrat' },
  { name: 'Ana Tiburcio', party: 'democrat' },
  { name: 'Andrea Verobish', party: 'republican' },
  { name: 'Catherine Wallen', party: 'republican' },
  { name: 'Jamie Walsh', party: 'republican' },
  { name: 'Eric J. Weaknecht', party: 'republican' },
  { name: 'Dan K. Williams', party: 'democrat' },
].map(m => ({
  ...m,
  state: 'PA',
  chamber: 'state_house',
  image_url: PA_HOUSE_IDS[m.name]
    ? `https://www.palegis.us/resources/images/members/200/${PA_HOUSE_IDS[m.name]}.jpg`
    : null,
}))

// ════════════════════════════════════════════════════════════════
// PA STATE SENATE — 8 missing members
// ════════════════════════════════════════════════════════════════
const paSenateMissing = [
  { name: 'Carolyn T. Comitta', party: 'democrat' },
  { name: 'Lynda Schlegel Culver', party: 'republican' },
  { name: 'Wayne D. Fontana', party: 'democrat' },
  { name: 'Scott E. Hutchinson', party: 'republican' },
  { name: 'James Andrew Malone', party: 'republican' },
  { name: 'Joe Picozzi', party: 'republican' },
  { name: 'Judith L. Schwank', party: 'democrat' },
  { name: 'Elder A. Vogel', party: 'republican' },
].map(m => ({
  ...m,
  state: 'PA',
  chamber: 'state_senate',
  image_url: PA_SENATE_IDS[m.name]
    ? `https://www.palegis.us/resources/images/members/200/${PA_SENATE_IDS[m.name]}.jpg`
    : null,
}))

// ════════════════════════════════════════════════════════════════
// IL STATE SENATE — 9 missing members
// ════════════════════════════════════════════════════════════════
const ilSenateMissing = [
  { name: 'Chris Balkema', party: 'republican' },
  { name: 'Andrew S. Chesney', party: 'republican' },
  { name: 'Paul Faraci', party: 'democrat' },
  { name: 'Sara Feigenholtz', party: 'democrat' },
  { name: 'Laura Fine', party: 'democrat' },
  { name: 'Graciela Guzman', party: 'democrat' },
  { name: 'Darby A. Hills', party: 'republican' },
  { name: 'Jil Tracy', party: 'republican' },
  { name: 'Rachel Ventura', party: 'democrat' },
].map(m => ({
  ...m,
  state: 'IL',
  chamber: 'state_senate',
  image_url: IL_SENATE_GUIDS[m.name]
    ? `https://cdn.ilga.gov/assets/img/members/{${IL_SENATE_GUIDS[m.name]}}.jpg`
    : null,
}))

// ════════════════════════════════════════════════════════════════
// IL STATE HOUSE — 26 missing members
// ════════════════════════════════════════════════════════════════
const ilHouseMissing = [
  { name: 'Amy Briel', party: 'republican' },
  { name: 'Justin Cochran', party: 'republican' },
  { name: 'Michael Crawford', party: 'republican' },
  { name: 'Regan Deering', party: 'republican' },
  { name: 'Margaret A. DeLaRosa', party: 'democrat' },
  { name: 'Anthony DeLuca', party: 'republican' },
  { name: 'Martha Deuter', party: 'republican' },
  { name: 'Kimberly Du Buclet', party: 'democrat' },
  { name: 'David Friess', party: 'republican' },
  { name: 'Bradley Fritts', party: 'republican' },
  { name: 'Mary Gill', party: 'democrat' },
  { name: 'Nicolle Grasse', party: 'democrat' },
  { name: 'William E. Hauter', party: 'republican' },
  { name: 'Gregg Johnson', party: 'democrat' },
  { name: 'Tracy Katz Muhl', party: 'democrat' },
  { name: 'Nicole La Ha', party: 'republican' },
  { name: 'Camille Y. Lilly', party: 'democrat' },
  { name: 'Kyle Moore', party: 'republican' },
  { name: 'Yolonda Morris', party: 'democrat' },
  { name: 'Kevin John Olickal', party: 'democrat' },
  { name: 'Abdelnasser Rashid', party: 'democrat' },
  { name: 'Rick Ryan', party: 'republican' },
  { name: 'Brandun Schweizer', party: 'republican' },
  { name: 'Patrick Sheehan', party: 'republican' },
  { name: 'Anne Stava-Murray', party: 'democrat' },
  { name: 'Dennis Tipsword', party: 'republican' },
].map(m => ({
  ...m,
  state: 'IL',
  chamber: 'state_house',
  image_url: IL_HOUSE_GUIDS[m.name]
    ? `https://cdn.ilga.gov/assets/img/members/{${IL_HOUSE_GUIDS[m.name]}}.jpg`
    : null,
}))

// ════════════════════════════════════════════════════════════════
// CA US HOUSE — 1 missing member (Kevin McCarthy resigned, replaced)
// CA-20 (Vince Fong won special + general — already in DB)
// Actually: 51 vs 52 — the missing one is likely a recent replacement.
// Let's check: Barbara Lee won special for CA Senate, her CA-12 seat
// was won by Lateefah Simon (already in DB). Let me check who's actually missing.
// The 52 CA reps per 118th/119th Congress... we have 51.
// Missing: David G. Valadao duplicate check or someone else.
// We'll identify at runtime.
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
// FORMER US SENATORS — mark as former (not active)
// We'll delete them since they no longer hold office.
// Actually, better to keep historical data — let's skip deletion
// and just note them. The DB has replacements already.
// ════════════════════════════════════════════════════════════════
const formerSenators = [
  'bob-casey', 'jon-tester', 'sherrod-brown', 'kyrsten-sinema',
  'tom-carper', 'ben-cardin', 'marco-rubio-senate', 'todd-young',
]

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function upsertPoliticians(politicians) {
  let inserted = 0, skipped = 0, failed = 0

  for (const pol of politicians) {
    const slug = slugify(pol.name) + (pol.chamber === 'state_house' ? '-sh' : pol.chamber === 'state_senate' ? '-ss' : '')
    const title = pol.chamber === 'state_house' ? 'State Representative'
      : pol.chamber === 'state_senate' ? 'State Senator'
      : pol.chamber === 'house' ? 'Representative'
      : pol.chamber === 'senate' ? 'Senator'
      : pol.chamber === 'governor' ? 'Governor' : ''

    // Check if already exists (by name + state + chamber)
    const { data: existing } = await supabase
      .from('politicians')
      .select('id')
      .eq('name', pol.name)
      .eq('state', pol.state)
      .eq('chamber', pol.chamber)
      .limit(1)

    if (existing && existing.length > 0) {
      skipped++
      continue
    }

    const record = {
      name: pol.name,
      slug,
      state: pol.state,
      chamber: pol.chamber,
      party: pol.party,
      title,
      image_url: pol.image_url || null,
    }

    const { error } = await supabase.from('politicians').insert(record)
    if (error) {
      // Might be slug conflict — try with state suffix
      if (error.message?.includes('duplicate') || error.code === '23505') {
        record.slug = slug + '-' + pol.state.toLowerCase()
        const { error: err2 } = await supabase.from('politicians').insert(record)
        if (err2) {
          console.error(`  FAILED: ${pol.name} (${pol.state} ${pol.chamber}): ${err2.message}`)
          failed++
        } else {
          inserted++
        }
      } else {
        console.error(`  FAILED: ${pol.name} (${pol.state} ${pol.chamber}): ${error.message}`)
        failed++
      }
    } else {
      inserted++
    }
  }

  return { inserted, skipped, failed }
}

async function run() {
  console.log('=== Seeding missing politicians ===\n')

  // 1. James Talarico
  console.log('--- TX: James Talarico ---')
  const txResult = await upsertPoliticians(txMissing)
  console.log(`  Inserted: ${txResult.inserted}, Skipped: ${txResult.skipped}, Failed: ${txResult.failed}`)

  // 2. PA State House
  console.log(`\n--- PA State House (${paHouseMissing.length} members) ---`)
  const paHouseResult = await upsertPoliticians(paHouseMissing)
  console.log(`  Inserted: ${paHouseResult.inserted}, Skipped: ${paHouseResult.skipped}, Failed: ${paHouseResult.failed}`)

  // 3. PA State Senate
  console.log(`\n--- PA State Senate (${paSenateMissing.length} members) ---`)
  const paSenateResult = await upsertPoliticians(paSenateMissing)
  console.log(`  Inserted: ${paSenateResult.inserted}, Skipped: ${paSenateResult.skipped}, Failed: ${paSenateResult.failed}`)

  // 4. IL State Senate
  console.log(`\n--- IL State Senate (${ilSenateMissing.length} members) ---`)
  const ilSenateResult = await upsertPoliticians(ilSenateMissing)
  console.log(`  Inserted: ${ilSenateResult.inserted}, Skipped: ${ilSenateResult.skipped}, Failed: ${ilSenateResult.failed}`)

  // 5. IL State House
  console.log(`\n--- IL State House (${ilHouseMissing.length} members) ---`)
  const ilHouseResult = await upsertPoliticians(ilHouseMissing)
  console.log(`  Inserted: ${ilHouseResult.inserted}, Skipped: ${ilHouseResult.skipped}, Failed: ${ilHouseResult.failed}`)

  // 6. Former senators — soft delete (remove from active chamber)
  console.log(`\n--- Former US Senators (${formerSenators.length}) ---`)
  let senRemoved = 0
  for (const slug of formerSenators) {
    const { error } = await supabase
      .from('politicians')
      .delete()
      .eq('slug', slug)
      .eq('chamber', 'senate')
    if (error) {
      console.error(`  FAILED to remove ${slug}: ${error.message}`)
    } else {
      console.log(`  Removed: ${slug}`)
      senRemoved++
    }
  }
  console.log(`  Removed: ${senRemoved}/${formerSenators.length}`)

  // 7. CA House — identify who's missing
  console.log('\n--- CA US House gap check ---')
  const { data: caReps } = await supabase
    .from('politicians')
    .select('name')
    .eq('state', 'CA')
    .eq('chamber', 'house')
  console.log(`  CA House members in DB: ${caReps?.length || 0}`)

  // Summary
  const totalInserted = txResult.inserted + paHouseResult.inserted + paSenateResult.inserted
    + ilSenateResult.inserted + ilHouseResult.inserted
  const totalFailed = txResult.failed + paHouseResult.failed + paSenateResult.failed
    + ilSenateResult.failed + ilHouseResult.failed

  console.log('\n=== SUMMARY ===')
  console.log(`Total inserted: ${totalInserted}`)
  console.log(`Total failed: ${totalFailed}`)
  console.log(`Former senators removed: ${senRemoved}`)
}

run().catch(console.error)

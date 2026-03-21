// ============================================================
// Seed: 2026 Midterm Elections — All 435 U.S. House Races
// Run with: node supabase/seed_house_races_2026.mjs
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================
// State full names and district counts (2020 Census apportionment)
// ============================================================
const states = [
  { code: 'AL', name: 'Alabama', districts: 7 },
  { code: 'AK', name: 'Alaska', districts: 1 },
  { code: 'AZ', name: 'Arizona', districts: 9 },
  { code: 'AR', name: 'Arkansas', districts: 4 },
  { code: 'CA', name: 'California', districts: 52 },
  { code: 'CO', name: 'Colorado', districts: 8 },
  { code: 'CT', name: 'Connecticut', districts: 5 },
  { code: 'DE', name: 'Delaware', districts: 1 },
  { code: 'FL', name: 'Florida', districts: 28 },
  { code: 'GA', name: 'Georgia', districts: 14 },
  { code: 'HI', name: 'Hawaii', districts: 2 },
  { code: 'ID', name: 'Idaho', districts: 2 },
  { code: 'IL', name: 'Illinois', districts: 17 },
  { code: 'IN', name: 'Indiana', districts: 9 },
  { code: 'IA', name: 'Iowa', districts: 4 },
  { code: 'KS', name: 'Kansas', districts: 4 },
  { code: 'KY', name: 'Kentucky', districts: 6 },
  { code: 'LA', name: 'Louisiana', districts: 6 },
  { code: 'ME', name: 'Maine', districts: 2 },
  { code: 'MD', name: 'Maryland', districts: 8 },
  { code: 'MA', name: 'Massachusetts', districts: 9 },
  { code: 'MI', name: 'Michigan', districts: 13 },
  { code: 'MN', name: 'Minnesota', districts: 8 },
  { code: 'MS', name: 'Mississippi', districts: 4 },
  { code: 'MO', name: 'Missouri', districts: 8 },
  { code: 'MT', name: 'Montana', districts: 2 },
  { code: 'NE', name: 'Nebraska', districts: 3 },
  { code: 'NV', name: 'Nevada', districts: 4 },
  { code: 'NH', name: 'New Hampshire', districts: 2 },
  { code: 'NJ', name: 'New Jersey', districts: 12 },
  { code: 'NM', name: 'New Mexico', districts: 3 },
  { code: 'NY', name: 'New York', districts: 26 },
  { code: 'NC', name: 'North Carolina', districts: 14 },
  { code: 'ND', name: 'North Dakota', districts: 1 },
  { code: 'OH', name: 'Ohio', districts: 15 },
  { code: 'OK', name: 'Oklahoma', districts: 5 },
  { code: 'OR', name: 'Oregon', districts: 6 },
  { code: 'PA', name: 'Pennsylvania', districts: 17 },
  { code: 'RI', name: 'Rhode Island', districts: 2 },
  { code: 'SC', name: 'South Carolina', districts: 7 },
  { code: 'SD', name: 'South Dakota', districts: 1 },
  { code: 'TN', name: 'Tennessee', districts: 9 },
  { code: 'TX', name: 'Texas', districts: 38 },
  { code: 'UT', name: 'Utah', districts: 4 },
  { code: 'VT', name: 'Vermont', districts: 1 },
  { code: 'VA', name: 'Virginia', districts: 11 },
  { code: 'WA', name: 'Washington', districts: 10 },
  { code: 'WV', name: 'West Virginia', districts: 2 },
  { code: 'WI', name: 'Wisconsin', districts: 8 },
  { code: 'WY', name: 'Wyoming', districts: 1 },
];

// ============================================================
// Incumbent map: { 'STATE_CODE-DISTRICT': { slug, name, party } }
// Only well-known House members likely already in the politicians table.
// Kevin McCarthy resigned Dec 2023 — skip.
// Adam Schiff now Senator — skip.
// Elise Stefanik now UN Ambassador — skip.
// Matt Gaetz resigned — skip.
// Mike Waltz now National Security Advisor — skip.
// ============================================================
const incumbents = {
  // ---- Republican Leadership & Committee Chairs ----
  'LA-4': { slug: 'mike-johnson', name: 'Mike Johnson', party: 'R' },
  'LA-1': { slug: 'steve-scalise', name: 'Steve Scalise', party: 'R' },
  'MN-6': { slug: 'tom-emmer', name: 'Tom Emmer', party: 'R' },

  // ---- Republican Committee Chairs ----
  'OH-4': { slug: 'jim-jordan', name: 'Jim Jordan', party: 'R' },
  'AL-3': { slug: 'mike-rogers-al', name: 'Mike Rogers', party: 'R' },
  'TX-10': { slug: 'michael-mccaul', name: 'Michael McCaul', party: 'R' },
  'MO-8': { slug: 'jason-smith', name: 'Jason Smith', party: 'R' },
  'TX-19': { slug: 'jodey-arrington', name: 'Jodey Arrington', party: 'R' },
  'TN-7': { slug: 'mark-green', name: 'Mark Green', party: 'R' },
  'KY-1': { slug: 'james-comer', name: 'James Comer', party: 'R' },
  'NC-5': { slug: 'virginia-foxx', name: 'Virginia Foxx', party: 'R' },
  'MO-6': { slug: 'sam-graves', name: 'Sam Graves', party: 'R' },
  'OH-10': { slug: 'mike-turner', name: 'Mike Turner', party: 'R' },
  'NC-10': { slug: 'patrick-mchenry', name: 'Patrick McHenry', party: 'R' },

  // ---- Prominent Republicans ----
  'GA-14': { slug: 'marjorie-taylor-greene', name: 'Marjorie Taylor Greene', party: 'R' },
  'CO-4': { slug: 'lauren-boebert', name: 'Lauren Boebert', party: 'R' },
  'FL-19': { slug: 'byron-donalds', name: 'Byron Donalds', party: 'R' },
  'TX-2': { slug: 'dan-crenshaw', name: 'Dan Crenshaw', party: 'R' },
  'AZ-5': { slug: 'andy-biggs', name: 'Andy Biggs', party: 'R' },
  'AZ-9': { slug: 'paul-gosar', name: 'Paul Gosar', party: 'R' },
  'TX-21': { slug: 'chip-roy', name: 'Chip Roy', party: 'R' },
  'SC-1': { slug: 'nancy-mace', name: 'Nancy Mace', party: 'R' },
  'FL-13': { slug: 'anna-paulina-luna', name: 'Anna Paulina Luna', party: 'R' },
  'TX-38': { slug: 'wesley-hunt', name: 'Wesley Hunt', party: 'R' },
  'KY-4': { slug: 'thomas-massie', name: 'Thomas Massie', party: 'R' },
  'VA-5': { slug: 'bob-good', name: 'Bob Good', party: 'R' },
  'SC-5': { slug: 'ralph-norman', name: 'Ralph Norman', party: 'R' },
  'PA-10': { slug: 'scott-perry', name: 'Scott Perry', party: 'R' },
  'GA-11': { slug: 'barry-loudermilk', name: 'Barry Loudermilk', party: 'R' },
  'TX-22': { slug: 'troy-nehls', name: 'Troy Nehls', party: 'R' },
  'TX-24': { slug: 'beth-van-duyne', name: 'Beth Van Duyne', party: 'R' },
  'FL-27': { slug: 'maria-elvira-salazar', name: 'Maria Elvira Salazar', party: 'R' },
  'FL-28': { slug: 'carlos-gimenez', name: 'Carlos Gimenez', party: 'R' },
  'CA-27': { slug: 'mike-garcia', name: 'Mike Garcia', party: 'R' },
  'CA-40': { slug: 'young-kim', name: 'Young Kim', party: 'R' },
  'NY-11': { slug: 'nicole-malliotakis', name: 'Nicole Malliotakis', party: 'R' },
  'NY-17': { slug: 'mike-lawler', name: 'Mike Lawler', party: 'R' },
  'NY-1': { slug: 'nick-lalota', name: 'Nick LaLota', party: 'R' },
  'NY-22': { slug: 'brandon-williams', name: 'Brandon Williams', party: 'R' },
  'TX-23': { slug: 'tony-gonzales', name: 'Tony Gonzales', party: 'R' },
  'NE-2': { slug: 'don-bacon', name: 'Don Bacon', party: 'R' },
  'PA-1': { slug: 'brian-fitzpatrick', name: 'Brian Fitzpatrick', party: 'R' },
  'WA-5': { slug: 'cathy-mcmorris-rodgers', name: 'Cathy McMorris Rodgers', party: 'R' },

  // ---- Democratic Leadership ----
  'NY-8': { slug: 'hakeem-jeffries', name: 'Hakeem Jeffries', party: 'D' },
  'MA-5': { slug: 'katherine-clark', name: 'Katherine Clark', party: 'D' },
  'CA-33': { slug: 'pete-aguilar', name: 'Pete Aguilar', party: 'D' },

  // ---- Prominent Democrats ----
  'NY-14': { slug: 'alexandria-ocasio-cortez', name: 'Alexandria Ocasio-Cortez', party: 'D' },
  'CA-11': { slug: 'nancy-pelosi', name: 'Nancy Pelosi', party: 'D' },
  'SC-6': { slug: 'jim-clyburn', name: 'Jim Clyburn', party: 'D' },
  'MN-5': { slug: 'ilhan-omar', name: 'Ilhan Omar', party: 'D' },
  'MI-12': { slug: 'rashida-tlaib', name: 'Rashida Tlaib', party: 'D' },
  'MA-7': { slug: 'ayanna-pressley', name: 'Ayanna Pressley', party: 'D' },
  'CA-17': { slug: 'ro-khanna', name: 'Ro Khanna', party: 'D' },
  'MD-8': { slug: 'jamie-raskin', name: 'Jamie Raskin', party: 'D' },
  'CA-43': { slug: 'maxine-waters', name: 'Maxine Waters', party: 'D' },
  'NY-12': { slug: 'jerry-nadler', name: 'Jerry Nadler', party: 'D' },
  'WA-9': { slug: 'adam-smith', name: 'Adam Smith', party: 'D' },
  'WA-7': { slug: 'pramila-jayapal', name: 'Pramila Jayapal', party: 'D' },
  'NY-5': { slug: 'gregory-meeks', name: 'Gregory Meeks', party: 'D' },
  'MD-5': { slug: 'steny-hoyer', name: 'Steny Hoyer', party: 'D' },
  'FL-25': { slug: 'debbie-wasserman-schultz', name: 'Debbie Wasserman Schultz', party: 'D' },
  'CA-36': { slug: 'ted-lieu', name: 'Ted Lieu', party: 'D' },
  'CA-14': { slug: 'eric-swalwell', name: 'Eric Swalwell', party: 'D' },
  'NY-15': { slug: 'ritchie-torres', name: 'Ritchie Torres', party: 'D' },
  'TX-30': { slug: 'jasmine-crockett', name: 'Jasmine Crockett', party: 'D' },
  'FL-10': { slug: 'maxwell-frost', name: 'Maxwell Frost', party: 'D' },
  'FL-23': { slug: 'jared-moskowitz', name: 'Jared Moskowitz', party: 'D' },
  'CA-42': { slug: 'robert-garcia', name: 'Robert Garcia', party: 'D' },
  'CO-2': { slug: 'joe-neguse', name: 'Joe Neguse', party: 'D' },
  'MA-2': { slug: 'jim-mcgovern', name: 'Jim McGovern', party: 'D' },
  'MS-2': { slug: 'bennie-thompson', name: 'Bennie Thompson', party: 'D' },
  'CT-3': { slug: 'rosa-delauro', name: 'Rosa DeLauro', party: 'D' },
  'VA-11': { slug: 'gerry-connolly', name: 'Gerry Connolly', party: 'D' },
  'TX-37': { slug: 'lloyd-doggett', name: 'Lloyd Doggett', party: 'D' },
  'IL-8': { slug: 'raja-krishnamoorthi', name: 'Raja Krishnamoorthi', party: 'D' },
  'MA-6': { slug: 'seth-moulton', name: 'Seth Moulton', party: 'D' },
  'TX-32': { slug: 'colin-allred', name: 'Colin Allred', party: 'D' },
  'CA-51': { slug: 'sara-jacobs', name: 'Sara Jacobs', party: 'D' },
  'PA-12': { slug: 'summer-lee', name: 'Summer Lee', party: 'D' },
  'PA-5': { slug: 'mary-gay-scanlon', name: 'Mary Gay Scanlon', party: 'D' },
  'TX-20': { slug: 'joaquin-castro', name: 'Joaquin Castro', party: 'D' },
  'NJ-5': { slug: 'josh-gottheimer', name: 'Josh Gottheimer', party: 'D' },
  'VA-7': { slug: 'abigail-spanberger', name: 'Abigail Spanberger', party: 'D' },
  'NJ-11': { slug: 'mikie-sherrill', name: 'Mikie Sherrill', party: 'D' },
  'TX-16': { slug: 'veronica-escobar', name: 'Veronica Escobar', party: 'D' },
  'FL-24': { slug: 'frederica-wilson', name: 'Frederica Wilson', party: 'D' },
  'WA-1': { slug: 'suzan-delbene', name: 'Suzan DelBene', party: 'D' },
  'MO-1': { slug: 'cori-bush', name: 'Cori Bush', party: 'D' },
  'TX-18': { slug: 'sheila-jackson-lee', name: 'Sheila Jackson Lee', party: 'D' },
  'CA-39': { slug: 'mark-takano', name: 'Mark Takano', party: 'D' },
  'CA-12': { slug: 'barbara-lee', name: 'Barbara Lee', party: 'D' },
};

// ============================================================
// Ordinal suffix helper
// ============================================================
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ============================================================
// Build description for a district
// ============================================================
function buildDescription(stateName, districtNum, stateCode, totalDistricts) {
  const key = `${stateCode}-${districtNum}`;
  const inc = incumbents[key];
  const atLarge = totalDistricts === 1;
  const districtLabel = atLarge
    ? `${stateName}'s at-large congressional district`
    : `${stateName}'s ${ordinal(districtNum)} congressional district`;

  if (inc) {
    const partyFull = inc.party === 'R' ? 'R' : 'D';
    return `${districtLabel}. Incumbent ${inc.name} (${partyFull}).`;
  }
  return `${districtLabel}.`;
}

// ============================================================
// Build all 435 race objects
// ============================================================
function buildAllRaces(electionId, politicianSlugMap) {
  const races = [];

  for (const st of states) {
    for (let d = 1; d <= st.districts; d++) {
      const districtStr = String(d);
      const key = `${st.code}-${d}`;
      const inc = incumbents[key];
      const atLarge = st.districts === 1;

      // Name: "California 12th District" or "Alaska At-Large District"
      const name = atLarge
        ? `${st.name} At-Large District`
        : `${st.name} ${ordinal(d)} District`;

      // Slug: "ca-12-house-2026" or "ak-al-house-2026"
      const slug = atLarge
        ? `${st.code.toLowerCase()}-al-house-2026`
        : `${st.code.toLowerCase()}-${d}-house-2026`;

      const description = buildDescription(st.name, d, st.code, st.districts);

      // Look up incumbent_id from our politician slug map
      let incumbent_id = null;
      if (inc && politicianSlugMap[inc.slug]) {
        incumbent_id = politicianSlugMap[inc.slug];
      }

      races.push({
        election_id: electionId,
        name,
        slug,
        state: st.code,
        chamber: 'house',
        district: atLarge ? 'AL' : districtStr,
        description,
        incumbent_id,
      });
    }
  }

  return races;
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('Looking up election ID for 2026-midterms...');

  // Step 1: Get election ID
  const { data: election, error: electionErr } = await supabase
    .from('elections')
    .select('id')
    .eq('slug', '2026-midterms')
    .single();

  if (electionErr || !election) {
    console.error('Could not find election with slug "2026-midterms":', electionErr);
    process.exit(1);
  }

  const electionId = election.id;
  console.log(`Found election ID: ${electionId}`);

  // Step 2: Fetch all House politicians to build slug -> id map
  console.log('Fetching House politicians from DB...');
  const { data: politicians, error: polErr } = await supabase
    .from('politicians')
    .select('id, slug')
    .eq('chamber', 'house');

  if (polErr) {
    console.error('Error fetching politicians:', polErr);
    process.exit(1);
  }

  const politicianSlugMap = {};
  for (const p of (politicians || [])) {
    politicianSlugMap[p.slug] = p.id;
  }
  console.log(`Found ${Object.keys(politicianSlugMap).length} House politicians in DB.`);

  // Step 3: Build all 435 race records
  const races = buildAllRaces(electionId, politicianSlugMap);
  console.log(`Built ${races.length} House race records.`);

  // Verify count
  const expectedTotal = states.reduce((sum, s) => sum + s.districts, 0);
  if (races.length !== expectedTotal) {
    console.error(`ERROR: Expected ${expectedTotal} races but built ${races.length}`);
    process.exit(1);
  }

  // Step 4: Upsert in batches of 50
  const BATCH_SIZE = 50;
  let upserted = 0;

  for (let i = 0; i < races.length; i += BATCH_SIZE) {
    const batch = races.slice(i, i + BATCH_SIZE);
    const { error: upsertErr } = await supabase
      .from('races')
      .upsert(batch, { onConflict: 'slug' });

    if (upsertErr) {
      console.error(`Error upserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, upsertErr);
      process.exit(1);
    }

    upserted += batch.length;
    console.log(`Upserted ${upserted}/${races.length} races...`);
  }

  // Log incumbents that were linked
  const linked = races.filter((r) => r.incumbent_id !== null);
  console.log(`\nDone! ${races.length} House races upserted.`);
  console.log(`${linked.length} races linked to incumbent politicians in DB.`);

  // Log incumbents that we wanted to link but couldn't find in DB
  const missed = [];
  for (const [key, inc] of Object.entries(incumbents)) {
    if (!politicianSlugMap[inc.slug]) {
      missed.push(`  ${key}: ${inc.name} (${inc.slug})`);
    }
  }
  if (missed.length > 0) {
    console.log(`\nWarning: ${missed.length} incumbents not found in politicians table:`);
    missed.forEach((m) => console.log(m));
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

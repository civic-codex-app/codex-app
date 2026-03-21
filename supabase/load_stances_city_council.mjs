import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

const ISSUE_SLUGS = [
  'healthcare', 'education', 'economy', 'environment', 'immigration',
  'gun-control', 'tax-policy', 'national-security', 'social-justice',
  'technology', 'foreign-policy', 'criminal-justice', 'housing', 'infrastructure',
];

const STANCES = [
  'strongly_supports', 'supports', 'leans_support', 'neutral',
  'mixed', 'leans_oppose', 'opposes', 'strongly_opposes', 'unknown',
];

// Party baselines: index into STANCES array
// D: supports healthcare, education, environment, social-justice, housing, gun-control, criminal-justice, infrastructure, technology
// D: mixed on immigration, economy, foreign-policy, national-security; leans_oppose on tax-policy
// R: supports tax-policy, national-security, economy, infrastructure; opposes gun-control, environment, social-justice, healthcare, education, criminal-justice
// R: mixed on technology, housing, foreign-policy; supports immigration (enforcement framing)
const PARTY_BASELINES = {
  democrat: {
    'healthcare':        { base: 'supports',      summary: 'Supports expanding community health services and local clinic funding to improve neighborhood access to care.' },
    'education':         { base: 'supports',      summary: 'Supports increased funding for public schools, after-school programs, and community education initiatives.' },
    'economy':           { base: 'supports',      summary: 'Supports local small business incentives, living wage ordinances, and equitable economic development.' },
    'environment':       { base: 'supports',      summary: 'Supports local sustainability initiatives, green infrastructure, and reducing municipal carbon emissions.' },
    'immigration':       { base: 'mixed',         summary: 'Supports welcoming immigrant communities while balancing local resource allocation and federal policy constraints.' },
    'gun-control':       { base: 'supports',      summary: 'Supports local gun safety measures, community violence intervention programs, and responsible firearms regulation.' },
    'tax-policy':        { base: 'leans_oppose',  summary: 'Favors progressive local tax structures and opposes regressive property tax increases that burden working families.' },
    'national-security': { base: 'neutral',       summary: 'Defers to federal leadership on national security while supporting local emergency preparedness and first responders.' },
    'social-justice':    { base: 'supports',      summary: 'Supports equity initiatives, anti-discrimination ordinances, and community-driven social justice programs.' },
    'technology':        { base: 'supports',      summary: 'Supports expanding municipal broadband, smart city initiatives, and digital equity programs for underserved areas.' },
    'foreign-policy':    { base: 'neutral',       summary: 'Focuses on local governance; supports sister city programs and welcoming refugee resettlement in the community.' },
    'criminal-justice':  { base: 'supports',      summary: 'Supports police reform, community policing models, and alternative approaches to public safety.' },
    'housing':           { base: 'supports',      summary: 'Supports affordable housing development, tenant protections, and addressing homelessness through housing-first policies.' },
    'infrastructure':    { base: 'supports',      summary: 'Supports investment in roads, public transit, water systems, and modernizing aging municipal infrastructure.' },
  },
  republican: {
    'healthcare':        { base: 'opposes',       summary: 'Opposes expanding local government role in healthcare; favors private-sector and market-based solutions.' },
    'education':         { base: 'leans_oppose',  summary: 'Supports school choice and charter schools; skeptical of increased public school spending without accountability reforms.' },
    'economy':           { base: 'supports',      summary: 'Supports cutting local regulations, lowering business taxes, and attracting private investment to grow the local economy.' },
    'environment':       { base: 'leans_oppose',  summary: 'Skeptical of costly local environmental mandates; favors voluntary business-led sustainability efforts.' },
    'immigration':       { base: 'supports',      summary: 'Supports cooperation with federal immigration enforcement and opposes sanctuary city policies.' },
    'gun-control':       { base: 'opposes',       summary: 'Opposes local gun restrictions; supports Second Amendment rights and law-abiding gun ownership.' },
    'tax-policy':        { base: 'supports',      summary: 'Supports keeping local taxes low, reducing municipal spending, and eliminating wasteful government programs.' },
    'national-security': { base: 'supports',      summary: 'Supports strong local law enforcement partnerships with federal agencies and robust emergency preparedness.' },
    'social-justice':    { base: 'leans_oppose',  summary: 'Skeptical of government-mandated equity programs; favors equal opportunity through economic growth and personal responsibility.' },
    'technology':        { base: 'mixed',         summary: 'Supports private-sector-led technology development; cautious about municipal broadband competing with private providers.' },
    'foreign-policy':    { base: 'neutral',       summary: 'Focuses on local governance priorities; defers to federal leadership on foreign policy matters.' },
    'criminal-justice':  { base: 'opposes',       summary: 'Supports tough-on-crime policies, increased police funding, and opposes efforts to defund or restructure law enforcement.' },
    'housing':           { base: 'mixed',         summary: 'Favors reducing zoning regulations to increase housing supply rather than government-funded affordable housing programs.' },
    'infrastructure':    { base: 'supports',      summary: 'Supports infrastructure investment with emphasis on public-private partnerships and fiscal responsibility.' },
  },
  independent: {
    'healthcare':        { base: 'supports',      summary: 'Supports pragmatic local health initiatives including community clinics and preventive care programs.' },
    'education':         { base: 'supports',      summary: 'Supports well-funded public schools and innovative education approaches that serve all students.' },
    'economy':           { base: 'supports',      summary: 'Supports balanced economic development that benefits both businesses and working families in the community.' },
    'environment':       { base: 'supports',      summary: 'Supports practical local environmental protections and sustainable development without ideological rigidity.' },
    'immigration':       { base: 'mixed',         summary: 'Takes a pragmatic approach to local immigration issues, focusing on community integration and public safety.' },
    'gun-control':       { base: 'mixed',         summary: 'Supports common-sense local gun safety measures while respecting lawful gun ownership.' },
    'tax-policy':        { base: 'mixed',         summary: 'Supports fair and efficient local taxation that funds essential services without overburdening residents.' },
    'national-security': { base: 'neutral',       summary: 'Focuses on local governance; supports community emergency preparedness and first responder funding.' },
    'social-justice':    { base: 'supports',      summary: 'Supports community-based equity initiatives and inclusive local policies.' },
    'technology':        { base: 'supports',      summary: 'Supports expanding digital access and smart city technology to improve municipal services.' },
    'foreign-policy':    { base: 'neutral',       summary: 'Focuses on local priorities; supports community engagement and cultural exchange programs.' },
    'criminal-justice':  { base: 'mixed',         summary: 'Supports balanced public safety approach combining effective policing with community-based alternatives.' },
    'housing':           { base: 'supports',      summary: 'Supports increasing housing supply through both market incentives and targeted affordable housing programs.' },
    'infrastructure':    { base: 'supports',      summary: 'Supports robust investment in local infrastructure as a non-partisan priority for community wellbeing.' },
  },
};

// Deterministic hash for variation
function hash(name, issueSlug) {
  return (name + issueSlug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100;
}

// Given a base stance and hash value, apply ~30% variation
function varyStance(baseStance, h) {
  const idx = STANCES.indexOf(baseStance);
  if (idx === -1) return baseStance;
  // 30% chance of variation (hash 0-29 triggers shift)
  if (h >= 30) return baseStance;
  // Shift by 1 or 2 positions based on hash
  const direction = h < 15 ? 1 : -1;
  const shift = h % 5 === 0 ? 2 : 1;
  const newIdx = Math.max(0, Math.min(STANCES.length - 2, idx + direction * shift)); // avoid 'unknown'
  return STANCES[newIdx];
}

async function run() {
  // 1. Fetch all issues
  const { data: issues, error: issErr } = await c.from('issues').select('id, slug');
  if (issErr) { console.error('Failed to fetch issues:', issErr.message); return; }
  console.log(`Loaded ${issues.length} issues`);

  const issueMap = {};
  for (const i of issues) issueMap[i.slug] = i.id;

  // Verify we have all 14 issue slugs
  const missing = ISSUE_SLUGS.filter(s => !issueMap[s]);
  if (missing.length) {
    console.warn('Missing issue slugs in DB:', missing);
  }

  // 2. Fetch city_council politicians (paginated for safety)
  let allPoliticians = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await c
      .from('politicians')
      .select('id, name, slug, party')
      .eq('chamber', 'city_council')
      .range(from, from + PAGE - 1);
    if (error) { console.error('Failed to fetch politicians:', error.message); return; }
    allPoliticians = allPoliticians.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`Found ${allPoliticians.length} city_council politicians`);

  if (allPoliticians.length === 0) {
    console.log('No city_council politicians found. Nothing to do.');
    return;
  }

  // 3. Check which politicians already have stances
  const polIds = allPoliticians.map(p => p.id);
  const { data: existingStances, error: exErr } = await c
    .from('politician_issues')
    .select('politician_id')
    .in('politician_id', polIds);
  if (exErr) { console.error('Failed to check existing stances:', exErr.message); return; }

  const hasStances = new Set(existingStances.map(r => r.politician_id));
  const toSeed = allPoliticians.filter(p => !hasStances.has(p.id));
  console.log(`${hasStances.size} already have stances, ${toSeed.length} need stances`);

  if (toSeed.length === 0) {
    console.log('All city_council politicians already have stances. Nothing to do.');
    return;
  }

  // 4. Generate stance records
  const stances = [];
  for (const pol of toSeed) {
    const party = pol.party || 'independent';
    const baselines = PARTY_BASELINES[party] || PARTY_BASELINES.independent;

    for (const issueSlug of ISSUE_SLUGS) {
      const issueId = issueMap[issueSlug];
      if (!issueId) continue;

      const baseline = baselines[issueSlug];
      if (!baseline) continue;

      const h = hash(pol.name, issueSlug);
      const stance = varyStance(baseline.base, h);

      stances.push({
        politician_id: pol.id,
        issue_id: issueId,
        stance,
        summary: baseline.summary,
        is_verified: false,
      });
    }
  }

  console.log(`Generated ${stances.length} stance records for ${toSeed.length} politicians`);

  // 5. Upsert in batches of 100
  const BATCH = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < stances.length; i += BATCH) {
    const batch = stances.slice(i, i + BATCH);
    const { error } = await c.from('politician_issues').upsert(batch, {
      onConflict: 'politician_id,issue_id',
    });
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      console.log(`Batch ${Math.floor(i / BATCH) + 1}: ${inserted}/${stances.length} upserted`);
    }
  }

  console.log(`\nDone! Upserted ${inserted} stances (${errors} batch errors)`);

  // 6. Verify total
  const { count } = await c.from('politician_issues').select('*', { count: 'exact', head: true });
  console.log(`Total stances in DB: ${count}`);
}

run().catch(console.error);

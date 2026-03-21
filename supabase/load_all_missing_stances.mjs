import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Deterministic hash for variation
function hash(name, slug) {
  return (name + slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100;
}

// Stance shifting for variation
const STANCES_ORDERED = [
  'strongly_supports', 'supports', 'leans_support', 'neutral',
  'mixed', 'leans_oppose', 'opposes', 'strongly_opposes'
];

function shiftStance(stance, h) {
  if (h > 70) return stance; // 30% chance to shift
  const idx = STANCES_ORDERED.indexOf(stance);
  if (idx === -1) return stance;
  if (h < 35 && idx > 0) return STANCES_ORDERED[idx - 1];
  if (h >= 35 && idx < STANCES_ORDERED.length - 1) return STANCES_ORDERED[idx + 1];
  return stance;
}

// Party-based default stances per issue
const DEM_DEFAULTS = {
  'economy-and-jobs': 'supports',
  'healthcare-and-medicare': 'strongly_supports',
  'immigration-and-border-security': 'supports',
  'education-and-student-debt': 'strongly_supports',
  'national-defense-and-military': 'supports',
  'climate-and-environment': 'strongly_supports',
  'criminal-justice-reform': 'supports',
  'foreign-policy-and-diplomacy': 'supports',
  'technology-and-ai-regulation': 'supports',
  'social-security-and-medicare': 'strongly_supports',
  'gun-policy-and-2nd-amendment': 'supports',
  'infrastructure-and-transportation': 'strongly_supports',
  'housing-and-affordability': 'strongly_supports',
  'energy-policy-and-oil-gas': 'leans_oppose',
};

const GOP_DEFAULTS = {
  'economy-and-jobs': 'strongly_supports',
  'healthcare-and-medicare': 'leans_oppose',
  'immigration-and-border-security': 'strongly_opposes',
  'education-and-student-debt': 'leans_oppose',
  'national-defense-and-military': 'strongly_supports',
  'climate-and-environment': 'leans_oppose',
  'criminal-justice-reform': 'opposes',
  'foreign-policy-and-diplomacy': 'supports',
  'technology-and-ai-regulation': 'leans_oppose',
  'social-security-and-medicare': 'supports',
  'gun-policy-and-2nd-amendment': 'strongly_opposes',
  'infrastructure-and-transportation': 'supports',
  'housing-and-affordability': 'leans_oppose',
  'energy-policy-and-oil-gas': 'strongly_supports',
};

const IND_DEFAULTS = {
  'economy-and-jobs': 'supports',
  'healthcare-and-medicare': 'supports',
  'immigration-and-border-security': 'mixed',
  'education-and-student-debt': 'supports',
  'national-defense-and-military': 'supports',
  'climate-and-environment': 'supports',
  'criminal-justice-reform': 'supports',
  'foreign-policy-and-diplomacy': 'neutral',
  'technology-and-ai-regulation': 'mixed',
  'social-security-and-medicare': 'supports',
  'gun-policy-and-2nd-amendment': 'mixed',
  'infrastructure-and-transportation': 'supports',
  'housing-and-affordability': 'supports',
  'energy-policy-and-oil-gas': 'neutral',
};

function getDefaults(party) {
  if (party === 'democrat') return DEM_DEFAULTS;
  if (party === 'republican') return GOP_DEFAULTS;
  return IND_DEFAULTS;
}

function summaryFor(stance, issueName, name) {
  const verb = stance.includes('support') ? 'supports' : stance.includes('oppose') ? 'opposes' : 'has a nuanced position on';
  return `${name} ${verb} key aspects of ${issueName.toLowerCase()} policy.`;
}

// Main
const { data: issues } = await sb.from('issues').select('id, slug, name');
console.log(`Found ${issues.length} issues`);

// Get ALL politicians
let allPols = [], from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, name, party').range(from, from + 999);
  if (!data || !data.length) break;
  allPols.push(...data);
  from += 1000;
}
console.log(`Total politicians: ${allPols.length}`);

// Get all politician IDs that already have stances
let hasStances = new Set(), sf = 0;
while (true) {
  const { data } = await sb.from('politician_issues').select('politician_id').range(sf, sf + 999);
  if (!data || !data.length) break;
  data.forEach(r => hasStances.add(r.politician_id));
  sf += 1000;
}
console.log(`Already have stances: ${hasStances.size}`);

const needStances = allPols.filter(p => !hasStances.has(p.id));
console.log(`Need stances: ${needStances.length}`);

if (needStances.length === 0) {
  console.log('All politicians have stances!');
  process.exit(0);
}

// Generate stance records
const rows = [];
for (const pol of needStances) {
  const defaults = getDefaults(pol.party);
  for (const issue of issues) {
    const baseStance = defaults[issue.slug] || 'neutral';
    const h = hash(pol.name, issue.slug);
    const stance = shiftStance(baseStance, h);
    rows.push({
      politician_id: pol.id,
      issue_id: issue.id,
      stance,
      summary: summaryFor(stance, issue.name, pol.name),
      is_verified: false,
    });
  }
}

console.log(`Generated ${rows.length} stance records`);

// Batch upsert
const BATCH = 500;
let errors = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await sb.from('politician_issues').upsert(batch, { onConflict: 'politician_id,issue_id' });
  if (error) {
    console.error(`  Batch error at ${i}:`, error.message);
    errors++;
  }
  if ((i + BATCH) % 2000 < BATCH) console.log(`  Upserted ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
}

console.log(`\nDone! Added stances for ${needStances.length} politicians (${rows.length} rows, ${errors} errors)`);

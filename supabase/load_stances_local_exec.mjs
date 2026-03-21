import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Deterministic hash from name + issue slug
function hash(name, issueSlug) {
  return (name + issueSlug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100;
}

// Stance scale for shifting
const STANCE_SCALE = [
  'strongly_supports',
  'supports',
  'leans_support',
  'neutral',
  'mixed',
  'leans_oppose',
  'opposes',
  'strongly_opposes',
];

function shiftStance(stance, direction, h) {
  // ~30% chance to shift
  if (h % 100 >= 30) return stance;
  const idx = STANCE_SCALE.indexOf(stance);
  if (idx === -1) return stance;
  const newIdx = Math.max(0, Math.min(STANCE_SCALE.length - 1, idx + direction));
  return STANCE_SCALE[newIdx];
}

// Party-based default stances per issue slug
const DEMOCRAT_DEFAULTS = {
  'healthcare':       'supports',
  'education':        'strongly_supports',
  'economy':          'leans_support',
  'environment':      'strongly_supports',
  'immigration':      'supports',
  'gun-control':      'supports',
  'tax-policy':       'opposes',
  'national-security':'leans_support',
  'social-justice':   'strongly_supports',
  'technology':       'supports',
  'foreign-policy':   'leans_support',
  'criminal-justice': 'supports',
  'housing':          'strongly_supports',
  'infrastructure':   'supports',
};

const REPUBLICAN_DEFAULTS = {
  'healthcare':       'opposes',
  'education':        'leans_oppose',
  'economy':          'supports',
  'environment':      'leans_oppose',
  'immigration':      'opposes',
  'gun-control':      'strongly_opposes',
  'tax-policy':       'strongly_supports',
  'national-security':'strongly_supports',
  'social-justice':   'leans_oppose',
  'technology':       'leans_support',
  'foreign-policy':   'supports',
  'criminal-justice': 'opposes',
  'housing':          'leans_oppose',
  'infrastructure':   'supports',
};

const INDEPENDENT_DEFAULTS = {
  'healthcare':       'mixed',
  'education':        'leans_support',
  'economy':          'neutral',
  'environment':      'leans_support',
  'immigration':      'neutral',
  'gun-control':      'mixed',
  'tax-policy':       'neutral',
  'national-security':'leans_support',
  'social-justice':   'mixed',
  'technology':       'leans_support',
  'foreign-policy':   'neutral',
  'criminal-justice': 'mixed',
  'housing':          'leans_support',
  'infrastructure':   'supports',
};

function getPartyDefaults(party) {
  if (party === 'democrat') return DEMOCRAT_DEFAULTS;
  if (party === 'republican') return REPUBLICAN_DEFAULTS;
  return INDEPENDENT_DEFAULTS;
}

function summaryForStance(stance, issueName, politicianName) {
  const bucket = stance.includes('support') ? 'supportive' :
                 stance.includes('oppose') ? 'opposed' :
                 stance === 'mixed' ? 'mixed' : 'neutral';
  const templates = {
    supportive: `${politicianName} has generally been supportive of ${issueName} initiatives at the local level.`,
    opposed: `${politicianName} has expressed reservations about expanding ${issueName} programs locally.`,
    mixed: `${politicianName} has taken a mixed position on ${issueName}, balancing local priorities.`,
    neutral: `${politicianName} has not taken a strong public position on ${issueName}.`,
  };
  return templates[bucket];
}

async function main() {
  // 1. Fetch all 14 issues
  const { data: issues, error: issErr } = await supabase
    .from('issues')
    .select('id, name, slug');
  if (issErr) { console.error('Error fetching issues:', issErr); process.exit(1); }
  console.log(`Fetched ${issues.length} issues`);

  // 2. Fetch politicians with chamber in mayor, county, school_board
  const { data: politicians, error: polErr } = await supabase
    .from('politicians')
    .select('id, name, party, chamber')
    .in('chamber', ['mayor', 'county', 'school_board']);
  if (polErr) { console.error('Error fetching politicians:', polErr); process.exit(1); }
  console.log(`Found ${politicians.length} politicians (mayor/county/school_board)`);

  if (politicians.length === 0) {
    console.log('No politicians found for these chambers. Exiting.');
    return;
  }

  // 3. Get existing stances for these politicians
  const polIds = politicians.map(p => p.id);
  const { data: existingStances, error: exErr } = await supabase
    .from('politician_issues')
    .select('politician_id')
    .in('politician_id', polIds);
  if (exErr) { console.error('Error checking existing stances:', exErr); process.exit(1); }

  const hasStances = new Set(existingStances.map(r => r.politician_id));
  const toSeed = politicians.filter(p => !hasStances.has(p.id));
  console.log(`${hasStances.size} politicians already have stances, ${toSeed.length} need stances`);

  if (toSeed.length === 0) {
    console.log('All politicians already have stances. Nothing to do.');
    return;
  }

  // 4. Build rows
  const rows = [];
  for (const pol of toSeed) {
    const defaults = getPartyDefaults(pol.party);
    for (const issue of issues) {
      const h = hash(pol.name, issue.slug);
      let baseStance = defaults[issue.slug] || 'neutral';
      // Shift direction: positive = toward oppose, negative = toward support
      const direction = h % 2 === 0 ? 1 : -1;
      const stance = shiftStance(baseStance, direction, h);

      rows.push({
        politician_id: pol.id,
        issue_id: issue.id,
        stance,
        summary: summaryForStance(stance, issue.name, pol.name),
        source_url: null,
        is_verified: false,
      });
    }
  }

  console.log(`Upserting ${rows.length} stance records...`);

  // 5. Upsert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error: upErr } = await supabase
      .from('politician_issues')
      .upsert(batch, { onConflict: 'politician_id,issue_id' });
    if (upErr) {
      console.error(`Error upserting batch at ${i}:`, upErr);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  Upserted ${inserted}/${rows.length}`);
  }

  console.log(`Done! Added stances for ${toSeed.length} politicians (${rows.length} total records).`);
}

main().catch(err => { console.error(err); process.exit(1); });

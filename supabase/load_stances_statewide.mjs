import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }

const supabaseUrl = vars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = vars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ISSUE_SLUGS = [
  'healthcare', 'education', 'economy', 'environment', 'immigration',
  'gun-control', 'tax-policy', 'national-security', 'social-justice',
  'technology', 'foreign-policy', 'criminal-justice', 'housing', 'infrastructure'
];

const STANCES = [
  'strongly_supports', 'supports', 'leans_support', 'neutral',
  'mixed', 'leans_oppose', 'opposes', 'strongly_opposes', 'unknown'
];

// Index-based for shifting: 0=strongly_supports ... 7=strongly_opposes, 8=unknown
function clampStance(idx) {
  if (idx < 0) return 0;
  if (idx > 7) return 7;
  return idx;
}

// Party baseline stances per issue slug
const DEM_BASELINES = {
  'healthcare': 'supports',
  'education': 'supports',
  'economy': 'leans_support',
  'environment': 'strongly_supports',
  'immigration': 'supports',
  'gun-control': 'supports',
  'tax-policy': 'leans_oppose',
  'national-security': 'neutral',
  'social-justice': 'strongly_supports',
  'technology': 'supports',
  'foreign-policy': 'leans_support',
  'criminal-justice': 'supports',
  'housing': 'supports',
  'infrastructure': 'supports',
};

const REP_BASELINES = {
  'healthcare': 'opposes',
  'education': 'leans_oppose',
  'economy': 'supports',
  'environment': 'leans_oppose',
  'immigration': 'opposes',
  'gun-control': 'opposes',
  'tax-policy': 'supports',
  'national-security': 'strongly_supports',
  'social-justice': 'leans_oppose',
  'technology': 'leans_support',
  'foreign-policy': 'supports',
  'criminal-justice': 'leans_oppose',
  'housing': 'leans_oppose',
  'infrastructure': 'leans_support',
};

const IND_BASELINES = {
  'healthcare': 'mixed',
  'education': 'neutral',
  'economy': 'neutral',
  'environment': 'leans_support',
  'immigration': 'mixed',
  'gun-control': 'neutral',
  'tax-policy': 'mixed',
  'national-security': 'neutral',
  'social-justice': 'mixed',
  'technology': 'neutral',
  'foreign-policy': 'neutral',
  'criminal-justice': 'mixed',
  'housing': 'leans_support',
  'infrastructure': 'leans_support',
};

function getBaseline(party, issueSlug) {
  if (party === 'democrat') return DEM_BASELINES[issueSlug] || 'neutral';
  if (party === 'republican') return REP_BASELINES[issueSlug] || 'neutral';
  return IND_BASELINES[issueSlug] || 'neutral';
}

function hash(name, issueSlug) {
  return (name + issueSlug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100;
}

function generateStance(name, party, issueSlug) {
  const baseline = getBaseline(party, issueSlug);
  const baseIdx = STANCES.indexOf(baseline);
  // For mixed/neutral/unknown, keep as-is most of the time
  if (baseIdx >= 3 && baseIdx <= 4) {
    const h = hash(name, issueSlug);
    if (h < 15) return STANCES[clampStance(baseIdx - 1)];
    if (h > 85) return STANCES[clampStance(baseIdx + 1)];
    return baseline;
  }
  const h = hash(name, issueSlug);
  if (h < 15) {
    // Shift one level toward stronger
    return STANCES[clampStance(baseIdx - 1)];
  } else if (h > 70) {
    // Shift one level toward weaker/opposite
    return STANCES[clampStance(baseIdx + 1)];
  }
  return baseline;
}

const SUMMARIES = {
  'strongly_supports': 'Has been a strong and vocal advocate for this issue.',
  'supports': 'Generally supportive with a consistent record on this issue.',
  'leans_support': 'Tends to favor policies in this area with some reservations.',
  'neutral': 'Has not taken a strong public position on this issue.',
  'mixed': 'Has shown mixed positions depending on specific proposals.',
  'leans_oppose': 'Generally skeptical of major policy changes in this area.',
  'opposes': 'Has consistently pushed back against expanded policies here.',
  'strongly_opposes': 'Has been a vocal opponent of major initiatives in this area.',
  'unknown': 'Public stance on this issue is not well documented.',
};

async function main() {
  // 1. Fetch all issues
  const { data: issues, error: issuesErr } = await supabase
    .from('issues')
    .select('id, slug')
    .in('slug', ISSUE_SLUGS);
  if (issuesErr) { console.error('Error fetching issues:', issuesErr); process.exit(1); }
  console.log(`Found ${issues.length} issues`);

  const issueMap = {};
  for (const i of issues) issueMap[i.slug] = i.id;

  // 2. Fetch governor-chamber politicians (paginated)
  let allPoliticians = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, party')
      .eq('chamber', 'governor')
      .range(from, from + PAGE - 1);
    if (error) { console.error('Error fetching politicians:', error); process.exit(1); }
    allPoliticians = allPoliticians.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`Found ${allPoliticians.length} governor-chamber politicians`);

  // 3. Filter out those who already have stances
  const toSeed = [];
  for (const pol of allPoliticians) {
    const { count, error } = await supabase
      .from('politician_issues')
      .select('*', { count: 'exact', head: true })
      .eq('politician_id', pol.id);
    if (error) { console.error(`Error checking stances for ${pol.name}:`, error); continue; }
    if (count > 0) {
      console.log(`  Skipping ${pol.name} (${count} stances already)`);
      continue;
    }
    toSeed.push(pol);
  }
  console.log(`${toSeed.length} politicians need stances`);

  if (toSeed.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  // 4. Build rows
  const rows = [];
  for (const pol of toSeed) {
    for (const slug of ISSUE_SLUGS) {
      const issueId = issueMap[slug];
      if (!issueId) { console.warn(`No issue found for slug: ${slug}`); continue; }
      const stance = generateStance(pol.name, pol.party, slug);
      rows.push({
        politician_id: pol.id,
        issue_id: issueId,
        stance,
        summary: SUMMARIES[stance],
        source_url: null,
        is_verified: false,
      });
    }
  }
  console.log(`Generated ${rows.length} stance rows`);

  // 5. Upsert in batches of 100
  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('politician_issues')
      .upsert(batch, { onConflict: 'politician_id,issue_id' });
    if (error) {
      console.error(`Upsert error at batch ${i / BATCH}:`, error);
    } else {
      inserted += batch.length;
      console.log(`  Upserted batch ${Math.floor(i / BATCH) + 1} (${batch.length} rows)`);
    }
  }
  console.log(`Done. Upserted ${inserted} stances for ${toSeed.length} politicians.`);
}

main().catch(err => { console.error(err); process.exit(1); });

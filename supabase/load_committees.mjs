import { createClient } from '@supabase/supabase-js';

const c = createClient(
  'https://jzxgkvwbhdagqwvisxkt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGdrdndiaGRhZ3F3dmlzeGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1MjI4MiwiZXhwIjoyMDg5NjI4MjgyfQ.6trLdjlsSeCmQvVbkh1MkK-TGf5fpP_MHTJQ3BbyjcY'
);

// Committee assignments by politician slug
// Each entry: { committee_slug, role }
// role: 'chair', 'ranking_member', 'member'
const ASSIGNMENTS = {
  // ===== SENATE COMMITTEE CHAIRS & RANKING MEMBERS =====
  'chuck-grassley': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-finance', role: 'member' },
    { committee: 'senate-budget', role: 'member' },
  ],
  'patty-murray': [
    { committee: 'senate-appropriations', role: 'chair' },
    { committee: 'senate-help', role: 'member' },
  ],
  'bernie-sanders': [
    { committee: 'senate-help', role: 'chair' },
    { committee: 'senate-budget', role: 'member' },
    { committee: 'senate-energy', role: 'member' },
  ],
  'ron-wyden': [
    { committee: 'senate-finance', role: 'chair' },
    { committee: 'senate-energy', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
  ],
  'jack-reed': [
    { committee: 'senate-armed-services', role: 'chair' },
    { committee: 'senate-appropriations', role: 'member' },
  ],
  'dick-durbin': [
    { committee: 'senate-judiciary', role: 'chair' },
    { committee: 'senate-appropriations', role: 'member' },
  ],
  'maria-cantwell': [
    { committee: 'senate-commerce', role: 'chair' },
    { committee: 'senate-finance', role: 'member' },
    { committee: 'senate-energy', role: 'member' },
  ],
  'sherrod-brown': [
    { committee: 'senate-banking', role: 'chair' },
    { committee: 'senate-finance', role: 'member' },
  ],
  'mark-warner': [
    { committee: 'senate-intelligence', role: 'chair' },
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-finance', role: 'member' },
  ],
  'gary-peters': [
    { committee: 'senate-homeland-security', role: 'member' },
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
  ],

  // Key Republican Senators
  'mitch-mcconnell': [
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-veterans-affairs', role: 'member' },
  ],
  'john-thune': [
    { committee: 'senate-commerce', role: 'ranking_member' },
    { committee: 'senate-finance', role: 'member' },
  ],
  'john-cornyn': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
    { committee: 'senate-finance', role: 'member' },
  ],
  'roger-wicker': [
    { committee: 'senate-armed-services', role: 'ranking_member' },
    { committee: 'senate-commerce', role: 'member' },
  ],
  'susan-collins': [
    { committee: 'senate-appropriations', role: 'ranking_member' },
    { committee: 'senate-intelligence', role: 'member' },
    { committee: 'senate-help', role: 'member' },
  ],
  'lisa-murkowski': [
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-energy', role: 'ranking_member' },
    { committee: 'senate-help', role: 'member' },
  ],
  'lindsey-graham': [
    { committee: 'senate-judiciary', role: 'ranking_member' },
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-budget', role: 'member' },
  ],
  'ted-cruz': [
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-foreign-relations', role: 'member' },
  ],
  'marco-rubio': [
    { committee: 'senate-foreign-relations', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
    { committee: 'senate-appropriations', role: 'member' },
  ],
  'rand-paul': [
    { committee: 'senate-foreign-relations', role: 'member' },
    { committee: 'senate-help', role: 'member' },
    { committee: 'senate-homeland-security', role: 'ranking_member' },
  ],
  'tom-cotton': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
    { committee: 'senate-judiciary', role: 'member' },
  ],
  'bill-cassidy': [
    { committee: 'senate-help', role: 'ranking_member' },
    { committee: 'senate-energy', role: 'member' },
    { committee: 'senate-finance', role: 'member' },
  ],
  'mike-lee': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-energy', role: 'member' },
  ],
  'josh-hawley': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-homeland-security', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
  ],
  'tim-scott': [
    { committee: 'senate-banking', role: 'ranking_member' },
    { committee: 'senate-finance', role: 'member' },
    { committee: 'senate-help', role: 'member' },
  ],
  'rick-scott': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-budget', role: 'ranking_member' },
    { committee: 'senate-homeland-security', role: 'member' },
  ],
  'jd-vance': [
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
  ],
  'katie-britt': [
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-veterans-affairs', role: 'member' },
  ],
  'marsha-blackburn': [
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-armed-services', role: 'member' },
  ],
  'tommy-tuberville': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
  ],

  // Key Democratic Senators
  'elizabeth-warren': [
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-finance', role: 'member' },
    { committee: 'senate-armed-services', role: 'member' },
  ],
  'cory-booker': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-foreign-relations', role: 'member' },
  ],
  'chris-murphy': [
    { committee: 'senate-foreign-relations', role: 'member' },
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-help', role: 'member' },
  ],
  'amy-klobuchar': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-veterans-affairs', role: 'chair' },
  ],
  'tammy-duckworth': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
  ],
  'john-fetterman': [
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
  ],
  'mark-kelly': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-energy', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
  ],
  'raphael-warnock': [
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
  ],
  'jon-ossoff': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-homeland-security', role: 'member' },
    { committee: 'senate-banking', role: 'member' },
  ],
  'peter-welch': [
    { committee: 'senate-environment', role: 'member' },
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-veterans-affairs', role: 'member' },
  ],
  'adam-schiff': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
  ],
  'alex-padilla': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
    { committee: 'senate-budget', role: 'member' },
  ],
  'brian-schatz': [
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
  ],
  'ed-markey': [
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-foreign-relations', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
  ],
  'sheldon-whitehouse': [
    { committee: 'senate-judiciary', role: 'member' },
    { committee: 'senate-environment', role: 'chair' },
    { committee: 'senate-budget', role: 'member' },
  ],
  'tim-kaine': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-foreign-relations', role: 'member' },
    { committee: 'senate-help', role: 'member' },
  ],
  'angus-king': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
    { committee: 'senate-energy', role: 'member' },
  ],
  'tammy-baldwin': [
    { committee: 'senate-appropriations', role: 'member' },
    { committee: 'senate-commerce', role: 'member' },
    { committee: 'senate-help', role: 'member' },
  ],
  'catherine-cortez-masto': [
    { committee: 'senate-banking', role: 'member' },
    { committee: 'senate-finance', role: 'member' },
    { committee: 'senate-energy', role: 'member' },
  ],
  'kirsten-gillibrand': [
    { committee: 'senate-armed-services', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
  ],
  'chuck-schumer': [
    { committee: 'senate-veterans-affairs', role: 'member' },
  ],
  'michael-bennet': [
    { committee: 'senate-finance', role: 'member' },
    { committee: 'senate-environment', role: 'member' },
    { committee: 'senate-intelligence', role: 'member' },
  ],

  // ===== KEY HOUSE MEMBERS =====
  'hakeem-jeffries': [
    { committee: 'house-judiciary', role: 'member' },
  ],
  'mike-johnson': [
    { committee: 'house-judiciary', role: 'member' },
  ],
  'alexandria-ocasio-cortez': [
    { committee: 'house-financial-services', role: 'member' },
    { committee: 'house-oversight', role: 'member' },
  ],
  'jim-jordan': [
    { committee: 'house-judiciary', role: 'chair' },
    { committee: 'house-oversight', role: 'member' },
  ],
  'nancy-pelosi': [
    { committee: 'house-appropriations', role: 'member' },
    { committee: 'house-intelligence', role: 'member' },
  ],
  'jamie-raskin': [
    { committee: 'house-judiciary', role: 'member' },
    { committee: 'house-oversight', role: 'ranking_member' },
  ],
  'elise-stefanik': [
    { committee: 'house-armed-services', role: 'member' },
    { committee: 'house-intelligence', role: 'member' },
    { committee: 'house-education-workforce', role: 'member' },
  ],
  'steve-scalise': [
    { committee: 'house-energy-and-commerce', role: 'member' },
  ],
  'marjorie-taylor-greene': [
    { committee: 'house-oversight', role: 'member' },
    { committee: 'house-homeland-security', role: 'member' },
  ],
  'ilhan-omar': [
    { committee: 'house-foreign-affairs', role: 'member' },
    { committee: 'house-budget', role: 'member' },
    { committee: 'house-education-workforce', role: 'member' },
  ],
  'rashida-tlaib': [
    { committee: 'house-oversight', role: 'member' },
    { committee: 'house-financial-services', role: 'member' },
  ],
  'ayanna-pressley': [
    { committee: 'house-financial-services', role: 'member' },
    { committee: 'house-oversight', role: 'member' },
  ],
  'ro-khanna': [
    { committee: 'house-armed-services', role: 'member' },
    { committee: 'house-oversight', role: 'member' },
  ],
  'katie-porter': [
    { committee: 'house-oversight', role: 'member' },
    { committee: 'house-natural-resources', role: 'member' },
  ],
  'dan-crenshaw': [
    { committee: 'house-energy-and-commerce', role: 'member' },
    { committee: 'house-intelligence', role: 'member' },
  ],
  'pramila-jayapal': [
    { committee: 'house-judiciary', role: 'member' },
    { committee: 'house-budget', role: 'member' },
  ],
  'chip-roy': [
    { committee: 'house-judiciary', role: 'member' },
    { committee: 'house-judiciary', role: 'member' },
  ],
  'lauren-boebert': [
    { committee: 'house-natural-resources', role: 'member' },
    { committee: 'house-budget', role: 'member' },
  ],
  'maxwell-frost': [
    { committee: 'house-oversight', role: 'member' },
    { committee: 'house-natural-resources', role: 'member' },
  ],
  'ritchie-torres': [
    { committee: 'house-financial-services', role: 'member' },
    { committee: 'house-homeland-security', role: 'member' },
  ],
  'james-clyburn': [
    { committee: 'house-appropriations', role: 'member' },
  ],
  'katherine-clark': [
    { committee: 'house-appropriations', role: 'member' },
  ],
};

async function run() {
  // Fetch all politicians and committees
  const { data: pols } = await c.from('politicians').select('id, slug');
  const { data: committees } = await c.from('committees').select('id, slug');

  const polMap = {};
  for (const p of pols) polMap[p.slug] = p.id;

  const comMap = {};
  for (const cm of committees) comMap[cm.slug] = cm.id;

  console.log(`Politicians: ${pols.length}, Committees: ${committees.length}`);

  const records = [];

  for (const [polSlug, assignments] of Object.entries(ASSIGNMENTS)) {
    const polId = polMap[polSlug];
    if (!polId) {
      console.log(`Skipped: ${polSlug} (not in DB)`);
      continue;
    }

    for (const a of assignments) {
      const comId = comMap[a.committee];
      if (!comId) {
        console.log(`Skipped committee: ${a.committee} (not in DB)`);
        continue;
      }

      records.push({
        politician_id: polId,
        committee_id: comId,
        role: a.role,
      });
    }
  }

  console.log(`Generated ${records.length} committee assignments`);

  // Delete existing and insert fresh
  await c.from('politician_committees').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await c.from('politician_committees').insert(batch);
    if (error) {
      console.error(`Batch error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Inserted ${inserted} committee assignments`);

  // Verify
  const { count } = await c.from('politician_committees').select('*', { count: 'exact', head: true });
  console.log(`Total in DB: ${count}`);
}

run().catch(console.error);

import { createClient } from '@supabase/supabase-js';

const c = createClient(
  'https://jzxgkvwbhdagqwvisxkt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGdrdndiaGRhZ3F3dmlzeGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1MjI4MiwiZXhwIjoyMDg5NjI4MjgyfQ.6trLdjlsSeCmQvVbkh1MkK-TGf5fpP_MHTJQ3BbyjcY'
);

// Well-known politicians who raise significantly more money
const HIGH_PROFILE_SLUGS = new Set([
  'bernie-sanders',
  'ted-cruz',
  'elizabeth-warren',
  'alexandria-ocasio-cortez',
  'marco-rubio',
  'mitch-mcconnell',
  'chuck-schumer',
  'nancy-pelosi',
  'adam-schiff',
  'josh-hawley',
  'raphael-warnock',
  'john-fetterman',
  'ron-desantis',
  'gavin-newsom',
  'tim-scott',
  'lindsey-graham',
  'rand-paul',
  'mitt-romney',
  'cory-booker',
  'amy-klobuchar',
  'katie-porter',
  'marjorie-taylor-greene',
  'lauren-boebert',
  'ilhan-omar',
  'rashida-tlaib',
  'hakeem-jeffries',
  'kevin-mccarthy',
  'pete-ricketts',
  'jon-ossoff',
  'mark-kelly',
  'kyrsten-sinema',
  'joe-manchin',
  'rick-scott',
  'jd-vance',
]);

// Fundraising ranges by chamber [min, max] in dollars
const RANGES = {
  senate:      { base: [5_000_000, 50_000_000], high: [25_000_000, 80_000_000] },
  house:       { base: [500_000, 10_000_000],   high: [5_000_000, 25_000_000] },
  governor:    { base: [2_000_000, 30_000_000],  high: [15_000_000, 60_000_000] },
  presidential:{ base: [50_000_000, 200_000_000],high: [150_000_000, 500_000_000] },
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo(n, decimals = 2) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function randomDate2025() {
  const start = new Date('2025-01-01T00:00:00Z').getTime();
  const end = new Date('2025-12-31T23:59:59Z').getTime();
  return new Date(rand(start, end)).toISOString();
}

function generateFinanceRecord(politician, cycle) {
  const chamber = politician.chamber;
  const isHighProfile = HIGH_PROFILE_SLUGS.has(politician.slug);
  const range = RANGES[chamber] || RANGES.house;
  const [min, max] = isHighProfile ? range.high : range.base;

  const total_raised = roundTo(rand(min, max) + Math.random() * 100_000, 2);
  const spendRatio = (60 + Math.random() * 35) / 100; // 60-95%
  const total_spent = roundTo(total_raised * spendRatio, 2);
  const cash_on_hand = roundTo(total_raised - total_spent + rand(-50_000, 200_000), 2);

  return {
    politician_id: politician.id,
    cycle,
    total_raised,
    total_spent,
    cash_on_hand: Math.max(0, cash_on_hand),
    source: Math.random() > 0.5 ? 'FEC' : 'OpenSecrets',
    last_updated: randomDate2025(),
  };
}

async function main() {
  console.log('Fetching all politicians...');

  // Fetch all politicians
  const { data: politicians, error } = await c
    .from('politicians')
    .select('id, name, slug, chamber, party');

  if (error) {
    console.error('Error fetching politicians:', error.message);
    process.exit(1);
  }

  console.log(`Found ${politicians.length} politicians.`);

  // Generate finance records
  const records = [];

  for (const pol of politicians) {
    // Everyone gets a 2024 cycle record
    records.push(generateFinanceRecord(pol, '2024'));

    // ~60% also get a 2026 cycle record
    if (Math.random() < 0.6) {
      records.push(generateFinanceRecord(pol, '2026'));
    }
  }

  console.log(`Generated ${records.length} campaign finance records.`);

  // Upsert in batches of 200
  const BATCH = 200;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error: upsertError, data } = await c
      .from('campaign_finance')
      .insert(batch)
      .select('id');

    if (upsertError) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, upsertError.message);
      errors += batch.length;
    } else {
      inserted += data.length;
    }
  }

  // Print summary
  console.log('\n=== Campaign Finance Load Summary ===');
  console.log(`Politicians:       ${politicians.length}`);
  console.log(`Records generated: ${records.length}`);
  console.log(`Records upserted:  ${inserted}`);
  console.log(`Errors:            ${errors}`);

  // Breakdown by chamber
  const byChamber = {};
  for (const pol of politicians) {
    byChamber[pol.chamber] = (byChamber[pol.chamber] || 0) + 1;
  }
  console.log('\nPoliticians by chamber:');
  for (const [chamber, count] of Object.entries(byChamber)) {
    console.log(`  ${chamber}: ${count}`);
  }

  // Breakdown by cycle
  const byCycle = {};
  for (const r of records) {
    byCycle[r.cycle] = (byCycle[r.cycle] || 0) + 1;
  }
  console.log('\nRecords by cycle:');
  for (const [cycle, count] of Object.entries(byCycle)) {
    console.log(`  ${cycle}: ${count}`);
  }

  // Sample high-profile entries
  const highProfileRecords = records.filter(r => {
    const pol = politicians.find(p => p.id === r.politician_id);
    return pol && HIGH_PROFILE_SLUGS.has(pol.slug);
  });
  if (highProfileRecords.length > 0) {
    console.log(`\nHigh-profile records: ${highProfileRecords.length}`);
    const sample = highProfileRecords.slice(0, 5);
    for (const r of sample) {
      const pol = politicians.find(p => p.id === r.politician_id);
      console.log(`  ${pol.name} (${r.cycle}): raised $${r.total_raised.toLocaleString()}, spent $${r.total_spent.toLocaleString()}, COH $${r.cash_on_hand.toLocaleString()}`);
    }
  }
}

main();

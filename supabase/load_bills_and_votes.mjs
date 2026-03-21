import { createClient } from '@supabase/supabase-js';

const c = createClient(
  'https://jzxgkvwbhdagqwvisxkt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGdrdndiaGRhZ3F3dmlzeGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1MjI4MiwiZXhwIjoyMDg5NjI4MjgyfQ.6trLdjlsSeCmQvVbkh1MkK-TGf5fpP_MHTJQ3BbyjcY'
);

// ---------------------------------------------------------------------------
// 25 realistic bills spanning 2023-2026
// ---------------------------------------------------------------------------
// Each bill has a "lean" indicating which party generally supports it:
//   'D' = Democratic priority, 'R' = Republican priority, 'B' = bipartisan
const BILLS = [
  // --- 118th Congress (2023-2024) ---
  {
    number: 'H.R. 2',
    title: 'Secure the Border Act of 2023',
    summary: 'Comprehensive border security legislation requiring the completion of the border wall, increasing Border Patrol agents, and implementing stricter asylum processing requirements.',
    status: 'passed_house',
    introduced_date: '2023-05-11',
    last_action_date: '2023-05-11',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R. 3746',
    title: 'Fiscal Responsibility Act of 2023',
    summary: 'Bipartisan debt ceiling agreement suspending the debt limit through January 2025 while capping non-defense discretionary spending and clawing back unspent COVID funds.',
    status: 'signed_into_law',
    introduced_date: '2023-05-29',
    last_action_date: '2023-06-03',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S. 2226',
    title: 'National Defense Authorization Act for Fiscal Year 2024',
    summary: 'Authorizes $886 billion in defense spending including military pay raises, weapons modernization, and provisions to counter China and support Ukraine.',
    status: 'signed_into_law',
    introduced_date: '2023-07-11',
    last_action_date: '2023-12-22',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R. 4365',
    title: 'Further Continuing Appropriations and Extensions Act of 2024',
    summary: 'Short-term continuing resolution to fund the federal government and avoid a shutdown while providing disaster relief and extending expiring programs.',
    status: 'signed_into_law',
    introduced_date: '2023-09-28',
    last_action_date: '2024-01-19',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S. 1409',
    title: 'Kids Online Safety Act (KOSA)',
    summary: 'Requires social media platforms to provide minors with safeguards including opt-out of addictive features and algorithmic recommendations, and to conduct regular audits.',
    status: 'passed_senate',
    introduced_date: '2023-05-02',
    last_action_date: '2024-07-30',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R. 7521',
    title: 'Protecting Americans from Foreign Adversary Controlled Applications Act',
    summary: 'Requires ByteDance to divest TikTok within 270 days or face a ban in U.S. app stores, citing national security concerns over Chinese government data access.',
    status: 'signed_into_law',
    introduced_date: '2024-03-05',
    last_action_date: '2024-04-24',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S. 3853',
    title: 'Bipartisan Border Security and Immigration Reform Act',
    summary: 'Bipartisan border deal providing emergency authority to close the border at high crossing levels, expediting asylum processing, and increasing immigration judge funding.',
    status: 'failed',
    introduced_date: '2024-02-04',
    last_action_date: '2024-02-07',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R. 8070',
    title: 'Servicemember Quality of Life Improvement and National Defense Authorization Act for FY2025',
    summary: 'Authorizes $895 billion in defense spending with the largest military pay raise in decades, housing improvements, and expanded childcare for military families.',
    status: 'signed_into_law',
    introduced_date: '2024-04-19',
    last_action_date: '2024-12-23',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S. 2073',
    title: 'PRESS Act',
    summary: 'Protects journalists from being compelled to reveal confidential sources in federal proceedings, establishing a federal media shield law.',
    status: 'passed_senate',
    introduced_date: '2023-06-21',
    last_action_date: '2024-01-18',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R. 6090',
    title: 'Antisemitism Awareness Act of 2023',
    summary: 'Requires the Department of Education to use the IHRA definition of antisemitism when investigating discrimination complaints under Title VI.',
    status: 'passed_house',
    introduced_date: '2023-10-26',
    last_action_date: '2024-05-01',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R. 1163',
    title: 'HALT Fentanyl Act',
    summary: 'Permanently classifies fentanyl-related substances as Schedule I controlled substances and increases penalties for trafficking synthetic opioids.',
    status: 'passed_house',
    introduced_date: '2023-02-21',
    last_action_date: '2023-05-10',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R. 5376',
    title: 'Tax Relief for American Families and Workers Act of 2024',
    summary: 'Expands the child tax credit, extends business tax deductions, and increases the low-income housing tax credit with bipartisan support.',
    status: 'passed_house',
    introduced_date: '2024-01-17',
    last_action_date: '2024-01-31',
    congress_session: '118th',
    lean: 'B',
  },
  // --- 119th Congress (2025-2026) ---
  {
    number: 'H.R. 1',
    title: 'One Big Beautiful Bill Act',
    summary: 'Sweeping reconciliation package combining tax cuts extension, border security funding, energy deregulation, and defense spending in a single legislative vehicle.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-05-22',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S. 14',
    title: 'Laken Riley Act',
    summary: 'Requires ICE to detain undocumented immigrants charged with theft or violent crimes and allows state attorneys general to sue the federal government over immigration enforcement.',
    status: 'signed_into_law',
    introduced_date: '2025-01-08',
    last_action_date: '2025-01-29',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S. 328',
    title: 'TAKE IT DOWN Act',
    summary: 'Criminalizes the non-consensual publication of intimate images including AI-generated deepfakes and requires platforms to remove such content within 48 hours.',
    status: 'signed_into_law',
    introduced_date: '2025-01-30',
    last_action_date: '2025-05-19',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R. 891',
    title: 'SAVE Act',
    summary: 'Requires proof of citizenship to register to vote in federal elections, mandating documentary proof such as a passport or birth certificate.',
    status: 'passed_house',
    introduced_date: '2025-02-04',
    last_action_date: '2025-06-04',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S. 112',
    title: 'Artificial Intelligence Research and Innovation Act of 2025',
    summary: 'Establishes a national AI research program, creates safety testing requirements for high-risk AI systems, and funds AI workforce development.',
    status: 'in_committee',
    introduced_date: '2025-02-14',
    last_action_date: '2025-04-10',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R. 2100',
    title: 'American Energy Independence Act of 2025',
    summary: 'Expedites permitting for oil, gas, and LNG exports, opens additional federal lands for drilling, and rolls back methane emission regulations.',
    status: 'passed_house',
    introduced_date: '2025-03-15',
    last_action_date: '2025-07-22',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S. 445',
    title: 'Prescription Drug Affordability Act of 2025',
    summary: 'Expands Medicare drug price negotiation to 100 additional drugs, caps insulin at $35 for all insured Americans, and allows drug importation from Canada.',
    status: 'in_committee',
    introduced_date: '2025-03-01',
    last_action_date: '2025-06-15',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R. 3200',
    title: 'Parents Bill of Rights Expansion Act',
    summary: 'Requires school transparency on curricula, expands parental notification requirements, and restricts certain health services in schools without parental consent.',
    status: 'passed_house',
    introduced_date: '2025-05-05',
    last_action_date: '2025-09-18',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S. 600',
    title: 'Climate Resilience and Clean Energy Act of 2025',
    summary: 'Invests in climate adaptation infrastructure, extends clean energy tax credits, and sets new emissions targets for power plants by 2035.',
    status: 'in_committee',
    introduced_date: '2025-04-22',
    last_action_date: '2025-08-30',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R. 4010',
    title: 'Law Enforcement Support and Community Safety Act',
    summary: 'Provides $10 billion in grants for state and local police departments, funds officer recruitment, and establishes a national use-of-force database.',
    status: 'in_committee',
    introduced_date: '2025-06-10',
    last_action_date: '2025-10-01',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S. 820',
    title: 'Affordable Housing Investment Act of 2026',
    summary: 'Creates a $50 billion affordable housing trust fund, expands the Low-Income Housing Tax Credit, and provides first-time homebuyer down payment assistance.',
    status: 'in_committee',
    introduced_date: '2026-01-15',
    last_action_date: '2026-03-10',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R. 5500',
    title: 'Social Security Stabilization Act of 2026',
    summary: 'Raises the payroll tax cap to $250,000, adjusts benefit calculations for future retirees, and extends the Social Security trust fund solvency by 30 years.',
    status: 'in_committee',
    introduced_date: '2026-02-01',
    last_action_date: '2026-03-15',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'S. 950',
    title: 'Second Amendment Preservation Act of 2026',
    summary: 'Prohibits federal agencies from enforcing any executive action that restricts lawful firearm ownership and preempts state red flag laws with federal standards.',
    status: 'in_committee',
    introduced_date: '2026-02-10',
    last_action_date: '2026-03-05',
    congress_session: '119th',
    lean: 'R',
  },
];

// ---------------------------------------------------------------------------
// Crossover / moderate politician slugs (vote against party more often)
// ---------------------------------------------------------------------------
const MODERATE_REPUBLICANS = new Set([
  'susan-collins',
  'lisa-murkowski',
  'mitt-romney',
  'bill-cassidy',
  'john-cornyn',
  'todd-young',
  'thom-tillis',
  'rob-portman',
]);

const MODERATE_DEMOCRATS = new Set([
  'joe-manchin',
  'kyrsten-sinema',
  'jon-tester',
  'mark-kelly',
  'john-fetterman',
  'jared-golden',
]);

// ---------------------------------------------------------------------------
// Helper: weighted random vote based on party alignment
// ---------------------------------------------------------------------------
function chooseVote(politicianParty, billLean, slug) {
  // Is this politician a known moderate / crossover voter?
  const isModerateDem = MODERATE_DEMOCRATS.has(slug);
  const isModerateRep = MODERATE_REPUBLICANS.has(slug);
  const isModerate = isModerateDem || isModerateRep;

  // Base probability of voting yea
  let yeaProb;

  if (billLean === 'B') {
    // Bipartisan: most people vote yea
    yeaProb = 0.82;
    if (isModerate) yeaProb = 0.90;
  } else if (
    (billLean === 'D' && politicianParty === 'democrat') ||
    (billLean === 'R' && politicianParty === 'republican')
  ) {
    // Aligned: party supports this bill
    yeaProb = 0.92;
    if (isModerate) yeaProb = 0.78; // moderates break away sometimes even on own party bills
  } else if (
    (billLean === 'D' && politicianParty === 'republican') ||
    (billLean === 'R' && politicianParty === 'democrat')
  ) {
    // Opposed: other party's bill
    yeaProb = 0.08;
    if (isModerate) yeaProb = 0.30; // moderates cross over more
  } else {
    // Independents
    if (billLean === 'D') yeaProb = 0.75; // independents lean D
    else if (billLean === 'R') yeaProb = 0.25;
    else yeaProb = 0.70;
  }

  const r = Math.random();
  if (r < 0.03) return 'not_voting'; // small chance anyone misses a vote
  if (r < 0.05) return 'abstain';    // rare abstention
  return Math.random() < yeaProb ? 'yea' : 'nay';
}

// ---------------------------------------------------------------------------
// Pick a random subset of n items from an array
// ---------------------------------------------------------------------------
function sampleArray(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
  console.log('=== Loading Bills & Voting Records ===\n');

  // ------------------------------------------------------------------
  // Step 1: Insert bills, collect returned IDs
  // ------------------------------------------------------------------
  const billRows = BILLS.map(({ lean, ...rest }) => rest);
  const { data: insertedBills, error: billErr } = await c
    .from('bills')
    .upsert(billRows, { onConflict: 'number' })
    .select('id, number, title');

  if (billErr) {
    // If upsert on number fails (no unique constraint), fall back to insert
    console.warn('Upsert failed, trying plain insert:', billErr.message);
    const { data: inserted, error: insertErr } = await c
      .from('bills')
      .insert(billRows)
      .select('id, number, title');
    if (insertErr) {
      console.error('Failed to insert bills:', insertErr.message);
      process.exit(1);
    }
    console.log(`Inserted ${inserted.length} bills (insert)`);
    return generateVotes(inserted);
  }

  console.log(`Inserted/upserted ${insertedBills.length} bills`);
  await generateVotes(insertedBills);
}

async function generateVotes(insertedBills) {
  // Build a lookup from bill number to id + metadata
  const billMap = {};
  for (const b of insertedBills) {
    billMap[b.number] = b;
  }

  // ------------------------------------------------------------------
  // Step 2: Fetch all politicians from the DB
  // ------------------------------------------------------------------
  const { data: politicians, error: polErr } = await c
    .from('politicians')
    .select('id, name, slug, party, chamber');

  if (polErr) {
    console.error('Failed to fetch politicians:', polErr.message);
    process.exit(1);
  }

  console.log(`Fetched ${politicians.length} politicians from DB`);

  // Separate senators, house members, and others
  const senators = politicians.filter((p) => p.chamber === 'senate');
  const houseMembers = politicians.filter((p) => p.chamber === 'house');
  const allFederal = [...senators, ...houseMembers];

  console.log(`  Senators: ${senators.length}, House members: ${houseMembers.length}`);

  if (allFederal.length === 0) {
    console.error('No federal legislators found. Are politicians seeded?');
    process.exit(1);
  }

  // ------------------------------------------------------------------
  // Step 3: Generate voting records
  // ------------------------------------------------------------------
  const votingRecords = [];

  for (const bill of BILLS) {
    const dbBill = billMap[bill.number];
    if (!dbBill) continue;

    // For Senate bills, prefer senators; for House bills, prefer house members
    // But include some crossover since bills move between chambers
    let voterPool;
    const isSenate = bill.number.startsWith('S.');
    if (isSenate) {
      // Mostly senators + a few house members
      const senatorSample = sampleArray(senators, Math.min(senators.length, 45));
      const houseSample = sampleArray(houseMembers, Math.min(houseMembers.length, 8));
      voterPool = [...senatorSample, ...houseSample];
    } else {
      // Mostly house members + a few senators
      const houseSample = sampleArray(houseMembers, Math.min(houseMembers.length, 40));
      const senatorSample = sampleArray(senators, Math.min(senators.length, 10));
      voterPool = [...houseSample, ...senatorSample];
    }

    // Ensure we have 30-50 voters
    const voterCount = 30 + Math.floor(Math.random() * 21); // 30-50
    const voters = sampleArray(voterPool, voterCount);

    for (const pol of voters) {
      const vote = chooseVote(pol.party, bill.lean, pol.slug);

      votingRecords.push({
        politician_id: pol.id,
        bill_id: dbBill.id,
        bill_name: bill.title,
        bill_number: bill.number,
        vote,
        vote_date: bill.last_action_date,
        session: bill.congress_session,
      });
    }
  }

  console.log(`\nGenerated ${votingRecords.length} voting records`);

  // ------------------------------------------------------------------
  // Step 4: Insert voting records in batches
  // ------------------------------------------------------------------
  const BATCH = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < votingRecords.length; i += BATCH) {
    const batch = votingRecords.slice(i, i + BATCH);
    const { error } = await c.from('voting_records').insert(batch);
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      console.log(
        `Batch ${Math.floor(i / BATCH) + 1}: ${inserted}/${votingRecords.length} inserted`
      );
    }
  }

  // ------------------------------------------------------------------
  // Step 5: Print summary stats
  // ------------------------------------------------------------------
  console.log('\n=== Summary ===');
  console.log(`Bills inserted:          ${insertedBills.length}`);
  console.log(`Voting records inserted: ${inserted}`);
  console.log(`Batch errors:            ${errors}`);

  // Vote breakdown
  const counts = { yea: 0, nay: 0, abstain: 0, not_voting: 0 };
  for (const vr of votingRecords) counts[vr.vote]++;
  console.log(`\nVote breakdown:`);
  console.log(`  Yea:        ${counts.yea} (${((counts.yea / votingRecords.length) * 100).toFixed(1)}%)`);
  console.log(`  Nay:        ${counts.nay} (${((counts.nay / votingRecords.length) * 100).toFixed(1)}%)`);
  console.log(`  Abstain:    ${counts.abstain} (${((counts.abstain / votingRecords.length) * 100).toFixed(1)}%)`);
  console.log(`  Not voting: ${counts.not_voting} (${((counts.not_voting / votingRecords.length) * 100).toFixed(1)}%)`);

  // Verify DB totals
  const { count: billCount } = await c
    .from('bills')
    .select('*', { count: 'exact', head: true });
  const { count: voteCount } = await c
    .from('voting_records')
    .select('*', { count: 'exact', head: true });
  console.log(`\nDB totals — bills: ${billCount}, voting_records: ${voteCount}`);
}

run().catch(console.error);

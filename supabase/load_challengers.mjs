import { createClient } from '@supabase/supabase-js';

const c = createClient(
  'https://jzxgkvwbhdagqwvisxkt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGdrdndiaGRhZ3F3dmlzeGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1MjI4MiwiZXhwIjoyMDg5NjI4MjgyfQ.6trLdjlsSeCmQvVbkh1MkK-TGf5fpP_MHTJQ3BbyjcY'
);

// Swing states that get 2 challengers (opposing party + independent)
const SWING_STATES = new Set(['AZ', 'GA', 'NV', 'PA', 'WI', 'MI', 'NC', 'OH']);

// Pool of realistic-sounding names (fictional)
const NAMES = {
  democrat: [
    'Sarah Mitchell', 'David Hernandez', 'Maria Chen', 'Robert Whitfield',
    'Angela Torres', 'Marcus Baldwin', 'Patricia Nakamura', 'James Calloway',
    'Danielle Reeves', 'Brian Kowalski', 'Lisa Fontaine', 'Christopher Okafor',
    'Rebecca Moreno', 'Anthony DiMaggio', 'Kathleen Brennan', 'Steven Park',
    'Nicole Ashford', 'Daniel Gutierrez', 'Sandra Petrov', 'Michael Durand',
    'Rachel Abrams', 'Kevin Washington', 'Diane Lam', 'Thomas Hargrove',
    'Caroline Jensen', 'Raymond Flores', 'Janet Osei', 'William Tanaka',
    'Laura Fitzpatrick', 'Gregory Salazar', 'Helen Volkov', 'Jason Mercer',
    'Stephanie Nguyen', 'Richard Caldwell', 'Megan Blackwell', 'Andrew Ramos',
    'Victoria Sato', 'Philip Donnelly', 'Christine Amari', 'Derek Swanson',
    'Alicia Dumont', 'Nathan Begay', 'Pamela Lindstrom', 'Carlos Ramirez',
    'Tanya Stafford', 'Benjamin Cho', 'Evelyn Montoya', 'Douglas Winslow',
    'Monique LeBlanc', 'Tyler Hashimoto', 'Joanne Prescott', 'Samuel Ortega',
    'Bridget Callahan', 'Leonard Fong', 'Natalie Serrano', 'Howard Pennington',
    'Cynthia Adesanya', 'Oscar Levine', 'Denise Kuznetsov', 'Paul Weatherford',
    'Adrienne Costello', 'Franklin Zheng', 'Loretta Buchanan', 'Martin Espinoza',
    'Sylvia Ikeda', 'Russell Keenan', 'Gloria Santiago', 'Donald Albright',
    'Theresa Novak', 'Edwin Masterson', 'Rosa Delgado', 'Vincent Gallagher',
  ],
  republican: [
    'James Crawford', 'Katherine Brewer', 'Robert Halverson', 'Nancy Kirkpatrick',
    'William Stratton', 'Elizabeth Garrett', 'Richard Pendleton', 'Susan Aldridge',
    'Thomas Waverly', 'Margaret Holcomb', 'Charles Beaumont', 'Barbara Langford',
    'Kenneth Ashworth', 'Dorothy Prescott', 'George Fairbanks', 'Carol Wentworth',
    'Frank Thornberry', 'Judith Kensington', 'Roy McAllister', 'Sharon Caldwell',
    'Donald Whitmore', 'Patricia Edgeworth', 'Ronald Blackstone', 'Deborah Kingsley',
    'Gary Sutherland', 'Carolyn Merriweather', 'Lawrence Redmond', 'Virginia Davenport',
    'Harold Pemberton', 'Diane Carmichael', 'Wayne Northcutt', 'Janet Stonebridge',
    'Gerald Harrington', 'Linda Broadwell', 'Raymond Stockdale', 'Karen Whitehurst',
    'Eugene Bancroft', 'Donna Chesterfield', 'Dean Mooreland', 'Teresa Rutherford',
    'Stanley Carrington', 'Rose Pemberton', 'Mitchell Galway', 'Valerie Ashford',
    'Howard Drummond', 'Marilyn Foxworth', 'Warren Castleberry', 'Cynthia Townsend',
    'Craig Mansfield', 'Rebecca Stanhope', 'Dale Weatherby', 'Joyce Eastwood',
    'Russell Lockhart', 'Pamela Fairchild', 'Lloyd Grantham', 'Marlene Courtland',
    'Keith Summerfield', 'Lorraine Whitfield', 'Vernon Ashcroft', 'Bonnie Wainwright',
    'Stewart Mayfield', 'Phyllis Kensington', 'Allan Holbrooke', 'Elaine Braxton',
    'Grant Woodbury', 'Shirley Hastings', 'Nelson Wakefield', 'Beverly Ellsworth',
    'Wendell Stratford', 'Catherine Greenfield', 'Calvin Thornton', 'Jeanne Blackwell',
  ],
  independent: [
    'Alex Whitaker', 'Jordan Bellamy', 'Morgan Fairchild', 'Casey Underwood',
    'Taylor Brennan', 'Riley Ashworth', 'Quinn Delaney', 'Avery Callahan',
    'Dakota Merritt', 'Sage Holbrook', 'Cameron Prescott', 'Drew Langford',
    'Parker Livingston', 'Hayden Carmichael', 'Reese Thornton', 'Kendall Waverly',
    'Finley Davenport', 'Blake Redmond', 'Shannon Kingsley', 'Robin Aldridge',
    'Jamie Hargrove', 'Devon Stonehill', 'Aubrey Fairfield', 'Shawn Ellsworth',
    'Emerson Lockwood', 'Lee Pemberton', 'Rowan Blackstone', 'Lane Whitmore',
    'Dallas Carmichael', 'Skyler Montague', 'Rory Pendleton', 'Jules Beaumont',
    'Dominique Ashfield', 'Noel Sutherland', 'Tatum Kensington', 'River Galway',
    'Phoenix Winslow', 'Marlowe Edgeworth', 'Sterling Pemberton', 'Harper Redfield',
  ],
};

// Bios for challengers
const BIOS = {
  democrat: [
    'Former state attorney general challenging the incumbent in a competitive race. Focused on protecting voting rights and expanding healthcare access.',
    'Business leader and community organizer running on an economic justice platform. Advocates for raising the minimum wage and affordable housing.',
    'State legislator with a track record of bipartisan cooperation. Campaigning on education reform and infrastructure investment.',
    'Former mayor who turned around a struggling local economy. Running on a platform of job creation and clean energy investment.',
    'Civil rights attorney and first-time candidate focused on criminal justice reform and protecting civil liberties.',
    'Veteran educator and school board member running on expanding public education funding and student loan relief.',
    'Former nonprofit executive championing affordable healthcare and lowering prescription drug costs.',
    'Environmental scientist running on a climate action platform. Advocates for clean energy jobs and sustainable development.',
    'Small business owner and city council member focused on supporting working families and expanding paid family leave.',
    'Public health official who gained recognition during the pandemic. Running on healthcare expansion and pandemic preparedness.',
    'Labor union leader campaigning on workers\' rights, fair wages, and rebuilding the middle class.',
    'Former state treasurer with expertise in fiscal policy. Running on economic growth and responsible government spending.',
    'Tech entrepreneur turned public servant. Focused on bridging the digital divide and expanding broadband access.',
    'Former Peace Corps volunteer and diplomat. Campaigning on strengthening international alliances and smart foreign policy.',
    'Community health center director running on expanding Medicaid and reducing health disparities in underserved areas.',
    'Former state senator with a focus on transportation infrastructure and rural economic development.',
    'Immigration attorney and first-generation American running on comprehensive immigration reform.',
    'Retired military officer focused on veterans\' issues, national security, and bipartisan problem-solving.',
    'Consumer protection advocate campaigning against corporate monopolies and for stronger antitrust enforcement.',
    'Former deputy secretary of education running on universal pre-K and teacher pay increases.',
  ],
  republican: [
    'Former state attorney general with a tough-on-crime record. Running on border security and tax cuts for working families.',
    'Business executive and job creator campaigning on cutting regulations and unleashing economic growth.',
    'Retired military general focused on national defense, border security, and supporting law enforcement.',
    'Former state legislator with a fiscally conservative record. Running on reducing government spending and lowering taxes.',
    'Small business owner and rancher running on protecting Second Amendment rights and energy independence.',
    'Former U.S. Attorney championing law and order, border security, and fighting the opioid crisis.',
    'Tech industry veteran campaigning on innovation, deregulation, and American competitiveness.',
    'Former state treasurer focused on balanced budgets, pension reform, and fiscal responsibility.',
    'Physician and healthcare policy expert running on market-based healthcare reform and lowering costs.',
    'Former county sheriff with a strong public safety record. Campaigning on backing the blue and securing the border.',
    'Energy industry executive running on American energy dominance and opposing costly environmental regulations.',
    'Military veteran and Purple Heart recipient focused on veterans\' affairs and a strong national defense.',
    'Former school board president championing parental rights in education and school choice.',
    'Real estate developer and philanthropist running on housing affordability through deregulation.',
    'Agricultural leader and farmer running on supporting rural communities and reducing federal overreach.',
    'Former state commerce secretary focused on bringing manufacturing jobs back and supporting trade policies.',
    'Constitutional lawyer running on protecting individual liberties and limiting federal government power.',
    'Former ambassador focused on America First foreign policy and countering China\' growing influence.',
    'Manufacturing executive campaigning on reshoring American jobs and standing up for blue-collar workers.',
    'Former state insurance commissioner running on lowering healthcare costs through competition and transparency.',
  ],
  independent: [
    'Centrist former business executive running as an independent. Advocates for pragmatic solutions over partisan politics.',
    'Former city mayor who left the two-party system. Campaigning on fiscal responsibility and social moderation.',
    'Political outsider and community advocate focused on government transparency and ending partisan gridlock.',
    'Retired professor and policy expert running on evidence-based governance and restoring trust in institutions.',
    'Former nonprofit leader running on common-sense reforms. Rejects the extremes of both major parties.',
    'Veteran and former state official running as an independent voice for working families and fiscal sanity.',
    'Entrepreneur and civic leader campaigning on term limits, campaign finance reform, and government accountability.',
    'Former journalist and public interest advocate running on transparency, ethics reform, and bipartisan cooperation.',
    'Environmental business leader promoting market-based climate solutions and sustainable economic growth.',
    'Healthcare executive running on bipartisan healthcare reform and reducing costs without expanding government control.',
  ],
};

// Deterministic "random" using a simple hash
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

async function run() {
  // 1. Fetch all races with their current candidates
  const { data: races, error: racesErr } = await c
    .from('races')
    .select('id, slug, state, name, chamber, description')
    .order('state');

  if (racesErr) {
    console.error('Failed to fetch races:', racesErr.message);
    return;
  }

  const { data: existingCandidates, error: candErr } = await c
    .from('candidates')
    .select('id, race_id, name, party, is_incumbent');

  if (candErr) {
    console.error('Failed to fetch candidates:', candErr.message);
    return;
  }

  console.log(`Found ${races.length} races and ${existingCandidates.length} existing candidates`);

  // Build a map of race_id -> candidates
  const candidatesByRace = {};
  for (const cand of existingCandidates) {
    if (!candidatesByRace[cand.race_id]) candidatesByRace[cand.race_id] = [];
    candidatesByRace[cand.race_id].push(cand);
  }

  // Track used name indices per party to avoid duplicates across races
  const usedNameIndices = { democrat: new Set(), republican: new Set(), independent: new Set() };

  function pickName(party, seed) {
    const pool = NAMES[party];
    let idx = simpleHash(seed) % pool.length;
    // Find an unused name
    let attempts = 0;
    while (usedNameIndices[party].has(idx) && attempts < pool.length) {
      idx = (idx + 1) % pool.length;
      attempts++;
    }
    usedNameIndices[party].add(idx);
    return pool[idx];
  }

  function pickBio(party, seed) {
    const pool = BIOS[party];
    const idx = simpleHash(seed) % pool.length;
    return pool[idx];
  }

  const newCandidates = [];

  for (const race of races) {
    const raceCandidates = candidatesByRace[race.id] || [];
    const incumbents = raceCandidates.filter(c => c.is_incumbent);
    const nonIncumbents = raceCandidates.filter(c => !c.is_incumbent);

    // Determine the incumbent's party from existing candidates
    let incumbentParty = null;
    if (incumbents.length > 0) {
      incumbentParty = incumbents[0].party;
    } else {
      // Try to infer from description
      if (race.description && race.description.includes('(R)')) incumbentParty = 'republican';
      else if (race.description && race.description.includes('(D)')) incumbentParty = 'democrat';
      else incumbentParty = 'republican'; // fallback
    }

    const opposingParty = incumbentParty === 'democrat' ? 'republican' : 'democrat';
    const isSwing = SWING_STATES.has(race.state);

    // Check if we already have non-incumbent challengers for this race
    const existingChallengers = nonIncumbents.filter(c => c.name !== 'Open Seat');
    if (existingChallengers.length > 0) {
      console.log(`  Skipping ${race.slug} — already has ${existingChallengers.length} challenger(s)`);
      continue;
    }

    // Add main opposing party challenger
    const name1 = pickName(opposingParty, race.slug + '-challenger-1');
    const bio1 = pickBio(opposingParty, race.slug + '-bio-1');
    newCandidates.push({
      race_id: race.id,
      name: name1,
      party: opposingParty,
      is_incumbent: false,
      status: 'running',
      bio: bio1,
    });

    // Add independent challenger for swing states
    if (isSwing) {
      const name2 = pickName('independent', race.slug + '-challenger-2');
      const bio2 = pickBio('independent', race.slug + '-bio-2');
      newCandidates.push({
        race_id: race.id,
        name: name2,
        party: 'independent',
        is_incumbent: false,
        status: 'running',
        bio: bio2,
      });
    }
  }

  console.log(`\nPrepared ${newCandidates.length} new challengers to insert`);

  if (newCandidates.length === 0) {
    console.log('Nothing to insert.');
    return;
  }

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < newCandidates.length; i += BATCH) {
    const batch = newCandidates.slice(i, i + BATCH);
    const { data, error } = await c.from('candidates').insert(batch).select('id');
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors++;
    } else {
      inserted += data.length;
      console.log(`Batch ${Math.floor(i / BATCH) + 1}: inserted ${data.length} (total: ${inserted}/${newCandidates.length})`);
    }
  }

  console.log(`\nDone! Inserted ${inserted} challengers (${errors} batch errors)`);

  // Verify totals
  const { count } = await c.from('candidates').select('*', { count: 'exact', head: true });
  console.log(`Total candidates in DB: ${count}`);

  // Show breakdown
  const { data: breakdown } = await c.from('candidates').select('is_incumbent, party');
  const summary = {};
  for (const row of breakdown) {
    const key = `${row.is_incumbent ? 'incumbent' : 'challenger'} (${row.party})`;
    summary[key] = (summary[key] || 0) + 1;
  }
  console.log('\nBreakdown:');
  for (const [key, val] of Object.entries(summary).sort()) {
    console.log(`  ${key}: ${val}`);
  }
}

run().catch(console.error);

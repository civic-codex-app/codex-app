// ============================================================
// Seed: Candidates for all 435 House races (2026 Midterms)
// Run with:
//   export $(grep -v '^#' .env.local | xargs)
//   node supabase/seed_house_candidates.mjs
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
// Swing states that get an extra independent challenger
// ============================================================
const SWING_STATES = new Set(['AZ', 'GA', 'NV', 'PA', 'WI', 'MI', 'NC', 'OH']);

// ============================================================
// State code -> full name mapping
// ============================================================
const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

// ============================================================
// District ordinal suffix helper
// ============================================================
function ordinal(n) {
  const num = parseInt(n, 10);
  if (num === 0) return 'At-Large';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ============================================================
// Deterministic hash for reproducible "random" picks
// ============================================================
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ============================================================
// Name pools (fictional, diverse)
// ============================================================
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
    'Yolanda Baptiste', 'Peter Johansson', 'Iris Maalouf', 'Kenneth Takahashi',
    'Felicia Okonkwo', 'George Papageorgiou', 'Bianca Reyes', 'Arthur Lindqvist',
    'Tamara Rousseau', 'Jerome Fitzgerald', 'Hana Svensson', 'Malcolm Bautista',
    'Priya Chakrabarti', 'Sean Doyle', 'Xiomara Velasquez', 'Walter Kempf',
    'Anita Mazur', 'Oliver Sandoval', 'Camille DuBois', 'Terrence Achebe',
    'Mei-Ling Huang', 'Frederick Bergman', 'Constance Abubakar', 'Rafael Cordero',
    'Sonja Nilsen', 'Darnell Hawkins', 'Elena Petrova', 'Isaac Weissman',
    'Lucinda Ferreira', 'Hugo Marquez', 'Naomi Saito', 'Clarence Whitfield',
    'Amara Osei-Bonsu', 'Stefan Kovalenko', 'Yvette Charlemagne', 'Desmond Farrell',
    'Lakshmi Reddy', 'Patrick Beauregard', 'Fatima Al-Hassan', 'Ernest Kolb',
    'Jasmine Toussaint', 'Byron Matsumoto', 'Celeste Arroyo', 'Randall Erikson',
    'Keisha Mbeki', 'Phillip Castellano', 'Ingrid Larsson', 'Maurice Baptiste',
    'Alma Gutierrez-Lopez', 'Theodore Nakashima', 'Geneva Oduya', 'Curtis Blanchard',
    'Renata Vasquez', 'Dwight Abernathy', 'Sonia Kristiansen', 'Lionel DaCosta',
    'Claudia Mizrahi', 'Reginald Okoro', 'Valentina Robles', 'Graham Sinclair',
    'Nadia Khoury', 'Wesley Taniguchi', 'Carmen Delacroix', 'Donovan Acheson',
    'Aisha Mensah', 'Elliott Johansson', 'Marisol Figueroa', 'Cedric Beaumont',
    'Lena Sorensen', 'Troy Washington', 'Gabriella Esposito', 'Brendan Kowalczyk',
    'Simone Baptiste', 'Marshall Hayashi', 'Paloma Cisneros', 'Clifford Engstrom',
    'Tiffany Anyanwu', 'Roland Pettersson', 'Esperanza Morales', 'Anton Volkov',
    'Jocelyn Deveraux', 'Lamar Hutchinson', 'Adeline Fontaine', 'Norbert Schumann',
    'Kiara Bello', 'Gavin McPherson', 'Rosario Evangelista', 'Terence Nkrumah',
    'Marguerite Lefevre', 'Jameson Tanaka', 'Solange Beaufort', 'Cornelius Obi',
    'Annalise Bergstrom', 'Roman Castillo', 'Fiona Mwangi', 'Barrett Lindgren',
    'Zara Abdelrahman', 'Spencer Nakamura', 'Giselle Rondeau', 'Kendrick Okafor',
    'Beatrice Lombardi', 'Nelson Fujimoto', 'Dominique Thibault', 'Alvin Nyong\'o',
    'Miriam Steinberg', 'Roderick Abalos', 'Sabine Moreau', 'Carlton Wainwright',
    'Leila Farouk', 'Winston Carrillo', 'Tatiana Sokolov', 'Garrett Onyango',
    'Magdalena Cruz', 'Irving Tannenbaum', 'Colette Beauchamp', 'Demetrius Asante',
    'Astrid Holmgren', 'Xavier Montague', 'Corinne Lefebvre', 'Sherman Ochieng',
    'Noelle Christensen', 'Tyrone McAllister', 'Aurelia Bianchi', 'Gilbert Kawamoto',
    'Esmeralda Suarez', 'Milton Bergmann', 'Josephine Afolabi', 'Cyrus Blackwood',
    'Vivienne Marchand', 'Otis Sekiguchi', 'Bernadette O\'Sullivan', 'Lyle Matsuoka',
    'Francesca DiNapoli', 'Alonzo Kimura', 'Genevieve Bouchard', 'Preston Ogunyemi',
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
    'Randall Whitaker', 'Martha Pennington', 'Bruce Kensington', 'Gloria Ashford',
    'Norman Pembroke', 'Judith Hawthorne', 'Arthur Westfield', 'Constance Aldrich',
    'Clifford Hargrove', 'Evelyn Stonehouse', 'Roger Blakemore', 'Marianne Foxwell',
    'Wesley Thornhill', 'Doris Wentworth', 'Lester Blackburn', 'Florence Pendleton',
    'Gilbert Fairchild', 'Ruth Kingsbury', 'Marshall Alderman', 'Irene Southgate',
    'Victor Chamberlin', 'Agnes Whitfield', 'Carlton Davenport', 'Pauline Ashworth',
    'Horace Pemberton', 'Mildred Stockbridge', 'Edmund Hartwell', 'Gladys Beaufort',
    'Chester Broadhurst', 'Harriet Kensington', 'Roscoe Wakefield', 'Beatrice Langley',
    'Percival Whitmore', 'Marjorie Pemberton', 'Alton Fairfax', 'Lillian Courtland',
    'Orville Stonebridge', 'Eleanor Beaumont', 'Wilbur Drummond', 'Myrtle Harrington',
    'Clarence Ashbury', 'Geraldine Merrifield', 'Elmer Thornberry', 'Virginia Foxworth',
    'Hubert Castleberry', 'Esther Northcutt', 'Reginald Weatherby', 'Hazel Stockdale',
    'Morton Broadwell', 'Bernice Carmichael', 'Bernard Merriweather', 'Lucille Waverly',
    'Sheldon Fairmont', 'Mabel Pemberton', 'Dwight Ashford', 'Edna Hargrove',
    'Bradford Kingsley', 'Winifred Blakemore', 'Milton Stratfield', 'Josephine Davenport',
    'Archibald Southgate', 'Henrietta Beaumont', 'Franklin Drummore', 'Rosamond Ashworth',
    'Thaddeus Broadhurst', 'Millicent Thornhill', 'Cornelius Foxwell', 'Agatha Wentworth',
    'Barton Eastfield', 'Prudence Stockbridge', 'Leopold Fairchild', 'Cordelia Harrington',
    'Montague Whitfield', 'Theodora Pembroke', 'Prescott Aldrich', 'Genevieve Langford',
    'Weston Chamberlin', 'Adelaide Beaufort', 'Stanford Merrifield', 'Rosalind Kensington',
    'Thornton Hartwell', 'Clarissa Pemberton', 'Emerson Wakefield', 'Penelope Courtland',
    'Augustus Ashbury', 'Vivian Beaumont', 'Sinclair Drummond', 'Constance Foxworth',
    'Hamilton Broadwell', 'Minerva Thornberry', 'Bartholomew Stratton', 'Henriette Fairfax',
    'Remington Castleberry', 'Cordelia Northcutt', 'Sterling Weatherby', 'Florence Stockdale',
    'Kingston Ashford', 'Loretta Pemberton', 'Davenport Merriweather', 'Evangeline Waverly',
    'Whitfield Hargrove', 'Seraphina Langley', 'Aldrich Beaumont', 'Clementine Fairchild',
    'Pemberton Thornhill', 'Arabella Kensington', 'Beaumont Broadhurst', 'Josephina Courtland',
    'Stratford Carmichael', 'Rosemary Pembroke', 'Wakefield Drummore', 'Gwendolyn Southgate',
    'Castleberry Ashworth', 'Marguerite Stockbridge', 'Drummond Fairmont', 'Priscilla Harrington',
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
    'Addison Weatherby', 'Sage Drummond', 'Rowan Foxworth', 'Ellis Thornberry',
    'Bailey Northcutt', 'Peyton Stockdale', 'Reese Broadwell', 'Skyler Fairchild',
    'Finley Courtland', 'Avery Pemberton', 'Harper Ashworth', 'Cameron Langley',
    'Dakota Beaumont', 'Quinn Merrifield', 'Jordan Whitfield', 'Riley Harrington',
    'Taylor Wakefield', 'Morgan Castleberry', 'Casey Southgate', 'Drew Kensington',
  ],
};

// ============================================================
// Bio templates for challengers
// ============================================================
const CHALLENGER_BIOS = {
  democrat: [
    'Former state attorney general challenging the incumbent. Focused on protecting voting rights and expanding healthcare access.',
    'Business leader and community organizer running on an economic justice platform. Advocates for raising the minimum wage.',
    'State legislator with a track record of bipartisan cooperation. Campaigning on education reform and infrastructure.',
    'Former mayor who turned around a struggling local economy. Running on job creation and clean energy investment.',
    'Civil rights attorney and first-time candidate focused on criminal justice reform and protecting civil liberties.',
    'Veteran educator and school board member running on expanding public education funding and student loan relief.',
    'Former nonprofit executive championing affordable healthcare and lowering prescription drug costs.',
    'Environmental scientist running on a climate action platform. Advocates for clean energy jobs and sustainable development.',
    'Small business owner and city council member focused on supporting working families and paid family leave.',
    'Public health official who gained recognition during the pandemic. Running on healthcare expansion.',
    'Labor union leader campaigning on workers\' rights, fair wages, and rebuilding the middle class.',
    'Former state treasurer with expertise in fiscal policy. Running on economic growth and responsible spending.',
    'Tech entrepreneur turned public servant. Focused on bridging the digital divide and expanding broadband.',
    'Former Peace Corps volunteer and diplomat. Campaigning on strengthening alliances and smart foreign policy.',
    'Community health center director running on expanding Medicaid and reducing health disparities.',
    'Former state senator with a focus on transportation infrastructure and rural economic development.',
    'Immigration attorney and first-generation American running on comprehensive immigration reform.',
    'Retired military officer focused on veterans\' issues, national security, and bipartisan problem-solving.',
    'Consumer protection advocate campaigning against corporate monopolies and for stronger antitrust enforcement.',
    'Former deputy secretary of education running on universal pre-K and teacher pay increases.',
  ],
  republican: [
    'Former state attorney general with a tough-on-crime record. Running on border security and tax cuts.',
    'Business executive and job creator campaigning on cutting regulations and unleashing economic growth.',
    'Retired military general focused on national defense, border security, and supporting law enforcement.',
    'Former state legislator with a fiscally conservative record. Running on reducing government spending.',
    'Small business owner and rancher running on protecting Second Amendment rights and energy independence.',
    'Former U.S. Attorney championing law and order, border security, and fighting the opioid crisis.',
    'Tech industry veteran campaigning on innovation, deregulation, and American competitiveness.',
    'Former state treasurer focused on balanced budgets, pension reform, and fiscal responsibility.',
    'Physician and healthcare policy expert running on market-based healthcare reform and lowering costs.',
    'Former county sheriff with a strong public safety record. Campaigning on backing the blue.',
    'Energy industry executive running on American energy dominance and opposing costly environmental regulations.',
    'Military veteran and Purple Heart recipient focused on veterans\' affairs and a strong national defense.',
    'Former school board president championing parental rights in education and school choice.',
    'Real estate developer and philanthropist running on housing affordability through deregulation.',
    'Agricultural leader and farmer running on supporting rural communities and reducing federal overreach.',
    'Former state commerce secretary focused on bringing manufacturing jobs back to America.',
    'Constitutional lawyer running on protecting individual liberties and limiting federal government power.',
    'Former ambassador focused on America First foreign policy and countering foreign threats.',
    'Manufacturing executive campaigning on reshoring American jobs and standing up for blue-collar workers.',
    'Former state insurance commissioner running on lowering healthcare costs through competition.',
  ],
  independent: [
    'Centrist former business executive. Advocates for pragmatic solutions over partisan politics.',
    'Former city mayor who left the two-party system. Campaigning on fiscal responsibility and moderation.',
    'Political outsider and community advocate focused on government transparency and ending gridlock.',
    'Retired professor and policy expert running on evidence-based governance and restoring trust.',
    'Former nonprofit leader running on common-sense reforms. Rejects the extremes of both parties.',
    'Veteran and former state official running as an independent voice for working families.',
    'Entrepreneur and civic leader campaigning on term limits, campaign finance reform, and accountability.',
    'Former journalist and public interest advocate running on transparency and ethics reform.',
    'Environmental business leader promoting market-based climate solutions and sustainable growth.',
    'Healthcare executive running on bipartisan healthcare reform and reducing costs.',
  ],
};

// ============================================================
// Helper: paginated fetch (Supabase 1000-row limit)
// ============================================================
async function fetchAll(table, select, filters = {}) {
  const PAGE = 1000;
  let allData = [];
  let from = 0;

  while (true) {
    let query = supabase.from(table).select(select).range(from, from + PAGE - 1);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    allData = allData.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return allData;
}

// ============================================================
// Main
// ============================================================
async function run() {
  console.log('=== Seed House Candidates for 2026 Midterms ===\n');

  // 1. Get the 2026 Midterm Elections election record
  const { data: election, error: elErr } = await supabase
    .from('elections')
    .select('id, name, slug')
    .eq('slug', '2026-midterms')
    .single();

  if (elErr || !election) {
    console.error('Could not find 2026-midterm-elections:', elErr?.message);
    process.exit(1);
  }
  console.log(`Election: ${election.name} (${election.id})`);

  // 2. Get all House races for this election
  const houseRaces = await fetchAll('races', 'id, slug, state, district, name, chamber, description, incumbent_id', {
    election_id: election.id,
    chamber: 'house',
  });
  console.log(`Found ${houseRaces.length} House races`);

  // 3. Get all existing candidates to avoid duplicates
  const existingCandidates = await fetchAll('candidates', 'id, race_id, name, party, is_incumbent, politician_id');
  console.log(`Found ${existingCandidates.length} existing candidates total`);

  // Build race_id -> candidates map
  const candidatesByRace = {};
  for (const cand of existingCandidates) {
    if (!candidatesByRace[cand.race_id]) candidatesByRace[cand.race_id] = [];
    candidatesByRace[cand.race_id].push(cand);
  }

  // 4. Get all House politicians for incumbent matching
  const politicians = await fetchAll('politicians', 'id, name, slug, state, party, image_url, bio, chamber, title');
  console.log(`Found ${politicians.length} politicians in DB`);

  // Build lookup: state -> list of House politicians
  const housePoliticiansByState = {};
  for (const p of politicians) {
    if (p.chamber === 'house') {
      if (!housePoliticiansByState[p.state]) housePoliticiansByState[p.state] = [];
      housePoliticiansByState[p.state].push(p);
    }
  }

  // Try to extract district number from politician bio
  function extractDistrict(bio) {
    if (!bio) return null;
    // Match patterns like "1st congressional district", "2nd congressional district", "At-Large"
    const atLarge = /at[- ]large/i.exec(bio);
    if (atLarge) return '0';
    const match = /(\d+)(?:st|nd|rd|th)\s+congressional/i.exec(bio);
    if (match) return match[1];
    return null;
  }

  // Match a politician to a race by state + district
  function findIncumbentPolitician(race) {
    // If race already has incumbent_id, use that
    if (race.incumbent_id) {
      const pol = politicians.find(p => p.id === race.incumbent_id);
      if (pol) return pol;
    }

    const statePols = housePoliticiansByState[race.state] || [];
    if (statePols.length === 0) return null;

    // At-large states (1 district) — match any House member from that state
    if (!race.district || race.district === '0' || race.district === 'at-large') {
      return statePols[0] || null;
    }

    // Try to match by district from bio
    for (const p of statePols) {
      const bioDistrict = extractDistrict(p.bio);
      if (bioDistrict === race.district) return p;
    }

    // Try matching district from the politician's slug (e.g., "john-smith" won't help, but worth a shot)
    // If only one House member from the state, use them for district 1
    if (statePols.length === 1 && race.district === '1') {
      return statePols[0];
    }

    return null;
  }

  // Track used name indices per party to avoid duplicates
  const usedNameIndices = { democrat: new Set(), republican: new Set(), independent: new Set() };

  function pickName(party, seed) {
    const pool = NAMES[party];
    let idx = simpleHash(seed) % pool.length;
    let attempts = 0;
    while (usedNameIndices[party].has(idx) && attempts < pool.length) {
      idx = (idx + 1) % pool.length;
      attempts++;
    }
    usedNameIndices[party].add(idx);
    return pool[idx];
  }

  function pickBio(party, seed) {
    const pool = CHALLENGER_BIOS[party];
    return pool[simpleHash(seed) % pool.length];
  }

  function avatarUrl(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff&bold=true`;
  }

  // ============================================================
  // Build candidate records
  // ============================================================
  const newCandidates = [];
  let racesWithNewCandidates = 0;
  let incumbentsLinked = 0;
  let incumbentsUnlinked = 0;

  for (const race of houseRaces) {
    const existing = candidatesByRace[race.id] || [];

    // Skip if race already has candidates
    if (existing.length > 0) {
      continue;
    }

    racesWithNewCandidates++;
    const stateName = STATE_NAMES[race.state] || race.state;
    const districtLabel = race.district === '0' || race.district === 'at-large'
      ? 'At-Large'
      : `${ordinal(race.district)}`;

    // --- Incumbent candidate ---
    const incumbentPol = findIncumbentPolitician(race);
    let incumbentParty = 'republican'; // fallback

    if (incumbentPol) {
      incumbentsLinked++;
      incumbentParty = incumbentPol.party;
      newCandidates.push({
        race_id: race.id,
        politician_id: incumbentPol.id,
        name: incumbentPol.name,
        party: incumbentPol.party,
        is_incumbent: true,
        status: 'active',
        website_url: null,
        image_url: incumbentPol.image_url || avatarUrl(incumbentPol.name),
        bio: `Incumbent U.S. Representative for ${stateName}'s ${districtLabel} congressional district.`,
      });
    } else {
      // No politician match — create a placeholder incumbent
      incumbentsUnlinked++;
      // Infer party from race description if available
      if (race.description) {
        if (race.description.includes('(R)') || race.description.toLowerCase().includes('republican')) {
          incumbentParty = 'republican';
        } else if (race.description.includes('(D)') || race.description.toLowerCase().includes('democrat')) {
          incumbentParty = 'democrat';
        }
      }
      // Deterministic party assignment based on race slug when no description hint
      if (!race.description) {
        // Use hash to roughly split 50/50
        incumbentParty = simpleHash(race.slug) % 2 === 0 ? 'republican' : 'democrat';
      }

      const incumbentName = pickName(incumbentParty, race.slug + '-incumbent');
      newCandidates.push({
        race_id: race.id,
        politician_id: null,
        name: incumbentName,
        party: incumbentParty,
        is_incumbent: true,
        status: 'active',
        website_url: null,
        image_url: avatarUrl(incumbentName),
        bio: `Incumbent U.S. Representative for ${stateName}'s ${districtLabel} congressional district.`,
      });
    }

    // --- Main challenger (opposing party) ---
    const opposingParty = incumbentParty === 'democrat' ? 'republican' : 'democrat';
    const challengerName = pickName(opposingParty, race.slug + '-challenger-1');
    const challengerBio = pickBio(opposingParty, race.slug + '-bio-1');
    newCandidates.push({
      race_id: race.id,
      politician_id: null,
      name: challengerName,
      party: opposingParty,
      is_incumbent: false,
      status: 'active',
      website_url: null,
      image_url: avatarUrl(challengerName),
      bio: `Challenger for ${stateName}'s ${districtLabel} congressional district. ${challengerBio}`,
    });

    // --- Independent challenger for swing states ---
    if (SWING_STATES.has(race.state)) {
      const indName = pickName('independent', race.slug + '-challenger-2');
      const indBio = pickBio('independent', race.slug + '-bio-2');
      newCandidates.push({
        race_id: race.id,
        politician_id: null,
        name: indName,
        party: 'independent',
        is_incumbent: false,
        status: 'active',
        website_url: null,
        image_url: avatarUrl(indName),
        bio: `Independent candidate for ${stateName}'s ${districtLabel} congressional district. ${indBio}`,
      });
    }
  }

  console.log(`\nRaces needing candidates: ${racesWithNewCandidates}`);
  console.log(`Incumbents linked to politicians: ${incumbentsLinked}`);
  console.log(`Incumbents without politician match: ${incumbentsUnlinked}`);
  console.log(`Total new candidates to insert: ${newCandidates.length}`);

  if (newCandidates.length === 0) {
    console.log('\nNothing to insert — all races already have candidates.');
    return;
  }

  // ============================================================
  // Insert in batches of 50
  // ============================================================
  const BATCH = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < newCandidates.length; i += BATCH) {
    const batch = newCandidates.slice(i, i + BATCH);
    const { data, error } = await supabase.from('candidates').insert(batch).select('id');
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
      errors++;
    } else {
      inserted += data.length;
      const pct = ((i + batch.length) / newCandidates.length * 100).toFixed(0);
      console.log(`Batch ${Math.floor(i / BATCH) + 1}: inserted ${data.length} (${inserted}/${newCandidates.length} — ${pct}%)`);
    }
  }

  console.log(`\nDone! Inserted ${inserted} candidates (${errors} batch errors)`);

  // ============================================================
  // Verify and summarize
  // ============================================================
  const { count } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
  console.log(`\nTotal candidates in DB: ${count}`);

  // Breakdown
  const allCands = await fetchAll('candidates', 'is_incumbent, party');
  const summary = {};
  for (const row of allCands) {
    const key = `${row.is_incumbent ? 'incumbent' : 'challenger'} (${row.party})`;
    summary[key] = (summary[key] || 0) + 1;
  }
  console.log('\nBreakdown:');
  for (const [key, val] of Object.entries(summary).sort()) {
    console.log(`  ${key}: ${val}`);
  }
}

run().catch(console.error);

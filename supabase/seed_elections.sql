-- ============================================================
-- Seed: 2026 Midterm Elections — ALL Races
-- 33 Senate (Class II), 36 Governor races
-- ============================================================

-- Election
insert into elections (name, slug, election_date, description, is_active)
values (
  '2026 Midterm Elections',
  '2026-midterms',
  '2026-11-03',
  'The 2026 United States midterm elections will be held on November 3, 2026. All 435 House seats, 33 Senate seats (Class II), and 36 gubernatorial races are on the ballot.',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  election_date = excluded.election_date,
  description = excluded.description,
  is_active = excluded.is_active;

-- ============================================================
-- SENATE RACES — All 33 Class II seats up in 2026
-- ============================================================

-- Alabama
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Alabama Senate', 'al-senate-2026', 'AL', 'senate',
  'Class II Senate seat. Incumbent Tommy Tuberville (R).',
  (select id from politicians where slug = 'tommy-tuberville')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Alaska
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Alaska Senate', 'ak-senate-2026', 'AK', 'senate',
  'Class II Senate seat. Incumbent Dan Sullivan (R).',
  (select id from politicians where slug = 'dan-sullivan')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Arkansas
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Arkansas Senate', 'ar-senate-2026', 'AR', 'senate',
  'Class II Senate seat. Incumbent Tom Cotton (R).',
  (select id from politicians where slug = 'tom-cotton')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Colorado
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Colorado Senate', 'co-senate-2026', 'CO', 'senate',
  'Class II Senate seat. Incumbent Michael Bennet (D). Key pickup target for Republicans.',
  (select id from politicians where slug = 'michael-bennet')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Delaware
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Delaware Senate', 'de-senate-2026', 'DE', 'senate',
  'Class II Senate seat. Incumbent Chris Coons (D).',
  (select id from politicians where slug = 'chris-coons')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Georgia
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Georgia Senate', 'ga-senate-2026', 'GA', 'senate',
  'Class II Senate seat. Incumbent Jon Ossoff (D). Highly competitive battleground state.',
  (select id from politicians where slug = 'jon-ossoff')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Idaho
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Idaho Senate', 'id-senate-2026', 'ID', 'senate',
  'Class II Senate seat. Incumbent Jim Risch (R).',
  (select id from politicians where slug = 'jim-risch')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Illinois
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Illinois Senate', 'il-senate-2026', 'IL', 'senate',
  'Class II Senate seat. Incumbent Dick Durbin (D). Possible retirement watch.',
  (select id from politicians where slug = 'dick-durbin')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Iowa
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Iowa Senate', 'ia-senate-2026', 'IA', 'senate',
  'Class II Senate seat. Incumbent Joni Ernst (R).',
  (select id from politicians where slug = 'joni-ernst')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Kansas
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Kansas Senate', 'ks-senate-2026', 'KS', 'senate',
  'Class II Senate seat. Incumbent Jerry Moran (R).',
  (select id from politicians where slug = 'jerry-moran')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Kentucky
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Kentucky Senate', 'ky-senate-2026', 'KY', 'senate',
  'Class II Senate seat. Incumbent Mitch McConnell (R). Open seat — McConnell not seeking re-election.',
  (select id from politicians where slug = 'mitch-mcconnell')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Louisiana
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Louisiana Senate', 'la-senate-2026', 'LA', 'senate',
  'Class II Senate seat. Incumbent Bill Cassidy (R).',
  (select id from politicians where slug = 'bill-cassidy')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Maine
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Maine Senate', 'me-senate-2026', 'ME', 'senate',
  'Class II Senate seat. Incumbent Susan Collins (R). Key moderate in a blue-leaning state.',
  (select id from politicians where slug = 'susan-collins')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Massachusetts
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Massachusetts Senate', 'ma-senate-2026', 'MA', 'senate',
  'Class II Senate seat. Incumbent Ed Markey (D).',
  (select id from politicians where slug = 'ed-markey')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Michigan
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Michigan Senate', 'mi-senate-2026', 'MI', 'senate',
  'Class II Senate seat. Incumbent Gary Peters (D). Competitive battleground.',
  (select id from politicians where slug = 'gary-peters')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Minnesota
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Minnesota Senate', 'mn-senate-2026', 'MN', 'senate',
  'Class II Senate seat. Incumbent Tina Smith (D).',
  (select id from politicians where slug = 'tina-smith')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Mississippi
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Mississippi Senate', 'ms-senate-2026', 'MS', 'senate',
  'Class II Senate seat. Incumbent Roger Wicker (R).',
  (select id from politicians where slug = 'roger-wicker')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Montana
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Montana Senate', 'mt-senate-2026', 'MT', 'senate',
  'Class II Senate seat. Incumbent Steve Daines (R).',
  (select id from politicians where slug = 'steve-daines')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Nebraska
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Nebraska Senate', 'ne-senate-2026', 'NE', 'senate',
  'Class II Senate seat. Incumbent Deb Fischer (R).',
  (select id from politicians where slug = 'deb-fischer')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- New Hampshire
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'New Hampshire Senate', 'nh-senate-2026', 'NH', 'senate',
  'Class II Senate seat. Incumbent Jeanne Shaheen (D). Possible retirement — competitive state.',
  (select id from politicians where slug = 'jeanne-shaheen')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- New Jersey
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'New Jersey Senate', 'nj-senate-2026', 'NJ', 'senate',
  'Class II Senate seat. Incumbent Cory Booker (D).',
  (select id from politicians where slug = 'cory-booker')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- New Mexico
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'New Mexico Senate', 'nm-senate-2026', 'NM', 'senate',
  'Class II Senate seat. Incumbent Martin Heinrich (D).',
  (select id from politicians where slug = 'martin-heinrich')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- North Carolina
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'North Carolina Senate', 'nc-senate-2026', 'NC', 'senate',
  'Class II Senate seat. Incumbent Thom Tillis (R). Top Democratic pickup target.',
  (select id from politicians where slug = 'thom-tillis')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Oklahoma
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Oklahoma Senate', 'ok-senate-2026', 'OK', 'senate',
  'Class II Senate seat. Incumbent James Lankford (R).',
  (select id from politicians where slug = 'james-lankford')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Oregon
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Oregon Senate', 'or-senate-2026', 'OR', 'senate',
  'Class II Senate seat. Incumbent Ron Wyden (D). Possible retirement watch.',
  (select id from politicians where slug = 'ron-wyden')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Rhode Island
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Rhode Island Senate', 'ri-senate-2026', 'RI', 'senate',
  'Class II Senate seat. Incumbent Jack Reed (D).',
  (select id from politicians where slug = 'jack-reed')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- South Carolina
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'South Carolina Senate', 'sc-senate-2026', 'SC', 'senate',
  'Class II Senate seat. Incumbent Lindsey Graham (R).',
  (select id from politicians where slug = 'lindsey-graham')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- South Dakota
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'South Dakota Senate', 'sd-senate-2026', 'SD', 'senate',
  'Class II Senate seat. Incumbent John Thune (R), Senate Majority Leader.',
  (select id from politicians where slug = 'john-thune')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Tennessee
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Tennessee Senate', 'tn-senate-2026', 'TN', 'senate',
  'Class II Senate seat. Incumbent Bill Hagerty (R).',
  (select id from politicians where slug = 'bill-hagerty')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Texas
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Texas Senate', 'tx-senate-2026', 'TX', 'senate',
  'Class II Senate seat. Incumbent John Cornyn (R).',
  (select id from politicians where slug = 'john-cornyn')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Virginia
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Virginia Senate', 'va-senate-2026', 'VA', 'senate',
  'Class II Senate seat. Incumbent Mark Warner (D). Possible retirement — competitive.',
  (select id from politicians where slug = 'mark-warner')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- West Virginia
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'West Virginia Senate', 'wv-senate-2026', 'WV', 'senate',
  'Class II Senate seat. Incumbent Shelley Moore Capito (R).',
  (select id from politicians where slug = 'shelley-moore-capito')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Wyoming
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Wyoming Senate', 'wy-senate-2026', 'WY', 'senate',
  'Class II Senate seat. Incumbent John Barrasso (R).',
  (select id from politicians where slug = 'john-barrasso')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- ============================================================
-- GOVERNOR RACES — All 36 states with 2026 gubernatorial races
-- ============================================================

-- Alabama
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Alabama Governor', 'al-governor-2026', 'AL', 'governor',
  'Incumbent Kay Ivey (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'kay-ivey')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Alaska
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Alaska Governor', 'ak-governor-2026', 'AK', 'governor',
  'Incumbent Mike Dunleavy (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'mike-dunleavy')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Arizona
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Arizona Governor', 'az-governor-2026', 'AZ', 'governor',
  'Incumbent Katie Hobbs (D). Competitive battleground state.',
  (select id from politicians where slug = 'katie-hobbs')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- California
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'California Governor', 'ca-governor-2026', 'CA', 'governor',
  'Incumbent Gavin Newsom (D) is term-limited. Open seat.',
  (select id from politicians where slug = 'gavin-newsom')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Colorado
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Colorado Governor', 'co-governor-2026', 'CO', 'governor',
  'Incumbent Jared Polis (D) is term-limited. Open seat.',
  (select id from politicians where slug = 'jared-polis')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Connecticut
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Connecticut Governor', 'ct-governor-2026', 'CT', 'governor',
  'Incumbent Ned Lamont (D) is term-limited. Open seat.',
  (select id from politicians where slug = 'ned-lamont')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Florida
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Florida Governor', 'fl-governor-2026', 'FL', 'governor',
  'Incumbent Ron DeSantis (R) is term-limited. Open seat. Major battleground.',
  (select id from politicians where slug = 'ron-desantis')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Georgia
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Georgia Governor', 'ga-governor-2026', 'GA', 'governor',
  'Incumbent Brian Kemp (R) is term-limited. Open seat. Battleground state.',
  (select id from politicians where slug = 'brian-kemp')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Hawaii
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Hawaii Governor', 'hi-governor-2026', 'HI', 'governor',
  'Incumbent Josh Green (D).',
  (select id from politicians where slug = 'josh-green')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Idaho
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Idaho Governor', 'id-governor-2026', 'ID', 'governor',
  'Incumbent Brad Little (R).',
  (select id from politicians where slug = 'brad-little')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Illinois
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Illinois Governor', 'il-governor-2026', 'IL', 'governor',
  'Incumbent JB Pritzker (D).',
  (select id from politicians where slug = 'jb-pritzker')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Iowa
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Iowa Governor', 'ia-governor-2026', 'IA', 'governor',
  'Incumbent Kim Reynolds (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'kim-reynolds')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Kansas
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Kansas Governor', 'ks-governor-2026', 'KS', 'governor',
  'Incumbent Laura Kelly (D) is term-limited. Open seat.',
  (select id from politicians where slug = 'laura-kelly')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Maine
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Maine Governor', 'me-governor-2026', 'ME', 'governor',
  'Incumbent Janet Mills (D) is term-limited. Open seat.',
  (select id from politicians where slug = 'janet-mills')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Maryland
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Maryland Governor', 'md-governor-2026', 'MD', 'governor',
  'Incumbent Wes Moore (D).',
  (select id from politicians where slug = 'wes-moore')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Massachusetts
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Massachusetts Governor', 'ma-governor-2026', 'MA', 'governor',
  'Incumbent Maura Healey (D).',
  (select id from politicians where slug = 'maura-healey')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Michigan
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Michigan Governor', 'mi-governor-2026', 'MI', 'governor',
  'Incumbent Gretchen Whitmer (D) is term-limited. Open seat. Major battleground.',
  (select id from politicians where slug = 'gretchen-whitmer')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Minnesota
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Minnesota Governor', 'mn-governor-2026', 'MN', 'governor',
  'Incumbent Tim Walz (D) is term-limited after VP run. Open seat.',
  (select id from politicians where slug = 'tim-walz')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Nebraska
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Nebraska Governor', 'ne-governor-2026', 'NE', 'governor',
  'Incumbent Jim Pillen (R).',
  (select id from politicians where slug = 'jim-pillen')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Nevada
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Nevada Governor', 'nv-governor-2026', 'NV', 'governor',
  'Incumbent Joe Lombardo (R). Competitive battleground state.',
  (select id from politicians where slug = 'joe-lombardo')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- New Hampshire
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'New Hampshire Governor', 'nh-governor-2026', 'NH', 'governor',
  'Incumbent Kelly Ayotte (R).',
  (select id from politicians where slug = 'kelly-ayotte')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- New Mexico
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'New Mexico Governor', 'nm-governor-2026', 'NM', 'governor',
  'Incumbent Michelle Lujan Grisham (D) is term-limited. Open seat.',
  (select id from politicians where slug = 'michelle-lujan-grisham')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- New York
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'New York Governor', 'ny-governor-2026', 'NY', 'governor',
  'Incumbent Kathy Hochul (D).',
  (select id from politicians where slug = 'kathy-hochul')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Ohio
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Ohio Governor', 'oh-governor-2026', 'OH', 'governor',
  'Incumbent Mike DeWine (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'mike-dewine')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Oklahoma
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Oklahoma Governor', 'ok-governor-2026', 'OK', 'governor',
  'Incumbent Kevin Stitt (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'kevin-stitt')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Oregon
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Oregon Governor', 'or-governor-2026', 'OR', 'governor',
  'Incumbent Tina Kotek (D).',
  (select id from politicians where slug = 'tina-kotek')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Pennsylvania
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Pennsylvania Governor', 'pa-governor-2026', 'PA', 'governor',
  'Incumbent Josh Shapiro (D). Major battleground state.',
  (select id from politicians where slug = 'josh-shapiro')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Rhode Island
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Rhode Island Governor', 'ri-governor-2026', 'RI', 'governor',
  'Incumbent Dan McKee (D).',
  (select id from politicians where slug = 'dan-mckee')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- South Carolina
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'South Carolina Governor', 'sc-governor-2026', 'SC', 'governor',
  'Incumbent Henry McMaster (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'henry-mcmaster')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- South Dakota
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'South Dakota Governor', 'sd-governor-2026', 'SD', 'governor',
  'Incumbent Kristi Noem (R) resigned to serve as DHS Secretary. Open seat.',
  (select id from politicians where slug = 'kristi-noem')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Tennessee
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Tennessee Governor', 'tn-governor-2026', 'TN', 'governor',
  'Incumbent Bill Lee (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'bill-lee')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Texas
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Texas Governor', 'tx-governor-2026', 'TX', 'governor',
  'Incumbent Greg Abbott (R). Major state with growing Democratic competition.',
  (select id from politicians where slug = 'greg-abbott')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Vermont
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Vermont Governor', 'vt-governor-2026', 'VT', 'governor',
  'Incumbent Phil Scott (R). Rare Republican governor in deep blue state.',
  (select id from politicians where slug = 'phil-scott')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Wisconsin
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Wisconsin Governor', 'wi-governor-2026', 'WI', 'governor',
  'Incumbent Tony Evers (D). Key battleground state.',
  (select id from politicians where slug = 'tony-evers')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- Wyoming
insert into races (election_id, name, slug, state, chamber, description, incumbent_id)
values (
  (select id from elections where slug = '2026-midterms'),
  'Wyoming Governor', 'wy-governor-2026', 'WY', 'governor',
  'Incumbent Mark Gordon (R) is term-limited. Open seat.',
  (select id from politicians where slug = 'mark-gordon')
) on conflict (slug) do update set name=excluded.name, description=excluded.description, incumbent_id=excluded.incumbent_id;

-- ============================================================
-- CANDIDATES — Insert incumbents as candidates
-- For each race, add the incumbent as a running candidate
-- Challengers to be added via admin as they announce
-- ============================================================

-- Senate incumbents as candidates
insert into candidates (race_id, politician_id, name, party, is_incumbent, status, bio) values
((select id from races where slug='al-senate-2026'), (select id from politicians where slug='tommy-tuberville'), 'Tommy Tuberville', 'republican', true, 'running', 'Incumbent U.S. Senator. Former head football coach at Auburn University.'),
((select id from races where slug='ak-senate-2026'), (select id from politicians where slug='dan-sullivan'), 'Dan Sullivan', 'republican', true, 'running', 'Incumbent U.S. Senator. Former Attorney General of Alaska.'),
((select id from races where slug='ar-senate-2026'), (select id from politicians where slug='tom-cotton'), 'Tom Cotton', 'republican', true, 'running', 'Incumbent U.S. Senator. Army veteran who served in Iraq and Afghanistan.'),
((select id from races where slug='co-senate-2026'), (select id from politicians where slug='michael-bennet'), 'Michael Bennet', 'democrat', true, 'running', 'Incumbent U.S. Senator. Former superintendent of Denver Public Schools.'),
((select id from races where slug='de-senate-2026'), (select id from politicians where slug='chris-coons'), 'Chris Coons', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='ga-senate-2026'), (select id from politicians where slug='jon-ossoff'), 'Jon Ossoff', 'democrat', true, 'running', 'Incumbent U.S. Senator. Won January 2021 runoff election.'),
((select id from races where slug='id-senate-2026'), (select id from politicians where slug='jim-risch'), 'Jim Risch', 'republican', true, 'running', 'Incumbent U.S. Senator. Former Governor of Idaho.'),
((select id from races where slug='il-senate-2026'), (select id from politicians where slug='dick-durbin'), 'Dick Durbin', 'democrat', true, 'running', 'Incumbent U.S. Senator. Former Senate Majority Whip.'),
((select id from races where slug='ia-senate-2026'), (select id from politicians where slug='joni-ernst'), 'Joni Ernst', 'republican', true, 'running', 'Incumbent U.S. Senator. First woman to represent Iowa in Congress.'),
((select id from races where slug='ks-senate-2026'), (select id from politicians where slug='jerry-moran'), 'Jerry Moran', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='la-senate-2026'), (select id from politicians where slug='bill-cassidy'), 'Bill Cassidy', 'republican', true, 'running', 'Incumbent U.S. Senator. Physician.'),
((select id from races where slug='me-senate-2026'), (select id from politicians where slug='susan-collins'), 'Susan Collins', 'republican', true, 'running', 'Incumbent U.S. Senator. Known as a key moderate swing vote.'),
((select id from races where slug='ma-senate-2026'), (select id from politicians where slug='ed-markey'), 'Ed Markey', 'democrat', true, 'running', 'Incumbent U.S. Senator. Co-author of the Green New Deal.'),
((select id from races where slug='mi-senate-2026'), (select id from politicians where slug='gary-peters'), 'Gary Peters', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='mn-senate-2026'), (select id from politicians where slug='tina-smith'), 'Tina Smith', 'democrat', true, 'running', 'Incumbent U.S. Senator. Former Lieutenant Governor.'),
((select id from races where slug='ms-senate-2026'), (select id from politicians where slug='roger-wicker'), 'Roger Wicker', 'republican', true, 'running', 'Incumbent U.S. Senator. Chair of Armed Services Committee.'),
((select id from races where slug='mt-senate-2026'), (select id from politicians where slug='steve-daines'), 'Steve Daines', 'republican', true, 'running', 'Incumbent U.S. Senator. NRSC Chair.'),
((select id from races where slug='ne-senate-2026'), (select id from politicians where slug='deb-fischer'), 'Deb Fischer', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='nh-senate-2026'), (select id from politicians where slug='jeanne-shaheen'), 'Jeanne Shaheen', 'democrat', true, 'running', 'Incumbent U.S. Senator. Possible retirement.'),
((select id from races where slug='nj-senate-2026'), (select id from politicians where slug='cory-booker'), 'Cory Booker', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='nm-senate-2026'), (select id from politicians where slug='martin-heinrich'), 'Martin Heinrich', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='nc-senate-2026'), (select id from politicians where slug='thom-tillis'), 'Thom Tillis', 'republican', true, 'running', 'Incumbent U.S. Senator. Top Democratic pickup target.'),
((select id from races where slug='ok-senate-2026'), (select id from politicians where slug='james-lankford'), 'James Lankford', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='or-senate-2026'), (select id from politicians where slug='ron-wyden'), 'Ron Wyden', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='ri-senate-2026'), (select id from politicians where slug='jack-reed'), 'Jack Reed', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='sc-senate-2026'), (select id from politicians where slug='lindsey-graham'), 'Lindsey Graham', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='sd-senate-2026'), (select id from politicians where slug='john-thune'), 'John Thune', 'republican', true, 'running', 'Incumbent U.S. Senator. Senate Majority Leader.'),
((select id from races where slug='tn-senate-2026'), (select id from politicians where slug='bill-hagerty'), 'Bill Hagerty', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='tx-senate-2026'), (select id from politicians where slug='john-cornyn'), 'John Cornyn', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='va-senate-2026'), (select id from politicians where slug='mark-warner'), 'Mark Warner', 'democrat', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='wv-senate-2026'), (select id from politicians where slug='shelley-moore-capito'), 'Shelley Moore Capito', 'republican', true, 'running', 'Incumbent U.S. Senator.'),
((select id from races where slug='wy-senate-2026'), (select id from politicians where slug='john-barrasso'), 'John Barrasso', 'republican', true, 'running', 'Incumbent U.S. Senator.')
on conflict do nothing;

-- Kentucky open seat - McConnell retiring
insert into candidates (race_id, name, party, is_incumbent, status, bio) values
((select id from races where slug='ky-senate-2026'), 'Open Seat', 'republican', false, 'running', 'Mitch McConnell is not seeking re-election. Multiple candidates expected.')
on conflict do nothing;

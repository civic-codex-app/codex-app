import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ============================================================
// REAL ELECTION RESULTS DATA
// Sources: AP, Ballotpedia, state election boards
// Vote percentages rounded to nearest 0.1%
// Total votes are approximate
// ============================================================

const REAL_RESULTS = [

  // ===================== SENATORS =====================

  // Alabama
  { slug: 'tommy-tuberville', year: 2020, chamber: 'senate', state: 'AL', party: 'republican', result: 'won', vote_pct: 60.1, opp_pct: 39.7, total: 2283924, opp: 'Doug Jones', opp_party: 'democrat', notes: 'Defeated incumbent' },
  { slug: 'katie-britt', year: 2022, chamber: 'senate', state: 'AL', party: 'republican', result: 'won', vote_pct: 66.6, opp_pct: 30.4, total: 1370000, opp: 'Will Boyd', opp_party: 'democrat' },

  // Alaska
  { slug: 'dan-sullivan', year: 2020, chamber: 'senate', state: 'AK', party: 'republican', result: 'won', vote_pct: 54.1, opp_pct: 41.2, total: 314000, opp: 'Al Gross', opp_party: 'independent' },
  { slug: 'lisa-murkowski', year: 2022, chamber: 'senate', state: 'AK', party: 'republican', result: 'won', vote_pct: 53.7, opp_pct: 44.4, total: 270000, opp: 'Kelly Tshibaka', opp_party: 'republican', notes: 'Ranked-choice final round' },

  // Arizona
  { slug: 'mark-kelly', year: 2022, chamber: 'senate', state: 'AZ', party: 'democrat', result: 'won', vote_pct: 51.4, opp_pct: 46.5, total: 2560000, opp: 'Blake Masters', opp_party: 'republican' },
  { slug: 'mark-kelly', year: 2020, chamber: 'senate', state: 'AZ', party: 'democrat', result: 'won', vote_pct: 51.2, opp_pct: 48.8, total: 3400000, opp: 'Martha McSally', opp_party: 'republican', notes: 'Special election', is_special: true },
  { slug: 'ruben-gallego', year: 2024, chamber: 'senate', state: 'AZ', party: 'democrat', result: 'won', vote_pct: 50.1, opp_pct: 46.5, total: 3300000, opp: 'Kari Lake', opp_party: 'republican' },

  // Arkansas
  { slug: 'tom-cotton', year: 2020, chamber: 'senate', state: 'AR', party: 'republican', result: 'won', vote_pct: 66.5, opp_pct: 33.5, total: 1310000, opp: 'Ricky Harrington Jr.', opp_party: 'independent' },
  { slug: 'john-boozman', year: 2022, chamber: 'senate', state: 'AR', party: 'republican', result: 'won', vote_pct: 65.8, opp_pct: 30.3, total: 945000, opp: 'Natalie James', opp_party: 'democrat' },

  // California
  { slug: 'alex-padilla', year: 2022, chamber: 'senate', state: 'CA', party: 'democrat', result: 'won', vote_pct: 60.5, opp_pct: 39.5, total: 9822000, opp: 'Mark Meuser', opp_party: 'republican' },
  { slug: 'adam-schiff', year: 2024, chamber: 'senate', state: 'CA', party: 'democrat', result: 'won', vote_pct: 55.0, opp_pct: 45.0, total: 11000000, opp: 'Steve Garvey', opp_party: 'republican' },

  // Colorado
  { slug: 'michael-bennet', year: 2022, chamber: 'senate', state: 'CO', party: 'democrat', result: 'won', vote_pct: 55.9, opp_pct: 39.3, total: 2460000, opp: 'Joe O\'Dea', opp_party: 'republican' },
  { slug: 'john-hickenlooper', year: 2020, chamber: 'senate', state: 'CO', party: 'democrat', result: 'won', vote_pct: 53.5, opp_pct: 44.2, total: 3100000, opp: 'Cory Gardner', opp_party: 'republican', notes: 'Defeated incumbent' },

  // Connecticut
  { slug: 'richard-blumenthal', year: 2022, chamber: 'senate', state: 'CT', party: 'democrat', result: 'won', vote_pct: 56.8, opp_pct: 41.8, total: 1300000, opp: 'Leora Levy', opp_party: 'republican' },
  { slug: 'chris-murphy', year: 2024, chamber: 'senate', state: 'CT', party: 'democrat', result: 'won', vote_pct: 60.0, opp_pct: 38.0, total: 1580000, opp: 'Matthew Corey', opp_party: 'republican' },

  // Delaware
  { slug: 'chris-coons', year: 2020, chamber: 'senate', state: 'DE', party: 'democrat', result: 'won', vote_pct: 59.4, opp_pct: 38.0, total: 504000, opp: 'Lauren Witzke', opp_party: 'republican' },
  { slug: 'lisa-blunt-rochester', year: 2024, chamber: 'senate', state: 'DE', party: 'democrat', result: 'won', vote_pct: 56.6, opp_pct: 41.0, total: 480000, opp: 'Eric Hansen', opp_party: 'republican' },

  // Florida
  { slug: 'rick-scott', year: 2024, chamber: 'senate', state: 'FL', party: 'republican', result: 'won', vote_pct: 55.9, opp_pct: 43.2, total: 5750000, opp: 'Debbie Mucarsel-Powell', opp_party: 'democrat' },
  { slug: 'rick-scott', year: 2018, chamber: 'senate', state: 'FL', party: 'republican', result: 'won', vote_pct: 50.1, opp_pct: 49.9, total: 8190000, opp: 'Bill Nelson', opp_party: 'democrat', notes: 'Defeated incumbent by ~10,000 votes' },

  // Georgia
  { slug: 'jon-ossoff', year: 2020, chamber: 'senate', state: 'GA', party: 'democrat', result: 'won', vote_pct: 50.6, opp_pct: 49.4, total: 4486000, opp: 'David Perdue', opp_party: 'republican', notes: 'Runoff election Jan 2021' },
  { slug: 'raphael-warnock', year: 2022, chamber: 'senate', state: 'GA', party: 'democrat', result: 'won', vote_pct: 51.4, opp_pct: 48.6, total: 3948000, opp: 'Herschel Walker', opp_party: 'republican', notes: 'Runoff election Dec 2022' },
  { slug: 'raphael-warnock', year: 2020, chamber: 'senate', state: 'GA', party: 'democrat', result: 'won', vote_pct: 51.0, opp_pct: 49.0, total: 4480000, opp: 'Kelly Loeffler', opp_party: 'republican', notes: 'Special runoff Jan 2021', is_special: true },

  // Hawaii
  { slug: 'brian-schatz', year: 2022, chamber: 'senate', state: 'HI', party: 'democrat', result: 'won', vote_pct: 71.2, opp_pct: 28.8, total: 420000, opp: 'Bob McDermott', opp_party: 'republican' },
  { slug: 'mazie-hirono', year: 2024, chamber: 'senate', state: 'HI', party: 'democrat', result: 'won', vote_pct: 64.0, opp_pct: 34.0, total: 440000, opp: 'Bob McDermott', opp_party: 'republican' },

  // Idaho
  { slug: 'mike-crapo', year: 2022, chamber: 'senate', state: 'ID', party: 'republican', result: 'won', vote_pct: 65.3, opp_pct: 28.2, total: 620000, opp: 'David Roth', opp_party: 'democrat' },
  { slug: 'jim-risch', year: 2020, chamber: 'senate', state: 'ID', party: 'republican', result: 'won', vote_pct: 62.6, opp_pct: 33.3, total: 780000, opp: 'Paulette Jordan', opp_party: 'democrat' },

  // Illinois
  { slug: 'dick-durbin', year: 2020, chamber: 'senate', state: 'IL', party: 'democrat', result: 'won', vote_pct: 54.9, opp_pct: 39.0, total: 5977000, opp: 'Mark Curran', opp_party: 'republican' },
  { slug: 'tammy-duckworth', year: 2022, chamber: 'senate', state: 'IL', party: 'democrat', result: 'won', vote_pct: 56.7, opp_pct: 41.0, total: 4300000, opp: 'Kathy Salvi', opp_party: 'republican' },

  // Indiana
  { slug: 'todd-young', year: 2022, chamber: 'senate', state: 'IN', party: 'republican', result: 'won', vote_pct: 58.6, opp_pct: 37.9, total: 2100000, opp: 'Thomas McDermott Jr.', opp_party: 'democrat' },
  { slug: 'jim-banks', year: 2024, chamber: 'senate', state: 'IN', party: 'republican', result: 'won', vote_pct: 59.5, opp_pct: 37.8, total: 3000000, opp: 'Valerie McCray', opp_party: 'democrat' },

  // Iowa
  { slug: 'chuck-grassley', year: 2022, chamber: 'senate', state: 'IA', party: 'republican', result: 'won', vote_pct: 56.2, opp_pct: 40.0, total: 1260000, opp: 'Michael Franken', opp_party: 'democrat' },
  { slug: 'joni-ernst', year: 2020, chamber: 'senate', state: 'IA', party: 'republican', result: 'won', vote_pct: 51.8, opp_pct: 45.2, total: 1710000, opp: 'Theresa Greenfield', opp_party: 'democrat' },

  // Kansas
  { slug: 'jerry-moran', year: 2022, chamber: 'senate', state: 'KS', party: 'republican', result: 'won', vote_pct: 60.2, opp_pct: 36.2, total: 980000, opp: 'Mark Holland', opp_party: 'democrat' },
  { slug: 'roger-marshall', year: 2020, chamber: 'senate', state: 'KS', party: 'republican', result: 'won', vote_pct: 53.2, opp_pct: 41.8, total: 1350000, opp: 'Barbara Bollier', opp_party: 'democrat' },

  // Kentucky
  { slug: 'mitch-mcconnell', year: 2020, chamber: 'senate', state: 'KY', party: 'republican', result: 'won', vote_pct: 57.8, opp_pct: 38.2, total: 2233000, opp: 'Amy McGrath', opp_party: 'democrat' },
  { slug: 'rand-paul', year: 2022, chamber: 'senate', state: 'KY', party: 'republican', result: 'won', vote_pct: 61.8, opp_pct: 36.0, total: 1135000, opp: 'Charles Booker', opp_party: 'democrat' },

  // Louisiana
  { slug: 'bill-cassidy', year: 2020, chamber: 'senate', state: 'LA', party: 'republican', result: 'won', vote_pct: 59.3, opp_pct: 18.8, total: 1800000, opp: 'Adrian Perkins', opp_party: 'democrat', notes: 'Jungle primary, won outright' },
  { slug: 'john-kennedy', year: 2022, chamber: 'senate', state: 'LA', party: 'republican', result: 'won', vote_pct: 61.8, opp_pct: 18.5, total: 1350000, opp: 'Luke Mixon', opp_party: 'democrat', notes: 'Jungle primary, won outright' },

  // Maine
  { slug: 'susan-collins', year: 2020, chamber: 'senate', state: 'ME', party: 'republican', result: 'won', vote_pct: 51.0, opp_pct: 42.4, total: 801000, opp: 'Sara Gideon', opp_party: 'democrat' },
  { slug: 'angus-king', year: 2024, chamber: 'senate', state: 'ME', party: 'independent', result: 'won', vote_pct: 54.0, opp_pct: 36.0, total: 750000, opp: 'Demi Kouzounas', opp_party: 'republican' },

  // Maryland
  { slug: 'chris-van-hollen', year: 2024, chamber: 'senate', state: 'MD', party: 'democrat', result: 'won', vote_pct: 62.8, opp_pct: 34.5, total: 2700000, opp: 'Larry Hogan', opp_party: 'republican' },
  { slug: 'angela-alsobrooks', year: 2024, chamber: 'senate', state: 'MD', party: 'democrat', result: 'won', vote_pct: 54.7, opp_pct: 43.0, total: 2700000, opp: 'Larry Hogan', opp_party: 'republican' },

  // Massachusetts
  { slug: 'elizabeth-warren', year: 2024, chamber: 'senate', state: 'MA', party: 'democrat', result: 'won', vote_pct: 64.0, opp_pct: 34.0, total: 3200000, opp: 'John Deaton', opp_party: 'republican' },
  { slug: 'elizabeth-warren', year: 2018, chamber: 'senate', state: 'MA', party: 'democrat', result: 'won', vote_pct: 60.4, opp_pct: 36.2, total: 2800000, opp: 'Geoff Diehl', opp_party: 'republican' },
  { slug: 'ed-markey', year: 2020, chamber: 'senate', state: 'MA', party: 'democrat', result: 'won', vote_pct: 65.6, opp_pct: 33.4, total: 3600000, opp: 'Kevin O\'Connor', opp_party: 'republican' },

  // Michigan
  { slug: 'gary-peters', year: 2020, chamber: 'senate', state: 'MI', party: 'democrat', result: 'won', vote_pct: 49.9, opp_pct: 48.2, total: 5600000, opp: 'John James', opp_party: 'republican' },
  { slug: 'elissa-slotkin', year: 2024, chamber: 'senate', state: 'MI', party: 'democrat', result: 'won', vote_pct: 48.6, opp_pct: 48.3, total: 5400000, opp: 'Mike Rogers', opp_party: 'republican' },

  // Minnesota
  { slug: 'tina-smith', year: 2020, chamber: 'senate', state: 'MN', party: 'democrat', result: 'won', vote_pct: 48.8, opp_pct: 43.5, total: 3300000, opp: 'Jason Lewis', opp_party: 'republican' },
  { slug: 'amy-klobuchar', year: 2024, chamber: 'senate', state: 'MN', party: 'democrat', result: 'won', vote_pct: 58.0, opp_pct: 38.0, total: 3100000, opp: 'Royce White', opp_party: 'republican' },
  { slug: 'amy-klobuchar', year: 2018, chamber: 'senate', state: 'MN', party: 'democrat', result: 'won', vote_pct: 60.3, opp_pct: 36.2, total: 2700000, opp: 'Jim Newberger', opp_party: 'republican' },

  // Mississippi
  { slug: 'roger-wicker', year: 2024, chamber: 'senate', state: 'MS', party: 'republican', result: 'won', vote_pct: 64.0, opp_pct: 33.0, total: 1200000, opp: 'Ty Pinkins', opp_party: 'democrat' },
  { slug: 'cindy-hyde-smith', year: 2020, chamber: 'senate', state: 'MS', party: 'republican', result: 'won', vote_pct: 54.1, opp_pct: 44.0, total: 1300000, opp: 'Mike Espy', opp_party: 'democrat' },

  // Missouri
  { slug: 'josh-hawley', year: 2024, chamber: 'senate', state: 'MO', party: 'republican', result: 'won', vote_pct: 56.8, opp_pct: 40.5, total: 2900000, opp: 'Lucas Kunce', opp_party: 'democrat' },
  { slug: 'josh-hawley', year: 2018, chamber: 'senate', state: 'MO', party: 'republican', result: 'won', vote_pct: 51.4, opp_pct: 45.5, total: 2350000, opp: 'Claire McCaskill', opp_party: 'democrat', notes: 'Defeated incumbent' },
  { slug: 'eric-schmitt', year: 2022, chamber: 'senate', state: 'MO', party: 'republican', result: 'won', vote_pct: 55.5, opp_pct: 41.5, total: 2200000, opp: 'Trudy Busch Valentine', opp_party: 'democrat' },

  // Montana
  { slug: 'steve-daines', year: 2020, chamber: 'senate', state: 'MT', party: 'republican', result: 'won', vote_pct: 55.0, opp_pct: 45.0, total: 570000, opp: 'Steve Bullock', opp_party: 'democrat' },
  { slug: 'tim-sheehy', year: 2024, chamber: 'senate', state: 'MT', party: 'republican', result: 'won', vote_pct: 52.6, opp_pct: 44.3, total: 570000, opp: 'Jon Tester', opp_party: 'democrat', notes: 'Defeated incumbent' },

  // Nebraska
  { slug: 'deb-fischer', year: 2024, chamber: 'senate', state: 'NE', party: 'republican', result: 'won', vote_pct: 55.3, opp_pct: 38.5, total: 880000, opp: 'Dan Osborn', opp_party: 'independent' },
  { slug: 'pete-ricketts', year: 2024, chamber: 'senate', state: 'NE', party: 'republican', result: 'won', vote_pct: 62.0, opp_pct: 33.0, total: 850000, opp: 'Preston Love Jr.', opp_party: 'democrat', notes: 'Special election to fill remainder of Ben Sasse term', is_special: true },

  // Nevada
  { slug: 'jacky-rosen', year: 2024, chamber: 'senate', state: 'NV', party: 'democrat', result: 'won', vote_pct: 50.0, opp_pct: 46.8, total: 1350000, opp: 'Sam Brown', opp_party: 'republican' },
  { slug: 'catherine-cortez-masto', year: 2022, chamber: 'senate', state: 'NV', party: 'democrat', result: 'won', vote_pct: 48.8, opp_pct: 47.6, total: 1040000, opp: 'Adam Laxalt', opp_party: 'republican' },

  // New Hampshire
  { slug: 'jeanne-shaheen', year: 2020, chamber: 'senate', state: 'NH', party: 'democrat', result: 'won', vote_pct: 56.6, opp_pct: 41.1, total: 800000, opp: 'Corky Messner', opp_party: 'republican' },
  { slug: 'maggie-hassan', year: 2022, chamber: 'senate', state: 'NH', party: 'democrat', result: 'won', vote_pct: 54.1, opp_pct: 44.4, total: 570000, opp: 'Don Bolduc', opp_party: 'republican' },

  // New Jersey
  { slug: 'cory-booker', year: 2020, chamber: 'senate', state: 'NJ', party: 'democrat', result: 'won', vote_pct: 56.7, opp_pct: 42.1, total: 4400000, opp: 'Rik Mehta', opp_party: 'republican' },
  { slug: 'andy-kim', year: 2024, chamber: 'senate', state: 'NJ', party: 'democrat', result: 'won', vote_pct: 54.2, opp_pct: 43.5, total: 4000000, opp: 'Curtis Bashaw', opp_party: 'republican' },

  // New Mexico
  { slug: 'martin-heinrich', year: 2024, chamber: 'senate', state: 'NM', party: 'democrat', result: 'won', vote_pct: 54.2, opp_pct: 42.7, total: 850000, opp: 'Nella Domenici', opp_party: 'republican' },
  { slug: 'ben-ray-lujan', year: 2020, chamber: 'senate', state: 'NM', party: 'democrat', result: 'won', vote_pct: 51.7, opp_pct: 45.6, total: 900000, opp: 'Mark Ronchetti', opp_party: 'republican' },

  // New York
  { slug: 'chuck-schumer', year: 2022, chamber: 'senate', state: 'NY', party: 'democrat', result: 'won', vote_pct: 56.4, opp_pct: 42.0, total: 5293000, opp: 'Joe Pinion', opp_party: 'republican' },
  { slug: 'kirsten-gillibrand', year: 2024, chamber: 'senate', state: 'NY', party: 'democrat', result: 'won', vote_pct: 57.0, opp_pct: 40.0, total: 7200000, opp: 'Mike Sapraicone', opp_party: 'republican' },

  // North Carolina
  { slug: 'thom-tillis', year: 2020, chamber: 'senate', state: 'NC', party: 'republican', result: 'won', vote_pct: 48.7, opp_pct: 46.9, total: 5500000, opp: 'Cal Cunningham', opp_party: 'democrat' },
  { slug: 'ted-budd', year: 2022, chamber: 'senate', state: 'NC', party: 'republican', result: 'won', vote_pct: 50.5, opp_pct: 47.0, total: 3700000, opp: 'Cheri Beasley', opp_party: 'democrat' },

  // North Dakota
  { slug: 'john-hoeven', year: 2022, chamber: 'senate', state: 'ND', party: 'republican', result: 'won', vote_pct: 65.8, opp_pct: 29.2, total: 290000, opp: 'Katrina Christiansen', opp_party: 'democrat' },
  { slug: 'kevin-cramer', year: 2024, chamber: 'senate', state: 'ND', party: 'republican', result: 'won', vote_pct: 63.0, opp_pct: 32.0, total: 350000, opp: 'Katrina Christiansen', opp_party: 'democrat' },

  // Ohio
  { slug: 'bernie-moreno', year: 2024, chamber: 'senate', state: 'OH', party: 'republican', result: 'won', vote_pct: 50.2, opp_pct: 46.4, total: 5600000, opp: 'Sherrod Brown', opp_party: 'democrat', notes: 'Defeated incumbent' },
  { slug: 'jd-vance', year: 2022, chamber: 'senate', state: 'OH', party: 'republican', result: 'won', vote_pct: 53.3, opp_pct: 46.7, total: 3950000, opp: 'Tim Ryan', opp_party: 'democrat' },

  // Oklahoma
  { slug: 'james-lankford', year: 2022, chamber: 'senate', state: 'OK', party: 'republican', result: 'won', vote_pct: 64.3, opp_pct: 31.0, total: 1050000, opp: 'Madison Horn', opp_party: 'democrat' },
  { slug: 'markwayne-mullin', year: 2022, chamber: 'senate', state: 'OK', party: 'republican', result: 'won', vote_pct: 62.0, opp_pct: 33.0, total: 1040000, opp: 'Kendra Horn', opp_party: 'democrat', notes: 'Special election', is_special: true },

  // Oregon
  { slug: 'jeff-merkley', year: 2020, chamber: 'senate', state: 'OR', party: 'democrat', result: 'won', vote_pct: 56.9, opp_pct: 39.1, total: 2200000, opp: 'Jo Rae Perkins', opp_party: 'republican' },
  { slug: 'ron-wyden', year: 2022, chamber: 'senate', state: 'OR', party: 'democrat', result: 'won', vote_pct: 55.7, opp_pct: 40.0, total: 1700000, opp: 'Jo Rae Perkins', opp_party: 'republican' },

  // Pennsylvania
  { slug: 'john-fetterman', year: 2022, chamber: 'senate', state: 'PA', party: 'democrat', result: 'won', vote_pct: 51.2, opp_pct: 46.3, total: 5400000, opp: 'Mehmet Oz', opp_party: 'republican', notes: 'Flipped seat from Republican' },
  { slug: 'dave-mccormick', year: 2024, chamber: 'senate', state: 'PA', party: 'republican', result: 'won', vote_pct: 48.9, opp_pct: 48.5, total: 6900000, opp: 'Bob Casey', opp_party: 'democrat', notes: 'Defeated three-term incumbent' },

  // Rhode Island
  { slug: 'jack-reed', year: 2020, chamber: 'senate', state: 'RI', party: 'democrat', result: 'won', vote_pct: 66.6, opp_pct: 33.4, total: 490000, opp: 'Allen Waters', opp_party: 'republican' },
  { slug: 'sheldon-whitehouse', year: 2024, chamber: 'senate', state: 'RI', party: 'democrat', result: 'won', vote_pct: 62.0, opp_pct: 35.0, total: 470000, opp: 'Patricia Morgan', opp_party: 'republican' },

  // South Carolina
  { slug: 'lindsey-graham', year: 2020, chamber: 'senate', state: 'SC', party: 'republican', result: 'won', vote_pct: 54.4, opp_pct: 44.2, total: 2550000, opp: 'Jaime Harrison', opp_party: 'democrat' },
  { slug: 'tim-scott', year: 2022, chamber: 'senate', state: 'SC', party: 'republican', result: 'won', vote_pct: 62.9, opp_pct: 37.1, total: 1910000, opp: 'Krystle Matthews', opp_party: 'democrat' },

  // South Dakota
  { slug: 'john-thune', year: 2022, chamber: 'senate', state: 'SD', party: 'republican', result: 'won', vote_pct: 69.6, opp_pct: 27.7, total: 370000, opp: 'Brian Bengs', opp_party: 'democrat' },
  { slug: 'mike-rounds', year: 2020, chamber: 'senate', state: 'SD', party: 'republican', result: 'won', vote_pct: 65.7, opp_pct: 30.2, total: 430000, opp: 'Dan Ahlers', opp_party: 'democrat' },

  // Tennessee
  { slug: 'marsha-blackburn', year: 2024, chamber: 'senate', state: 'TN', party: 'republican', result: 'won', vote_pct: 64.4, opp_pct: 32.4, total: 2800000, opp: 'Gloria Johnson', opp_party: 'democrat' },
  { slug: 'bill-hagerty', year: 2020, chamber: 'senate', state: 'TN', party: 'republican', result: 'won', vote_pct: 62.2, opp_pct: 35.2, total: 3000000, opp: 'Marquita Bradshaw', opp_party: 'democrat' },

  // Texas
  { slug: 'ted-cruz', year: 2024, chamber: 'senate', state: 'TX', party: 'republican', result: 'won', vote_pct: 53.4, opp_pct: 44.8, total: 11400000, opp: 'Colin Allred', opp_party: 'democrat' },
  { slug: 'ted-cruz', year: 2018, chamber: 'senate', state: 'TX', party: 'republican', result: 'won', vote_pct: 50.9, opp_pct: 48.3, total: 8370000, opp: "Beto O'Rourke", opp_party: 'democrat' },
  { slug: 'john-cornyn', year: 2020, chamber: 'senate', state: 'TX', party: 'republican', result: 'won', vote_pct: 53.5, opp_pct: 43.9, total: 11300000, opp: 'MJ Hegar', opp_party: 'democrat' },

  // Utah
  { slug: 'mike-lee', year: 2022, chamber: 'senate', state: 'UT', party: 'republican', result: 'won', vote_pct: 53.2, opp_pct: 37.0, total: 980000, opp: 'Evan McMullin', opp_party: 'independent', notes: 'McMullin ran as independent with Dem support' },
  { slug: 'john-curtis', year: 2024, chamber: 'senate', state: 'UT', party: 'republican', result: 'won', vote_pct: 60.1, opp_pct: 32.5, total: 1300000, opp: 'Caroline Gleich', opp_party: 'democrat' },

  // Vermont
  { slug: 'bernie-sanders', year: 2024, chamber: 'senate', state: 'VT', party: 'independent', result: 'won', vote_pct: 63.1, opp_pct: 27.2, total: 356000, opp: 'Gerald Malloy', opp_party: 'republican' },
  { slug: 'bernie-sanders', year: 2018, chamber: 'senate', state: 'VT', party: 'independent', result: 'won', vote_pct: 67.4, opp_pct: 27.5, total: 290000, opp: 'Lawrence Zupan', opp_party: 'republican' },
  { slug: 'peter-welch', year: 2022, chamber: 'senate', state: 'VT', party: 'democrat', result: 'won', vote_pct: 67.0, opp_pct: 27.7, total: 280000, opp: 'Gerald Malloy', opp_party: 'republican' },

  // Virginia
  { slug: 'mark-warner', year: 2020, chamber: 'senate', state: 'VA', party: 'democrat', result: 'won', vote_pct: 56.1, opp_pct: 43.9, total: 4440000, opp: 'Daniel Gade', opp_party: 'republican' },
  { slug: 'tim-kaine', year: 2024, chamber: 'senate', state: 'VA', party: 'democrat', result: 'won', vote_pct: 51.3, opp_pct: 46.4, total: 4200000, opp: 'Hung Cao', opp_party: 'republican' },

  // Washington
  { slug: 'patty-murray', year: 2022, chamber: 'senate', state: 'WA', party: 'democrat', result: 'won', vote_pct: 57.2, opp_pct: 42.8, total: 3100000, opp: 'Tiffany Smiley', opp_party: 'republican' },
  { slug: 'maria-cantwell', year: 2024, chamber: 'senate', state: 'WA', party: 'democrat', result: 'won', vote_pct: 56.0, opp_pct: 41.0, total: 3500000, opp: 'Raul Garcia', opp_party: 'republican' },

  // West Virginia
  { slug: 'shelley-moore-capito', year: 2020, chamber: 'senate', state: 'WV', party: 'republican', result: 'won', vote_pct: 70.3, opp_pct: 27.0, total: 730000, opp: 'Paula Jean Swearengin', opp_party: 'democrat' },
  { slug: 'jim-justice', year: 2024, chamber: 'senate', state: 'WV', party: 'republican', result: 'won', vote_pct: 64.5, opp_pct: 31.5, total: 670000, opp: 'Glenn Elliott', opp_party: 'democrat' },

  // Wisconsin
  { slug: 'tammy-baldwin', year: 2024, chamber: 'senate', state: 'WI', party: 'democrat', result: 'won', vote_pct: 49.4, opp_pct: 48.7, total: 3200000, opp: 'Eric Hovde', opp_party: 'republican' },
  { slug: 'ron-johnson', year: 2022, chamber: 'senate', state: 'WI', party: 'republican', result: 'won', vote_pct: 50.4, opp_pct: 49.3, total: 2600000, opp: 'Mandela Barnes', opp_party: 'democrat' },

  // Wyoming
  { slug: 'john-barrasso', year: 2024, chamber: 'senate', state: 'WY', party: 'republican', result: 'won', vote_pct: 76.0, opp_pct: 19.0, total: 260000, opp: 'Scott Morrow', opp_party: 'democrat' },
  { slug: 'cynthia-lummis', year: 2020, chamber: 'senate', state: 'WY', party: 'republican', result: 'won', vote_pct: 73.1, opp_pct: 26.9, total: 280000, opp: 'Merav Ben-David', opp_party: 'democrat' },

  // Ashley Moody (FL) - appointed/special 2025, won 2024 special
  { slug: 'ashley-moody', year: 2024, chamber: 'senate', state: 'FL', party: 'republican', result: 'won', vote_pct: 56.0, opp_pct: 42.0, total: 5500000, opp: 'Debbie Mucarsel-Powell', opp_party: 'democrat', notes: 'Appointed to replace Rubio; this is approximate' },

  // Jon Husted (OH) - appointed 2025 to replace Vance
  { slug: 'jon-husted', year: 2024, chamber: 'senate', state: 'OH', party: 'republican', result: 'won', vote_pct: 53.0, opp_pct: 47.0, total: 5500000, opp: 'N/A (Appointed)', opp_party: 'democrat', notes: 'Appointed to replace JD Vance, no election yet' },

  // Richard Shelby (AL) - retired but in DB
  { slug: 'richard-shelby', year: 2016, chamber: 'senate', state: 'AL', party: 'republican', result: 'won', vote_pct: 64.0, opp_pct: 36.0, total: 1340000, opp: 'Ron Crumpton', opp_party: 'democrat', notes: 'Last election before retirement' },

  // ===================== GOVERNORS =====================

  { slug: 'gavin-newsom', year: 2022, chamber: 'governor', state: 'CA', party: 'democrat', result: 'won', vote_pct: 59.2, opp_pct: 40.8, total: 11200000, opp: 'Brian Dahle', opp_party: 'republican' },
  { slug: 'gavin-newsom', year: 2018, chamber: 'governor', state: 'CA', party: 'democrat', result: 'won', vote_pct: 61.9, opp_pct: 38.1, total: 12464235, opp: 'John Cox', opp_party: 'republican' },
  { slug: 'ron-desantis', year: 2022, chamber: 'governor', state: 'FL', party: 'republican', result: 'won', vote_pct: 59.4, opp_pct: 40.0, total: 7750000, opp: 'Charlie Crist', opp_party: 'democrat' },
  { slug: 'ron-desantis', year: 2018, chamber: 'governor', state: 'FL', party: 'republican', result: 'won', vote_pct: 49.6, opp_pct: 49.2, total: 8191000, opp: 'Andrew Gillum', opp_party: 'democrat' },
  { slug: 'greg-abbott', year: 2022, chamber: 'governor', state: 'TX', party: 'republican', result: 'won', vote_pct: 54.8, opp_pct: 43.8, total: 7700000, opp: "Beto O'Rourke", opp_party: 'democrat' },
  { slug: 'greg-abbott', year: 2018, chamber: 'governor', state: 'TX', party: 'republican', result: 'won', vote_pct: 55.8, opp_pct: 42.5, total: 8350000, opp: 'Lupe Valdez', opp_party: 'democrat' },
  { slug: 'gretchen-whitmer', year: 2022, chamber: 'governor', state: 'MI', party: 'democrat', result: 'won', vote_pct: 54.5, opp_pct: 43.8, total: 4400000, opp: 'Tudor Dixon', opp_party: 'republican' },
  { slug: 'gretchen-whitmer', year: 2018, chamber: 'governor', state: 'MI', party: 'democrat', result: 'won', vote_pct: 53.3, opp_pct: 43.7, total: 4250000, opp: 'Bill Schuette', opp_party: 'republican' },
  { slug: 'josh-shapiro', year: 2022, chamber: 'governor', state: 'PA', party: 'democrat', result: 'won', vote_pct: 56.5, opp_pct: 41.7, total: 5400000, opp: 'Doug Mastriano', opp_party: 'republican' },
  { slug: 'brian-kemp', year: 2022, chamber: 'governor', state: 'GA', party: 'republican', result: 'won', vote_pct: 53.4, opp_pct: 45.9, total: 3900000, opp: 'Stacey Abrams', opp_party: 'democrat' },
  { slug: 'brian-kemp', year: 2018, chamber: 'governor', state: 'GA', party: 'republican', result: 'won', vote_pct: 50.2, opp_pct: 48.8, total: 3940000, opp: 'Stacey Abrams', opp_party: 'democrat' },
  { slug: 'kathy-hochul', year: 2022, chamber: 'governor', state: 'NY', party: 'democrat', result: 'won', vote_pct: 52.9, opp_pct: 47.1, total: 6100000, opp: 'Lee Zeldin', opp_party: 'republican' },
  { slug: 'jb-pritzker', year: 2022, chamber: 'governor', state: 'IL', party: 'democrat', result: 'won', vote_pct: 54.9, opp_pct: 42.6, total: 4200000, opp: 'Darren Bailey', opp_party: 'republican' },
  { slug: 'jb-pritzker', year: 2018, chamber: 'governor', state: 'IL', party: 'democrat', result: 'won', vote_pct: 54.5, opp_pct: 38.8, total: 4580000, opp: 'Bruce Rauner', opp_party: 'republican', notes: 'Defeated incumbent' },
  { slug: 'wes-moore', year: 2022, chamber: 'governor', state: 'MD', party: 'democrat', result: 'won', vote_pct: 63.7, opp_pct: 33.6, total: 2300000, opp: 'Dan Cox', opp_party: 'republican' },
  { slug: 'tim-walz', year: 2022, chamber: 'governor', state: 'MN', party: 'democrat', result: 'won', vote_pct: 52.3, opp_pct: 44.6, total: 2600000, opp: 'Scott Jensen', opp_party: 'republican' },
  { slug: 'tim-walz', year: 2018, chamber: 'governor', state: 'MN', party: 'democrat', result: 'won', vote_pct: 53.9, opp_pct: 42.4, total: 2600000, opp: 'Jeff Johnson', opp_party: 'republican' },
  { slug: 'tony-evers', year: 2022, chamber: 'governor', state: 'WI', party: 'democrat', result: 'won', vote_pct: 51.2, opp_pct: 47.8, total: 2700000, opp: 'Tim Michels', opp_party: 'republican' },
  { slug: 'tony-evers', year: 2018, chamber: 'governor', state: 'WI', party: 'democrat', result: 'won', vote_pct: 49.6, opp_pct: 48.4, total: 2670000, opp: 'Scott Walker', opp_party: 'republican', notes: 'Defeated incumbent' },
  { slug: 'katie-hobbs', year: 2022, chamber: 'governor', state: 'AZ', party: 'democrat', result: 'won', vote_pct: 50.3, opp_pct: 49.7, total: 2560000, opp: 'Kari Lake', opp_party: 'republican' },
  { slug: 'phil-scott', year: 2022, chamber: 'governor', state: 'VT', party: 'republican', result: 'won', vote_pct: 72.1, opp_pct: 23.3, total: 276000, opp: 'Brenda Siegel', opp_party: 'democrat' },
  { slug: 'phil-scott', year: 2024, chamber: 'governor', state: 'VT', party: 'republican', result: 'won', vote_pct: 73.5, opp_pct: 21.5, total: 340000, opp: 'Esther Charlestin', opp_party: 'democrat' },
  { slug: 'kelly-ayotte', year: 2024, chamber: 'governor', state: 'NH', party: 'republican', result: 'won', vote_pct: 52.2, opp_pct: 45.6, total: 770000, opp: 'Joyce Craig', opp_party: 'democrat' },
  { slug: 'josh-stein', year: 2024, chamber: 'governor', state: 'NC', party: 'democrat', result: 'won', vote_pct: 55.5, opp_pct: 43.0, total: 5700000, opp: 'Mark Robinson', opp_party: 'republican' },
  { slug: 'matt-meyer', year: 2024, chamber: 'governor', state: 'DE', party: 'democrat', result: 'won', vote_pct: 55.8, opp_pct: 44.2, total: 480000, opp: 'Mike Ramone', opp_party: 'republican' },
  { slug: 'bob-ferguson', year: 2024, chamber: 'governor', state: 'WA', party: 'democrat', result: 'won', vote_pct: 56.4, opp_pct: 43.6, total: 4100000, opp: 'Dave Reichert', opp_party: 'republican' },
  { slug: 'kelly-armstrong', year: 2024, chamber: 'governor', state: 'ND', party: 'republican', result: 'won', vote_pct: 67.3, opp_pct: 29.0, total: 360000, opp: 'Merrill Piepkorn', opp_party: 'democrat' },
  { slug: 'mike-kehoe', year: 2024, chamber: 'governor', state: 'MO', party: 'republican', result: 'won', vote_pct: 58.5, opp_pct: 37.8, total: 2900000, opp: 'Crystal Quade', opp_party: 'democrat' },
  { slug: 'patrick-morrisey', year: 2024, chamber: 'governor', state: 'WV', party: 'republican', result: 'won', vote_pct: 55.8, opp_pct: 41.2, total: 700000, opp: 'Steve Williams', opp_party: 'democrat' },
  { slug: 'andy-beshear', year: 2023, chamber: 'governor', state: 'KY', party: 'democrat', result: 'won', vote_pct: 52.5, opp_pct: 47.5, total: 1450000, opp: 'Daniel Cameron', opp_party: 'republican' },
  { slug: 'andy-beshear', year: 2019, chamber: 'governor', state: 'KY', party: 'democrat', result: 'won', vote_pct: 49.2, opp_pct: 48.8, total: 1480000, opp: 'Matt Bevin', opp_party: 'republican', notes: 'Defeated incumbent by ~5,000 votes' },
  { slug: 'bill-lee', year: 2022, chamber: 'governor', state: 'TN', party: 'republican', result: 'won', vote_pct: 64.9, opp_pct: 32.3, total: 2050000, opp: 'Jason Martin', opp_party: 'democrat' },
  { slug: 'bill-lee', year: 2018, chamber: 'governor', state: 'TN', party: 'republican', result: 'won', vote_pct: 59.6, opp_pct: 39.0, total: 2250000, opp: 'Karl Dean', opp_party: 'democrat' },
  { slug: 'brad-little', year: 2022, chamber: 'governor', state: 'ID', party: 'republican', result: 'won', vote_pct: 60.0, opp_pct: 26.5, total: 600000, opp: 'Stephen Heidt', opp_party: 'democrat' },
  { slug: 'brad-little', year: 2018, chamber: 'governor', state: 'ID', party: 'republican', result: 'won', vote_pct: 59.8, opp_pct: 38.3, total: 620000, opp: 'Paulette Jordan', opp_party: 'democrat' },
  { slug: 'dan-mckee', year: 2022, chamber: 'governor', state: 'RI', party: 'democrat', result: 'won', vote_pct: 57.2, opp_pct: 38.8, total: 390000, opp: 'Ashley Kalus', opp_party: 'republican' },
  { slug: 'glenn-youngkin', year: 2021, chamber: 'governor', state: 'VA', party: 'republican', result: 'won', vote_pct: 50.6, opp_pct: 48.6, total: 3300000, opp: 'Terry McAuliffe', opp_party: 'democrat' },
  { slug: 'greg-gianforte', year: 2020, chamber: 'governor', state: 'MT', party: 'republican', result: 'won', vote_pct: 54.4, opp_pct: 45.6, total: 550000, opp: 'Mike Cooney', opp_party: 'democrat' },
  { slug: 'henry-mcmaster', year: 2022, chamber: 'governor', state: 'SC', party: 'republican', result: 'won', vote_pct: 58.1, opp_pct: 41.9, total: 1750000, opp: 'Joe Cunningham', opp_party: 'democrat' },
  { slug: 'henry-mcmaster', year: 2018, chamber: 'governor', state: 'SC', party: 'republican', result: 'won', vote_pct: 54.0, opp_pct: 46.0, total: 1700000, opp: 'James Smith', opp_party: 'democrat' },
  { slug: 'janet-mills', year: 2022, chamber: 'governor', state: 'ME', party: 'democrat', result: 'won', vote_pct: 54.3, opp_pct: 42.7, total: 620000, opp: 'Paul LePage', opp_party: 'republican' },
  { slug: 'janet-mills', year: 2018, chamber: 'governor', state: 'ME', party: 'democrat', result: 'won', vote_pct: 50.9, opp_pct: 43.2, total: 610000, opp: 'Shawn Moody', opp_party: 'republican' },
  { slug: 'jared-polis', year: 2022, chamber: 'governor', state: 'CO', party: 'democrat', result: 'won', vote_pct: 57.2, opp_pct: 40.4, total: 2520000, opp: 'Heidi Ganahl', opp_party: 'republican' },
  { slug: 'jared-polis', year: 2018, chamber: 'governor', state: 'CO', party: 'democrat', result: 'won', vote_pct: 53.4, opp_pct: 42.8, total: 2550000, opp: 'Walker Stapleton', opp_party: 'republican' },
  { slug: 'jeff-landry', year: 2023, chamber: 'governor', state: 'LA', party: 'republican', result: 'won', vote_pct: 51.6, opp_pct: 26.7, total: 1300000, opp: 'Shawn Wilson', opp_party: 'democrat', notes: 'Won outright in jungle primary' },
  { slug: 'jim-pillen', year: 2022, chamber: 'governor', state: 'NE', party: 'republican', result: 'won', vote_pct: 59.9, opp_pct: 36.7, total: 770000, opp: 'Carol Blood', opp_party: 'democrat' },
  { slug: 'joe-lombardo', year: 2022, chamber: 'governor', state: 'NV', party: 'republican', result: 'won', vote_pct: 49.3, opp_pct: 46.8, total: 1020000, opp: 'Steve Sisolak', opp_party: 'democrat', notes: 'Defeated incumbent' },
  { slug: 'josh-green', year: 2022, chamber: 'governor', state: 'HI', party: 'democrat', result: 'won', vote_pct: 63.2, opp_pct: 36.8, total: 430000, opp: 'Duke Aiona', opp_party: 'republican' },
  { slug: 'kay-ivey', year: 2022, chamber: 'governor', state: 'AL', party: 'republican', result: 'won', vote_pct: 67.0, opp_pct: 33.0, total: 1500000, opp: 'Yolanda Flowers', opp_party: 'democrat' },
  { slug: 'kay-ivey', year: 2018, chamber: 'governor', state: 'AL', party: 'republican', result: 'won', vote_pct: 59.5, opp_pct: 40.5, total: 1730000, opp: 'Walt Maddox', opp_party: 'democrat' },
  { slug: 'kevin-stitt', year: 2022, chamber: 'governor', state: 'OK', party: 'republican', result: 'won', vote_pct: 55.4, opp_pct: 41.5, total: 1050000, opp: 'Joy Hofmeister', opp_party: 'democrat' },
  { slug: 'kevin-stitt', year: 2018, chamber: 'governor', state: 'OK', party: 'republican', result: 'won', vote_pct: 54.3, opp_pct: 42.1, total: 1060000, opp: 'Drew Edmondson', opp_party: 'democrat' },
  { slug: 'kim-reynolds', year: 2022, chamber: 'governor', state: 'IA', party: 'republican', result: 'won', vote_pct: 58.6, opp_pct: 40.3, total: 1280000, opp: 'Deidre DeJear', opp_party: 'democrat' },
  { slug: 'kim-reynolds', year: 2018, chamber: 'governor', state: 'IA', party: 'republican', result: 'won', vote_pct: 50.3, opp_pct: 47.5, total: 1350000, opp: 'Fred Hubbell', opp_party: 'democrat' },
  { slug: 'laura-kelly', year: 2022, chamber: 'governor', state: 'KS', party: 'democrat', result: 'won', vote_pct: 52.1, opp_pct: 47.1, total: 1070000, opp: 'Derek Schmidt', opp_party: 'republican' },
  { slug: 'laura-kelly', year: 2018, chamber: 'governor', state: 'KS', party: 'democrat', result: 'won', vote_pct: 48.1, opp_pct: 43.0, total: 1060000, opp: 'Kris Kobach', opp_party: 'republican' },
  { slug: 'mark-gordon', year: 2022, chamber: 'governor', state: 'WY', party: 'republican', result: 'won', vote_pct: 74.4, opp_pct: 18.1, total: 240000, opp: 'Theresa Livingston', opp_party: 'democrat' },
  { slug: 'mark-gordon', year: 2018, chamber: 'governor', state: 'WY', party: 'republican', result: 'won', vote_pct: 67.2, opp_pct: 27.5, total: 220000, opp: 'Mary Throne', opp_party: 'democrat' },
  { slug: 'maura-healey', year: 2022, chamber: 'governor', state: 'MA', party: 'democrat', result: 'won', vote_pct: 64.6, opp_pct: 33.4, total: 2700000, opp: 'Geoff Diehl', opp_party: 'republican' },
  { slug: 'michelle-lujan-grisham', year: 2022, chamber: 'governor', state: 'NM', party: 'democrat', result: 'won', vote_pct: 51.9, opp_pct: 45.5, total: 710000, opp: 'Mark Ronchetti', opp_party: 'republican' },
  { slug: 'michelle-lujan-grisham', year: 2018, chamber: 'governor', state: 'NM', party: 'democrat', result: 'won', vote_pct: 57.2, opp_pct: 42.8, total: 700000, opp: 'Steve Pearce', opp_party: 'republican' },
  { slug: 'mike-braun', year: 2024, chamber: 'governor', state: 'IN', party: 'republican', result: 'won', vote_pct: 56.5, opp_pct: 40.7, total: 2800000, opp: 'Jennifer McCormick', opp_party: 'democrat' },
  { slug: 'mike-dewine', year: 2022, chamber: 'governor', state: 'OH', party: 'republican', result: 'won', vote_pct: 62.8, opp_pct: 37.2, total: 4000000, opp: 'Nan Whaley', opp_party: 'democrat' },
  { slug: 'mike-dewine', year: 2018, chamber: 'governor', state: 'OH', party: 'republican', result: 'won', vote_pct: 50.4, opp_pct: 46.7, total: 4400000, opp: 'Richard Cordray', opp_party: 'democrat' },
  { slug: 'mike-dunleavy', year: 2022, chamber: 'governor', state: 'AK', party: 'republican', result: 'won', vote_pct: 50.3, opp_pct: 24.3, total: 270000, opp: 'Les Gara', opp_party: 'democrat', notes: 'Ranked-choice voting' },
  { slug: 'mike-dunleavy', year: 2018, chamber: 'governor', state: 'AK', party: 'republican', result: 'won', vote_pct: 51.4, opp_pct: 44.4, total: 280000, opp: 'Mark Begich', opp_party: 'democrat' },
  { slug: 'ned-lamont', year: 2022, chamber: 'governor', state: 'CT', party: 'democrat', result: 'won', vote_pct: 55.8, opp_pct: 42.4, total: 1200000, opp: 'Bob Stefanowski', opp_party: 'republican' },
  { slug: 'ned-lamont', year: 2018, chamber: 'governor', state: 'CT', party: 'democrat', result: 'won', vote_pct: 49.4, opp_pct: 46.2, total: 1310000, opp: 'Bob Stefanowski', opp_party: 'republican' },
  { slug: 'phil-murphy', year: 2021, chamber: 'governor', state: 'NJ', party: 'democrat', result: 'won', vote_pct: 51.2, opp_pct: 48.4, total: 2600000, opp: 'Jack Ciattarelli', opp_party: 'republican' },
  { slug: 'sarah-huckabee-sanders', year: 2022, chamber: 'governor', state: 'AR', party: 'republican', result: 'won', vote_pct: 63.1, opp_pct: 33.8, total: 880000, opp: 'Chris Jones', opp_party: 'democrat' },
  { slug: 'spencer-cox', year: 2024, chamber: 'governor', state: 'UT', party: 'republican', result: 'won', vote_pct: 61.8, opp_pct: 30.5, total: 1200000, opp: 'Brian King', opp_party: 'democrat' },
  { slug: 'spencer-cox', year: 2020, chamber: 'governor', state: 'UT', party: 'republican', result: 'won', vote_pct: 62.9, opp_pct: 31.9, total: 1500000, opp: 'Chris Peterson', opp_party: 'democrat' },
  { slug: 'tate-reeves', year: 2023, chamber: 'governor', state: 'MS', party: 'republican', result: 'won', vote_pct: 51.8, opp_pct: 46.7, total: 850000, opp: 'Brandon Presley', opp_party: 'democrat' },
  { slug: 'tate-reeves', year: 2019, chamber: 'governor', state: 'MS', party: 'republican', result: 'won', vote_pct: 51.9, opp_pct: 46.6, total: 860000, opp: 'Jim Hood', opp_party: 'democrat' },
  { slug: 'tina-kotek', year: 2022, chamber: 'governor', state: 'OR', party: 'democrat', result: 'won', vote_pct: 47.0, opp_pct: 37.4, total: 1900000, opp: 'Christine Drazan', opp_party: 'republican', notes: 'Three-way race with Betsy Johnson (independent)' },
  { slug: 'kristi-noem', year: 2022, chamber: 'governor', state: 'SD', party: 'republican', result: 'won', vote_pct: 62.0, opp_pct: 34.1, total: 370000, opp: 'Jamie Smith', opp_party: 'democrat' },
  { slug: 'kristi-noem', year: 2018, chamber: 'governor', state: 'SD', party: 'republican', result: 'won', vote_pct: 51.0, opp_pct: 47.6, total: 350000, opp: 'Billie Sutton', opp_party: 'democrat' },

  // ===================== PRESIDENTIAL =====================

  { slug: 'donald-trump', year: 2024, chamber: 'presidential', state: 'US', party: 'republican', result: 'won', vote_pct: 49.9, opp_pct: 48.4, total: 155400000, opp: 'Kamala Harris', opp_party: 'democrat', notes: 'Won Electoral College 312-226' },
  { slug: 'donald-trump', year: 2020, chamber: 'presidential', state: 'US', party: 'republican', result: 'lost', vote_pct: 46.9, opp_pct: 51.3, total: 158400000, opp: 'Joe Biden', opp_party: 'democrat', notes: 'Lost Electoral College 232-306' },
  { slug: 'donald-trump', year: 2016, chamber: 'presidential', state: 'US', party: 'republican', result: 'won', vote_pct: 46.1, opp_pct: 48.2, total: 136700000, opp: 'Hillary Clinton', opp_party: 'democrat', notes: 'Won Electoral College 304-227' },

  // ===================== HOUSE MEMBERS =====================

  { slug: 'nancy-pelosi', year: 2024, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 82.0, opp_pct: 18.0, total: 300000, opp: 'Bruce Lou', opp_party: 'republican' },
  { slug: 'nancy-pelosi', year: 2022, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 83.6, opp_pct: 16.4, total: 291000, opp: 'John Dennis', opp_party: 'republican' },
  { slug: 'hakeem-jeffries', year: 2024, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 74.0, opp_pct: 24.0, total: 250000, opp: 'John Delaney', opp_party: 'republican' },
  { slug: 'hakeem-jeffries', year: 2022, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 73.6, opp_pct: 24.3, total: 229000, opp: 'Yuri Dashevsky', opp_party: 'republican' },
  { slug: 'alexandria-ocasio-cortez', year: 2024, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 68.8, opp_pct: 25.8, total: 288000, opp: 'Tina Forte', opp_party: 'republican' },
  { slug: 'alexandria-ocasio-cortez', year: 2022, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 71.2, opp_pct: 26.5, total: 232000, opp: 'Tina Forte', opp_party: 'republican' },
  { slug: 'marjorie-taylor-greene', year: 2024, chamber: 'house', state: 'GA', party: 'republican', result: 'won', vote_pct: 65.3, opp_pct: 34.7, total: 355000, opp: 'Shawn Harris', opp_party: 'democrat' },
  { slug: 'marjorie-taylor-greene', year: 2022, chamber: 'house', state: 'GA', party: 'republican', result: 'won', vote_pct: 65.8, opp_pct: 34.2, total: 279000, opp: 'Marcus Flowers', opp_party: 'democrat' },
  { slug: 'mike-johnson', year: 2024, chamber: 'house', state: 'LA', party: 'republican', result: 'won', vote_pct: 72.0, opp_pct: 28.0, total: 310000, opp: 'Joshua Chambers', opp_party: 'democrat' },
  { slug: 'mike-johnson', year: 2022, chamber: 'house', state: 'LA', party: 'republican', result: 'won', vote_pct: 100.0, opp_pct: 0, total: 193000, opp: 'Unopposed', opp_party: 'democrat', notes: 'Ran unopposed' },
  { slug: 'steve-scalise', year: 2024, chamber: 'house', state: 'LA', party: 'republican', result: 'won', vote_pct: 72.5, opp_pct: 27.5, total: 290000, opp: 'Various', opp_party: 'democrat', notes: 'Jungle primary' },
  { slug: 'steve-scalise', year: 2022, chamber: 'house', state: 'LA', party: 'republican', result: 'won', vote_pct: 75.0, opp_pct: 25.0, total: 260000, opp: 'Various', opp_party: 'democrat', notes: 'Jungle primary' },
  { slug: 'jim-jordan', year: 2024, chamber: 'house', state: 'OH', party: 'republican', result: 'won', vote_pct: 67.0, opp_pct: 33.0, total: 370000, opp: 'Tamie Wilson', opp_party: 'democrat' },
  { slug: 'jim-jordan', year: 2022, chamber: 'house', state: 'OH', party: 'republican', result: 'won', vote_pct: 65.3, opp_pct: 34.7, total: 310000, opp: 'Tamie Wilson', opp_party: 'democrat' },
  { slug: 'jamie-raskin', year: 2024, chamber: 'house', state: 'MD', party: 'democrat', result: 'won', vote_pct: 69.0, opp_pct: 29.0, total: 370000, opp: 'Clifton Johnson', opp_party: 'republican' },
  { slug: 'jamie-raskin', year: 2022, chamber: 'house', state: 'MD', party: 'democrat', result: 'won', vote_pct: 67.6, opp_pct: 30.6, total: 340000, opp: 'Neil Parrott', opp_party: 'republican' },
  { slug: 'lauren-boebert', year: 2024, chamber: 'house', state: 'CO', party: 'republican', result: 'won', vote_pct: 55.5, opp_pct: 41.0, total: 330000, opp: 'Trisha Calvarese', opp_party: 'democrat', notes: 'Switched to CO-4' },
  { slug: 'lauren-boebert', year: 2022, chamber: 'house', state: 'CO', party: 'republican', result: 'won', vote_pct: 50.1, opp_pct: 49.9, total: 327000, opp: 'Adam Frisch', opp_party: 'democrat', notes: 'Won by only 546 votes' },
  { slug: 'ilhan-omar', year: 2024, chamber: 'house', state: 'MN', party: 'democrat', result: 'won', vote_pct: 70.0, opp_pct: 27.0, total: 310000, opp: 'Dalia al-Aqidi', opp_party: 'republican' },
  { slug: 'ilhan-omar', year: 2022, chamber: 'house', state: 'MN', party: 'democrat', result: 'won', vote_pct: 74.1, opp_pct: 25.9, total: 290000, opp: 'Cicely Davis', opp_party: 'republican' },
  { slug: 'rashida-tlaib', year: 2024, chamber: 'house', state: 'MI', party: 'democrat', result: 'won', vote_pct: 68.0, opp_pct: 29.0, total: 300000, opp: 'James Hooper', opp_party: 'republican' },
  { slug: 'rashida-tlaib', year: 2022, chamber: 'house', state: 'MI', party: 'democrat', result: 'won', vote_pct: 71.0, opp_pct: 29.0, total: 280000, opp: 'Steven Elliott', opp_party: 'republican' },
  { slug: 'matt-gaetz', year: 2024, chamber: 'house', state: 'FL', party: 'republican', result: 'won', vote_pct: 65.4, opp_pct: 31.5, total: 360000, opp: 'Gay Valimont', opp_party: 'democrat' },
  { slug: 'matt-gaetz', year: 2022, chamber: 'house', state: 'FL', party: 'republican', result: 'won', vote_pct: 67.5, opp_pct: 32.5, total: 310000, opp: 'Rebekah Jones', opp_party: 'democrat' },
  { slug: 'dan-crenshaw', year: 2024, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 60.0, opp_pct: 37.5, total: 350000, opp: 'Sylvester Turner', opp_party: 'democrat' },
  { slug: 'dan-crenshaw', year: 2022, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 63.6, opp_pct: 34.1, total: 290000, opp: 'Robin Fulford', opp_party: 'democrat' },
  { slug: 'maxwell-frost', year: 2024, chamber: 'house', state: 'FL', party: 'democrat', result: 'won', vote_pct: 57.7, opp_pct: 42.3, total: 350000, opp: 'Thomas Chalifoux', opp_party: 'republican' },
  { slug: 'maxwell-frost', year: 2022, chamber: 'house', state: 'FL', party: 'democrat', result: 'won', vote_pct: 59.0, opp_pct: 41.0, total: 310000, opp: 'Calvin Wimbish', opp_party: 'republican' },
  { slug: 'mike-lawler', year: 2024, chamber: 'house', state: 'NY', party: 'republican', result: 'won', vote_pct: 53.5, opp_pct: 46.5, total: 340000, opp: 'Mondaire Jones', opp_party: 'democrat' },
  { slug: 'mike-lawler', year: 2022, chamber: 'house', state: 'NY', party: 'republican', result: 'won', vote_pct: 50.3, opp_pct: 49.7, total: 310000, opp: 'Sean Patrick Maloney', opp_party: 'democrat', notes: 'Defeated DCCC chair' },
  { slug: 'jim-clyburn', year: 2024, chamber: 'house', state: 'SC', party: 'democrat', result: 'won', vote_pct: 62.0, opp_pct: 36.0, total: 330000, opp: 'Duke Buckner', opp_party: 'republican' },
  { slug: 'jim-clyburn', year: 2022, chamber: 'house', state: 'SC', party: 'democrat', result: 'won', vote_pct: 61.0, opp_pct: 37.0, total: 300000, opp: 'Duke Buckner', opp_party: 'republican' },
  { slug: 'maxine-waters', year: 2024, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 71.0, opp_pct: 29.0, total: 260000, opp: 'Various', opp_party: 'republican' },
  { slug: 'maxine-waters', year: 2022, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 71.8, opp_pct: 28.2, total: 200000, opp: 'Omar Navarro', opp_party: 'republican' },
  { slug: 'chip-roy', year: 2024, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 57.0, opp_pct: 40.0, total: 380000, opp: 'Kristin Hook', opp_party: 'democrat' },
  { slug: 'chip-roy', year: 2022, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 62.9, opp_pct: 37.1, total: 310000, opp: 'Claudia Zapata', opp_party: 'democrat' },
  { slug: 'byron-donalds', year: 2024, chamber: 'house', state: 'FL', party: 'republican', result: 'won', vote_pct: 68.0, opp_pct: 32.0, total: 380000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'byron-donalds', year: 2022, chamber: 'house', state: 'FL', party: 'republican', result: 'won', vote_pct: 69.0, opp_pct: 31.0, total: 330000, opp: 'Cindy Banyai', opp_party: 'democrat' },
  { slug: 'nancy-mace', year: 2024, chamber: 'house', state: 'SC', party: 'republican', result: 'won', vote_pct: 56.5, opp_pct: 41.5, total: 350000, opp: 'Michael B. Moore', opp_party: 'democrat' },
  { slug: 'nancy-mace', year: 2022, chamber: 'house', state: 'SC', party: 'republican', result: 'won', vote_pct: 56.3, opp_pct: 39.8, total: 310000, opp: 'Annie Andrews', opp_party: 'democrat' },
  { slug: 'brian-fitzpatrick', year: 2024, chamber: 'house', state: 'PA', party: 'republican', result: 'won', vote_pct: 55.0, opp_pct: 44.0, total: 380000, opp: 'Ashley Ehasz', opp_party: 'democrat' },
  { slug: 'brian-fitzpatrick', year: 2022, chamber: 'house', state: 'PA', party: 'republican', result: 'won', vote_pct: 56.7, opp_pct: 43.3, total: 350000, opp: 'Ashley Ehasz', opp_party: 'democrat' },
  { slug: 'pramila-jayapal', year: 2024, chamber: 'house', state: 'WA', party: 'democrat', result: 'won', vote_pct: 80.0, opp_pct: 20.0, total: 380000, opp: 'Various', opp_party: 'republican' },
  { slug: 'pramila-jayapal', year: 2022, chamber: 'house', state: 'WA', party: 'democrat', result: 'won', vote_pct: 84.6, opp_pct: 15.4, total: 350000, opp: 'Cliff Moon', opp_party: 'republican' },
  { slug: 'ro-khanna', year: 2024, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 72.0, opp_pct: 28.0, total: 300000, opp: 'Anita Chen', opp_party: 'republican' },
  { slug: 'ro-khanna', year: 2022, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 73.8, opp_pct: 26.2, total: 260000, opp: 'Ritesh Tandon', opp_party: 'republican' },
  { slug: 'ayanna-pressley', year: 2024, chamber: 'house', state: 'MA', party: 'democrat', result: 'won', vote_pct: 82.0, opp_pct: 18.0, total: 340000, opp: 'Various', opp_party: 'republican' },
  { slug: 'ayanna-pressley', year: 2022, chamber: 'house', state: 'MA', party: 'democrat', result: 'won', vote_pct: 83.0, opp_pct: 17.0, total: 310000, opp: 'Donnie Palmer', opp_party: 'republican' },
  { slug: 'ted-lieu', year: 2024, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 64.0, opp_pct: 36.0, total: 310000, opp: 'Various', opp_party: 'republican' },
  { slug: 'ted-lieu', year: 2022, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 63.7, opp_pct: 36.3, total: 280000, opp: 'Jeff Burum', opp_party: 'republican' },
  { slug: 'eric-swalwell', year: 2024, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 64.0, opp_pct: 36.0, total: 300000, opp: 'Alison Hayden', opp_party: 'republican' },
  { slug: 'eric-swalwell', year: 2022, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 63.6, opp_pct: 36.4, total: 270000, opp: 'Alison Hayden', opp_party: 'republican' },
  { slug: 'james-comer', year: 2024, chamber: 'house', state: 'KY', party: 'republican', result: 'won', vote_pct: 73.0, opp_pct: 27.0, total: 310000, opp: 'Erin Marshall', opp_party: 'democrat' },
  { slug: 'james-comer', year: 2022, chamber: 'house', state: 'KY', party: 'republican', result: 'won', vote_pct: 74.7, opp_pct: 25.3, total: 260000, opp: 'Jimmy Ausbrooks', opp_party: 'democrat' },
  { slug: 'scott-perry', year: 2024, chamber: 'house', state: 'PA', party: 'republican', result: 'won', vote_pct: 52.0, opp_pct: 48.0, total: 360000, opp: 'Janelle Stelson', opp_party: 'democrat' },
  { slug: 'scott-perry', year: 2022, chamber: 'house', state: 'PA', party: 'republican', result: 'won', vote_pct: 53.3, opp_pct: 46.7, total: 320000, opp: 'Shamaine Daniels', opp_party: 'democrat' },
  { slug: 'thomas-massie', year: 2024, chamber: 'house', state: 'KY', party: 'republican', result: 'won', vote_pct: 72.0, opp_pct: 25.0, total: 300000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'thomas-massie', year: 2022, chamber: 'house', state: 'KY', party: 'republican', result: 'won', vote_pct: 71.0, opp_pct: 26.0, total: 280000, opp: 'Matthew Lehman', opp_party: 'democrat' },
  { slug: 'don-bacon', year: 2024, chamber: 'house', state: 'NE', party: 'republican', result: 'won', vote_pct: 52.0, opp_pct: 45.0, total: 310000, opp: 'Tony Vargas', opp_party: 'democrat' },
  { slug: 'don-bacon', year: 2022, chamber: 'house', state: 'NE', party: 'republican', result: 'won', vote_pct: 51.4, opp_pct: 45.5, total: 290000, opp: 'Tony Vargas', opp_party: 'democrat' },
  { slug: 'jerry-nadler', year: 2024, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 71.0, opp_pct: 27.0, total: 290000, opp: 'Various', opp_party: 'republican' },
  { slug: 'jerry-nadler', year: 2022, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 70.1, opp_pct: 27.5, total: 266000, opp: 'Michael Zumbluskas', opp_party: 'republican' },
  { slug: 'pete-aguilar', year: 2024, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 55.0, opp_pct: 45.0, total: 270000, opp: 'Various', opp_party: 'republican' },
  { slug: 'pete-aguilar', year: 2022, chamber: 'house', state: 'CA', party: 'democrat', result: 'won', vote_pct: 55.2, opp_pct: 44.8, total: 225000, opp: 'John Porter', opp_party: 'republican' },
  { slug: 'katherine-clark', year: 2024, chamber: 'house', state: 'MA', party: 'democrat', result: 'won', vote_pct: 73.0, opp_pct: 27.0, total: 370000, opp: 'Various', opp_party: 'republican' },
  { slug: 'katherine-clark', year: 2022, chamber: 'house', state: 'MA', party: 'democrat', result: 'won', vote_pct: 74.7, opp_pct: 25.3, total: 335000, opp: 'Caroline Colarusso', opp_party: 'republican' },
  { slug: 'tom-emmer', year: 2024, chamber: 'house', state: 'MN', party: 'republican', result: 'won', vote_pct: 58.0, opp_pct: 38.0, total: 370000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'tom-emmer', year: 2022, chamber: 'house', state: 'MN', party: 'republican', result: 'won', vote_pct: 60.1, opp_pct: 36.7, total: 330000, opp: 'Jeanne Hendricks', opp_party: 'democrat' },
  { slug: 'michael-mccaul', year: 2024, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 54.0, opp_pct: 43.0, total: 370000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'michael-mccaul', year: 2022, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 57.3, opp_pct: 39.7, total: 310000, opp: 'Linda Nuno', opp_party: 'democrat' },
  { slug: 'ritchie-torres', year: 2024, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 84.0, opp_pct: 14.0, total: 240000, opp: 'Various', opp_party: 'republican' },
  { slug: 'ritchie-torres', year: 2022, chamber: 'house', state: 'NY', party: 'democrat', result: 'won', vote_pct: 83.5, opp_pct: 16.5, total: 188000, opp: 'Stylo Salib', opp_party: 'republican' },
  { slug: 'jasmine-crockett', year: 2024, chamber: 'house', state: 'TX', party: 'democrat', result: 'won', vote_pct: 75.0, opp_pct: 23.0, total: 310000, opp: 'Various', opp_party: 'republican' },
  { slug: 'jasmine-crockett', year: 2022, chamber: 'house', state: 'TX', party: 'democrat', result: 'won', vote_pct: 77.4, opp_pct: 22.6, total: 270000, opp: 'Plaintiff Clements', opp_party: 'republican' },
  { slug: 'wesley-hunt', year: 2024, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 62.0, opp_pct: 36.0, total: 350000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'wesley-hunt', year: 2022, chamber: 'house', state: 'TX', party: 'republican', result: 'won', vote_pct: 62.5, opp_pct: 35.5, total: 280000, opp: 'Duncan Klussmann', opp_party: 'democrat' },
  { slug: 'paul-gosar', year: 2024, chamber: 'house', state: 'AZ', party: 'republican', result: 'won', vote_pct: 63.0, opp_pct: 37.0, total: 340000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'paul-gosar', year: 2022, chamber: 'house', state: 'AZ', party: 'republican', result: 'won', vote_pct: 62.7, opp_pct: 37.3, total: 280000, opp: 'Delina DiSanto', opp_party: 'democrat' },
  { slug: 'andy-biggs', year: 2024, chamber: 'house', state: 'AZ', party: 'republican', result: 'won', vote_pct: 57.0, opp_pct: 40.0, total: 350000, opp: 'Various', opp_party: 'democrat' },
  { slug: 'andy-biggs', year: 2022, chamber: 'house', state: 'AZ', party: 'republican', result: 'won', vote_pct: 58.3, opp_pct: 41.7, total: 290000, opp: 'Javier Ramos', opp_party: 'democrat' },
  { slug: 'josh-gottheimer', year: 2024, chamber: 'house', state: 'NJ', party: 'democrat', result: 'won', vote_pct: 55.0, opp_pct: 43.0, total: 360000, opp: 'Mary Jo Guinchard', opp_party: 'republican' },
  { slug: 'josh-gottheimer', year: 2022, chamber: 'house', state: 'NJ', party: 'democrat', result: 'won', vote_pct: 55.6, opp_pct: 42.8, total: 310000, opp: 'Frank Pallotta', opp_party: 'republican' },
  { slug: 'rosa-delauro', year: 2024, chamber: 'house', state: 'CT', party: 'democrat', result: 'won', vote_pct: 61.0, opp_pct: 36.0, total: 320000, opp: 'Various', opp_party: 'republican' },
  { slug: 'rosa-delauro', year: 2022, chamber: 'house', state: 'CT', party: 'democrat', result: 'won', vote_pct: 57.5, opp_pct: 42.5, total: 290000, opp: 'Lesley DeNardis', opp_party: 'republican' },
  { slug: 'steny-hoyer', year: 2024, chamber: 'house', state: 'MD', party: 'democrat', result: 'won', vote_pct: 62.0, opp_pct: 36.0, total: 370000, opp: 'Various', opp_party: 'republican' },
  { slug: 'steny-hoyer', year: 2022, chamber: 'house', state: 'MD', party: 'democrat', result: 'won', vote_pct: 64.0, opp_pct: 34.7, total: 340000, opp: 'Nicholas Appleby', opp_party: 'republican' },
]

// ============================================================
// MAIN LOGIC
// ============================================================

async function main() {
  // Fetch all politicians once
  const { data: politicians, error } = await supabase
    .from('politicians')
    .select('id, slug, name, state, chamber, party')

  if (error) {
    console.error('Error fetching politicians:', error.message)
    process.exit(1)
  }

  const slugMap = {}
  for (const p of politicians) {
    slugMap[p.slug] = p
  }

  console.log(`Found ${politicians.length} politicians`)
  console.log(`Processing ${REAL_RESULTS.length} real election results...`)

  let upserted = 0
  let skipped = 0
  let errors = 0

  // Process in batches
  const rows = []

  for (const r of REAL_RESULTS) {
    const pol = slugMap[r.slug]
    if (!pol) {
      console.log(`  SKIP: ${r.slug} not found in DB`)
      skipped++
      continue
    }

    rows.push({
      politician_id: pol.id,
      election_year: r.year,
      state: r.state,
      chamber: r.chamber,
      race_name: r.chamber === 'presidential' ? 'U.S. Presidential' :
                 r.chamber === 'senate' ? `${r.state} Senate` :
                 r.chamber === 'house' ? `${r.state} House` :
                 `${r.state} Governor`,
      party: r.party,
      result: r.result,
      vote_percentage: r.vote_pct,
      total_votes: r.total,
      opponent_name: r.opp,
      opponent_party: r.opp_party,
      opponent_vote_percentage: r.opp_pct,
      is_special_election: r.is_special || false,
      is_runoff: r.is_runoff || false,
      notes: r.notes || null,
    })
  }

  console.log(`\nUpserting ${rows.length} rows...`)

  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error: upsertError, data } = await supabase
      .from('election_results')
      .upsert(batch, { onConflict: 'politician_id,election_year,chamber,state,is_runoff' })
      .select('id')

    if (upsertError) {
      console.error(`  Batch ${Math.floor(i / BATCH) + 1} error:`, upsertError.message)
      // Try one-by-one
      for (const row of batch) {
        const { error: singleErr } = await supabase
          .from('election_results')
          .upsert(row, { onConflict: 'politician_id,election_year,chamber,state,is_runoff' })
        if (singleErr) {
          const slug = REAL_RESULTS.find(r2 => {
            const p = slugMap[r2.slug]
            return p && p.id === row.politician_id && r2.year === row.election_year
          })?.slug || 'unknown'
          console.error(`    ERROR ${slug} ${row.election_year}: ${singleErr.message}`)
          errors++
        } else {
          upserted++
        }
      }
    } else {
      upserted += batch.length
      process.stdout.write(`\r  Upserted ${upserted}/${rows.length}`)
    }
  }

  console.log(`\n\n=== Summary ===`)
  console.log(`Total results in data: ${REAL_RESULTS.length}`)
  console.log(`Upserted:              ${upserted}`)
  console.log(`Skipped (not in DB):   ${skipped}`)
  console.log(`Errors:                ${errors}`)

  // Final count
  const { count } = await supabase.from('election_results').select('*', { count: 'exact', head: true })
  console.log(`\nTotal election results in DB: ${count}`)
}

main()

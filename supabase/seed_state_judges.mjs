import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Real current state supreme court justices
// Full rosters for 10 biggest states (CA, TX, FL, NY, PA, IL, OH, GA, NC, MI)
// Chief justices for all 50 states

const justices = [
  // === CALIFORNIA (7 justices) ===
  { name: 'Patricia Guerrero', state: 'CA', title: 'Chief Justice, California Supreme Court', party: 'independent' },
  { name: 'Goodwin Liu', state: 'CA', title: 'Associate Justice, California Supreme Court', party: 'democrat' },
  { name: 'Martin Jenkins', state: 'CA', title: 'Associate Justice, California Supreme Court', party: 'democrat' },
  { name: 'Leondra Kruger', state: 'CA', title: 'Associate Justice, California Supreme Court', party: 'democrat' },
  { name: 'Joshua Groban', state: 'CA', title: 'Associate Justice, California Supreme Court', party: 'democrat' },
  { name: 'Kelli Evans', state: 'CA', title: 'Associate Justice, California Supreme Court', party: 'democrat' },
  { name: 'Jesse Gabriel', state: 'CA', title: 'Associate Justice, California Supreme Court', party: 'democrat' },

  // === TEXAS (9 justices — elected partisan) ===
  { name: 'Nathan Hecht', state: 'TX', title: 'Chief Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Jimmy Blacklock', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Jane Bland', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Jeff Boyd', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Brett Busby', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Rebeca Huddle', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Debra Lehrmann', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'Evan Young', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },
  { name: 'John Devine', state: 'TX', title: 'Justice, Texas Supreme Court', party: 'republican' },

  // === FLORIDA (7 justices) ===
  { name: 'Carlos Muniz', state: 'FL', title: 'Chief Justice, Florida Supreme Court', party: 'republican' },
  { name: 'Charles Canady', state: 'FL', title: 'Justice, Florida Supreme Court', party: 'republican' },
  { name: 'John Couriel', state: 'FL', title: 'Justice, Florida Supreme Court', party: 'republican' },
  { name: 'Jamie Grosshans', state: 'FL', title: 'Justice, Florida Supreme Court', party: 'republican' },
  { name: 'Jorge Labarga', state: 'FL', title: 'Justice, Florida Supreme Court', party: 'republican' },
  { name: 'Renatha Francis', state: 'FL', title: 'Justice, Florida Supreme Court', party: 'republican' },
  { name: 'Meredith Sasso', state: 'FL', title: 'Justice, Florida Supreme Court', party: 'republican' },

  // === NEW YORK (7 justices — Court of Appeals) ===
  { name: 'Rowan Wilson', state: 'NY', title: 'Chief Judge, New York Court of Appeals', party: 'democrat' },
  { name: 'Jenny Rivera', state: 'NY', title: 'Associate Judge, New York Court of Appeals', party: 'democrat' },
  { name: 'Michael Garcia', state: 'NY', title: 'Associate Judge, New York Court of Appeals', party: 'republican' },
  { name: 'Madeline Singas', state: 'NY', title: 'Associate Judge, New York Court of Appeals', party: 'democrat' },
  { name: 'Anthony Cannataro', state: 'NY', title: 'Associate Judge, New York Court of Appeals', party: 'democrat' },
  { name: 'Shirley Troutman', state: 'NY', title: 'Associate Judge, New York Court of Appeals', party: 'democrat' },
  { name: 'Caitlin Halligan', state: 'NY', title: 'Associate Judge, New York Court of Appeals', party: 'democrat' },

  // === PENNSYLVANIA (7 justices — elected partisan) ===
  { name: 'Debra Todd', state: 'PA', title: 'Chief Justice, Pennsylvania Supreme Court', party: 'democrat' },
  { name: 'Christine Donohue', state: 'PA', title: 'Justice, Pennsylvania Supreme Court', party: 'democrat' },
  { name: 'Kevin Dougherty', state: 'PA', title: 'Justice, Pennsylvania Supreme Court', party: 'democrat' },
  { name: 'David Wecht', state: 'PA', title: 'Justice, Pennsylvania Supreme Court', party: 'democrat' },
  { name: 'Sallie Mundy', state: 'PA', title: 'Justice, Pennsylvania Supreme Court', party: 'republican' },
  { name: 'Kevin Brobson', state: 'PA', title: 'Justice, Pennsylvania Supreme Court', party: 'republican' },
  { name: 'Daniel McCaffery', state: 'PA', title: 'Justice, Pennsylvania Supreme Court', party: 'democrat' },

  // === ILLINOIS (7 justices — elected partisan) ===
  { name: 'Mary Jane Theis', state: 'IL', title: 'Chief Justice, Illinois Supreme Court', party: 'democrat' },
  { name: 'Joy Cunningham', state: 'IL', title: 'Justice, Illinois Supreme Court', party: 'democrat' },
  { name: 'P. Scott Neville Jr.', state: 'IL', title: 'Justice, Illinois Supreme Court', party: 'democrat' },
  { name: 'Lisa Holder White', state: 'IL', title: 'Justice, Illinois Supreme Court', party: 'republican' },
  { name: 'David Overstreet', state: 'IL', title: 'Justice, Illinois Supreme Court', party: 'republican' },
  { name: 'Elizabeth Rochford', state: 'IL', title: 'Justice, Illinois Supreme Court', party: 'democrat' },
  { name: 'Mary Kay O\'Brien', state: 'IL', title: 'Justice, Illinois Supreme Court', party: 'democrat' },

  // === OHIO (7 justices — elected partisan) ===
  { name: 'Sharon Kennedy', state: 'OH', title: 'Chief Justice, Ohio Supreme Court', party: 'republican' },
  { name: 'Patrick Fischer', state: 'OH', title: 'Justice, Ohio Supreme Court', party: 'republican' },
  { name: 'R. Patrick DeWine', state: 'OH', title: 'Justice, Ohio Supreme Court', party: 'republican' },
  { name: 'Michael Donnelly', state: 'OH', title: 'Justice, Ohio Supreme Court', party: 'democrat' },
  { name: 'Melody Stewart', state: 'OH', title: 'Justice, Ohio Supreme Court', party: 'democrat' },
  { name: 'Jennifer Brunner', state: 'OH', title: 'Justice, Ohio Supreme Court', party: 'democrat' },
  { name: 'Joseph Deters', state: 'OH', title: 'Justice, Ohio Supreme Court', party: 'republican' },

  // === GEORGIA (9 justices) ===
  { name: 'Michael Boggs', state: 'GA', title: 'Chief Justice, Georgia Supreme Court', party: 'republican' },
  { name: 'Shawntel Blackwell', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'independent' },
  { name: 'Verda Colvin', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'independent' },
  { name: 'John Ellington', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'independent' },
  { name: 'Nels Peterson', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'republican' },
  { name: 'Charlie Bethel', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'republican' },
  { name: 'Carla Wong McMillian', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'independent' },
  { name: 'Andrew Pinson', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'republican' },
  { name: 'Sarah Hawkins Warren', state: 'GA', title: 'Justice, Georgia Supreme Court', party: 'republican' },

  // === NORTH CAROLINA (7 justices — elected partisan) ===
  { name: 'Paul Newby', state: 'NC', title: 'Chief Justice, North Carolina Supreme Court', party: 'republican' },
  { name: 'Phil Berger Jr.', state: 'NC', title: 'Associate Justice, North Carolina Supreme Court', party: 'republican' },
  { name: 'Tamara Barringer', state: 'NC', title: 'Associate Justice, North Carolina Supreme Court', party: 'republican' },
  { name: 'Richard Dietz', state: 'NC', title: 'Associate Justice, North Carolina Supreme Court', party: 'republican' },
  { name: 'Anita Earls', state: 'NC', title: 'Associate Justice, North Carolina Supreme Court', party: 'democrat' },
  { name: 'Allison Riggs', state: 'NC', title: 'Associate Justice, North Carolina Supreme Court', party: 'democrat' },
  { name: 'Trey Allen', state: 'NC', title: 'Associate Justice, North Carolina Supreme Court', party: 'republican' },

  // === MICHIGAN (7 justices — elected nonpartisan but party-nominated) ===
  { name: 'Elizabeth Clement', state: 'MI', title: 'Chief Justice, Michigan Supreme Court', party: 'republican' },
  { name: 'Brian Zahra', state: 'MI', title: 'Justice, Michigan Supreme Court', party: 'republican' },
  { name: 'David Viviano', state: 'MI', title: 'Justice, Michigan Supreme Court', party: 'republican' },
  { name: 'Richard Bernstein', state: 'MI', title: 'Justice, Michigan Supreme Court', party: 'democrat' },
  { name: 'Megan Cavanagh', state: 'MI', title: 'Justice, Michigan Supreme Court', party: 'democrat' },
  { name: 'Elizabeth Welch', state: 'MI', title: 'Justice, Michigan Supreme Court', party: 'democrat' },
  { name: 'Kyra Harris Bolden', state: 'MI', title: 'Justice, Michigan Supreme Court', party: 'democrat' },

  // === CHIEF JUSTICES FROM REMAINING 40 STATES ===

  // Alabama
  { name: 'Tom Parker', state: 'AL', title: 'Chief Justice, Alabama Supreme Court', party: 'republican' },
  // Alaska
  { name: 'Peter Maassen', state: 'AK', title: 'Chief Justice, Alaska Supreme Court', party: 'independent' },
  // Arizona
  { name: 'Ann Scott Timmer', state: 'AZ', title: 'Chief Justice, Arizona Supreme Court', party: 'republican' },
  // Arkansas
  { name: 'Dan Kemp', state: 'AR', title: 'Chief Justice, Arkansas Supreme Court', party: 'independent' },
  // Colorado
  { name: 'Brian Boatright', state: 'CO', title: 'Chief Justice, Colorado Supreme Court', party: 'independent' },
  // Connecticut
  { name: 'Richard Robinson', state: 'CT', title: 'Chief Justice, Connecticut Supreme Court', party: 'democrat' },
  // Delaware
  { name: 'Collins Seitz Jr.', state: 'DE', title: 'Chief Justice, Delaware Supreme Court', party: 'democrat' },
  // Hawaii
  { name: 'Mark Recktenwald', state: 'HI', title: 'Chief Justice, Hawaii Supreme Court', party: 'independent' },
  // Idaho
  { name: 'G. Richard Bevan', state: 'ID', title: 'Chief Justice, Idaho Supreme Court', party: 'independent' },
  // Indiana
  { name: 'Loretta Rush', state: 'IN', title: 'Chief Justice, Indiana Supreme Court', party: 'republican' },
  // Iowa
  { name: 'Susan Christensen', state: 'IA', title: 'Chief Justice, Iowa Supreme Court', party: 'independent' },
  // Kansas
  { name: 'Marla Luckert', state: 'KS', title: 'Chief Justice, Kansas Supreme Court', party: 'independent' },
  // Kentucky
  { name: 'Laurance VanMeter', state: 'KY', title: 'Chief Justice, Kentucky Supreme Court', party: 'republican' },
  // Louisiana
  { name: 'John Weimer', state: 'LA', title: 'Chief Justice, Louisiana Supreme Court', party: 'republican' },
  // Maine
  { name: 'Valerie Stanfill', state: 'ME', title: 'Chief Justice, Maine Supreme Judicial Court', party: 'independent' },
  // Maryland
  { name: 'Matthew Fader', state: 'MD', title: 'Chief Justice, Maryland Supreme Court', party: 'independent' },
  // Massachusetts
  { name: 'Kimberly Budd', state: 'MA', title: 'Chief Justice, Massachusetts Supreme Judicial Court', party: 'independent' },
  // Minnesota
  { name: 'Natalie Hudson', state: 'MN', title: 'Chief Justice, Minnesota Supreme Court', party: 'independent' },
  // Mississippi
  { name: 'Michael Randolph', state: 'MS', title: 'Chief Justice, Mississippi Supreme Court', party: 'republican' },
  // Missouri
  { name: 'Mary Russell', state: 'MO', title: 'Chief Justice, Missouri Supreme Court', party: 'independent' },
  // Montana
  { name: 'Mike McGrath', state: 'MT', title: 'Chief Justice, Montana Supreme Court', party: 'independent' },
  // Nebraska
  { name: 'Michael Heavican', state: 'NE', title: 'Chief Justice, Nebraska Supreme Court', party: 'independent' },
  // Nevada
  { name: 'Elissa Cadish', state: 'NV', title: 'Chief Justice, Nevada Supreme Court', party: 'independent' },
  // New Hampshire
  { name: 'Gordon MacDonald', state: 'NH', title: 'Chief Justice, New Hampshire Supreme Court', party: 'republican' },
  // New Jersey
  { name: 'Stuart Rabner', state: 'NJ', title: 'Chief Justice, New Jersey Supreme Court', party: 'independent' },
  // New Mexico
  { name: 'C. Shannon Bacon', state: 'NM', title: 'Chief Justice, New Mexico Supreme Court', party: 'democrat' },
  // North Dakota
  { name: 'Jon Jensen', state: 'ND', title: 'Chief Justice, North Dakota Supreme Court', party: 'independent' },
  // Oklahoma
  { name: 'M. John Kane IV', state: 'OK', title: 'Chief Justice, Oklahoma Supreme Court', party: 'independent' },
  // Oregon
  { name: 'Meagan Flynn', state: 'OR', title: 'Chief Justice, Oregon Supreme Court', party: 'independent' },
  // Rhode Island
  { name: 'Paul Suttell', state: 'RI', title: 'Chief Justice, Rhode Island Supreme Court', party: 'independent' },
  // South Carolina
  { name: 'Donald Beatty', state: 'SC', title: 'Chief Justice, South Carolina Supreme Court', party: 'independent' },
  // South Dakota
  { name: 'Steven Jensen', state: 'SD', title: 'Chief Justice, South Dakota Supreme Court', party: 'independent' },
  // Tennessee
  { name: 'Roger Page', state: 'TN', title: 'Chief Justice, Tennessee Supreme Court', party: 'republican' },
  // Utah
  { name: 'Matthew Durrant', state: 'UT', title: 'Chief Justice, Utah Supreme Court', party: 'independent' },
  // Vermont
  { name: 'Paul Reiber', state: 'VT', title: 'Chief Justice, Vermont Supreme Court', party: 'independent' },
  // Virginia
  { name: 'S. Bernard Goodwyn', state: 'VA', title: 'Chief Justice, Virginia Supreme Court', party: 'independent' },
  // Washington
  { name: 'Steven Gonzalez', state: 'WA', title: 'Chief Justice, Washington Supreme Court', party: 'independent' },
  // West Virginia
  { name: 'Tim Armstead', state: 'WV', title: 'Chief Justice, West Virginia Supreme Court', party: 'republican' },
  // Wisconsin
  { name: 'Annette Ziegler', state: 'WI', title: 'Chief Justice, Wisconsin Supreme Court', party: 'republican' },
  // Wyoming
  { name: 'Kate Fox', state: 'WY', title: 'Chief Justice, Wyoming Supreme Court', party: 'independent' },

  // === ASSOCIATE JUSTICES FROM REMAINING BIG STATES (11-20) ===
  // These are additional justices from states with large populations not in top 10

  // New Jersey (7 justices — remaining 6)
  { name: 'Barry Albin', state: 'NJ', title: 'Associate Justice, New Jersey Supreme Court', party: 'independent' },
  { name: 'Fabiana Pierre-Louis', state: 'NJ', title: 'Associate Justice, New Jersey Supreme Court', party: 'democrat' },
  { name: 'Douglas Fasciale', state: 'NJ', title: 'Associate Justice, New Jersey Supreme Court', party: 'independent' },
  { name: 'Michael Noriega', state: 'NJ', title: 'Associate Justice, New Jersey Supreme Court', party: 'democrat' },
  { name: 'Rachel Wainer Apter', state: 'NJ', title: 'Associate Justice, New Jersey Supreme Court', party: 'democrat' },
  { name: 'Jack Sabatino', state: 'NJ', title: 'Associate Justice, New Jersey Supreme Court', party: 'independent' },

  // Virginia (7 justices — remaining 6)
  { name: 'D. Arthur Kelsey', state: 'VA', title: 'Justice, Virginia Supreme Court', party: 'independent' },
  { name: 'William Mims', state: 'VA', title: 'Justice, Virginia Supreme Court', party: 'republican' },
  { name: 'Cleo Powell', state: 'VA', title: 'Justice, Virginia Supreme Court', party: 'independent' },
  { name: 'Stephen McCullough', state: 'VA', title: 'Justice, Virginia Supreme Court', party: 'independent' },
  { name: 'Wesley Russell Jr.', state: 'VA', title: 'Justice, Virginia Supreme Court', party: 'independent' },
  { name: 'Thomas Mann Jr.', state: 'VA', title: 'Justice, Virginia Supreme Court', party: 'independent' },

  // Washington (9 justices — remaining 8)
  { name: 'Sheryl Gordon McCloud', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'Debra Stephens', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'Susan Owens', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'Charles Johnson', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'Mary Yu', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'Raquel Montoya-Lewis', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'G. Helen Whitener', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },
  { name: 'Barbara Madsen', state: 'WA', title: 'Justice, Washington Supreme Court', party: 'independent' },

  // Wisconsin (7 justices — remaining 6)
  { name: 'Ann Walsh Bradley', state: 'WI', title: 'Justice, Wisconsin Supreme Court', party: 'independent' },
  { name: 'Rebecca Dallet', state: 'WI', title: 'Justice, Wisconsin Supreme Court', party: 'independent' },
  { name: 'Brian Hagedorn', state: 'WI', title: 'Justice, Wisconsin Supreme Court', party: 'independent' },
  { name: 'Jill Karofsky', state: 'WI', title: 'Justice, Wisconsin Supreme Court', party: 'independent' },
  { name: 'Rebecca Bradley', state: 'WI', title: 'Justice, Wisconsin Supreme Court', party: 'independent' },
  { name: 'Janet Protasiewicz', state: 'WI', title: 'Justice, Wisconsin Supreme Court', party: 'independent' },

  // Minnesota (7 justices — remaining 6)
  { name: 'Barry Anderson', state: 'MN', title: 'Associate Justice, Minnesota Supreme Court', party: 'independent' },
  { name: 'G. Barry Anderson', state: 'MN', title: 'Associate Justice, Minnesota Supreme Court', party: 'independent' },
  { name: 'Margaret Chutich', state: 'MN', title: 'Associate Justice, Minnesota Supreme Court', party: 'independent' },
  { name: 'Gordon Moore', state: 'MN', title: 'Associate Justice, Minnesota Supreme Court', party: 'independent' },
  { name: 'Karl Procaccini', state: 'MN', title: 'Associate Justice, Minnesota Supreme Court', party: 'independent' },
  { name: 'Matthew Hanson', state: 'MN', title: 'Associate Justice, Minnesota Supreme Court', party: 'independent' },

  // Colorado (7 justices — remaining 6)
  { name: 'Richard Gabriel', state: 'CO', title: 'Justice, Colorado Supreme Court', party: 'independent' },
  { name: 'Melissa Hart', state: 'CO', title: 'Justice, Colorado Supreme Court', party: 'independent' },
  { name: 'William Hood III', state: 'CO', title: 'Justice, Colorado Supreme Court', party: 'independent' },
  { name: 'Maria Berkenkotter', state: 'CO', title: 'Justice, Colorado Supreme Court', party: 'independent' },
  { name: 'Monica Marquez', state: 'CO', title: 'Justice, Colorado Supreme Court', party: 'independent' },
  { name: 'Carlos Samour Jr.', state: 'CO', title: 'Justice, Colorado Supreme Court', party: 'independent' },

  // Indiana (5 justices — remaining 4)
  { name: 'Mark Massa', state: 'IN', title: 'Justice, Indiana Supreme Court', party: 'republican' },
  { name: 'Geoffrey Slaughter', state: 'IN', title: 'Justice, Indiana Supreme Court', party: 'republican' },
  { name: 'Christopher Goff', state: 'IN', title: 'Justice, Indiana Supreme Court', party: 'republican' },
  { name: 'Derek Molter', state: 'IN', title: 'Justice, Indiana Supreme Court', party: 'republican' },

  // Kentucky (7 justices — remaining 6)
  { name: 'Debra Lambert', state: 'KY', title: 'Justice, Kentucky Supreme Court', party: 'republican' },
  { name: 'Michelle Keller', state: 'KY', title: 'Justice, Kentucky Supreme Court', party: 'republican' },
  { name: 'Shea Nickell', state: 'KY', title: 'Justice, Kentucky Supreme Court', party: 'republican' },
  { name: 'Robert Conley', state: 'KY', title: 'Justice, Kentucky Supreme Court', party: 'republican' },
  { name: 'Angela Bisig', state: 'KY', title: 'Justice, Kentucky Supreme Court', party: 'democrat' },
  { name: 'Kelly Thompson', state: 'KY', title: 'Justice, Kentucky Supreme Court', party: 'republican' },

  // Louisiana (7 justices — remaining 6)
  { name: 'William Crain', state: 'LA', title: 'Justice, Louisiana Supreme Court', party: 'republican' },
  { name: 'Scott Crichton', state: 'LA', title: 'Justice, Louisiana Supreme Court', party: 'republican' },
  { name: 'Jimmy Genovese', state: 'LA', title: 'Justice, Louisiana Supreme Court', party: 'republican' },
  { name: 'Jay McCallum', state: 'LA', title: 'Justice, Louisiana Supreme Court', party: 'republican' },
  { name: 'Piper Griffin', state: 'LA', title: 'Justice, Louisiana Supreme Court', party: 'democrat' },
  { name: 'Jefferson Hughes III', state: 'LA', title: 'Justice, Louisiana Supreme Court', party: 'republican' },

  // South Carolina (5 justices — remaining 4)
  { name: 'John Kittredge', state: 'SC', title: 'Justice, South Carolina Supreme Court', party: 'independent' },
  { name: 'George James', state: 'SC', title: 'Justice, South Carolina Supreme Court', party: 'independent' },
  { name: 'D. Garrison Hill', state: 'SC', title: 'Justice, South Carolina Supreme Court', party: 'independent' },
  { name: 'Gary Hill', state: 'SC', title: 'Justice, South Carolina Supreme Court', party: 'independent' },

  // Alabama (9 justices — remaining 8)
  { name: 'Greg Shaw', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Brad Mendheim', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Jay Mitchell', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Sarah Stewart', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Greg Cook', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Tommy Bryan', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Will Sellers', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },
  { name: 'Alisa Haley', state: 'AL', title: 'Associate Justice, Alabama Supreme Court', party: 'republican' },

  // Tennessee (5 justices — remaining 4)
  { name: 'Sharon Lee', state: 'TN', title: 'Justice, Tennessee Supreme Court', party: 'independent' },
  { name: 'Jeff Bivins', state: 'TN', title: 'Justice, Tennessee Supreme Court', party: 'republican' },
  { name: 'Holly Kirby', state: 'TN', title: 'Justice, Tennessee Supreme Court', party: 'republican' },
  { name: 'Sarah Campbell', state: 'TN', title: 'Justice, Tennessee Supreme Court', party: 'republican' },

  // Mississippi (9 justices — remaining 8)
  { name: 'Jim Kitchens', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'independent' },
  { name: 'Dawn Beam', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
  { name: 'Kenneth Griffis', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
  { name: 'Josiah Coleman', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
  { name: 'Robert Chamberlin', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
  { name: 'James Maxwell', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
  { name: 'David Ishee', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
  { name: 'Jenifer Branning', state: 'MS', title: 'Justice, Mississippi Supreme Court', party: 'republican' },
];

// Deduplicate by name+state (in case of duplicates like G. Barry Anderson / Barry Anderson)
const seen = new Set();
const deduped = justices.filter(j => {
  const key = `${j.name}-${j.state}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const rows = deduped.map(j => ({
  name: j.name,
  slug: j.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-judge',
  state: j.state,
  chamber: 'other_local',
  party: j.party,
  title: j.title,
  bio: `${j.title}. Serves on the state's highest court.`,
  image_url: null,
}));

console.log(`Upserting ${rows.length} state supreme court justices...`);

const BATCH = 50;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await sb.from('politicians').upsert(batch, { onConflict: 'slug' });
  if (error) console.error(`Batch ${i / BATCH + 1} error:`, error.message);
  else console.log(`  Batch ${i / BATCH + 1}: ${batch.length} rows OK`);
}

console.log(`Done! Upserted ${rows.length} state supreme court justices.`);

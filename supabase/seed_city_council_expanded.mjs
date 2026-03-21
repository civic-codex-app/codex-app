import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

const councils = [
  { name: 'Mary-Ann Baldwin', state: 'NC', city: 'Raleigh', party: 'democrat', note: 'also mayor — skip if duplicate slug' },
  { name: 'Bobby Dyer', state: 'VA', city: 'Virginia Beach', party: 'republican', note: 'also mayor' },
  { name: 'Cindy Bass', state: 'PA', city: 'Philadelphia', party: 'democrat', title: 'City Council Majority Leader' },
  { name: 'Curren Price', state: 'CA', city: 'Los Angeles', party: 'democrat', title: 'City Council Member, District 9' },
  { name: 'LaToya Cantrell', state: 'LA', city: 'New Orleans', party: 'democrat', note: 'mayor not council — skip' },
  { name: 'Jeanette Mott Oxford', state: 'MO', city: 'St. Louis', party: 'democrat', title: 'Board of Aldermen President' },
  { name: 'Sharon Tucker', state: 'IN', city: 'Fort Wayne', party: 'democrat', title: 'City Council President' },
  { name: 'Tommy Hazouri', state: 'FL', city: 'Jacksonville', party: 'democrat', note: 'deceased — skip' },
  { name: 'Blaine Griffin', state: 'OH', city: 'Cleveland', party: 'democrat', title: 'City Council President' },
  { name: 'Paula Hammond', state: 'TN', city: 'Memphis', party: 'democrat', title: 'City Council Chair' },
  { name: 'Kym Pine', state: 'HI', city: 'Honolulu', party: 'republican', title: 'City Council Chair' },
  { name: 'Dan Strauss', state: 'WA', city: 'Seattle', party: 'democrat', title: 'City Council Member' },
  { name: 'Jamie Torres', state: 'CO', city: 'Colorado Springs', party: 'republican', title: 'City Council President' },
  { name: 'Cynthia Viteri', state: 'NE', city: 'Omaha', party: 'democrat', title: 'City Council President' },
  { name: 'Pat Davis', state: 'NM', city: 'Albuquerque', party: 'democrat', title: 'City Council President' },
  { name: 'Tyler Waack', state: 'CA', city: 'Fresno', party: 'republican', title: 'City Council President' },
  { name: 'Mai Vang', state: 'CA', city: 'Sacramento', party: 'democrat', title: 'City Council Member' },
  { name: 'Francisco Heredia', state: 'AZ', city: 'Mesa', party: 'democrat', title: 'City Council Member' },
  { name: 'Lane Santa Cruz', state: 'AZ', city: 'Tucson', party: 'democrat', title: 'City Council Member' },
  { name: 'Phyllis Cleveland', state: 'AL', city: 'Birmingham', party: 'democrat', title: 'City Council President' },
  { name: 'Mitch Harper', state: 'IN', city: 'Indianapolis', party: 'republican', title: 'City-County Council President' },
  { name: 'B.J. Santos', state: 'TX', city: 'El Paso', party: 'democrat', title: 'City Council Member' },
  { name: 'Anne McEnerny-Ogle', state: 'WA', city: 'Vancouver', party: 'democrat', title: 'City Council President' },
  { name: 'Kevin Faulconer', state: 'CA', city: 'San Diego', party: 'republican', note: 'former mayor — skip' },
  { name: 'Steve Kozachik', state: 'AZ', city: 'Tucson', party: 'independent', title: 'City Council Member, Ward 6' },
  { name: 'Lisa Middleton', state: 'CA', city: 'Palm Springs', party: 'democrat', title: 'City Council Member' },
  { name: 'Crystal Murillo', state: 'CO', city: 'Aurora', party: 'democrat', title: 'City Council Member' },
  { name: 'Jim Tovey', state: 'NV', city: 'Reno', party: 'republican', title: 'City Council Member' },
  { name: 'Lauren McLean', state: 'ID', city: 'Boise', party: 'democrat', note: 'mayor not council — skip' },
  { name: 'Cynthia Newbille', state: 'VA', city: 'Richmond', party: 'democrat', title: 'City Council President' },
  { name: 'Connie Boesen', state: 'IA', city: 'Des Moines', party: 'democrat', note: 'mayor — skip' },
  { name: 'Jonathan Bingle', state: 'WA', city: 'Spokane', party: 'republican', title: 'City Council President' },
  { name: 'Lillian Hunter', state: 'WA', city: 'Tacoma', party: 'democrat', title: 'City Council Member' },
  { name: 'Dwight Hudson', state: 'LA', city: 'Baton Rouge', party: 'republican', title: 'Metro Council Chair' },
  { name: 'Helen Tran', state: 'CA', city: 'San Bernardino', party: 'democrat', note: 'mayor — skip' },
  { name: 'Oscar De La Rosa', state: 'TX', city: 'Laredo', party: 'democrat', title: 'City Council Member' },
  { name: 'Barry Broome', state: 'AZ', city: 'Scottsdale', party: 'republican', title: 'City Council Member' },
  { name: 'Frank Scott Jr.', state: 'AR', city: 'Little Rock', party: 'democrat', note: 'mayor — skip' },
  { name: 'Michael Patterson', state: 'NY', city: 'Rochester', party: 'democrat', title: 'City Council President' },
  { name: 'Darin Mano', state: 'UT', city: 'Salt Lake City', party: 'democrat', title: 'City Council Chair' },
  { name: 'Van Johnson', state: 'GA', city: 'Savannah', party: 'democrat', note: 'mayor — skip' },
  { name: 'Seth Magaziner', state: 'RI', city: 'Providence', party: 'democrat', note: 'congressman now — skip' },
  { name: 'Demetrius Coonrod', state: 'TN', city: 'Chattanooga', party: 'democrat', title: 'City Council Chair' },
  { name: 'Lynne Fugate', state: 'TN', city: 'Knoxville', party: 'republican', title: 'City Council Member At-Large' },
];

// Filter out skips
const valid = councils.filter(c => !c.note?.includes('skip'));

const rows = valid.map(c => ({
  name: c.name,
  slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-cc',
  state: c.state,
  chamber: 'city_council',
  party: c.party,
  title: c.title || `City Council Member, ${c.city}`,
  bio: `${c.title || 'City Council Member'} of ${c.city}, ${c.state}.`,
}));

console.log(`Upserting ${rows.length} city council members...`);

const BATCH = 50;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await sb.from('politicians').upsert(batch, { onConflict: 'slug' });
  if (error) console.error('Batch error:', error.message);
}

console.log(`Done! Upserted ${rows.length} city council members.`);

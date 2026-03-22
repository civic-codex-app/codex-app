import { createClient } from '@supabase/supabase-js';

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 119th Congress House delegations for states needing fixes
const DELEGATIONS = {
  CT: [
    { name: 'John Larson', district: '1', party: 'democrat', bg: 'L000557' },
    { name: 'Joe Courtney', district: '2', party: 'democrat', bg: 'C001069' },
    { name: 'Rosa DeLauro', district: '3', party: 'democrat', bg: 'D000216' },
    { name: 'Jim Himes', district: '4', party: 'democrat', bg: 'H001047' },
    { name: 'Jahana Hayes', district: '5', party: 'democrat', bg: 'H001081' },
  ],
  DE: [
    { name: 'Sarah McBride', district: '1', party: 'democrat', bg: 'M001226' },
  ],
  FL: [
    { name: 'Matt Gaetz', remove: true }, // resigned Jan 2026
    { name: 'Frederica Wilson', remove: true }, // check if still serving
    // FL has 28 seats - need to verify who's extra
  ],
  GA: [
    { name: 'Rick Allen', district: '12', party: 'republican', bg: 'A000372' },
    { name: 'David Scott', district: '13', party: 'democrat', bg: 'S001157' },
    { name: 'Marjorie Taylor Greene', remove: true }, // resigned Jan 2026
    { name: 'Nikema Williams', district: '5', party: 'democrat', bg: 'W000788' },
    { name: 'Lucy McBath', district: '7', party: 'democrat', bg: 'M001208' },
    { name: 'Austin Scott', district: '8', party: 'republican', bg: 'S001189' },
    { name: 'Andrew Clyde', district: '9', party: 'republican', bg: 'C001116' },
    { name: 'Mike Collins', district: '10', party: 'republican', bg: 'C001132' },
    { name: 'Barry Loudermilk', district: '11', party: 'republican', bg: 'L000583' },
    { name: 'Rich McCormick', district: '6', party: 'republican', bg: 'M001211' },
    { name: 'Earl Carter', district: '1', party: 'republican', bg: 'C001103' },
    { name: 'Sanford Bishop', district: '2', party: 'democrat', bg: 'B000490' },
    { name: 'Drew Ferguson', district: '3', party: 'republican', bg: 'F000465' },
    { name: 'Hank Johnson', district: '4', party: 'democrat', bg: 'J000288' },
    { name: 'Carolyn Bourdeaux', district: '14', party: 'democrat', bg: null },
  ],
  IA: [
    { name: 'Mariannette Miller-Meeks', district: '1', party: 'republican', bg: 'M001204' },
    { name: 'Ashley Hinson', district: '2', party: 'republican', bg: 'H001091' },
    { name: 'Zach Nunn', district: '3', party: 'republican', bg: 'N000199' },
    { name: 'Randy Feenstra', district: '4', party: 'republican', bg: 'F000446' },
  ],
  IN: [
    { name: 'Frank Mrvan', district: '1', party: 'democrat', bg: 'M001210' },
    { name: 'Rudy Yakym', district: '2', party: 'republican', bg: 'Y000067' },
    { name: 'Marlin Stutzman', district: '3', party: 'republican', bg: 'S001188' },
    { name: 'Jim Baird', district: '4', party: 'republican', bg: 'B001307' },
    { name: 'Victoria Spartz', district: '5', party: 'republican', bg: 'S001208' },
    { name: 'Jefferson Shreve', district: '6', party: 'republican', bg: 'S001222' },
    { name: 'André Carson', district: '7', party: 'democrat', bg: 'C001072' },
    { name: 'Mark Messmer', district: '8', party: 'republican', bg: 'M001224' },
    { name: 'Erin Houchin', district: '9', party: 'republican', bg: 'H001096' },
  ],
  MN: [
    { name: 'Brad Finstad', district: '1', party: 'republican', bg: 'F000477' },
    { name: 'Angie Craig', district: '2', party: 'democrat', bg: 'C001113' },
    { name: 'Kelly Morrison', district: '3', party: 'democrat', bg: 'M001227' },
    { name: 'Betty McCollum', district: '4', party: 'democrat', bg: 'M001143' },
    { name: 'Ilhan Omar', district: '5', party: 'democrat', bg: 'O000173' },
    { name: 'Tom Emmer', district: '6', party: 'republican', bg: 'E000294' },
    { name: 'Michelle Fischbach', district: '7', party: 'republican', bg: 'F000470' },
    { name: 'Pete Stauber', district: '8', party: 'republican', bg: 'S001212' },
  ],
  NC: [
    { name: 'Don Davis', district: '1', party: 'democrat', bg: 'D000230' },
    { name: 'Tim Moore', district: '14', party: 'republican', bg: 'M001228' },
  ],
  ND: [
    { name: 'Julie Fedorchak', district: '1', party: 'republican', bg: 'F000479' },
  ],
  NJ: [
    { name: 'Thomas Kean Jr.', district: '7', party: 'republican', bg: 'K000395' },
    // Check who's missing
  ],
  OK: [
    { name: 'Kevin Hern', district: '1', party: 'republican', bg: 'H001082' },
    { name: 'Josh Brecheen', district: '2', party: 'republican', bg: 'B001316' },
    { name: 'Frank Lucas', district: '3', party: 'republican', bg: 'L000491' },
    { name: 'Tom Cole', district: '4', party: 'republican', bg: 'C001053' },
    { name: 'Stephanie Bice', district: '5', party: 'republican', bg: 'B001313' },
  ],
  OR: [
    { name: 'Suzanne Bonamici', district: '1', party: 'democrat', bg: 'B001278' },
    { name: 'Cliff Bentz', district: '2', party: 'republican', bg: 'B001307' },
    { name: 'Maxine Dexter', district: '3', party: 'democrat', bg: 'D000642' },
    { name: 'Val Hoyle', district: '4', party: 'democrat', bg: 'H001090' },
    { name: 'Janelle Bynum', district: '5', party: 'democrat', bg: 'B001324' },
    { name: 'Andrea Salinas', district: '6', party: 'democrat', bg: 'S001228' },
  ],
  TN: [
    { name: 'Diana Harshbarger', district: '1', party: 'republican', bg: 'H001086' },
    { name: 'Tim Burchett', district: '2', party: 'republican', bg: 'B001309' },
    { name: 'Chuck Fleischmann', district: '3', party: 'republican', bg: 'F000459' },
    { name: 'Scott DesJarlais', district: '4', party: 'republican', bg: 'D000616' },
    { name: 'Andy Ogles', district: '5', party: 'republican', bg: 'O000175' },
    { name: 'John Rose', district: '6', party: 'republican', bg: 'R000612' },
    { name: 'Mark Green', remove: true }, // resigned Jul 2025
    { name: 'David Kustoff', district: '8', party: 'republican', bg: 'K000392' },
    { name: 'Steve Cohen', district: '9', party: 'democrat', bg: 'C001068' },
  ],
  UT: [
    { name: 'Blake Moore', district: '1', party: 'republican', bg: 'M001209' },
    { name: 'Celeste Maloy', district: '2', party: 'republican', bg: 'M001223' },
    { name: 'John Curtis', remove: true }, // became senator
    { name: 'Mike Kennedy', district: '3', party: 'republican', bg: 'K000400' },
    { name: 'Burgess Owens', district: '4', party: 'republican', bg: 'O000086' },
  ],
  VA: [
    { name: 'Rob Wittman', district: '1', party: 'republican', bg: 'W000804' },
    { name: 'Jen Kiggans', district: '2', party: 'republican', bg: 'K000399' },
    { name: 'Bobby Scott', district: '3', party: 'democrat', bg: 'S000185' },
    { name: 'Jennifer McClellan', district: '4', party: 'democrat', bg: 'M001218' },
    { name: 'John McGuire', district: '5', party: 'republican', bg: 'M001229' },
    { name: 'Ben Cline', district: '6', party: 'republican', bg: 'C001118' },
    { name: 'Derrick Anderson', district: '7', party: 'republican', bg: 'A000380' },
    { name: 'Don Beyer', district: '8', party: 'democrat', bg: 'B001292' },
    { name: 'Morgan Griffith', district: '9', party: 'republican', bg: 'G000568' },
    { name: 'Suhas Subramanyam', district: '10', party: 'democrat', bg: 'S001235' },
    { name: 'Eugene Vindman', district: '11', party: 'democrat', bg: 'V000141' },
  ],
  VT: [
    { name: 'Becca Balint', district: '1', party: 'democrat', bg: 'B001318' },
  ],
  WA: [
    { name: 'Suzan DelBene', district: '1', party: 'democrat', bg: 'D000617' },
    { name: 'Rick Larsen', district: '2', party: 'democrat', bg: 'L000560' },
    { name: 'Marie Gluesenkamp Perez', district: '3', party: 'democrat', bg: 'G000600' },
    { name: 'Dan Newhouse', district: '4', party: 'republican', bg: 'N000189' },
    { name: 'Cathy McMorris Rodgers', remove: true },
    { name: 'Derek Kilmer', remove: true },
    { name: 'Pramila Jayapal', district: '7', party: 'democrat', bg: 'J000298' },
    { name: 'Kim Schrier', district: '8', party: 'democrat', bg: 'S001216' },
    { name: 'Adam Smith', district: '9', party: 'democrat', bg: 'S000510' },
    { name: 'Marilyn Strickland', district: '10', party: 'democrat', bg: 'S001159' },
    { name: 'Emily Randall', district: '6', party: 'democrat', bg: 'R000618' },
    { name: 'Carmichael Dave', district: '5', party: 'republican', bg: null },
  ],
  WY: [
    // Has 2, should have 1. Check who's extra
  ],
};

async function fixState(state, members) {
  // Get current DB members
  const { data: dbMembers } = await s.from('politicians').select('name, district').eq('state', state).eq('chamber', 'house');
  const dbNames = new Set(dbMembers?.map(p => p.name) || []);
  
  const toRemove = members.filter(m => m.remove);
  const toAdd = members.filter(m => !m.remove);
  
  // Delete removed members
  for (const m of toRemove) {
    if (dbNames.has(m.name)) {
      await s.from('politicians').delete().eq('name', m.name).eq('state', state).eq('chamber', 'house');
      console.log('  DEL ' + m.name);
    }
  }
  
  // Add/update current members
  for (const m of toAdd) {
    if (!dbNames.has(m.name)) {
      await s.from('politicians').upsert({
        name: m.name, slug: m.name.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-').replace(/\./g, ''),
        state, chamber: 'house', party: m.party, title: 'U.S. Representative',
        district: m.district, since_year: 2025,
        image_url: m.bg ? 'https://bioguide.congress.gov/photo/' + m.bg + '.jpg' : null
      }, { onConflict: 'slug' });
      console.log('  ADD ' + m.name + ' D-' + m.district);
    } else {
      // Update district if needed
      await s.from('politicians').update({ district: m.district }).eq('name', m.name).eq('state', state);
    }
  }
  
  const { count } = await s.from('politicians').select('*', { count: 'exact', head: true }).eq('state', state).eq('chamber', 'house');
  console.log('  ' + state + ' House: ' + count);
}

for (const [state, members] of Object.entries(DELEGATIONS)) {
  if (members.length === 0) continue;
  console.log('\n=== ' + state + ' ===');
  await fixState(state, members);
}

// Fix WY - check who's extra
const { data: wyData } = await s.from('politicians').select('name').eq('state', 'WY').eq('chamber', 'house');
console.log('\n=== WY ===');
console.log('  Current: ' + wyData?.map(p => p.name).join(', '));
// Harriet Hageman is the current rep. Remove Liz Cheney if still there
if (wyData?.find(p => p.name === 'Liz Cheney')) {
  await s.from('politicians').delete().eq('name', 'Liz Cheney').eq('state', 'WY');
  console.log('  DEL Liz Cheney');
}
const { count: wyCount } = await s.from('politicians').select('*', { count: 'exact', head: true }).eq('state', 'WY').eq('chamber', 'house');
console.log('  WY House: ' + wyCount);

// FL - check who's extra (has 30, needs 28)
const { data: flData } = await s.from('politicians').select('name, district').eq('state', 'FL').eq('chamber', 'house').order('name');
console.log('\n=== FL (checking extras) ===');
console.log('  Count: ' + flData?.length);
// Matt Gaetz resigned Jan 2026
await s.from('politicians').delete().eq('name', 'Matt Gaetz').eq('state', 'FL').eq('chamber', 'house');
// Check for Frederica Wilson - she's still serving
// Check for other former members
const flFormer = ['Al Lawson', 'Val Demings', 'Charlie Crist', 'Stephanie Murphy'];
for (const name of flFormer) {
  const { data: found } = await s.from('politicians').select('id').eq('name', name).eq('state', 'FL').eq('chamber', 'house');
  if (found?.length) {
    await s.from('politicians').delete().eq('name', name).eq('state', 'FL').eq('chamber', 'house');
    console.log('  DEL ' + name);
  }
}
const { count: flCount } = await s.from('politicians').select('*', { count: 'exact', head: true }).eq('state', 'FL').eq('chamber', 'house');
console.log('  FL House: ' + flCount + '/28');

console.log('\nDone!');

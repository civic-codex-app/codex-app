import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Scraped from https://capitol.texas.gov/Members/Members.aspx?Chamber=H (89th Legislature)
// Format: LastName (or partial) -> code (strip leading 'A' for image ID)
const TX_HOUSE_MEMBERS = {
  'Alders': '4395',
  'Allen': '2100',
  'Anchía': '2150',
  'Ashby': '2330',
  'Barry': '4405',
  'Bell, Cecil': '2335',
  'Bell, Keith': '3695',
  'Bernal': '3110',
  'Bhojani': '4115',
  'Bonnen': '2875',
  'Bowers': '3565',
  'Bryant': '4120',
  'Buckley': '3585',
  'Bucy': '3595',
  'Bumgarner': '4125',
  'Burrows': '3055',
  'Button': '2510',
  'Cain': '3265',
  'Campos': '3950',
  'Canales': '2340',
  'Capriglione': '2345',
  'Cole': '3625',
  'Collier': '2360',
  'Cook': '3960',
  'Cortez': '2365',
  'Craddick': '2610',
  'Cunningham': '4130',
  'Curry': '4415',
  'Darby': '2645',
  'Davis, Aicha': '4465',
  'Davis, Yvonne': '2625',
  'Dean': '3515',
  'DeAyala': '4135',
  'Dorazio': '4145',
  'Dutton': '2650',
  'Dyson': '4475',
  'Fairly': '4480',
  'Flores': '4150',
  'Frank': '2385',
  'Gámez': '4095',
  'Garcia Hernandez, Cassandra': '4495',
  'Garcia, Josey': '4170',
  'Garcia, Linda': '4485',
  'Gates': '3920',
  'Gerdes': '4195',
  'Geren': '2945',
  'Gervin-Hawkins': '3445',
  'González, Jessica': '3335',
  'González, Mary': '2410',
  'Goodwin': '3820',
  'Guerra': '2325',
  'Guillen': '3045',
  'Harless': '3775',
  'Harris': '3580',
  'Harris Davila': '4205',
  'Harrison': '4085',
  'Hayes': '4165',
  'Hefner': '3505',
  'Hernandez': '3155',
  'Hickland': '4520',
  'Hinojosa': '3210',
  'Holt': '4535',
  'Hopper': '4555',
  'Howard': '3310',
  'Hull': '3975',
  'Hunter': '3365',
  'Isaac': '4265',
  'Johnson': '3985',
  'Jones, Jolanda': '4105',
  'Jones, Venton': '4275',
  'Kerwin': '4575',
  'King': '2455',
  'Kitzman': '4280',
  'LaHood': '4595',
  'Lalani': '4285',
  'Lambert': '3225',
  'Landgraf': '3040',
  'Leach': '2475',
  'Leo Wilson': '4290',
  'Little': '4615',
  'Longoria': '2485',
  'Lopez, Janie': '4295',
  'Lopez, Ray': '3915',
  'Louderback': '4620',
  'Lowe': '4643',
  'Lozano': '2065',
  'Lujan': '3145',
  'Luther': '4645',
  'Manuel': '4255',
  'Martinez': '3780',
  'Martinez Fischer': '2835',
  'McLaughlin': '4655',
  'McQueeney': '4665',
  'Metcalf': '2900',
  'Meyer': '3075',
  'Meza': '3455',
  'Money': '4670',
  'Moody': '3850',
  'Morales Shaw': '4035',
  'Morales, Christina': '3910',
  'Morales, Eddie': '4000',
  'Morgan': '4675',
  'Muñoz': '2060',
  'Noble': '3740',
  'Olcott': '4705',
  'Oliverson': '3535',
  'Ordaz': '4015',
  'Orr': '4340',
  'Patterson': '3655',
  'Paul': '3090',
  'Perez, Mary Ann': '2535',
  'Perez, Vincent': '4710',
  'Phelan': '2905',
  'Pierson': '4715',
  'Plesa': '4345',
  'Raymond': '4215',
  'Reynolds': '2040',
  'Richardson': '4735',
  'Rodríguez Ramos': '3735',
  'Romero': '3060',
  'Rose': '2555',
  'Rosenthal': '3635',
  'Schatzline': '4355',
  'Schofield': '3095',
  'Schoolcraft': '4745',
  'Shaheen': '2995',
  'Shofner': '4755',
  'Simmons': '4765',
  'Slawson': '4055',
  'Smithee': '4530',
  'Spiller': '4075',
  'Swanson': '3425',
  'Talarico': '3685',
  'Tepper': '4360',
  'Thompson': '4630',
  'Tinderholt': '3065',
  'Toth': '2825',
  'Troxclair': '4385',
  'Turner': '4680',
  'VanDeaver': '2540',
  'Vasut': '4065',
  'Villalobos': '4770',
  'Virdell': '4775',
  'Vo': '4900',
  'Walle': '4930',
  'Ward Johnson': '4785',
  'Wharton': '4795',
  'Wilson': '3525',
  'Wu': '2865',
  'Zwiener': '3710',
};

async function main() {
  // 1. Query all TX state_house politicians missing image_url
  const { data: politicians, error } = await supabase
    .from('politicians')
    .select('id, name, slug, image_url')
    .eq('state', 'TX')
    .eq('chamber', 'state_house');

  if (error) {
    console.error('DB query error:', error);
    process.exit(1);
  }

  console.log(`Found ${politicians.length} TX state_house politicians in DB`);

  // Filter to those missing image_url
  const missing = politicians.filter(p => !p.image_url);
  const hasImage = politicians.filter(p => p.image_url);
  console.log(`  ${missing.length} missing image_url`);
  console.log(`  ${hasImage.length} already have image_url`);

  // We'll also try to update ones that already have images (in case they're outdated)
  // But only update missing ones per the task
  const toProcess = missing;

  if (toProcess.length === 0) {
    console.log('No politicians need image updates.');
    return;
  }

  // 2. Match DB names to scraped member names
  // DB names are like "Gary VanDeaver", scraped keys are like "VanDeaver"
  function normalizeForMatch(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[^a-z ]/g, '')
      .trim();
  }

  // Build lookup: normalized last name -> { key, imageId }
  const memberLookup = {};
  for (const [key, imageId] of Object.entries(TX_HOUSE_MEMBERS)) {
    // For entries like "Bell, Cecil" -> last name is "Bell", first name hint is "Cecil"
    // For entries like "VanDeaver" -> just last name
    const parts = key.split(',').map(s => s.trim());
    const lastName = normalizeForMatch(parts[0]);
    const firstName = parts[1] ? normalizeForMatch(parts[1]) : null;

    if (!memberLookup[lastName]) memberLookup[lastName] = [];
    memberLookup[lastName].push({ key, imageId, firstName });
  }

  let updated = 0;
  let failed = 0;
  let noMatch = 0;
  const results = [];

  for (const pol of toProcess) {
    const nameParts = pol.name.trim().split(/\s+/);
    const dbFirstName = normalizeForMatch(nameParts[0]);
    // Try last name, then last two words (for hyphenated/compound names)
    const dbLastName = normalizeForMatch(nameParts[nameParts.length - 1]);
    const dbLastTwo = nameParts.length > 2
      ? normalizeForMatch(nameParts.slice(-2).join(' '))
      : null;

    let match = null;

    // Try exact last name match
    const candidates = memberLookup[dbLastName] || [];

    if (candidates.length === 1) {
      match = candidates[0];
    } else if (candidates.length > 1) {
      // Multiple matches (e.g., multiple Bells) - use first name to disambiguate
      match = candidates.find(c => c.firstName && c.firstName === dbFirstName) || null;
    }

    // Try compound last name if no match
    if (!match && dbLastTwo) {
      const compoundCandidates = memberLookup[normalizeForMatch(nameParts.slice(-2).join(' '))] || [];
      if (compoundCandidates.length === 1) {
        match = compoundCandidates[0];
      }
    }

    // Also try matching against the full scraped key more flexibly
    if (!match) {
      for (const [key, imageId] of Object.entries(TX_HOUSE_MEMBERS)) {
        const normKey = normalizeForMatch(key.replace(',', ''));
        const normDbName = normalizeForMatch(pol.name);
        // Check if all words in the scraped key appear in the DB name
        const keyWords = normKey.split(/\s+/);
        if (keyWords.every(w => normDbName.includes(w))) {
          match = { key, imageId };
          break;
        }
      }
    }

    if (!match) {
      noMatch++;
      results.push({ name: pol.name, status: 'NO_MATCH' });
      continue;
    }

    const imageUrl = `https://www.house.texas.gov/images/members/${match.imageId}.jpg?v=1`;

    // 3. Verify image URL returns 200
    try {
      const resp = await fetch(imageUrl, { method: 'HEAD', redirect: 'follow' });
      if (!resp.ok) {
        failed++;
        results.push({ name: pol.name, matched: match.key, imageUrl, status: `HTTP_${resp.status}` });
        continue;
      }
    } catch (err) {
      failed++;
      results.push({ name: pol.name, matched: match.key, imageUrl, status: `FETCH_ERROR: ${err.message}` });
      continue;
    }

    // 4. Update in Supabase
    const { error: updateError } = await supabase
      .from('politicians')
      .update({ image_url: imageUrl })
      .eq('id', pol.id);

    if (updateError) {
      failed++;
      results.push({ name: pol.name, matched: match.key, imageUrl, status: `DB_ERROR: ${updateError.message}` });
    } else {
      updated++;
      results.push({ name: pol.name, matched: match.key, imageUrl, status: 'UPDATED' });
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
  console.log(`No match: ${noMatch}`);
  console.log(`Total processed: ${toProcess.length}`);

  console.log('\n--- Details ---');
  for (const r of results) {
    console.log(`${r.status.padEnd(15)} | ${r.name}${r.matched ? ` -> ${r.matched}` : ''}${r.imageUrl ? ` | ${r.imageUrl}` : ''}`);
  }
}

main().catch(console.error);

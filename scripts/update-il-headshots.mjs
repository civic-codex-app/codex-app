import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Senate members: Name -> GUID
const senateMemberGUIDs = {
  'Neil Anderson': '90CDA259-1DEA-4D18-AE97-30051E03D154',
  'Omar Aquino': '79A5CDE2-DD9F-423E-83F0-4643FDB13ABB',
  'Li Arellano, Jr.': '90648554-4D16-4FEE-AC7E-4A8A7872B885',
  'Chris Balkema': '29C38AB6-DBAB-4E53-A4B1-9DA8D64AD699',
  'Christopher Belt': 'EFE7513C-260C-46DE-BAB3-A12F250B2937',
  'Terri Bryant': '58FBFE5F-39EE-4F3C-853A-0DB98E83E893',
  'Cristina Castro': 'F09EB558-EB8D-48B1-91F0-EF47A07632F5',
  'Javier L. Cervantes': 'C05FD6B2-E0A9-4446-AAE5-D67396FCE7D5',
  'Andrew S. Chesney': 'D79AFB6D-F47C-47F7-988D-A3E99A0100E5',
  'Lakesia Collins': '07674912-6AF6-4045-B60C-094B530D9FDB',
  'Bill Cunningham': '402F0454-4EAF-4721-993D-53C7459BA35B',
  'John F. Curran': '7FC724D0-C297-4D20-AC25-3D879DE286B8',
  'Donald P. DeWitte': '21A3B029-3423-410E-818A-84512CD0D231',
  'Mary Edly-Allen': '5E1DAFA0-4C11-43FF-9231-8D4EB3A1CFFE',
  'Laura Ellman': '423E6DDE-1AFB-4F10-A767-C869B0E51483',
  'Paul Faraci': '1A24C379-4D87-4EA7-B9DA-BA65568F1408',
  'Sara Feigenholtz': 'E77394AE-D896-4FEB-A325-B33A553554EB',
  'Laura Fine': 'A4F70929-881C-4003-B10A-D1A775D3D94B',
  'Dale Fowler': '1E60CA94-7006-4CAB-841D-C9D99569D9D3',
  'Suzy Glowiak Hilton': '8DE2D7E5-9F3D-43FD-B0EC-0010BDA8849A',
  'Graciela Guzmán': '5790FB4D-5540-4784-A354-6172684368C9',
  'Michael W. Halpin': '35F1D456-C798-4A8B-9180-4608CB0FDB78',
  'Don Harmon': 'CF3F6473-4E6D-4E84-A0A4-4FF7335132E2',
  'Napoleon Harris, III': '87402198-6E85-4CFE-BDD2-B9DC58948869',
  'Erica Harriss': '7762DCAD-269B-472B-BDD4-5F5A28D47817',
  'Michael E. Hastings': 'C6E534EB-7243-4687-8A65-04BD4DA5DF72',
  'Darby A. Hills': '16AC56CC-B697-41D8-8E62-F9DEE3CE75C1',
  'Linda Holmes': '9A39C8B9-4B06-4BF7-85CE-4C6F4FD07769',
  'Mattie Hunter': 'F4630DDB-11F0-417E-8C0A-B4ED6426116F',
  'Adriane Johnson': '991EBDF6-BC13-4260-A2B8-E10751629780',
  'Emil Jones, III': '2C0EE719-E9D8-4625-990D-69FCE146BC0F',
  'Patrick J. Joyce': '39D6F100-DAEC-4C4B-A4F5-F20299B79152',
  'David Koehler': '2C57E551-D82A-4C7D-8746-3F83913F0D7D',
  'Seth Lewis': 'E714499E-C9C6-4A01-AE84-6CB703AFB9B7',
  'Kimberly A. Lightford': '7FBA8DB0-281E-406F-BF9F-ABEB75B7B38E',
  'Meg Loughran Cappel': '344F07C5-9853-49B6-902A-89D5F81637BF',
  'Robert F. Martwick': '8FA2A22C-6775-4098-905C-0C7D8BBD7AEE',
  'Steve McClure': 'EB86B3C4-3F25-4D5C-8944-7B4CBCA7CACE',
  'Julie A. Morrison': '0E6BF8A6-C5C8-4F54-977B-D5FD11707FA5',
  'Laura M. Murphy': 'E8C6FBF1-611C-4DD5-A81D-F0FF8917556D',
  'Robert Peters': '05AD9CBA-EA20-489D-9C33-3F39DC1F9B0C',
  'Jason Plummer': 'CE75DC7E-2CD4-4D01-B697-C2866F828E25',
  'Mike Porfirio': '0824C110-5C93-4CBA-92E2-C330BBD6FE02',
  'Willie Preston': 'CFF4C1DD-FC97-428B-9D19-A520A543F4AC',
  'Sue Rezin': '45666230-B77D-4162-A45E-6AC5587C4E56',
  'Chapin Rose': 'BA95E1D1-0570-4492-B739-D1F593F183FD',
  'Mike Simmons': '6EDEB1E8-2566-4659-ABF5-A9107C2912F0',
  'Elgie R. Sims, Jr.': '1EAF7721-A189-4CD1-B31D-CD39F79DBD04',
  'Steve Stadelman': '47906765-AB0A-48BF-8C14-B5443B8F27C4',
  'Dave Syverson': '6FD168B8-C34B-4399-8E39-7373F7600882',
  'Jil Tracy': '21C0F860-E9DD-4215-A3AA-703E275C8526',
  'Doris Turner': 'D114C73A-2295-431C-8250-38AC3353A20E',
  'Sally J. Turner': 'C47C199A-2C77-4A73-BAE5-AB139ED85CAC',
  'Rachel Ventura': 'F4164483-CA9E-423B-ADF4-FA52EE9A3F08',
  'Karina Villa': 'C8126F4D-472E-4738-85B5-87A229F8174A',
  'Celina Villanueva': 'F8A21A81-5453-4E94-AC51-E644E1B0C00B',
  'Ram Villivalam': 'DBFB0F0-0E16-4C5F-894A-16C4A14CAF51',
  'Mark L. Walker': '7DE7B419-A9A5-4D3B-B60B-27796D630C6E',
  'Craig Wilcox': 'E397F861-68AA-4CC2-9A23-50B9A8E13031',
};

// House members: Name -> GUID
const houseMemberGUIDs = {
  'Carol Ammons': 'BD4B7A5C-6D24-4E82-9C18-D5A0F3C42F6C',
  'Jaime M. Andrade, Jr.': '34A19039-7BF5-44A7-9A06-4EC121E52514',
  'Dagmara Avelar': 'EFDA6EE7-57E6-4ACA-BE60-02A042FF5D5D',
  'Harry Benton': '591DB385-5E0D-41CC-8B13-2FDA10A73D7F',
  'Diane Blair-Sherlock': 'C9D7B27E-2484-4917-A5CA-F85BA458950A',
  'Amy Briel': 'E820664D-DF76-4A22-88DC-736A218A001E',
  'Kam Buckner': '37E72FD2-6318-45FD-9FF1-C750EB26137D',
  'Jason R. Bunting': '5F0F6F55-F573-4F05-B495-878685C2C00A',
  'John M. Cabello': '9E64DAD4-4264-42B1-AFDA-AB8F652472A3',
  'Mary Beth Canty': '1A73F23E-9C8D-4392-B6BD-154AB570C66E',
  'Kelly M. Cassidy': '3EFBDD50-41FF-4677-AA47-FB35B70C4667',
  'Sharon Chung': '0555ECBC-C0A4-4E09-ABA2-F8D6E8E03246',
  'Justin Cochran': '54FFB767-E6F6-4F20-951A-2CBCD1B06211',
  'Michael J. Coffey, Jr.': 'EA682659-0B02-4A60-8244-1D5D2ABCD620',
  'Michael Crawford': 'C79CCD19-74A9-494F-BE14-E0D1E0A9D326',
  'Fred Crespo': 'B92F7A2F-6517-4A3F-87B3-56FAA240285F',
  'Margaret Croke': '1719759C-D601-4575-A753-1244D0FE550A',
  'Christopher Davidsmeyer': 'E54250D5-EB1C-4CB6-9CF9-CA95CAA2F269',
  'Jed Davis': 'AFBDE3F1-DE4D-419A-A7AB-D27678B015BE',
  'Lisa Davis': 'A61D2D11-9A19-483B-9C3E-C99CCC4CF5F4',
  'William Davis': '6012DCA8-7486-49F9-A387-8703A2CF469C',
  'Regan Deering': '57C9E73B-E152-4B7D-B42B-6EA67289504E',
  'Margaret A. DeLaRosa': '9E520EC6-A7D1-4749-BCBC-D178535ACB04',
  'Eva-Dina Delgado': 'D02A93E7-7D84-4429-92AB-60B61084EBA1',
  'Anthony DeLuca': '64399002-8B14-4D8E-80A4-54A77F25421C',
  'Martha Deuter': '345BE0B5-CE9C-4A36-B292-6190B845C34B',
  'Daniel Didech': '1EA869A9-B93D-4E72-824B-E14992452581',
  'Kimberly Du Buclet': '4858CB21-EEE1-409B-9A4C-FA760BB6905E',
  'Amy Elik': 'D070CEE6-55DF-4D51-961B-CCA4A0E49A8C',
  'Marcus C. Evans, Jr.': 'BFD8B13A-CD65-452C-8F20-9D32C3A013BF',
  'Laura Faver Dias': 'B0DFD215-F36D-47A7-B7BE-909CDF14DC07',
  'La Shawn K. Ford': 'BCC3C8D6-5728-4A69-8A3B-F203314DD563',
  'David Friess': 'C1F3982E-6DA7-4AE6-96B9-77E9FBC87A2A',
  'Bradley Fritts': '3A924147-7119-4921-BDF6-14B5D5BA4B8D',
  'Robyn Gabel': '739CC8F9-E9E4-40A1-AB86-883EF9A5E313',
  'Mary Gill': '28C54907-9CC9-428D-BD6B-361B91A10441',
  'Jennifer Gong-Gershowitz': '395E8140-10ED-4C70-81B9-2673676BF467',
  'Edgar González, Jr.': '370B1494-7F8F-48BC-BD66-4756E15442E1',
  'Jehan Gordon-Booth': 'A81D0C01-0A50-446D-B796-3A5A6D046EB1',
  'Amy L. Grant': '41DCC207-977E-45DC-BD10-A8AFDCEB673E',
  'Nicolle Grasse': 'D2D7C6E1-5147-4488-90CD-D4FC0982A738',
  'Angelica Guerrero-Cuellar': '22FBB36E-8A65-4E83-81F1-A20247A6B8F2',
  'Will Guzzardi': 'C127AF36-0EAE-48B6-8C31-86AAE3935790',
  'Jackie Haas': '9E211C98-BCB9-43CF-8A78-57D295FB9D78',
  'Brad Halbrook': '3F3C3739-E087-440D-B006-33043A8F5083',
  'Norine K. Hammond': '07D3914D-440A-4891-99AE-256F657BBFFF',
  'Matt Hanson': '457B8F0B-1DF6-4107-A5FC-9B2BFAAE1008',
  'Sonya M. Harper': '04C99384-69F8-4ACE-9E43-11E21CC5F820',
  'William E Hauter': '999C86E0-F35D-4F02-81BE-F4FEBF930114',
  'Barbara Hernandez': 'E3518E4F-7AAF-4D93-8985-336197D96094',
  'Lisa Hernandez': '4E4C2A21-FDC2-48CA-9BA8-462A62E7A33B',
  'Norma Hernandez': '3E520E2E-5D7A-491B-9744-0F0137816162',
  'Maura Hirschauer': 'F62525B8-2C23-49B7-AAB8-EFA6AE575F68',
  'Jay Hoffman': 'FCD7EF06-36D9-46A7-8085-4B5A5ED81A80',
  'Hoan Huynh': 'A6CE6A23-9F62-4C37-B297-4E48D79A3CE1',
  'Paul Jacobs': '0E151A06-57C8-4261-9577-278F5DD4B717',
  'Lilian Jiménez': '6C475229-0B41-4F93-A2C7-5B1396A1D1FA',
  'Gregg Johnson': '8746A238-F14D-428E-A0AD-E3D3F28F80F5',
  'Thaddeus Jones': '6EE82A11-2CC6-48E9-9DE6-61D83EBCAB6B',
  'Tracy Katz Muhl': '31ED8E80-A147-47D1-A4B9-70A51C651C48',
  'Jeff Keicher': 'FD009EA6-624D-45C7-A093-BC66B8B3C090',
  'Michael J. Kelly': '90B28E06-84A0-47EB-A80B-403DF4CDA607',
  'Stephanie A. Kifowit': '96E18070-8D3D-4EEC-8432-8A30FEC19E5C',
  'Nicole La Ha': '08891F3D-4342-4F2E-A5E5-6CCBCD415423',
  'Lindsey LaPointe': '7447C9D9-48D0-457E-BDC9-847FB8D35DB5',
  'Camille Y. Lilly': '84D8FB64-9F82-405A-9376-A69ADFB46E53',
  'Theresa Mah': '808BAA30-BB82-437A-9A76-386F9A65A073',
  'Natalie A. Manley': 'F3781CCA-4285-44C3-8E60-811B9229EA1B',
  'Joyce Mason': '26C52E17-9395-4BF8-B6E6-3E1CE6234032',
  'Rita Mayfield': '3A2DAB8B-B5F8-48EE-85D3-05894ED42A5D',
  'Tony M. McCombie': '0766A6E9-981F-491B-B3A1-12DF91F1DBDA',
  'Martin McLaughlin': 'F90CD638-AB1B-4A73-A003-02D9A911B599',
  'Charles Meier': '9D43D019-A58A-47EC-B769-A7050C4B49DB',
  'Debbie Meyers-Martin': 'E3E2099C-AB6A-442B-B191-3A83D6D3A1E2',
  'Chris Miller': '2A519012-9070-494B-9FFC-C2646374202E',
  'Anna Moeller': 'DCE9D682-0582-49BD-AD67-98C2502D89C2',
  'Kyle Moore': 'BB70A39A-DE8F-4EF5-A923-0EE51834A45F',
  'Bob Morgan': 'A3460802-617C-4097-B043-6D63A11278AC',
  'Yolonda Morris': '2EDE65F3-F463-4E44-B703-6B06D2ECB787',
  'Michelle Mussman': '63BBD5DE-333E-4015-8658-4F7B2D45E1B7',
  'Suzanne M. Ness': '735B1C5A-1929-4EC8-92B4-72E58D74E743',
  'Adam M. Niemerg': 'EDDABDD8-51A3-413F-B2A0-FA5953D29598',
  'Kevin John Olickal': '23C3BBA7-3179-41B5-A3EF-A372F88DD9C9',
  'Aarón M. Ortíz': 'D96B0DF9-0E06-487B-825C-AB0BE8C3CA1E',
  'Abdelnasser Rashid': '48E00B1D-C5BE-4210-A9A8-F68739D935D6',
  'Steven Reick': 'D4845B6E-9A2E-4F0E-9F70-503B2E5891CA',
  'Bob Rita': 'AC16F1E8-0988-4A08-A2E5-EF4D06371A24',
  'Wayne A. Rosenthal': '43DB5751-834C-4CA0-B8A4-6D1016E3CB28',
  'Rick Ryan': 'D636B7BF-6A7A-4F82-8429-018FF5E1CE36',
  'Jennifer Sanalitro': '07C35999-DEF2-49BA-8A46-7D9D8204BCEA',
  'Sue Scherer': 'A0B92E66-B4F7-4B85-A7F2-14C0153B426F',
  'Kevin Schmidt': '385A4AC4-BA7A-42A3-987F-85EA620B1F2B',
  'Brandun Schweizer': '7520D666-0725-4963-B643-C1106551E922',
  'Dave Severin': 'FC792043-4CE1-4796-BA38-E68B39A9847A',
  'Patrick Sheehan': '4F33CDD4-F7DD-40AC-B11E-DA5066173803',
  'Justin Slaughter': '170C17F3-38A1-42E5-B222-020B43077D53',
  'Nicholas K. Smith': '4D7D283C-73C8-40F8-A3F0-7FA9301456F5',
  'Joe C. Sosnowski': '7DEBF89C-D2BA-4952-94A2-40F564A00144',
  'Ryan Spain': '4C25C70B-0E39-406B-9318-A899C2A6D1B0',
  'Anne Stava': '0322F94E-013C-4237-9808-4462138AC595',
  'Brad Stephens': 'BD3836AC-CD0C-4E20-AD4C-1F2AEA56A8A2',
  'Katie Stuart': 'D6DC8152-9760-4BEA-ACF5-C41785E6F6C4',
  'Dan Swanson': 'F7512D74-4694-4272-9A1E-6935F4AD4F1D',
  'Nabeela Syed': '1B81D1C2-BEE3-408C-B52D-8B269BC5DA24',
  'Curtis J. Tarver, II': 'E9404756-F108-41DB-A7A8-87C36BBF763D',
  'Dennis Tipsword': 'D8E9F62C-6A73-4CCD-8148-332CD9806264',
  'Dan Ugaste': '2552FBE4-D977-4283-B00C-78FC085BD955',
  'Dave Vella': 'E0F72B4C-2737-483E-84FE-E596DB8F2DCF',
  'Lawrence Walsh, Jr.': 'F11DA3BE-D8FF-48F0-8450-43231B4DD28F',
  'Travis Weaver': '0A077509-6D57-4C96-8525-0480C8338827',
  'Tom Weber': '4C80DF49-91D2-4C24-981E-BBE946A671D2',
  'Chris Welch': '5D419B94-66B4-4F3B-86F1-BFF37B3FA55C',
  'Maurice A. West, II': 'AFB160BE-629B-4C70-8541-877D6FCDE529',
  'Blaine Wilhour': '66C5580C-A414-41BB-B3AC-638925AC34CD',
  'Ann M. Williams': 'C45B418C-4848-4467-ADC2-739B2D1E4418',
  'Jawaharial Williams': '32750D93-496F-42CA-9CCE-93C3451713A1',
  'Patrick Windhorst': '547F9C92-7368-4390-B625-5BB795568D50',
  'Janet Yang Rohr': '4B315A2D-F104-4613-BD17-77ECA3955B30',
};

const BASE_URL = 'https://cdn.ilga.gov/assets/img/members';

// Build a combined lookup: normalized name -> image URL
// We normalize by lowercasing and stripping suffixes, middle initials, etc.
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/\b(jr|sr|ii|iii|iv)\b\.?/gi, '')  // remove suffixes
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract last name from a full name
function lastName(name) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Build lookup maps
const allMembers = {};

for (const [name, guid] of Object.entries(senateMemberGUIDs)) {
  allMembers[normalizeName(name)] = { name, guid, chamber: 'state_senate' };
}
for (const [name, guid] of Object.entries(houseMemberGUIDs)) {
  allMembers[normalizeName(name)] = { name, guid, chamber: 'state_house' };
}

// Also build a last-name lookup for fuzzy matching
const lastNameLookup = {};
for (const [normalized, data] of Object.entries(allMembers)) {
  const ln = lastName(data.name);
  if (!lastNameLookup[ln]) lastNameLookup[ln] = [];
  lastNameLookup[ln].push({ normalized, ...data });
}

async function main() {
  // Query IL state_house and state_senate politicians
  const { data: politicians, error } = await supabase
    .from('politicians')
    .select('id, name, slug, state, chamber, image_url')
    .eq('state', 'IL')
    .in('chamber', ['state_house', 'state_senate']);

  if (error) {
    console.error('Error querying politicians:', error);
    process.exit(1);
  }

  console.log(`Found ${politicians.length} IL state legislators in database`);

  const needImage = politicians.filter(p => !p.image_url);
  const haveImage = politicians.filter(p => p.image_url);
  console.log(`  - ${needImage.length} missing image_url`);
  console.log(`  - ${haveImage.length} already have image_url`);

  // Match each politician to an ILGA member
  const updates = [];
  const unmatched = [];

  for (const pol of politicians) {
    // Try exact normalized match first
    const normalized = normalizeName(pol.name);
    let match = allMembers[normalized];

    if (!match) {
      // Try last name match
      const ln = lastName(pol.name);
      const candidates = lastNameLookup[ln];
      if (candidates && candidates.length === 1) {
        match = candidates[0];
      } else if (candidates && candidates.length > 1) {
        // Multiple matches by last name - try to narrow by chamber
        const chamberMatch = candidates.filter(c => c.chamber === pol.chamber);
        if (chamberMatch.length === 1) {
          match = chamberMatch[0];
        }
      }
    }

    if (match) {
      const imageUrl = `${BASE_URL}/{${match.guid}}.jpg`;
      updates.push({ id: pol.id, name: pol.name, image_url: imageUrl, had_image: !!pol.image_url });
    } else {
      unmatched.push(pol.name);
    }
  }

  console.log(`\nMatched: ${updates.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched politicians:', unmatched);
  }

  // Filter to only those that need updating (no existing image_url, or we want to update all)
  const toUpdate = updates.filter(u => !u.had_image);
  console.log(`\nWill update ${toUpdate.length} politicians missing image_url`);

  // Process in batches of 5
  let updated = 0;
  let failed = 0;
  const BATCH_SIZE = 5;

  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = toUpdate.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (item) => {
        const { error } = await supabase
          .from('politicians')
          .update({ image_url: item.image_url })
          .eq('id', item.id);
        if (error) {
          console.error(`  FAILED: ${item.name} - ${error.message}`);
          return false;
        }
        console.log(`  Updated: ${item.name} -> ${item.image_url}`);
        return true;
      })
    );
    updated += results.filter(Boolean).length;
    failed += results.filter(r => !r).length;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total IL legislators in DB: ${politicians.length}`);
  console.log(`Matched to ILGA: ${updates.length}`);
  console.log(`Already had image: ${updates.filter(u => u.had_image).length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Unmatched: ${unmatched.length}`);
}

main().catch(console.error);

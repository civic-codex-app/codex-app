import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Scraped from https://www.palegis.us/house/members and /senate/members
const houseMembers = [
  { name: "Aerion Abney", id: 1933 },
  { name: "Marc S. Anderson", id: 2029 },
  { name: "Mike Armanini", id: 1903 },
  { name: "Jacob D. Banta", id: 1937 },
  { name: "Scott Barger", id: 2027 },
  { name: "Jamie Barton", id: 1968 },
  { name: "Josh Bashline", id: 2026 },
  { name: "Anthony A. Bellmon", id: 1984 },
  { name: "Jessica Benham", id: 1899 },
  { name: "Kerry A. Benninghoff", id: 215 },
  { name: "Aaron Bernstine", id: 1742 },
  { name: "Ryan A. Bizzarro", id: 1619 },
  { name: "Timothy R. Bonner", id: 1877 },
  { name: "Stephanie Borowicz", id: 1838 },
  { name: "Lisa A. Borowski", id: 1977 },
  { name: "Heather Boyd", id: 2015 },
  { name: "Matthew D. Bradford", id: 1161 },
  { name: "Tim Brennan", id: 1943 },
  { name: "Tim Briggs", id: 1159 },
  { name: "Amen Brown", id: 1919 },
  { name: "Marla Brown", id: 1938 },
  { name: "Danilo Burgos", id: 1863 },
  { name: "Frank Burns", id: 1163 },
  { name: "Andre D. Carroll", id: 2019 },
  { name: "Martin T. Causer", id: 982 },
  { name: "Johanny Cepeda-Freytiz", id: 1969 },
  { name: "Morgan Cephas", id: 1759 },
  { name: "Melissa Cerrato", id: 1974 },
  { name: "Joe Ciresi", id: 1847 },
  { name: "Scott Conklin", id: 1096 },
  { name: "Bud Cook", id: 1745 },
  { name: "Jill N. Cooper", id: 1951 },
  { name: "Gina H. Curry", id: 1932 },
  { name: "Bryan Cutler", id: 1105 },
  { name: "Joseph D'Orsie", id: 1947 },
  { name: "Mary Jo Daley", id: 1622 },
  { name: "Eric Davanzo", id: 1875 },
  { name: "Nathan Davidson", id: 2031 },
  { name: "Tina M. Davis", id: 1204 },
  { name: "Jason Dawkins", id: 1685 },
  { name: "Gary W. Day", id: 1190 },
  { name: "Daniel J. Deasy", id: 1166 },
  { name: "David M. Delloso", id: 1853 },
  { name: "Sheryl M. Delozier", id: 1167 },
  { name: "Russ Diamond", id: 1686 },
  { name: "Kyle Donahue", id: 1963 },
  { name: "Sean Dougherty", id: 2035 },
  { name: "Joe Emrick", id: 1207 },
  { name: "Mindy Fee", id: 1625 },
  { name: "Elizabeth Fiedler", id: 1861 },
  { name: "Wendy Fink", id: 1956 },
  { name: "Justin C. Fleming", id: 1960 },
  { name: "Jamie L. Flick", id: 1954 },
  { name: "Ann Flood", id: 1910 },
  { name: "Dan Frankel", id: 84 },
  { name: "Robert Freeman", id: 136 },
  { name: "Paul Friel", id: 1942 },
  { name: "Jonathan Fritz", id: 1752 },
  { name: "Pat Gallagher", id: 1978 },
  { name: "Valerie S. Gaydos", id: 1831 },
  { name: "Mark M. Gillen", id: 1209 },
  { name: "Jose Giral", id: 1980 },
  { name: "Barbara Gleim", id: 1864 },
  { name: "Dan Goughnour", id: 2060 },
  { name: "G. Roni Green", id: 1874 },
  { name: "Keith J. Greiner", id: 1632 },
  { name: "Nancy Guenst", id: 1913 },
  { name: "Manuel Guzman", id: 1908 },
  { name: "Jim Haddock", id: 1966 },
  { name: "Joe Hamm", id: 1904 },
  { name: "Liz Hanbidge", id: 1834 },
  { name: "Patrick J. Harkins", id: 1081 },
  { name: "Jordan A. Harris", id: 1633 },
  { name: "Keith S. Harris", id: 2020 },
  { name: "Doyle Heffley", id: 1211 },
  { name: "Carol Hill-Evans", id: 1749 },
  { name: "Joe Hogan", id: 1971 },
  { name: "Joseph C. Hohenstein", id: 1858 },
  { name: "Kristine C. Howard", id: 1856 },
  { name: "John C. Inglis III", id: 2024 },
  { name: "Rich Irvin", id: 1691 },
  { name: "MaryLouise Isaacson", id: 1857 },
  { name: "R. Lee James", id: 1634 },
  { name: "Mike Jones", id: 1842 },
  { name: "Tom Jones", id: 1957 },
  { name: "Joshua D. Kail", id: 1823 },
  { name: "Rob W. Kauffman", id: 1022 },
  { name: "Carol Kazeem", id: 1976 },
  { name: "Malcolm Kenyatta", id: 1860 },
  { name: "Dallas Kephart", id: 1952 },
  { name: "Joe Kerwin", id: 1907 },
  { name: "Tarik Khan", id: 1983 },
  { name: "Emily Kinkead", id: 1896 },
  { name: "Kate A. Klunk", id: 1694 },
  { name: "Bridget M. Kosierowski", id: 1866 },
  { name: "Roman Kozak", id: 2022 },
  { name: "Rick Krajewski", id: 1918 },
  { name: "Leanne Krueger", id: 1735 },
  { name: "Charity Grimm Krupa", id: 1949 },
  { name: "Anita Astorino Kulik", id: 1744 },
  { name: "Thomas H. Kutz", id: 1955 },
  { name: "Andrew Kuzma", id: 1946 },
  { name: "Shelby Labs", id: 1911 },
  { name: "John A. Lawrence", id: 1215 },
  { name: "Robert Leadbeter", id: 1962 },
  { name: "Milou Mackenzie", id: 1909 },
  { name: "Maureen E. Madden", id: 1753 },
  { name: "Dave Madsen", id: 1959 },
  { name: "Abby Major", id: 1926 },
  { name: "Zachary Mako", id: 1758 },
  { name: "Steven R. Malagari", id: 1832 },
  { name: "David M. Maloney", id: 1226 },
  { name: "Kristin Marcell", id: 1979 },
  { name: "Brandon J. Markosek", id: 1825 },
  { name: "Robert F. Matzie", id: 1173 },
  { name: "La'Tasha D. Mayes", id: 1941 },
  { name: "Jen Mazzocco", id: 2063 },
  { name: "Joe McAndrew", id: 2011 },
  { name: "Joanna E. McClinton", id: 1734 },
  { name: "Jeanne McNeill", id: 1793 },
  { name: "Thomas L. Mehaffie", id: 1751 },
  { name: "Steven C. Mentzer", id: 1642 },
  { name: "Robert E. Merski", id: 1822 },
  { name: "Carl Walker Metzgar", id: 1174 },
  { name: "Natalie Mihalek", id: 1830 },
  { name: "Brett R. Miller", id: 1699 },
  { name: "Dan Moul", id: 1101 },
  { name: "Kyle J. Mullins", id: 1844 },
  { name: "Brian Munroe", id: 1972 },
  { name: "Marci Mustello", id: 1868 },
  { name: "Ed Neilson", id: 1615 },
  { name: "Eric R. Nelson", id: 1738 },
  { name: "Napoleon J. Nelson", id: 1914 },
  { name: "Jennifer O'Mara", id: 1855 },
  { name: "Timothy J. O'Neal", id: 1797 },
  { name: "Jeff Olsommer", id: 2018 },
  { name: "Jason Ortitay", id: 1701 },
  { name: "Danielle Friel Otten", id: 1850 },
  { name: "Clint Owlett", id: 1796 },
  { name: "Darisha K. Parker", id: 1920 },
  { name: "Eddie Day Pashinski", id: 1112 },
  { name: "Tina Pickett", id: 97 },
  { name: "Chris Pielli", id: 1975 },
  { name: "Lindsay Powell", id: 2016 },
  { name: "Tarah Probst", id: 1982 },
  { name: "Jim Prokopiak", id: 2017 },
  { name: "Brenda M. Pugh", id: 2033 },
  { name: "Christopher M. Rabb", id: 1760 },
  { name: "Jack Rader", id: 1703 },
  { name: "Kathy L. Rapp", id: 1028 },
  { name: "Brian C. Rasel", id: 2025 },
  { name: "Chad G. Reichard", id: 2028 },
  { name: "Jim Rigby", id: 1836 },
  { name: "Nikki Rivera", id: 2030 },
  { name: "Brad Roae", id: 1083 },
  { name: "Leslie Rossi", id: 1927 },
  { name: "David H. Rowe", id: 1871 },
  { name: "Jacklyn Rusnock", id: 2034 },
  { name: "Alec J. Ryncavage", id: 1967 },
  { name: "Abigail Salisbury", id: 2012 },
  { name: "Steve Samuelson", id: 80 },
  { name: "Benjamin V. Sanchez", id: 1849 },
  { name: "Christina D. Sappey", id: 1852 },
  { name: "Donna Scheuren", id: 1973 },
  { name: "John A. Schlegel", id: 1958 },
  { name: "Michael H. Schlossberg", id: 1649 },
  { name: "Peter Schweyer", id: 1706 },
  { name: "Stephenie Scialabba", id: 1939 },
  { name: "Greg Scott", id: 1950 },
  { name: "Jeremy Shaffer", id: 2023 },
  { name: "Melissa L. Shusterman", id: 1851 },
  { name: "Brian Smith", id: 1902 },
  { name: "Ismail Smith-Wade-El", id: 1948 },
  { name: "Jared G. Solomon", id: 1761 },
  { name: "Craig T. Staats", id: 1707 },
  { name: "Perry A. Stambaugh", id: 1905 },
  { name: "Mandy Steele", id: 1945 },
  { name: "Joanne Stehr", id: 1961 },
  { name: "Michael Stender", id: 2014 },
  { name: "James B. Struzzi", id: 1835 },
  { name: "Paul Takac", id: 1953 },
  { name: "Ana Tiburcio", id: 2062 },
  { name: "Kathleen C. Tomlinson", id: 1876 },
  { name: "Jesse Topper", id: 1681 },
  { name: "Tim Twardzik", id: 1906 },
  { name: "Arvind Venkat", id: 1944 },
  { name: "Andrea Verobish", id: 2065 },
  { name: "Greg Vitali", id: 210 },
  { name: "Catherine Wallen", id: 2064 },
  { name: "Jamie Walsh", id: 2032 },
  { name: "Ryan Warner", id: 1708 },
  { name: "Perry S. Warren", id: 1743 },
  { name: "Dane Watro", id: 1964 },
  { name: "Ben Waxman", id: 1981 },
  { name: "Eric J. Weaknecht", id: 2021 },
  { name: "Joe Webster", id: 1848 },
  { name: "Parke Wentling", id: 1709 },
  { name: "Martina A. White", id: 1732 },
  { name: "Craig Williams", id: 1916 },
  { name: "Dan K. Williams", id: 1837 },
  { name: "Regina G. Young", id: 1917 },
  { name: "David H. Zimmerman", id: 1711 },
];

const senateMembers = [
  { name: "David G. Argall", id: 69 },
  { name: "Lisa Baker", id: 1077 },
  { name: "Camera Bartolotta", id: 1698 },
  { name: "Lisa M. Boscola", id: 179 },
  { name: "Michele Brooks", id: 1087 },
  { name: "Rosemary M. Brown", id: 1200 },
  { name: "Amanda M. Cappelletti", id: 1923 },
  { name: "Jarrett Coleman", id: 2008 },
  { name: "Maria Collett", id: 1799 },
  { name: "Carolyn T. Comitta", id: 1790 },
  { name: "Jay Costa", id: 254 },
  { name: "Lynda Schlegel Culver", id: 1202 },
  { name: "Cris Dush", id: 1687 },
  { name: "Frank A. Farry", id: 1169 },
  { name: "Marty Flynn", id: 1626 },
  { name: "Wayne D. Fontana", id: 1041 },
  { name: "Chris Gebhard", id: 1928 },
  { name: "Art Haywood", id: 1689 },
  { name: "Vincent J. Hughes", id: 152 },
  { name: "Scott E. Hutchinson", id: 1629 },
  { name: "John I. Kane", id: 1925 },
  { name: "Timothy P. Kearney", id: 1800 },
  { name: "Dawn W. Keefer", id: 1748 },
  { name: "Patty Kim", id: 1636 },
  { name: "Wayne Langerholc", id: 1764 },
  { name: "Daniel Laughlin", id: 1766 },
  { name: "James Andrew Malone", id: 2061 },
  { name: "Scott Martin", id: 1763 },
  { name: "Doug Mastriano", id: 1869 },
  { name: "Nick Miller", id: 2009 },
  { name: "Katie J. Muth", id: 1802 },
  { name: "Tracy Pennycuick", id: 1912 },
  { name: "Kristin Phillips-Hill", id: 1801 },
  { name: "Joe Picozzi", id: 2036 },
  { name: "Nick Pisciottano", id: 1900 },
  { name: "Joe Pittman", id: 1870 },
  { name: "Devlin J. Robinson", id: 1924 },
  { name: "Greg Rothman", id: 1733 },
  { name: "Steven J. Santarsiero", id: 1179 },
  { name: "Nikil Saval", id: 1921 },
  { name: "Judith L. Schwank", id: 1234 },
  { name: "Patrick J. Stefano", id: 1697 },
  { name: "Sharif Street", id: 1767 },
  { name: "Christine M. Tartaglione", id: 277 },
  { name: "Elder A. Vogel", id: 1189 },
  { name: "Judy Ward", id: 1683 },
  { name: "Kim L. Ward", id: 1188 },
  { name: "Anthony H. Williams", id: 153 },
  { name: "Lindsey M. Williams", id: 1803 },
  { name: "Gene Yaw", id: 1186 },
];

// Normalize name for matching: lowercase, strip middle initials/suffixes, etc.
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\b(jr|sr|iii|ii|iv)\b\.?/gi, '')
    .replace(/\b[a-z]\.\s*/g, '') // remove single-letter initials like "M." "J."
    .replace(/['']/g, "'")
    .replace(/[^a-z' -]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract last name from normalized name
function lastName(normalized) {
  const parts = normalized.split(/[\s-]+/);
  return parts[parts.length - 1];
}

// Try to match a DB politician to a website member
function findMatch(dbName, members) {
  const dbNorm = normalizeName(dbName);
  const dbLast = lastName(dbNorm);

  // Exact normalized match
  for (const m of members) {
    if (normalizeName(m.name) === dbNorm) return m;
  }

  // Last name + first name start match
  for (const m of members) {
    const mNorm = normalizeName(m.name);
    const mLast = lastName(mNorm);
    const mFirst = mNorm.split(' ')[0];
    const dbFirst = dbNorm.split(' ')[0];
    if (mLast === dbLast && (mFirst.startsWith(dbFirst) || dbFirst.startsWith(mFirst))) {
      return m;
    }
  }

  // Last name only match (if unique)
  const lastMatches = members.filter(m => lastName(normalizeName(m.name)) === dbLast);
  if (lastMatches.length === 1) return lastMatches[0];

  return null;
}

async function verifyImageUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function run() {
  // Fetch PA state_house politicians missing image_url
  const { data: housePols, error: hErr } = await supabase
    .from('politicians')
    .select('id, name, slug, image_url, chamber')
    .eq('state', 'PA')
    .eq('chamber', 'state_house');

  if (hErr) { console.error('House query error:', hErr); return; }

  const { data: senatePols, error: sErr } = await supabase
    .from('politicians')
    .select('id, name, slug, image_url, chamber')
    .eq('state', 'PA')
    .eq('chamber', 'state_senate');

  if (sErr) { console.error('Senate query error:', sErr); return; }

  console.log(`Found ${housePols.length} PA state_house politicians in DB`);
  console.log(`Found ${senatePols.length} PA state_senate politicians in DB`);

  const houseMissing = housePols.filter(p => !p.image_url);
  const senateMissing = senatePols.filter(p => !p.image_url);

  console.log(`Missing images: ${houseMissing.length} house, ${senateMissing.length} senate`);

  let houseUpdated = 0, houseFailed = 0, houseSkipped = 0;
  let senateUpdated = 0, senateFailed = 0, senateSkipped = 0;

  // Process House
  for (const pol of houseMissing) {
    const match = findMatch(pol.name, houseMembers);
    if (!match) {
      console.log(`  NO MATCH: ${pol.name}`);
      houseFailed++;
      continue;
    }

    const imageUrl = `https://www.palegis.us/resources/images/members/200/${match.id}.jpg`;
    const ok = await verifyImageUrl(imageUrl);

    if (!ok) {
      console.log(`  IMAGE 404: ${pol.name} -> ${imageUrl}`);
      houseFailed++;
      continue;
    }

    const { error } = await supabase
      .from('politicians')
      .update({ image_url: imageUrl })
      .eq('id', pol.id);

    if (error) {
      console.log(`  UPDATE ERROR: ${pol.name}: ${error.message}`);
      houseFailed++;
    } else {
      console.log(`  UPDATED: ${pol.name} -> ${match.name} (${match.id})`);
      houseUpdated++;
    }
  }

  // Process Senate
  for (const pol of senateMissing) {
    const match = findMatch(pol.name, senateMembers);
    if (!match) {
      console.log(`  NO MATCH: ${pol.name}`);
      senateFailed++;
      continue;
    }

    const imageUrl = `https://www.palegis.us/resources/images/members/200/${match.id}.jpg`;
    const ok = await verifyImageUrl(imageUrl);

    if (!ok) {
      console.log(`  IMAGE 404: ${pol.name} -> ${imageUrl}`);
      senateFailed++;
      continue;
    }

    const { error } = await supabase
      .from('politicians')
      .update({ image_url: imageUrl })
      .eq('id', pol.id);

    if (error) {
      console.log(`  UPDATE ERROR: ${pol.name}: ${error.message}`);
      senateFailed++;
    } else {
      console.log(`  UPDATED: ${pol.name} -> ${match.name} (${match.id})`);
      senateUpdated++;
    }
  }

  // Also update any that already have image_url but it's not from palegis (optional - skip)
  // We only update those missing images.

  console.log('\n=== RESULTS ===');
  console.log(`State House: ${houseUpdated} updated, ${houseFailed} failed, ${housePols.length - houseMissing.length} already had images`);
  console.log(`State Senate: ${senateUpdated} updated, ${senateFailed} failed, ${senatePols.length - senateMissing.length} already had images`);
  console.log(`Total updated: ${houseUpdated + senateUpdated}`);
}

run().catch(console.error);

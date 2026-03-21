/**
 * Replace generic stance summaries with issue-specific, party-aware, stance-aware text.
 * Only updates rows that have generic/null summaries (preserves the ~6,500 hand-written ones).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Issue-specific summary templates per stance bucket
// Each issue has templates for: supports, opposes, mixed/neutral
const TEMPLATES = {
  'economy-and-jobs': {
    dem_supports: [
      'Advocates for raising the minimum wage, strengthening labor unions, and investing in job training programs.',
      'Supports progressive economic policies including worker protections, fair wages, and public investment in infrastructure.',
      'Prioritizes job creation through green energy investment, workforce development, and support for small businesses.',
      'Champions economic policies focused on reducing income inequality and expanding opportunities for working families.',
    ],
    gop_supports: [
      'Supports pro-growth economic policies including tax cuts, deregulation, and free-market principles.',
      'Advocates for reducing government regulations, lowering taxes on businesses, and promoting economic freedom.',
      'Champions supply-side economics with a focus on job creation through private sector growth.',
      'Supports policies to strengthen American manufacturing, reduce trade deficits, and promote energy independence.',
    ],
    opposes: [
      'Has expressed concerns about current economic policy direction and its impact on constituents.',
      'Critical of economic policies that could increase the national debt or burden taxpayers.',
    ],
    mixed: [
      'Takes a balanced approach to economic policy, supporting targeted investments while maintaining fiscal responsibility.',
      'Has a pragmatic stance on economic issues, crossing party lines on some fiscal matters.',
    ],
  },
  'healthcare-and-medicare': {
    dem_supports: [
      'Supports expanding the Affordable Care Act, lowering prescription drug costs, and protecting coverage for pre-existing conditions.',
      'Advocates for universal healthcare access, Medicare expansion, and reducing out-of-pocket costs for families.',
      'Champions public health investment, mental health services, and efforts to make healthcare more affordable.',
      'Supports strengthening Medicare and Medicaid while working to reduce the cost of prescription medications.',
    ],
    gop_supports: [
      'Supports market-based healthcare reforms, increased transparency in pricing, and expanded health savings accounts.',
      'Advocates for patient-centered healthcare, reducing government mandates, and promoting competition among insurers.',
    ],
    opposes: [
      'Opposes government-run healthcare and favors free-market solutions to reduce costs and improve care.',
      'Critical of healthcare expansion proposals, citing concerns about cost, quality, and government overreach.',
    ],
    mixed: [
      'Supports some healthcare reforms while opposing others, taking a selective approach to healthcare policy.',
      'Balances support for healthcare access with concerns about cost and government involvement.',
    ],
  },
  'immigration-and-border-security': {
    dem_supports: [
      'Supports comprehensive immigration reform, a pathway to citizenship for Dreamers, and humane border policies.',
      'Advocates for modernizing the immigration system while protecting refugee and asylum rights.',
      'Supports immigration reform that includes border security alongside pathways for undocumented residents.',
    ],
    gop_supports: [
      'Supports strong border security measures, increased enforcement, and merit-based immigration policies.',
      'Advocates for securing the southern border, ending catch-and-release, and enforcing existing immigration laws.',
      'Champions strict border security including physical barriers, increased border patrol, and visa enforcement.',
    ],
    opposes: [
      'Opposes current immigration enforcement approaches, advocating for more balanced reform.',
      'Critical of immigration policies that separate families or limit legal immigration pathways.',
    ],
    mixed: [
      'Takes a moderate approach to immigration, supporting both border security and reform of the legal immigration system.',
      'Advocates for a balanced immigration policy that addresses security concerns while treating immigrants humanely.',
    ],
  },
  'education-and-student-debt': {
    dem_supports: [
      'Supports increased funding for public schools, student debt relief, and universal pre-K programs.',
      'Advocates for making college more affordable, investing in teachers, and expanding access to early childhood education.',
      'Champions education funding, student loan reform, and programs to close the achievement gap.',
    ],
    gop_supports: [
      'Supports school choice, charter schools, and empowering parents in educational decisions.',
      'Advocates for local control of education, vocational training programs, and accountability in schools.',
    ],
    opposes: [
      'Opposes blanket student loan forgiveness and federal education mandates, favoring state and local control.',
      'Critical of one-size-fits-all education policies and supports alternatives to traditional public schooling.',
    ],
    mixed: [
      'Supports some education investments while advocating for accountability and school choice options.',
      'Takes a bipartisan approach to education, supporting funding increases alongside reform measures.',
    ],
  },
  'national-defense-and-military': {
    dem_supports: [
      'Supports maintaining strong national defense while prioritizing diplomacy and strategic alliances.',
      'Advocates for supporting military families, veterans services, and modernizing defense capabilities.',
    ],
    gop_supports: [
      'Supports a strong military, increased defense spending, and maintaining American military superiority.',
      'Champions robust national defense, support for troops and veterans, and maintaining global deterrence.',
      'Advocates for peace through strength, military modernization, and support for defense industry jobs.',
    ],
    opposes: [
      'Calls for reducing military spending and redirecting funds to domestic priorities.',
      'Critical of defense budget increases and advocates for greater diplomatic solutions.',
    ],
    mixed: [
      'Supports targeted defense investments while seeking accountability in military spending.',
      'Takes a pragmatic approach to defense, supporting readiness while questioning specific spending priorities.',
    ],
  },
  'climate-and-environment': {
    dem_supports: [
      'Supports aggressive climate action, clean energy investment, and reducing carbon emissions.',
      'Advocates for transitioning to renewable energy, environmental justice, and protecting public lands.',
      'Champions environmental protections, clean water standards, and investment in green infrastructure.',
    ],
    gop_supports: [
      'Supports conservation efforts and environmental stewardship through market-based approaches.',
      'Advocates for an all-of-the-above energy strategy that balances environmental protection with economic growth.',
    ],
    opposes: [
      'Opposes aggressive climate regulations, citing economic impacts on businesses and energy costs.',
      'Skeptical of government-mandated emissions standards and opposes policies that could raise energy prices.',
    ],
    mixed: [
      'Supports some environmental protections while opposing regulations seen as harmful to local industries.',
      'Takes a balanced approach to environmental policy, supporting conservation without heavy-handed mandates.',
    ],
  },
  'criminal-justice-reform': {
    dem_supports: [
      'Supports criminal justice reform including sentencing reform, police accountability, and reducing incarceration.',
      'Advocates for ending mass incarceration, investing in community-based alternatives, and addressing racial disparities.',
    ],
    gop_supports: [
      'Supports law enforcement funding, tough-on-crime policies, and protecting communities from violent crime.',
      'Advocates for backing the blue, mandatory minimum sentences for violent offenders, and victims rights.',
    ],
    opposes: [
      'Opposes criminal justice reform measures seen as weakening law enforcement or public safety.',
      'Critical of policies perceived as being soft on crime or reducing penalties for offenders.',
    ],
    mixed: [
      'Supports targeted criminal justice reforms like reentry programs while maintaining strong law enforcement.',
      'Takes a nuanced approach, supporting both police and reform efforts to improve the justice system.',
    ],
  },
  'foreign-policy-and-diplomacy': {
    dem_supports: [
      'Supports multilateral diplomacy, international alliances, and American leadership in global institutions.',
      'Advocates for diplomacy-first approaches, human rights promotion, and strengthening NATO partnerships.',
    ],
    gop_supports: [
      'Supports an America-first foreign policy while maintaining strategic alliances and strong deterrence.',
      'Advocates for protecting American interests abroad, strong diplomacy backed by military readiness.',
    ],
    opposes: [
      'Critical of foreign aid spending and military interventions, favoring a more restrained foreign policy.',
      'Opposes international agreements seen as undermining American sovereignty.',
    ],
    mixed: [
      'Takes a pragmatic approach to foreign policy, supporting alliances while questioning specific interventions.',
      'Balances internationalism with concerns about the cost and scope of American commitments abroad.',
    ],
  },
  'technology-and-ai-regulation': {
    dem_supports: [
      'Supports regulating big tech, protecting consumer privacy, and ensuring AI safety standards.',
      'Advocates for digital privacy protections, antitrust enforcement against tech monopolies, and net neutrality.',
    ],
    gop_supports: [
      'Supports tech innovation with limited regulation, opposing government censorship and promoting free speech online.',
      'Advocates for protecting free speech on social media while addressing concerns about big tech bias.',
    ],
    opposes: [
      'Opposes heavy-handed tech regulation, preferring industry self-regulation and innovation-friendly policies.',
      'Critical of government overreach in technology regulation.',
    ],
    mixed: [
      'Supports targeted tech regulation for safety while avoiding stifling innovation.',
      'Takes a balanced approach to technology policy, weighing privacy concerns against economic growth.',
    ],
  },
  'social-security-and-medicare': {
    dem_supports: [
      'Supports strengthening and expanding Social Security and Medicare benefits for seniors.',
      'Advocates for protecting Social Security from cuts, expanding Medicare coverage, and lowering the eligibility age.',
    ],
    gop_supports: [
      'Supports preserving Social Security and Medicare while exploring reforms to ensure long-term solvency.',
      'Advocates for protecting current beneficiaries while making structural changes for future sustainability.',
    ],
    opposes: [
      'Calls for significant reforms to entitlement programs to address long-term fiscal sustainability.',
    ],
    mixed: [
      'Supports protecting current benefits while open to bipartisan reforms for long-term program stability.',
    ],
  },
  'gun-policy-and-2nd-amendment': {
    dem_supports: [
      'Supports common-sense gun safety measures including universal background checks and assault weapons restrictions.',
      'Advocates for gun violence prevention through background checks, red flag laws, and safe storage requirements.',
    ],
    gop_supports: [
      'Strongly supports Second Amendment rights and opposes new restrictions on lawful gun ownership.',
      'Champions the right to keep and bear arms, opposing gun control measures as unconstitutional.',
      'Advocates for protecting gun rights, supporting concealed carry reciprocity, and opposing gun registries.',
    ],
    opposes: [
      'Opposes new gun control legislation, arguing existing laws should be better enforced.',
      'Strongly opposes restrictions on firearm ownership, viewing them as violations of constitutional rights.',
    ],
    mixed: [
      'Supports some gun safety measures while protecting Second Amendment rights for law-abiding citizens.',
      'Takes a moderate stance on firearms policy, supporting background checks while opposing bans.',
    ],
  },
  'infrastructure-and-transportation': {
    dem_supports: [
      'Supports major infrastructure investment including roads, bridges, public transit, and broadband expansion.',
      'Advocates for modernizing transportation systems, expanding high-speed rail, and investing in green infrastructure.',
    ],
    gop_supports: [
      'Supports infrastructure investment focused on roads, bridges, and rural broadband with private sector participation.',
      'Advocates for streamlining permitting processes and using public-private partnerships for infrastructure projects.',
    ],
    opposes: [
      'Concerns about infrastructure spending packages tied to unrelated policy priorities.',
    ],
    mixed: [
      'Supports infrastructure investment while seeking fiscal responsibility in how projects are funded.',
    ],
  },
  'housing-and-affordability': {
    dem_supports: [
      'Supports affordable housing initiatives, rent stabilization, and increased funding for public housing.',
      'Advocates for expanding housing assistance, combating homelessness, and addressing the housing affordability crisis.',
    ],
    gop_supports: [
      'Supports reducing regulations that increase housing costs and promoting homeownership through market solutions.',
      'Advocates for cutting zoning restrictions and permitting red tape to increase housing supply.',
    ],
    opposes: [
      'Opposes federal housing mandates, preferring local control over zoning and housing policy.',
    ],
    mixed: [
      'Supports increasing housing supply through both market solutions and targeted assistance programs.',
    ],
  },
  'energy-policy-and-oil-gas': {
    dem_supports: [
      'Supports transitioning to clean energy while managing the economic impacts on fossil fuel communities.',
      'Advocates for renewable energy incentives, electric vehicle adoption, and reducing dependence on fossil fuels.',
    ],
    gop_supports: [
      'Supports American energy independence through expanded oil, gas, and nuclear energy production.',
      'Advocates for an all-of-the-above energy strategy, supporting fossil fuels alongside renewable development.',
      'Champions domestic energy production, pipeline development, and reducing regulatory barriers for energy companies.',
    ],
    opposes: [
      'Opposes fossil fuel expansion and subsidies, calling for rapid transition to renewable energy sources.',
      'Critical of continued investment in oil and gas infrastructure given climate concerns.',
    ],
    mixed: [
      'Supports a balanced energy approach that includes both traditional and renewable sources.',
      'Takes a pragmatic stance on energy, supporting clean energy goals while acknowledging fossil fuel realities.',
    ],
  },
};

// Deterministic pick from array based on name hash
function pick(arr, name) {
  if (!arr || arr.length === 0) return null;
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return arr[hash % arr.length];
}

function getTemplateKey(party, stance) {
  const bucket = ['strongly_supports', 'supports', 'leans_support'].includes(stance) ? 'supports'
    : ['strongly_opposes', 'opposes', 'leans_oppose'].includes(stance) ? 'opposes'
    : ['mixed', 'neutral'].includes(stance) ? 'mixed' : 'unknown';

  if (bucket === 'unknown') return null;
  if (bucket === 'supports') return party === 'republican' ? 'gop_supports' : 'dem_supports';
  if (bucket === 'opposes') return 'opposes';
  return 'mixed';
}

function isGeneric(summary) {
  if (!summary || summary === 'null') return true;
  if (summary.includes('key aspects')) return true;
  if (summary.includes('generally been')) return true;
  if (summary.includes('has a nuanced position on')) return true;
  if (summary.includes('supports key')) return true;
  return false;
}

// Main
console.log('Loading politicians and issues...');
let allPols = new Map();
let from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, name, party, chamber').range(from, from + 999);
  if (!data || !data.length) break;
  for (const p of data) allPols.set(p.id, p);
  from += 1000;
}

const { data: issues } = await sb.from('issues').select('id, name, slug');
const issueMap = new Map(issues.map(i => [i.id, i]));

console.log(`Loaded ${allPols.size} politicians, ${issues.length} issues`);

// Get all stances that need updating
let toUpdate = [];
from = 0;
while (true) {
  const { data } = await sb.from('politician_issues').select('id, politician_id, issue_id, stance, summary').range(from, from + 999);
  if (!data || !data.length) break;
  for (const row of data) {
    if (isGeneric(row.summary)) toUpdate.push(row);
  }
  from += 1000;
}

console.log(`Found ${toUpdate.length} stances with generic summaries to update`);

// Generate and batch update
let updated = 0, skipped = 0;
const BATCH = 500;
let batch = [];

for (const row of toUpdate) {
  const pol = allPols.get(row.politician_id);
  const issue = issueMap.get(row.issue_id);
  if (!pol || !issue) { skipped++; continue; }

  const templates = TEMPLATES[issue.slug];
  if (!templates) { skipped++; continue; }

  const key = getTemplateKey(pol.party, row.stance);
  if (!key) { skipped++; continue; }

  const templateArr = templates[key];
  const summary = pick(templateArr, pol.name);
  if (!summary) { skipped++; continue; }

  batch.push({ id: row.id, summary });

  if (batch.length >= BATCH) {
    // Batch update using individual updates (supabase doesn't support bulk update by ID)
    for (const item of batch) {
      await sb.from('politician_issues').update({ summary: item.summary }).eq('id', item.id);
    }
    updated += batch.length;
    console.log(`  Updated ${updated}/${toUpdate.length}`);
    batch = [];
  }
}

// Flush remaining
if (batch.length > 0) {
  for (const item of batch) {
    await sb.from('politician_issues').update({ summary: item.summary }).eq('id', item.id);
  }
  updated += batch.length;
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);

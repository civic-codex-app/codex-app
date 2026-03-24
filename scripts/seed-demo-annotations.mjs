/**
 * Seed approved annotations (corrections, sources, context) on prominent politicians.
 * Uses demo users as authors. ~100-150 annotations total.
 *
 * Usage: node scripts/seed-demo-annotations.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Template annotations by type — these will be matched to politicians
const ANNOTATIONS = [
  // SOURCES — linking to real voting records or statements
  { type: 'source', pol: 'Donald Trump', issue: 'immigration-and-border-security', content: 'Executive Order 14159 reinstated the Remain in Mexico policy and expanded Title 42 enforcement at the southern border.', source_url: 'https://www.whitehouse.gov' },
  { type: 'source', pol: 'Donald Trump', issue: 'trade-and-tariffs', content: 'Imposed a universal 10% tariff on all imports and up to 60% on Chinese goods, significantly expanding the 2018-era trade war tariffs.', source_url: 'https://www.whitehouse.gov' },
  { type: 'source', pol: 'Bernie Sanders', issue: 'healthcare-and-medicare', content: 'Introduced the Medicare for All Act (S.1129) which would create a single-payer healthcare system covering all Americans.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Nancy Pelosi', issue: 'gun-policy-and-2nd-amendment', content: 'Led passage of H.R. 8, the Bipartisan Background Checks Act, through the House in 2019 and 2021.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Mitch McConnell', issue: 'foreign-policy-and-diplomacy', content: 'Consistently voted for Ukraine aid packages and publicly broke with some party members to support continued NATO commitment.', source_url: 'https://www.senate.gov' },
  { type: 'source', pol: 'Ted Cruz', issue: 'energy-policy-and-oil-gas', content: 'Sponsored the American Energy Independence Act to expand drilling on federal lands and expedite LNG export permits.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Elizabeth Warren', issue: 'housing-and-affordability', content: 'Proposed the American Housing and Economic Mobility Act to invest $500B in affordable housing construction.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Ron DeSantis', issue: 'education-and-student-debt', content: 'Signed the Parental Rights in Education Act (HB 1557) restricting classroom instruction on sexual orientation and gender identity.', source_url: 'https://www.flgov.com' },
  { type: 'source', pol: 'Gavin Newsom', issue: 'climate-and-environment', content: 'Signed executive order banning the sale of new gas-powered vehicles by 2035 and committing California to carbon neutrality.', source_url: 'https://www.gov.ca.gov' },
  { type: 'source', pol: 'Josh Hawley', issue: 'technology-and-ai-regulation', content: 'Introduced the Social Media Addiction Reduction Technology (SMART) Act to ban addictive design features and autoplay.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Marco Rubio', issue: 'foreign-policy-and-diplomacy', content: 'Co-authored the Hong Kong Human Rights and Democracy Act and led sanctions efforts against Cuba and Venezuela.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Alexandria Ocasio-Cortez', issue: 'climate-and-environment', content: 'Co-authored the Green New Deal resolution (H.Res.109) calling for net-zero emissions by 2030 and a federal jobs guarantee.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Rand Paul', issue: 'privacy-and-surveillance', content: 'Filibustered the PATRIOT Act renewal and introduced the Fourth Amendment Preservation and Protection Act to end warrantless surveillance.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Susan Collins', issue: 'reproductive-rights', content: 'Voted against overturning Roe v. Wade and co-sponsored the Reproductive Freedom for All Act to codify abortion access.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'John Cornyn', issue: 'gun-policy-and-2nd-amendment', content: 'Co-authored the Bipartisan Safer Communities Act after the Uvalde shooting, the first major gun safety legislation in decades.', source_url: 'https://www.congress.gov' },

  // CONTEXT — providing nuance to positions
  { type: 'context', pol: 'JD Vance', issue: 'labor-and-unions', content: 'Despite being Republican, Vance walked the picket line with UAW workers and has called for stronger labor protections, breaking with traditional GOP positions on unions.' },
  { type: 'context', pol: 'Robert F. Kennedy Jr.', issue: 'healthcare-and-medicare', content: 'While generally supportive of healthcare access, RFK Jr. has promoted vaccine skepticism and opposed many public health mandates, creating a unique position within the health policy space.' },
  { type: 'context', pol: 'Tulsi Gabbard', issue: 'foreign-policy-and-diplomacy', content: 'As a former Democrat who served in Iraq, Gabbard holds a uniquely non-interventionist stance that transcends traditional party lines on military engagement.' },
  { type: 'context', pol: 'Lindsey Graham', issue: 'reproductive-rights', content: 'Proposed a federal 15-week abortion ban, positioning himself between total ban advocates and those who support broader access, creating tension within the GOP.' },
  { type: 'context', pol: 'Joe Manchin', issue: 'climate-and-environment', content: 'As senator from coal-heavy West Virginia, Manchin supported the Inflation Reduction Act climate provisions only after securing protections for fossil fuel leasing.' },
  { type: 'context', pol: 'Mitt Romney', issue: 'taxes-and-spending', content: 'Broke with party to support expanded child tax credit proposals, reflecting his long-standing interest in anti-poverty policy despite fiscal conservatism.' },
  { type: 'context', pol: 'Greg Abbott', issue: 'immigration-and-border-security', content: 'Operation Lone Star deployed Texas National Guard to the border independently of federal immigration enforcement, establishing a model other governors followed.' },
  { type: 'context', pol: 'Gretchen Whitmer', issue: 'economy-and-jobs', content: 'Secured major EV manufacturing investments for Michigan through a combination of state incentives and federal IRA funding, positioning the state as an EV hub.' },
  { type: 'context', pol: 'Tim Scott', issue: 'criminal-justice-reform', content: 'Led the GOP response on police reform after George Floyd, proposing the JUSTICE Act as an alternative to Democratic proposals, focusing on data collection and training.' },
  { type: 'context', pol: 'Amy Klobuchar', issue: 'technology-and-ai-regulation', content: 'As chair of the Senate antitrust subcommittee, Klobuchar has led bipartisan efforts to rein in Big Tech monopolies through the American Innovation and Choice Online Act.' },

  // CORRECTIONS — fixing or clarifying potentially misleading info
  { type: 'correction', pol: 'Dan Crenshaw', issue: 'climate-and-environment', content: 'While generally skeptical of climate regulation, Crenshaw has supported some clean energy investments and carbon capture research, making his position more nuanced than a simple "oppose."' },
  { type: 'correction', pol: 'Lori Chavez-DeRemer', issue: 'labor-and-unions', content: 'Notably, Chavez-DeRemer was endorsed by multiple labor unions during her House campaign and supported the PRO Act provisions, unusual for a Republican member.' },
  { type: 'correction', pol: 'Kyrsten Sinema', issue: 'taxes-and-spending', content: 'Sinema blocked the carried interest loophole closure in the IRA but supported the 15% corporate minimum tax, showing a more selective approach to tax policy than simply opposing spending.' },
  { type: 'correction', pol: 'John Curtis', issue: 'climate-and-environment', content: 'As founder of the Conservative Climate Caucus, Curtis actively advocates for market-based climate solutions while opposing regulatory mandates — a distinct position from climate denial.' },
  { type: 'correction', pol: 'Nancy Mace', issue: 'reproductive-rights', content: 'Mace supports exceptions for rape, incest, and life of the mother in abortion legislation and has publicly opposed a total ban, distinguishing herself from many GOP colleagues.' },
  { type: 'correction', pol: 'Jared Golden', issue: 'gun-policy-and-2nd-amendment', content: 'After the Lewiston, Maine mass shooting, Golden reversed his opposition to an assault weapons ban, saying he was wrong to oppose such legislation previously.' },

  // More sources for variety
  { type: 'source', pol: 'Chuck Schumer', issue: 'technology-and-ai-regulation', content: 'Launched the bipartisan AI Insight Forums bringing together tech leaders and policymakers to develop a regulatory framework for artificial intelligence.', source_url: 'https://www.senate.gov' },
  { type: 'source', pol: 'Jim Jordan', issue: 'criminal-justice-reform', content: 'Co-sponsored the First Step Act with Democrats, supporting reduced mandatory minimums and expanded early release programs for federal prisoners.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Katie Britt', issue: 'immigration-and-border-security', content: 'Co-authored border security provisions in the bipartisan Senate immigration deal before it was shelved, supporting both enforcement and processing reforms.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Tammy Baldwin', issue: 'lgbtq-rights', content: 'As the first openly gay U.S. senator, Baldwin co-authored and helped pass the Respect for Marriage Act codifying same-sex marriage protections.', source_url: 'https://www.congress.gov' },
  { type: 'source', pol: 'Josh Shapiro', issue: 'criminal-justice-reform', content: 'As governor, signed executive order establishing the Board of Pardons reform and expanded clemency review processes for nonviolent offenders.', source_url: 'https://www.governor.pa.gov' },
  { type: 'source', pol: 'Wes Moore', issue: 'drug-policy', content: 'Pardoned over 175,000 marijuana convictions as governor, the largest mass pardon for cannabis offenses in U.S. history.', source_url: 'https://www.governor.maryland.gov' },
  { type: 'source', pol: 'Kim Reynolds', issue: 'education-and-student-debt', content: 'Signed the Students First Act establishing the most expansive school choice voucher program in the country, covering all K-12 students.', source_url: 'https://www.governor.iowa.gov' },
  { type: 'source', pol: 'Ro Khanna', issue: 'technology-and-ai-regulation', content: 'Introduced the Internet Bill of Rights framework and co-chairs the Congressional Caucus on the Future of Work, focusing on AI governance and worker displacement.', source_url: 'https://www.congress.gov' },

  // More context
  { type: 'context', pol: 'Mike Johnson', issue: 'taxes-and-spending', content: 'As Speaker, Johnson navigated between fiscal hawks demanding spending cuts and appropriators seeking to maintain current funding levels, ultimately passing both CRs and full-year spending bills.' },
  { type: 'context', pol: 'John Fetterman', issue: 'immigration-and-border-security', content: 'Despite being a progressive Democrat, Fetterman has taken a notably harder line on border security than most party colleagues, supporting stricter asylum policies.' },
  { type: 'context', pol: 'Brian Kemp', issue: 'voting-rights', content: 'Signed the Election Integrity Act (SB 202) which expanded early voting hours but added voter ID requirements for absentee ballots, drawing both praise and criticism.' },
  { type: 'context', pol: 'Hakeem Jeffries', issue: 'criminal-justice-reform', content: 'As a former public defender, Jeffries brings firsthand courtroom experience to criminal justice policy and co-authored the George Floyd Justice in Policing Act.' },
  { type: 'context', pol: 'Marjorie Taylor Greene', issue: 'national-defense-and-military', content: 'While strongly pro-military domestically, Greene has broken with traditional GOP hawks by opposing continued Ukraine funding, aligning with an emerging non-interventionist wing.' },
]

async function run() {
  // Load politicians
  const polMap = {}
  let from = 0
  while (true) {
    const { data } = await supabase.from('politicians').select('id, name').range(from, from + 999)
    if (!data?.length) break
    for (const p of data) polMap[p.name] = p.id
    from += 1000
  }

  // Load issues
  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueMap = Object.fromEntries(issues.map(i => [i.slug, i.id]))

  // Load random demo users for authorship
  let demoUsers = []
  from = 0
  while (true) {
    const { data } = await supabase.from('profiles').select('id').eq('is_demo', true).range(from, from + 999)
    if (!data?.length) break
    demoUsers.push(...data)
    from += 1000
  }

  // Shuffle demo users
  demoUsers.sort(() => Math.random() - 0.5)

  console.log(`Politicians: ${Object.keys(polMap).length}`)
  console.log(`Demo users: ${demoUsers.length}`)
  console.log(`Annotations to create: ${ANNOTATIONS.length}`)

  let created = 0, skipped = 0

  for (let i = 0; i < ANNOTATIONS.length; i++) {
    const ann = ANNOTATIONS[i]
    const polId = polMap[ann.pol]
    const issueId = issueMap[ann.issue]
    const userId = demoUsers[i % demoUsers.length].id

    if (!polId) {
      console.log(`  SKIP: ${ann.pol} not found`)
      skipped++
      continue
    }

    const row = {
      user_id: userId,
      politician_id: polId,
      issue_id: issueId || null,
      annotation_type: ann.type,
      content: ann.content,
      source_url: ann.source_url || null,
      status: 'approved',
    }

    const { error } = await supabase.from('annotations').insert(row)
    if (error) {
      console.error(`  ERROR: ${ann.pol}/${ann.issue}: ${error.message}`)
      skipped++
    } else {
      created++
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Annotations created: ${created}`)
  console.log(`Skipped: ${skipped}`)
}

run().catch(console.error)

import { createClient } from '@supabase/supabase-js';

const c = createClient(
  'https://jzxgkvwbhdagqwvisxkt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGdrdndiaGRhZ3F3dmlzeGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1MjI4MiwiZXhwIjoyMDg5NjI4MjgyfQ.6trLdjlsSeCmQvVbkh1MkK-TGf5fpP_MHTJQ3BbyjcY'
);

// Issue slugs for reference
const ISSUES = {
  'economy-and-jobs': null,
  'healthcare-and-medicare': null,
  'immigration-and-border-security': null,
  'education-and-student-debt': null,
  'national-defense-and-military': null,
  'climate-and-environment': null,
  'criminal-justice-reform': null,
  'foreign-policy-and-diplomacy': null,
  'technology-and-ai-regulation': null,
  'social-security-and-medicare': null,
  'gun-policy-and-2nd-amendment': null,
  'infrastructure-and-transportation': null,
  'housing-and-affordability': null,
  'energy-policy-and-oil-gas': null,
};

// Default stances by party
// [economy, healthcare, immigration, education, defense, climate, criminal-justice, foreign-policy, tech, social-security, guns, infrastructure, housing, energy]
const PARTY_DEFAULTS = {
  democrat: {
    'economy-and-jobs': { stance: 'supports', summary: 'Supports raising the minimum wage, expanding worker protections, and progressive tax reform to reduce income inequality.' },
    'healthcare-and-medicare': { stance: 'supports', summary: 'Supports expanding the Affordable Care Act, lowering prescription drug costs, and protecting coverage for pre-existing conditions.' },
    'immigration-and-border-security': { stance: 'mixed', summary: 'Supports a pathway to citizenship for undocumented immigrants while also backing border security measures and DACA protections.' },
    'education-and-student-debt': { stance: 'supports', summary: 'Supports student loan forgiveness programs, increased funding for public schools, and making community college tuition-free.' },
    'national-defense-and-military': { stance: 'supports', summary: 'Supports a strong national defense while emphasizing diplomacy and oversight of military spending.' },
    'climate-and-environment': { stance: 'supports', summary: 'Supports aggressive climate action including clean energy investment, rejoining the Paris Agreement, and reducing carbon emissions.' },
    'criminal-justice-reform': { stance: 'supports', summary: 'Supports police reform, sentencing reform, ending cash bail, and addressing systemic inequities in the justice system.' },
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'Supports multilateral diplomacy, strengthening alliances like NATO, and international cooperation on global challenges.' },
    'technology-and-ai-regulation': { stance: 'supports', summary: 'Supports regulating big tech companies, protecting consumer data privacy, and establishing guardrails for AI development.' },
    'social-security-and-medicare': { stance: 'supports', summary: 'Supports expanding Social Security benefits, opposing privatization, and strengthening Medicare for all seniors.' },
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'Supports universal background checks, assault weapons bans, red flag laws, and other gun safety measures.' },
    'infrastructure-and-transportation': { stance: 'supports', summary: 'Supports major federal investment in roads, bridges, broadband, and public transit infrastructure.' },
    'housing-and-affordability': { stance: 'supports', summary: 'Supports expanding affordable housing programs, rent assistance, and addressing housing discrimination.' },
    'energy-policy-and-oil-gas': { stance: 'mixed', summary: 'Supports transitioning to clean energy while managing the economic impact on fossil fuel-dependent communities.' },
  },
  republican: {
    'economy-and-jobs': { stance: 'supports', summary: 'Supports tax cuts, deregulation, and free-market policies to stimulate economic growth and job creation.' },
    'healthcare-and-medicare': { stance: 'opposes', summary: 'Opposes government-run healthcare and ACA mandates; supports market-based solutions and health savings accounts.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'Supports stricter border enforcement, building the border wall, reducing illegal immigration, and merit-based legal immigration.' },
    'education-and-student-debt': { stance: 'opposes', summary: 'Opposes blanket student loan forgiveness; supports school choice, charter schools, and parental rights in education.' },
    'national-defense-and-military': { stance: 'supports', summary: 'Supports increasing military funding, modernizing the armed forces, and maintaining a strong global military presence.' },
    'climate-and-environment': { stance: 'opposes', summary: 'Opposes costly environmental regulations; supports an all-of-the-above energy strategy prioritizing energy independence.' },
    'criminal-justice-reform': { stance: 'opposes', summary: 'Supports law enforcement funding, tough-on-crime policies, and opposes defunding police initiatives.' },
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'Supports a strong military posture, countering China and Russia, and prioritizing American interests in foreign affairs.' },
    'technology-and-ai-regulation': { stance: 'mixed', summary: 'Supports limited government regulation of tech, focusing on preventing censorship while opposing heavy-handed AI regulation.' },
    'social-security-and-medicare': { stance: 'mixed', summary: 'Supports preserving Social Security and Medicare while exploring reforms to ensure long-term solvency.' },
    'gun-policy-and-2nd-amendment': { stance: 'opposes', summary: 'Opposes new gun control measures; supports Second Amendment rights and opposes assault weapons bans.' },
    'infrastructure-and-transportation': { stance: 'supports', summary: 'Supports infrastructure investment focused on roads and bridges, with emphasis on private sector involvement.' },
    'housing-and-affordability': { stance: 'mixed', summary: 'Supports reducing regulations to increase housing supply rather than government housing programs.' },
    'energy-policy-and-oil-gas': { stance: 'supports', summary: 'Supports expanding domestic oil and gas production, energy independence, and reducing regulations on fossil fuels.' },
  },
  independent: {
    'economy-and-jobs': { stance: 'supports', summary: 'Supports policies to address income inequality, raise wages, and protect workers from corporate consolidation.' },
    'healthcare-and-medicare': { stance: 'supports', summary: 'Supports expanding healthcare access, including Medicare for All or public option proposals.' },
    'immigration-and-border-security': { stance: 'mixed', summary: 'Supports comprehensive immigration reform with both border security and a pathway for undocumented immigrants.' },
    'education-and-student-debt': { stance: 'supports', summary: 'Supports making public college tuition-free, canceling student debt, and increased K-12 funding.' },
    'national-defense-and-military': { stance: 'mixed', summary: 'Supports a strong defense while advocating for reduced military spending and greater diplomatic engagement.' },
    'climate-and-environment': { stance: 'supports', summary: 'Supports aggressive climate action and transitioning to renewable energy sources.' },
    'criminal-justice-reform': { stance: 'supports', summary: 'Supports comprehensive criminal justice reform, ending mass incarceration, and addressing racial disparities.' },
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'Supports diplomacy-first approach and international cooperation over unilateral military action.' },
    'technology-and-ai-regulation': { stance: 'supports', summary: 'Supports strong regulation of big tech, data privacy protections, and breaking up tech monopolies.' },
    'social-security-and-medicare': { stance: 'supports', summary: 'Supports expanding Social Security benefits by lifting the payroll tax cap on high earners.' },
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'Supports common-sense gun safety measures including universal background checks.' },
    'infrastructure-and-transportation': { stance: 'supports', summary: 'Supports major federal investment in infrastructure, including green energy and broadband.' },
    'housing-and-affordability': { stance: 'supports', summary: 'Supports expanding affordable housing, rent control, and addressing homelessness.' },
    'energy-policy-and-oil-gas': { stance: 'mixed', summary: 'Supports transitioning away from fossil fuels toward renewable energy while protecting workers.' },
  },
};

// Notable individual overrides - politicians with well-known positions that differ from party defaults
const OVERRIDES = {
  // MODERATE / CENTRIST REPUBLICANS
  'susan-collins': {
    'healthcare-and-medicare': { stance: 'mixed', summary: 'Has voted to protect the ACA and pre-existing condition protections; takes a moderate approach to healthcare reform.' },
    'climate-and-environment': { stance: 'mixed', summary: 'Has supported some climate legislation and acknowledges climate change as a real threat, breaking from party majority.' },
    'gun-policy-and-2nd-amendment': { stance: 'mixed', summary: 'Has supported bipartisan gun safety measures including the 2022 Bipartisan Safer Communities Act.' },
  },
  'lisa-murkowski': {
    'healthcare-and-medicare': { stance: 'mixed', summary: 'Voted to save the ACA from repeal; supports bipartisan healthcare solutions while opposing single-payer.' },
    'climate-and-environment': { stance: 'mixed', summary: 'One of few Republicans supporting carbon pricing and clean energy investment, reflecting Alaska\'s environmental concerns.' },
    'energy-policy-and-oil-gas': { stance: 'supports', summary: 'Strongly supports Alaska\'s energy industry while also backing renewable energy development and energy innovation.' },
  },
  'mitt-romney': {
    'climate-and-environment': { stance: 'mixed', summary: 'Acknowledges climate change and has supported carbon tax proposals, taking a more moderate Republican stance.' },
    'immigration-and-border-security': { stance: 'mixed', summary: 'Supports border security with a more moderate tone on immigration reform than many in his party.' },
  },
  'bill-cassidy': {
    'healthcare-and-medicare': { stance: 'mixed', summary: 'As a physician, supports healthcare reform but favors market-based solutions over ACA expansion; co-authored Graham-Cassidy.' },
    'infrastructure-and-transportation': { stance: 'supports', summary: 'Strongly supported the Bipartisan Infrastructure Law, breaking with many Republicans to pass it.' },
  },

  // PROGRESSIVE DEMOCRATS
  'bernie-sanders': {
    'economy-and-jobs': { stance: 'supports', summary: 'Champions a $15 minimum wage, workers\' rights, union support, and breaking up large corporations. Advocates democratic socialism.' },
    'healthcare-and-medicare': { stance: 'supports', summary: 'The leading advocate for Medicare for All, a single-payer healthcare system replacing private insurance.' },
    'education-and-student-debt': { stance: 'supports', summary: 'Authored the College for All Act to make public universities tuition-free and cancel all student loan debt.' },
    'climate-and-environment': { stance: 'supports', summary: 'Co-authored the Green New Deal resolution. Supports treating climate change as an existential crisis requiring transformative action.' },
    'energy-policy-and-oil-gas': { stance: 'opposes', summary: 'Opposes all new fossil fuel development and supports a rapid transition to 100% renewable energy.' },
    'housing-and-affordability': { stance: 'supports', summary: 'Supports national rent control, massive investment in affordable housing, and a tenants\' bill of rights.' },
  },
  'elizabeth-warren': {
    'economy-and-jobs': { stance: 'supports', summary: 'Champions a wealth tax on ultra-millionaires, breaking up big corporations, and aggressive financial regulation.' },
    'technology-and-ai-regulation': { stance: 'supports', summary: 'A leading voice for breaking up big tech companies like Amazon, Google, and Facebook, and regulating AI development.' },
    'housing-and-affordability': { stance: 'supports', summary: 'Authored major housing affordability legislation to build millions of new units and reduce costs for renters and buyers.' },
  },
  'ed-markey': {
    'climate-and-environment': { stance: 'supports', summary: 'Co-authored the Green New Deal resolution with Rep. Ocasio-Cortez. One of the Senate\'s strongest climate advocates.' },
    'technology-and-ai-regulation': { stance: 'supports', summary: 'Leads efforts on children\'s online privacy (COPPA 2.0) and comprehensive AI regulation in the Senate.' },
  },

  // MODERATE DEMOCRATS
  'joe-manchin': {
    'economy-and-jobs': { stance: 'mixed', summary: 'Supports bipartisan economic measures but opposes large spending packages; broke with Democrats on Build Back Better.' },
    'climate-and-environment': { stance: 'mixed', summary: 'Supports some clean energy investment but also strongly backs coal and natural gas from his state; key swing vote on IRA.' },
    'gun-policy-and-2nd-amendment': { stance: 'mixed', summary: 'An NRA-backed Democrat who supports Second Amendment rights but co-authored the Manchin-Toomey background check bill.' },
    'energy-policy-and-oil-gas': { stance: 'supports', summary: 'As chair of the Energy Committee, strongly supports fossil fuels alongside clean energy, representing West Virginia coal country.' },
    'immigration-and-border-security': { stance: 'mixed', summary: 'Takes a more conservative stance on immigration than most Democrats, supporting stricter border security.' },
  },
  'kyrsten-sinema': {
    'economy-and-jobs': { stance: 'mixed', summary: 'Originally centrist Democrat who blocked minimum wage increases and opposed some party-line spending bills.' },
    'climate-and-environment': { stance: 'mixed', summary: 'Supported the Inflation Reduction Act\'s climate provisions but opposed other climate regulations.' },
  },
  'jon-tester': {
    'gun-policy-and-2nd-amendment': { stance: 'mixed', summary: 'A gun owner who supports Second Amendment rights while also backing reasonable background check reforms.' },
    'energy-policy-and-oil-gas': { stance: 'supports', summary: 'Supports both clean energy and traditional energy development, reflecting Montana\'s energy-producing economy.' },
  },
  'mark-kelly': {
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'A leading gun safety advocate whose wife Gabby Giffords was shot; co-founded the Giffords gun safety organization.' },
    'immigration-and-border-security': { stance: 'mixed', summary: 'As an Arizona senator, supports both border security measures and pathways to citizenship for Dreamers.' },
    'national-defense-and-military': { stance: 'supports', summary: 'As a Navy combat pilot and astronaut, strongly supports military readiness and veterans\' benefits.' },
  },

  // TRUMP-ALIGNED REPUBLICANS
  'ted-cruz': {
    'immigration-and-border-security': { stance: 'supports', summary: 'One of the strongest voices for border wall construction, ending catch-and-release, and restricting legal immigration.' },
    'gun-policy-and-2nd-amendment': { stance: 'opposes', summary: 'Fiercely opposes all gun control measures; one of the NRA\'s strongest allies in the Senate.' },
    'climate-and-environment': { stance: 'opposes', summary: 'Opposes the Green New Deal and most climate legislation; questions the scientific consensus on climate change.' },
    'technology-and-ai-regulation': { stance: 'mixed', summary: 'Focuses on combating perceived Big Tech censorship of conservatives while opposing broad tech regulation.' },
  },
  'josh-hawley': {
    'technology-and-ai-regulation': { stance: 'supports', summary: 'A rare Republican advocate for tech regulation; has proposed bills to limit social media and break up Big Tech.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Populist economic stance supporting worker protections, opposing outsourcing, and criticizing corporate power.' },
    'foreign-policy-and-diplomacy': { stance: 'mixed', summary: 'Advocates for focusing on the China threat while reducing U.S. commitments in Europe and the Middle East.' },
  },
  'rand-paul': {
    'national-defense-and-military': { stance: 'mixed', summary: 'A libertarian-leaning voice against military interventionism and unchecked defense spending increases.' },
    'criminal-justice-reform': { stance: 'supports', summary: 'Breaks with party to support criminal justice reform, including the JUSTICE Act and ending no-knock warrants.' },
    'technology-and-ai-regulation': { stance: 'opposes', summary: 'Opposes government regulation of technology and the internet, favoring a libertarian hands-off approach.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Supports drastic spending cuts, balanced budget amendment, and libertarian free-market economic policies.' },
  },
  'marco-rubio': {
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'A leading hawk on China, Cuba, and Venezuela; supports strong sanctions and military readiness as deterrence.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'Originally co-authored bipartisan reform (Gang of Eight) but shifted to stronger enforcement-first position.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Supports an expanded child tax credit and pro-family economic policies alongside traditional conservative economics.' },
  },
  'lindsey-graham': {
    'national-defense-and-military': { stance: 'supports', summary: 'One of the Senate\'s most vocal defense hawks, supporting military intervention and increased defense budgets.' },
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'A leading voice for U.S. military engagement abroad, strong support for Israel, and hawkish foreign policy.' },
    'gun-policy-and-2nd-amendment': { stance: 'mixed', summary: 'Has supported some bipartisan gun measures including red flag laws while maintaining strong 2A support.' },
  },
  'mitch-mcconnell': {
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'Strongly supports NATO, Ukraine aid, and maintaining America\'s global leadership role, often breaking with isolationists.' },
    'gun-policy-and-2nd-amendment': { stance: 'opposes', summary: 'Consistently opposes new gun restrictions while occasionally allowing bipartisan measures to reach the floor.' },
  },
  'john-cornyn': {
    'gun-policy-and-2nd-amendment': { stance: 'mixed', summary: 'Led Republican negotiations on the Bipartisan Safer Communities Act after the Uvalde shooting in his home state.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'As a Texas senator, one of the strongest voices for border security and stricter immigration enforcement.' },
  },
  'mike-lee': {
    'technology-and-ai-regulation': { stance: 'opposes', summary: 'A constitutional conservative who opposes most tech regulation, favoring antitrust enforcement over new laws.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Champions limited government, balanced budgets, and constitutional constraints on federal spending.' },
    'criminal-justice-reform': { stance: 'supports', summary: 'Co-authored the FIRST STEP Act with bipartisan support, one of few Republicans leading on criminal justice reform.' },
  },
  'tim-scott': {
    'economy-and-jobs': { stance: 'supports', summary: 'Champions Opportunity Zones, small business tax cuts, and economic empowerment in underserved communities.' },
    'criminal-justice-reform': { stance: 'mixed', summary: 'Proposed the JUSTICE Act as a moderate alternative to Democratic police reform bills after George Floyd protests.' },
  },

  // NOTABLE GOVERNORS
  'gavin-newsom': {
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'One of America\'s strongest gun safety advocates, signing sweeping California gun laws and proposing a constitutional amendment.' },
    'climate-and-environment': { stance: 'supports', summary: 'Signed executive orders to ban new gas car sales by 2035 and set California\'s most aggressive climate targets.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'Declared California a sanctuary state and opposes federal immigration crackdowns; supports comprehensive reform.' },
  },
  'greg-abbott': {
    'immigration-and-border-security': { stance: 'supports', summary: 'Launched Operation Lone Star, bused migrants to sanctuary cities, and installed razor wire at the Texas border.' },
    'gun-policy-and-2nd-amendment': { stance: 'opposes', summary: 'Signed constitutional carry (permitless carry) into law and opposes federal gun control measures.' },
    'energy-policy-and-oil-gas': { stance: 'supports', summary: 'Strongly supports Texas oil and gas industry, opposes ESG restrictions, and backs energy deregulation.' },
  },
  'ron-desantis': {
    'education-and-student-debt': { stance: 'opposes', summary: 'Signed the Parental Rights in Education law, banned CRT in schools, and restructured New College of Florida.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'Flew migrants to Martha\'s Vineyard, signed strict anti-illegal immigration laws, and opposes sanctuary policies.' },
    'technology-and-ai-regulation': { stance: 'mixed', summary: 'Signed Florida\'s social media law for minors and took on Disney, but generally opposes heavy tech regulation.' },
  },
  'gretchen-whitmer': {
    'economy-and-jobs': { stance: 'supports', summary: 'Championed "Fix the Damn Roads" infrastructure plan and attracted major EV manufacturing investments to Michigan.' },
    'healthcare-and-medicare': { stance: 'supports', summary: 'Expanded Medicaid in Michigan and supports lowering prescription drug costs through state-level action.' },
  },
  'josh-shapiro': {
    'economy-and-jobs': { stance: 'supports', summary: 'Focused on bringing manufacturing jobs to Pennsylvania and supporting workforce development programs.' },
    'energy-policy-and-oil-gas': { stance: 'mixed', summary: 'Supports both Pennsylvania\'s natural gas industry and clean energy transition, seeking a balanced approach.' },
  },
  'kathy-hochul': {
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'Signed sweeping gun control laws after the Supreme Court\'s Bruen decision and the Buffalo mass shooting.' },
    'housing-and-affordability': { stance: 'supports', summary: 'Proposed major housing plan to address New York\'s affordability crisis, though faced legislative pushback.' },
  },
  'jb-pritzker': {
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'Signed Illinois\' assault weapons ban, one of the most comprehensive state-level gun safety laws.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Implemented a graduated income tax proposal and supports raising the minimum wage to support working families.' },
  },
  'brian-kemp': {
    'economy-and-jobs': { stance: 'supports', summary: 'Attracted major investments including Rivian and Hyundai EV plants to Georgia through business-friendly policies.' },
    'gun-policy-and-2nd-amendment': { stance: 'opposes', summary: 'Signed Georgia\'s constitutional carry law allowing permitless concealed carry statewide.' },
  },
  'glenn-youngkin': {
    'education-and-student-debt': { stance: 'opposes', summary: 'Campaigned on parental rights in education, banned CRT concepts in schools, and expanded charter school access.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Cut taxes, reduced regulations, and attracted business investment to Virginia with a pro-growth agenda.' },
  },
  'wes-moore': {
    'criminal-justice-reform': { stance: 'supports', summary: 'Signed cannabis legalization, expanded expungement of records, and focuses on reducing recidivism through opportunity.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Launched "Service Year" program and focused on economic development in underserved Baltimore communities.' },
  },
  'phil-murphy': {
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'Signed some of the nation\'s strictest gun laws in New Jersey, banning .50-caliber rifles and strengthening background checks.' },
    'climate-and-environment': { stance: 'supports', summary: 'Rejoined RGGI, set aggressive offshore wind targets, and signed the strongest environmental justice law in the nation.' },
  },

  // KEY DEMOCRATIC SENATORS
  'chuck-schumer': {
    'economy-and-jobs': { stance: 'supports', summary: 'As Senate Majority Leader, shepherded the Inflation Reduction Act, CHIPS Act, and bipartisan infrastructure law.' },
    'technology-and-ai-regulation': { stance: 'supports', summary: 'Launched the Senate\'s bipartisan AI policy framework and Insight Forums to develop comprehensive AI regulation.' },
  },
  'dick-durbin': {
    'immigration-and-border-security': { stance: 'supports', summary: 'Co-authored the original DREAM Act and is the Senate\'s leading advocate for Dreamer protections and immigration reform.' },
    'criminal-justice-reform': { stance: 'supports', summary: 'Chairs the Judiciary Committee and champions sentencing reform, ending mandatory minimums, and juvenile justice reform.' },
  },
  'cory-booker': {
    'criminal-justice-reform': { stance: 'supports', summary: 'A leading voice for criminal justice reform, co-authored the FIRST STEP Act and advocates for ending mass incarceration.' },
    'housing-and-affordability': { stance: 'supports', summary: 'Introduced the Baby Bonds program and major housing legislation to address wealth inequality and affordability.' },
  },
  'amy-klobuchar': {
    'technology-and-ai-regulation': { stance: 'supports', summary: 'Leads antitrust efforts against Big Tech and authored the American Innovation and Choice Online Act.' },
    'infrastructure-and-transportation': { stance: 'supports', summary: 'Championed rural broadband expansion and transportation infrastructure as key priorities for the Midwest.' },
  },
  'chris-murphy': {
    'gun-policy-and-2nd-amendment': { stance: 'supports', summary: 'The Senate\'s leading gun safety advocate since the Sandy Hook shooting in his state; led negotiations on the Bipartisan Safer Communities Act.' },
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'A leading voice on foreign policy, advocating for diplomatic solutions and greater Congressional oversight of military action.' },
  },
  'sheldon-whitehouse': {
    'climate-and-environment': { stance: 'supports', summary: 'Delivered over 290 "Time to Wake Up" Senate floor speeches on climate change; leads efforts on carbon pricing.' },
    'criminal-justice-reform': { stance: 'supports', summary: 'Advocates for RICO-style prosecution of dark money in politics and reform of the federal court system.' },
  },
  'tammy-duckworth': {
    'national-defense-and-military': { stance: 'supports', summary: 'A decorated combat veteran (Purple Heart) who lost both legs in Iraq; champions veterans\' benefits and military families.' },
    'infrastructure-and-transportation': { stance: 'supports', summary: 'As a former transportation official, leads on infrastructure investment, especially for veterans and people with disabilities.' },
  },
  'sherrod-brown': {
    'economy-and-jobs': { stance: 'supports', summary: 'One of the Senate\'s strongest labor advocates, fighting for manufacturing jobs, fair trade deals, and worker protections.' },
    'housing-and-affordability': { stance: 'supports', summary: 'As Banking Committee chair, led efforts on affordable housing investment and combating corporate landlord practices.' },
  },
  'john-fetterman': {
    'criminal-justice-reform': { stance: 'supports', summary: 'Led Pennsylvania\'s Board of Pardons expanding clemency; strong advocate for marijuana legalization and second chances.' },
    'economy-and-jobs': { stance: 'supports', summary: 'Populist economic message focused on raising the minimum wage and supporting union workers in Pennsylvania.' },
    'foreign-policy-and-diplomacy': { stance: 'mixed', summary: 'Breaks with many progressives on Israel, strongly supporting the U.S.-Israel relationship and opposing BDS.' },
  },
  'peter-welch': {
    'climate-and-environment': { stance: 'supports', summary: 'A leading climate advocate from Vermont, supporting the Green New Deal and aggressive emissions reduction targets.' },
    'healthcare-and-medicare': { stance: 'supports', summary: 'Supports Medicare for All and has been a vocal advocate for lowering prescription drug prices.' },
  },

  // MORE REPUBLICAN SENATORS
  'john-thune': {
    'economy-and-jobs': { stance: 'supports', summary: 'Helped author the 2017 Tax Cuts and Jobs Act; supports pro-business tax policy and reducing regulations.' },
    'technology-and-ai-regulation': { stance: 'mixed', summary: 'As Commerce Committee leader, supports light-touch tech regulation while addressing online safety for children.' },
  },
  'roger-wicker': {
    'national-defense-and-military': { stance: 'supports', summary: 'As Armed Services Committee leader, champions major increases in defense spending and naval shipbuilding.' },
  },
  'chuck-grassley': {
    'criminal-justice-reform': { stance: 'supports', summary: 'Co-authored the FIRST STEP Act and Sentencing Reform and Corrections Act, breaking with hardline GOP positions.' },
    'social-security-and-medicare': { stance: 'mixed', summary: 'Supports preserving Social Security while advocating for long-term reforms; chairs the committee overseeing these programs.' },
  },
  'tommy-tuberville': {
    'national-defense-and-military': { stance: 'mixed', summary: 'Blocked military promotions for months over Pentagon abortion policy, causing significant controversy within his own party.' },
  },
  'jd-vance': {
    'economy-and-jobs': { stance: 'supports', summary: 'Populist economic stance critical of Wall Street and supportive of working-class manufacturing communities in the Rust Belt.' },
    'foreign-policy-and-diplomacy': { stance: 'opposes', summary: 'Opposes continued Ukraine aid and advocates for restraining U.S. military commitments abroad.' },
    'technology-and-ai-regulation': { stance: 'mixed', summary: 'Former tech venture capitalist who is skeptical of Big Tech censorship but cautious about heavy regulation.' },
  },
  'rick-scott': {
    'economy-and-jobs': { stance: 'supports', summary: 'Proposed controversial plan to sunset all federal programs every 5 years; strongly pro-business and anti-tax.' },
    'social-security-and-medicare': { stance: 'mixed', summary: 'His "Rescue America" plan to sunset all federal legislation drew criticism for potentially threatening Social Security.' },
  },
  'tom-cotton': {
    'national-defense-and-military': { stance: 'supports', summary: 'An Army veteran and one of the Senate\'s most hawkish members on defense and military readiness.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'Authored the RAISE Act to cut legal immigration by 50% and supports the strictest enforcement measures.' },
    'foreign-policy-and-diplomacy': { stance: 'supports', summary: 'Hawkish on China and Iran; authored the controversial letter to Iran\'s leaders opposing the nuclear deal.' },
  },
  'marsha-blackburn': {
    'technology-and-ai-regulation': { stance: 'mixed', summary: 'Active on tech issues including children\'s online safety (KOSA) while opposing content moderation regulation.' },
    'immigration-and-border-security': { stance: 'supports', summary: 'One of the Senate\'s most vocal advocates for strict immigration enforcement and border wall funding.' },
  },
};

async function run() {
  // Fetch all data
  const { data: issues } = await c.from('issues').select('id, slug');
  const { data: politicians } = await c.from('politicians').select('id, name, slug, party, chamber');

  const issueMap = {};
  for (const i of issues) issueMap[i.slug] = i.id;

  console.log(`Loaded ${issues.length} issues, ${politicians.length} politicians`);

  const stances = [];

  for (const pol of politicians) {
    const party = pol.party;
    const defaults = PARTY_DEFAULTS[party] || PARTY_DEFAULTS.independent;
    const overrides = OVERRIDES[pol.slug] || {};

    for (const issueSlug of Object.keys(ISSUES)) {
      const issueId = issueMap[issueSlug];
      if (!issueId) continue;

      // Use override if exists, otherwise party default
      const data = overrides[issueSlug] || defaults[issueSlug];
      if (!data) continue;

      stances.push({
        politician_id: pol.id,
        issue_id: issueId,
        stance: data.stance,
        summary: data.summary,
      });
    }
  }

  console.log(`Generated ${stances.length} stance records`);

  // Upsert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < stances.length; i += BATCH) {
    const batch = stances.slice(i, i + BATCH);
    const { error } = await c.from('politician_issues').upsert(batch, {
      onConflict: 'politician_id,issue_id',
    });
    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      console.log(`Batch ${Math.floor(i/BATCH)+1}: ${inserted}/${stances.length} loaded`);
    }
  }

  console.log(`\nDone! Loaded ${inserted} stances (${errors} batch errors)`);

  // Verify
  const { count } = await c.from('politician_issues').select('*', { count: 'exact', head: true });
  console.log(`Total stances in DB: ${count}`);
}

run().catch(console.error);

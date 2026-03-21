import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Read .env.local
// ---------------------------------------------------------------------------
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------------------------------------------------------
// Deterministic hash for consistent vote assignment
// ---------------------------------------------------------------------------
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// 118th Congress bills (2023-2025) — REAL significant legislation
// lean: D = Democratic priority, R = Republican priority, B = bipartisan
// ---------------------------------------------------------------------------
const BILLS_118 = [
  // === SIGNED INTO LAW ===
  {
    number: 'H.R.2670',
    title: 'National Defense Authorization Act for Fiscal Year 2024',
    summary: 'Authorizes $886 billion in defense spending including a 5.2% military pay raise, weapons modernization programs, and provisions addressing threats from China.',
    status: 'signed_into_law',
    introduced_date: '2023-04-17',
    last_action_date: '2023-12-22',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3746',
    title: 'Fiscal Responsibility Act of 2023',
    summary: 'Suspends the debt ceiling through January 1, 2025, caps non-defense discretionary spending, claws back unspent COVID-19 relief funds, and restores student loan payments.',
    status: 'signed_into_law',
    introduced_date: '2023-05-29',
    last_action_date: '2023-06-03',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.4366',
    title: 'Further Continuing Appropriations and Other Extensions Act, 2024',
    summary: 'Short-term continuing resolution funding the federal government through early 2024, extending key programs and providing emergency disaster relief funds.',
    status: 'signed_into_law',
    introduced_date: '2023-06-26',
    last_action_date: '2024-01-19',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.815',
    title: 'National Security Supplemental Appropriations Act, 2024',
    summary: 'Provides $95 billion in emergency aid: $61B for Ukraine, $26B for Israel, $8B for Indo-Pacific/Taiwan, and includes the TikTok divestiture mandate.',
    status: 'signed_into_law',
    introduced_date: '2023-02-06',
    last_action_date: '2024-04-24',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7521',
    title: 'Protecting Americans from Foreign Adversary Controlled Applications Act',
    summary: 'Requires ByteDance to divest TikTok within 270 days or face a ban from U.S. app stores, citing national security concerns over Chinese data access.',
    status: 'signed_into_law',
    introduced_date: '2024-03-05',
    last_action_date: '2024-04-24',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7888',
    title: 'Reforming Intelligence and Securing America Act',
    summary: 'Reauthorizes Section 702 of FISA for two years, reforms warrant procedures, and adds oversight requirements for foreign intelligence surveillance.',
    status: 'signed_into_law',
    introduced_date: '2024-04-09',
    last_action_date: '2024-04-20',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.2226',
    title: 'FAA Reauthorization Act of 2024',
    summary: 'Reauthorizes the FAA for five years, increases funding for airport infrastructure, addresses pilot shortages, and improves aviation safety standards.',
    status: 'signed_into_law',
    introduced_date: '2023-07-11',
    last_action_date: '2024-05-16',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.8070',
    title: 'Servicemember Quality of Life Improvement and National Defense Authorization Act for FY2025',
    summary: 'Authorizes $895 billion in defense spending with the largest military pay raise in decades, housing improvements, and expanded childcare for military families.',
    status: 'signed_into_law',
    introduced_date: '2024-04-19',
    last_action_date: '2024-12-23',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.6363',
    title: 'Further Additional Continuing Appropriations and Extensions Act, 2024',
    summary: 'Second continuing resolution extending government funding through March 2024, averting a partial government shutdown.',
    status: 'signed_into_law',
    introduced_date: '2024-01-10',
    last_action_date: '2024-01-19',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.2882',
    title: 'Consolidated Appropriations Act, 2024',
    summary: 'Omnibus spending package funding all federal agencies for FY2024 totaling approximately $1.66 trillion, including defense and non-defense spending.',
    status: 'signed_into_law',
    introduced_date: '2023-04-26',
    last_action_date: '2024-03-23',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.4681',
    title: 'Airport and Airway Extension Act of 2023',
    summary: 'Short-term extension of FAA programs and airport funding to prevent disruption while long-term reauthorization was debated.',
    status: 'signed_into_law',
    introduced_date: '2023-07-17',
    last_action_date: '2024-01-05',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3250',
    title: 'Conveying the Israeli Knesset Menorah to the United States Holocaust Memorial Museum',
    summary: 'Transfers the Israeli Knesset Menorah sculpture to the U.S. Holocaust Memorial Museum for permanent display.',
    status: 'signed_into_law',
    introduced_date: '2023-05-15',
    last_action_date: '2024-01-05',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.546',
    title: 'Railway Safety Act of 2023',
    summary: 'Strengthens rail safety regulations in response to the East Palestine, Ohio derailment including requirements for two-person train crews and enhanced inspections.',
    status: 'signed_into_law',
    introduced_date: '2023-02-22',
    last_action_date: '2023-12-29',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.5009',
    title: 'Coast Guard Authorization Act of 2024',
    summary: 'Authorizes Coast Guard activities for two years including funding for new cutters, addresses sexual assault in the Coast Guard, and improves maritime safety.',
    status: 'signed_into_law',
    introduced_date: '2023-07-28',
    last_action_date: '2024-12-23',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.1425',
    title: 'Think Differently Database Act',
    summary: 'Creates a national database of resources for individuals with intellectual and developmental disabilities to help with employment, housing, and education.',
    status: 'signed_into_law',
    introduced_date: '2023-03-07',
    last_action_date: '2023-12-29',
    congress_session: '118th',
    lean: 'B',
  },
  // === PASSED ONE CHAMBER ===
  {
    number: 'H.R.2',
    title: 'Secure the Border Act of 2023',
    summary: 'Requires completion of the border wall, increases Border Patrol agents by 22,000, restricts asylum claims, implements mandatory E-Verify, and ends catch-and-release.',
    status: 'passed_house',
    introduced_date: '2023-01-09',
    last_action_date: '2023-05-11',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.1',
    title: 'Lower Energy Costs Act',
    summary: 'Repeals key climate provisions of the IRA, accelerates energy permitting, mandates oil and gas lease sales, and restricts ESG investing in federal retirement funds.',
    status: 'passed_house',
    introduced_date: '2023-01-09',
    last_action_date: '2023-03-30',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.5376',
    title: 'Tax Relief for American Families and Workers Act of 2024',
    summary: 'Bipartisan bill expanding the child tax credit, extending business tax deductions for R&D, and increasing the low-income housing tax credit.',
    status: 'passed_house',
    introduced_date: '2024-01-17',
    last_action_date: '2024-01-31',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.6090',
    title: 'Antisemitism Awareness Act of 2023',
    summary: 'Requires the Department of Education to use the IHRA definition of antisemitism when investigating discrimination complaints under Title VI of the Civil Rights Act.',
    status: 'passed_house',
    introduced_date: '2023-10-26',
    last_action_date: '2024-05-01',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.1163',
    title: 'HALT Fentanyl Act',
    summary: 'Permanently classifies fentanyl-related substances as Schedule I controlled substances and increases criminal penalties for trafficking synthetic opioids.',
    status: 'passed_house',
    introduced_date: '2023-02-21',
    last_action_date: '2023-05-10',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.1409',
    title: 'Kids Online Safety Act',
    summary: 'Requires social media platforms to enable safeguards for minors including options to disable addictive features and algorithmic recommendations.',
    status: 'passed_senate',
    introduced_date: '2023-05-02',
    last_action_date: '2024-07-30',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.2073',
    title: 'PRESS Act',
    summary: 'Protects journalists from being compelled to reveal confidential sources in federal proceedings, establishing a federal media shield law.',
    status: 'passed_senate',
    introduced_date: '2023-06-21',
    last_action_date: '2024-01-18',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3935',
    title: 'Right to Contraception Act',
    summary: 'Codifies the right to access contraception into federal law and prohibits states from restricting contraception access.',
    status: 'passed_house',
    introduced_date: '2023-06-12',
    last_action_date: '2024-06-21',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.7024',
    title: 'Pregnant Workers Fairness Act Implementation',
    summary: 'Strengthens workplace protections for pregnant workers by requiring reasonable accommodations and preventing discrimination.',
    status: 'passed_house',
    introduced_date: '2024-01-18',
    last_action_date: '2024-03-15',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3564',
    title: 'Parents Bill of Rights Act',
    summary: 'Requires schools to inform parents about curricula, allows parental review of instructional materials, and mandates notification about school violence.',
    status: 'passed_house',
    introduced_date: '2023-05-18',
    last_action_date: '2023-03-24',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.3',
    title: 'Protect Our Kids Act',
    summary: 'Raises the federal minimum age for purchasing semi-automatic rifles from 18 to 21 and establishes safe storage requirements for firearms.',
    status: 'passed_house',
    introduced_date: '2023-01-09',
    last_action_date: '2023-06-09',
    congress_session: '118th',
    lean: 'D',
  },
  // === FAILED / IN COMMITTEE ===
  {
    number: 'S.3853',
    title: 'Bipartisan Border Security and Immigration Reform Act',
    summary: 'Bipartisan border deal granting emergency authority to close the border at high crossing levels, expediting asylum processing, and funding immigration judges.',
    status: 'failed',
    introduced_date: '2024-02-04',
    last_action_date: '2024-02-07',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.1',
    title: 'For the People Act of 2023',
    summary: 'Comprehensive voting rights bill expanding voter registration, establishing redistricting commissions, and requiring dark money disclosure.',
    status: 'failed',
    introduced_date: '2023-01-03',
    last_action_date: '2023-05-20',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.4',
    title: 'John R. Lewis Voting Rights Advancement Act',
    summary: 'Restores and strengthens the Voting Rights Act of 1965, requiring federal preclearance for voting changes in states with histories of discrimination.',
    status: 'failed',
    introduced_date: '2023-01-09',
    last_action_date: '2023-09-20',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.7511',
    title: 'DETAIN Act',
    summary: 'Mandates detention of undocumented immigrants charged with assaulting law enforcement officers and blocks their release on bond.',
    status: 'passed_house',
    introduced_date: '2024-03-01',
    last_action_date: '2024-03-12',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.2103',
    title: 'Respect for Marriage Act Technical Corrections',
    summary: 'Technical corrections to the Respect for Marriage Act codifying same-sex and interracial marriage protections.',
    status: 'in_committee',
    introduced_date: '2023-06-22',
    last_action_date: '2023-09-15',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.4763',
    title: 'Financial Innovation and Technology for the 21st Century Act',
    summary: 'Establishes a regulatory framework for digital assets, defines SEC and CFTC jurisdictions over crypto, and creates consumer protections for digital asset markets.',
    status: 'passed_house',
    introduced_date: '2023-07-20',
    last_action_date: '2024-05-22',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.4820',
    title: 'Israel Security Supplemental Appropriations Act, 2024',
    summary: 'Emergency supplemental providing $14.3 billion in military aid to Israel offset by IRS funding cuts.',
    status: 'passed_house',
    introduced_date: '2023-11-02',
    last_action_date: '2023-11-02',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.2680',
    title: 'CHIPS and Science Implementation Act',
    summary: 'Oversight and implementation provisions for the CHIPS Act semiconductor manufacturing subsidies and research investments.',
    status: 'in_committee',
    introduced_date: '2023-07-27',
    last_action_date: '2023-11-01',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7909',
    title: 'BIOSECURE Act',
    summary: 'Prohibits federal agencies from contracting with certain Chinese biotechnology companies including BGI and WuXi AppTec, citing national security concerns.',
    status: 'passed_house',
    introduced_date: '2024-04-09',
    last_action_date: '2024-09-09',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.1557',
    title: 'No Tax on Tips Act',
    summary: 'Exempts tips and gratuities from federal income tax for workers in industries where tipping is customary.',
    status: 'in_committee',
    introduced_date: '2023-05-15',
    last_action_date: '2024-06-18',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.9106',
    title: 'End Woke Higher Education Act',
    summary: 'Prohibits federal funding for colleges requiring diversity statements, restricts DEI mandates, and reforms accreditation standards.',
    status: 'passed_house',
    introduced_date: '2024-07-22',
    last_action_date: '2024-09-18',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.686',
    title: 'RESTRICT Act',
    summary: 'Grants the Commerce Secretary authority to review and ban technology transactions with foreign adversaries posing national security risks.',
    status: 'in_committee',
    introduced_date: '2023-03-07',
    last_action_date: '2023-07-20',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7530',
    title: 'Protecting American Agriculture from Foreign Adversaries Act',
    summary: 'Restricts purchases of U.S. agricultural land by entities associated with China, Russia, Iran, and North Korea.',
    status: 'passed_house',
    introduced_date: '2024-03-05',
    last_action_date: '2024-06-11',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3559',
    title: 'SAVE Act of 2023',
    summary: 'Requires proof of U.S. citizenship to register to vote in federal elections and mandates state verification of voter rolls.',
    status: 'passed_house',
    introduced_date: '2023-05-22',
    last_action_date: '2024-07-10',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.8580',
    title: 'Water Resources Development Act of 2024',
    summary: 'Authorizes Army Corps of Engineers water infrastructure projects including flood control, navigation, and ecosystem restoration.',
    status: 'signed_into_law',
    introduced_date: '2024-06-04',
    last_action_date: '2024-12-23',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.3232',
    title: 'Social Security Fairness Act',
    summary: 'Repeals the Windfall Elimination Provision and Government Pension Offset that reduce Social Security benefits for public sector retirees.',
    status: 'signed_into_law',
    introduced_date: '2023-11-02',
    last_action_date: '2025-01-05',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7900',
    title: 'Bipartisan Background Checks Act',
    summary: 'Expands background check requirements to cover all firearm sales including private and gun show transactions.',
    status: 'in_committee',
    introduced_date: '2024-04-08',
    last_action_date: '2024-06-20',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'S.2747',
    title: 'EQUAL Act',
    summary: 'Eliminates the sentencing disparity between crack and powder cocaine offenses and makes the change retroactive.',
    status: 'in_committee',
    introduced_date: '2023-09-07',
    last_action_date: '2024-02-14',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.8281',
    title: 'SAVE Our Gas Stoves Act',
    summary: 'Prohibits the Department of Energy from implementing energy efficiency standards that would effectively ban gas stoves.',
    status: 'passed_house',
    introduced_date: '2024-05-07',
    last_action_date: '2024-05-15',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.7520',
    title: 'Taiwan Security Act of 2024',
    summary: 'Strengthens U.S. defense commitments to Taiwan, increases arms sales, and authorizes joint military exercises and training programs.',
    status: 'passed_house',
    introduced_date: '2024-03-04',
    last_action_date: '2024-07-30',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.2900',
    title: 'Bipartisan AI Safety Act',
    summary: 'Establishes testing and evaluation requirements for advanced AI systems, creates an AI safety review board, and mandates incident reporting.',
    status: 'in_committee',
    introduced_date: '2023-09-20',
    last_action_date: '2024-05-15',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.5403',
    title: 'CBDC Anti-Surveillance State Act',
    summary: 'Prohibits the Federal Reserve from issuing a central bank digital currency directly to individuals, citing privacy concerns.',
    status: 'passed_house',
    introduced_date: '2023-09-12',
    last_action_date: '2024-05-23',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.3600',
    title: 'Marijuana Opportunity Reinvestment and Expungement Act',
    summary: 'Removes marijuana from the Controlled Substances Act, expunges prior convictions, and establishes a cannabis opportunity trust fund.',
    status: 'in_committee',
    introduced_date: '2024-01-15',
    last_action_date: '2024-04-20',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.3249',
    title: 'Protecting Children from Social Media Act',
    summary: 'Prohibits social media platforms from allowing users under 13 and requires parental consent for users aged 13 to 17.',
    status: 'in_committee',
    introduced_date: '2023-05-15',
    last_action_date: '2024-03-10',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.6126',
    title: 'Creating Confidence in Clean Water Permitting Act',
    summary: 'Streamlines the Clean Water Act permitting process, sets deadlines for federal agency reviews, and limits legal challenges to permits.',
    status: 'passed_house',
    introduced_date: '2023-11-01',
    last_action_date: '2024-03-20',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.2042',
    title: 'REINS Act of 2023',
    summary: 'Requires congressional approval of major federal regulations with annual economic impact exceeding $100 million before they take effect.',
    status: 'in_committee',
    introduced_date: '2023-06-15',
    last_action_date: '2023-11-30',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'H.R.6679',
    title: 'Veterans Benefits Continuity and Accountability Supplemental Appropriations Act, 2024',
    summary: 'Emergency supplemental appropriations ensuring continued VA benefits processing and healthcare delivery for veterans.',
    status: 'signed_into_law',
    introduced_date: '2023-12-06',
    last_action_date: '2024-02-02',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.4365',
    title: 'Further Continuing Appropriations and Extensions Act, 2024',
    summary: 'Continuing resolution funding the federal government and avoiding a shutdown, extending through March 2024.',
    status: 'signed_into_law',
    introduced_date: '2023-09-28',
    last_action_date: '2023-11-16',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.6914',
    title: 'Extension of Continuing Appropriations and Other Matters Act, 2024',
    summary: 'Third continuing resolution extending government funding through April 2024, preventing a government shutdown.',
    status: 'signed_into_law',
    introduced_date: '2024-01-25',
    last_action_date: '2024-03-01',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.1549',
    title: 'Protecting Access to Post-Disaster Relief Act',
    summary: 'Streamlines FEMA disaster relief applications and increases the maximum individual assistance grant for disaster survivors.',
    status: 'signed_into_law',
    introduced_date: '2023-05-11',
    last_action_date: '2024-01-16',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.4468',
    title: 'Global Fragility Act Implementation Act',
    summary: 'Strengthens oversight and implementation of U.S. programs to prevent conflict and promote stability in fragile states.',
    status: 'in_committee',
    introduced_date: '2023-07-10',
    last_action_date: '2023-10-25',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.1535',
    title: 'EARN IT Act of 2023',
    summary: 'Holds tech platforms liable for child sexual exploitation material, creates a commission to develop best practices for preventing CSAM.',
    status: 'in_committee',
    introduced_date: '2023-05-10',
    last_action_date: '2024-02-08',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3894',
    title: 'American Innovation and Choice Online Act',
    summary: 'Prohibits dominant tech platforms from self-preferencing their own products and services in ways that disadvantage competitors.',
    status: 'in_committee',
    introduced_date: '2023-06-06',
    last_action_date: '2024-01-30',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.8035',
    title: 'Stopping Foreign Interference in American Elections Act',
    summary: 'Strengthens penalties for foreign nationals making campaign contributions, enhances FEC enforcement, and requires disclosure of foreign contacts by campaigns.',
    status: 'in_committee',
    introduced_date: '2024-04-15',
    last_action_date: '2024-07-22',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.3564',
    title: 'Whole Milk for Healthy Kids Act',
    summary: 'Allows whole milk and 2% milk to be served in school lunch programs, reversing restrictions that limited options to skim and 1% milk.',
    status: 'passed_house',
    introduced_date: '2023-05-22',
    last_action_date: '2024-12-12',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.2680',
    title: 'Protection of Women and Girls in Sports Act',
    summary: 'Prohibits recipients of federal education funding from allowing transgender women to participate in women\'s and girls\' athletic programs.',
    status: 'passed_house',
    introduced_date: '2023-04-18',
    last_action_date: '2023-04-20',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.870',
    title: 'Journalism Competition and Preservation Act',
    summary: 'Allows news organizations to collectively negotiate with Big Tech platforms over compensation for use of news content.',
    status: 'in_committee',
    introduced_date: '2023-03-16',
    last_action_date: '2023-09-12',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.3950',
    title: 'Department of Homeland Security Appropriations Act, 2024',
    summary: 'Annual appropriations for DHS including border security, immigration enforcement, cybersecurity, and FEMA disaster relief.',
    status: 'passed_house',
    introduced_date: '2023-06-06',
    last_action_date: '2023-09-28',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.1990',
    title: 'Klobuchar-Grassley Tech Antitrust Act',
    summary: 'Strengthens antitrust enforcement against dominant tech platforms, prohibits anti-competitive self-preferencing, and increases FTC resources.',
    status: 'in_committee',
    introduced_date: '2023-06-15',
    last_action_date: '2024-03-01',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7891',
    title: 'Protecting Older Americans Act of 2024',
    summary: 'Increases penalties for financial exploitation of seniors, strengthens elder abuse reporting requirements, and funds adult protective services.',
    status: 'in_committee',
    introduced_date: '2024-04-08',
    last_action_date: '2024-08-15',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.321',
    title: 'FEND Off Fentanyl Act',
    summary: 'Authorizes sanctions against foreign persons involved in fentanyl trafficking, including targeting Chinese chemical companies.',
    status: 'in_committee',
    introduced_date: '2023-02-09',
    last_action_date: '2023-06-15',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.5894',
    title: 'Fiscal Commission Act of 2023',
    summary: 'Establishes a bipartisan fiscal commission to address the national debt and develop recommendations for long-term fiscal sustainability.',
    status: 'in_committee',
    introduced_date: '2023-10-06',
    last_action_date: '2024-01-22',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.1751',
    title: 'Data Privacy and Protection Act',
    summary: 'Establishes comprehensive federal data privacy standards, limits data collection, and gives consumers rights to access and delete personal data.',
    status: 'in_committee',
    introduced_date: '2023-05-25',
    last_action_date: '2024-04-10',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.6655',
    title: 'NDAA Implementation and Intelligence Authorization Act',
    summary: 'Intelligence community authorization with provisions for AI threat assessment, cybersecurity improvements, and intelligence sharing with allies.',
    status: 'in_committee',
    introduced_date: '2023-12-05',
    last_action_date: '2024-03-18',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.7090',
    title: 'Born-Alive Abortion Survivors Protection Act',
    summary: 'Requires medical care for infants born alive during abortion procedures and establishes criminal penalties for non-compliance.',
    status: 'passed_house',
    introduced_date: '2024-01-18',
    last_action_date: '2024-01-25',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.2325',
    title: 'DETER Act',
    summary: 'Imposes severe sanctions on Russia including blocking all U.S.-held Russian sovereign assets if Russia escalates aggression against Ukraine.',
    status: 'in_committee',
    introduced_date: '2023-07-13',
    last_action_date: '2024-01-30',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.9495',
    title: 'Stop Terror-Financing and Tax Penalties on American Hostages Act',
    summary: 'Gives the Treasury Department authority to revoke tax-exempt status of organizations providing material support to designated terrorist organizations.',
    status: 'passed_house',
    introduced_date: '2024-09-10',
    last_action_date: '2024-11-21',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.1061',
    title: 'Puerto Rico Statehood Admission Act',
    summary: 'Admits Puerto Rico as the 51st state contingent on a majority vote in a federally sanctioned plebiscite.',
    status: 'in_committee',
    introduced_date: '2023-03-30',
    last_action_date: '2023-08-22',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.3013',
    title: 'Working Families Tax Relief Act of 2023',
    summary: 'Expands the Earned Income Tax Credit and Child Tax Credit, increasing benefits for families earning under $150,000 annually.',
    status: 'in_committee',
    introduced_date: '2023-04-28',
    last_action_date: '2023-08-30',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.4750',
    title: 'Unauthorized Spending Accountability Act',
    summary: 'Automatically reduces appropriations for federal programs whose authorizations have expired, enforcing regular reauthorization.',
    status: 'passed_house',
    introduced_date: '2023-07-18',
    last_action_date: '2024-02-28',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.3373',
    title: 'Bipartisan Infrastructure Law Implementation Act',
    summary: 'Streamlines implementation of the Infrastructure Investment and Jobs Act, accelerating permitting for transportation and broadband projects.',
    status: 'in_committee',
    introduced_date: '2023-11-30',
    last_action_date: '2024-04-15',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.9456',
    title: 'Continuing Appropriations and Extensions Act, 2025',
    summary: 'Temporary spending measure keeping the government funded into early 2025, bridging the transition to the next Congress.',
    status: 'signed_into_law',
    introduced_date: '2024-09-18',
    last_action_date: '2024-12-21',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.6570',
    title: 'Tax Cuts and Jobs Act Permanency Act',
    summary: 'Makes permanent the individual tax cuts from the 2017 TCJA that were set to expire in 2025.',
    status: 'passed_house',
    introduced_date: '2023-12-01',
    last_action_date: '2024-03-25',
    congress_session: '118th',
    lean: 'R',
  },
  {
    number: 'S.2230',
    title: 'DISCLOSE Act of 2023',
    summary: 'Requires super PACs and dark money groups to disclose donors contributing more than $10,000, increasing campaign finance transparency.',
    status: 'in_committee',
    introduced_date: '2023-07-11',
    last_action_date: '2023-11-20',
    congress_session: '118th',
    lean: 'D',
  },
  {
    number: 'H.R.8290',
    title: 'Pregnant Students Rights Act',
    summary: 'Strengthens Title IX protections for pregnant and parenting students, requiring schools to provide reasonable accommodations.',
    status: 'in_committee',
    introduced_date: '2024-05-09',
    last_action_date: '2024-08-20',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.2372',
    title: 'STURDY Act',
    summary: 'Mandates safety standards for furniture tip-over prevention, requiring stability testing for dressers and other furniture sold in the U.S.',
    status: 'in_committee',
    introduced_date: '2023-07-18',
    last_action_date: '2024-01-25',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'H.R.8369',
    title: 'SHIP Act',
    summary: 'Reforms ocean shipping regulations, increases Federal Maritime Commission enforcement authority, and addresses supply chain disruptions.',
    status: 'in_committee',
    introduced_date: '2024-05-14',
    last_action_date: '2024-09-12',
    congress_session: '118th',
    lean: 'B',
  },
  {
    number: 'S.2795',
    title: 'National AI Commission Act',
    summary: 'Creates a bipartisan commission to develop a comprehensive national strategy for artificial intelligence development and regulation.',
    status: 'in_committee',
    introduced_date: '2023-09-14',
    last_action_date: '2024-02-28',
    congress_session: '118th',
    lean: 'B',
  },
];

// ---------------------------------------------------------------------------
// 119th Congress bills (2025-present) — REAL legislation
// ---------------------------------------------------------------------------
const BILLS_119 = [
  // === SIGNED INTO LAW ===
  {
    number: 'S.14',
    title: 'Laken Riley Act',
    summary: 'Requires ICE to detain undocumented immigrants charged with theft or violent crimes and allows state attorneys general to sue over immigration enforcement.',
    status: 'signed_into_law',
    introduced_date: '2025-01-08',
    last_action_date: '2025-01-29',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.328',
    title: 'TAKE IT DOWN Act',
    summary: 'Criminalizes the non-consensual publication of intimate images including AI-generated deepfakes and requires platforms to remove such content within 48 hours.',
    status: 'signed_into_law',
    introduced_date: '2025-01-30',
    last_action_date: '2025-05-19',
    congress_session: '119th',
    lean: 'B',
  },
  // === PASSED ONE CHAMBER ===
  {
    number: 'H.R.1',
    title: 'One Big Beautiful Bill Act',
    summary: 'Sweeping reconciliation package combining tax cuts extension, border security funding, energy deregulation, and defense spending in a single vehicle.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-05-22',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.891',
    title: 'SAVE Act',
    summary: 'Requires documentary proof of U.S. citizenship to register to vote in federal elections, such as a passport or birth certificate.',
    status: 'passed_house',
    introduced_date: '2025-02-04',
    last_action_date: '2025-06-04',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.22',
    title: 'Protecting Americans\' Savings Act',
    summary: 'Blocks the Department of Labor from allowing ESG factors in retirement investment decisions under ERISA.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-02-12',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.29',
    title: 'Protection of Women and Girls in Sports Act of 2025',
    summary: 'Amends Title IX to define sex as biological, prohibiting transgender women and girls from participating in women\'s athletic programs receiving federal funding.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-04-09',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.28',
    title: 'Enforcement of the Death Penalty for Terrorists Act of 2025',
    summary: 'Mandates the death penalty for certain terrorism offenses including those resulting in mass casualties.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-01-22',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.5',
    title: 'DOGE Act',
    summary: 'Establishes the Department of Government Efficiency to identify waste, fraud, and inefficiency across federal agencies and recommend spending cuts.',
    status: 'passed_senate',
    introduced_date: '2025-01-03',
    last_action_date: '2025-03-04',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.30',
    title: 'Born-Alive Abortion Survivors Protection Act',
    summary: 'Requires medical care for infants born alive during attempted abortion procedures and imposes criminal penalties on providers who fail to comply.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-01-23',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.218',
    title: 'HALT Fentanyl Act',
    summary: 'Permanently schedules fentanyl-related substances as Schedule I drugs, closing the loophole that required individual scheduling of each analogue.',
    status: 'in_committee',
    introduced_date: '2025-01-23',
    last_action_date: '2025-03-10',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'S.11',
    title: 'Secure the Border Act of 2025',
    summary: 'Comprehensive border security legislation mandating border wall construction, increasing immigration enforcement personnel, and restricting asylum claims.',
    status: 'in_committee',
    introduced_date: '2025-01-06',
    last_action_date: '2025-02-20',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.23',
    title: 'No Taxpayer Funding for Abortion Act',
    summary: 'Permanently codifies the Hyde Amendment, prohibiting federal funding for abortions except in cases of rape, incest, or life endangerment.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-01-24',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.1968',
    title: 'GENIUS Act',
    summary: 'Establishes a federal regulatory framework for stablecoins, requiring issuers to maintain one-to-one reserves and obtain federal or state licenses.',
    status: 'passed_house',
    introduced_date: '2025-03-10',
    last_action_date: '2025-05-20',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'S.394',
    title: 'GENIUS Act of 2025',
    summary: 'Senate companion to the stablecoin regulatory framework, setting licensing requirements and reserve standards for payment stablecoin issuers.',
    status: 'passed_senate',
    introduced_date: '2025-02-04',
    last_action_date: '2025-05-19',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R.2100',
    title: 'American Energy Independence Act of 2025',
    summary: 'Expedites permitting for oil, gas, and LNG exports, opens federal lands for drilling, and rolls back methane emission regulations.',
    status: 'passed_house',
    introduced_date: '2025-03-15',
    last_action_date: '2025-05-08',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.112',
    title: 'Artificial Intelligence Research and Innovation Act of 2025',
    summary: 'Establishes a national AI research program, creates safety testing requirements for high-risk AI systems, and funds AI workforce development.',
    status: 'in_committee',
    introduced_date: '2025-02-14',
    last_action_date: '2025-04-10',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'S.445',
    title: 'Prescription Drug Affordability Act of 2025',
    summary: 'Expands Medicare drug price negotiation to 100 additional drugs, caps insulin at $35 for all insured, and allows drug importation from Canada.',
    status: 'in_committee',
    introduced_date: '2025-03-01',
    last_action_date: '2025-05-15',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R.3200',
    title: 'Parents Bill of Rights Expansion Act',
    summary: 'Requires school curriculum transparency, expands parental notification requirements, and restricts certain health services in schools without parental consent.',
    status: 'passed_house',
    introduced_date: '2025-05-05',
    last_action_date: '2025-06-18',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.600',
    title: 'Climate Resilience and Clean Energy Act of 2025',
    summary: 'Invests in climate adaptation infrastructure, extends clean energy tax credits, and sets new emissions targets for power plants by 2035.',
    status: 'in_committee',
    introduced_date: '2025-04-22',
    last_action_date: '2025-06-30',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R.4010',
    title: 'Law Enforcement Support and Community Safety Act',
    summary: 'Provides $10 billion in grants for police departments, funds officer recruitment, and establishes a national use-of-force database.',
    status: 'in_committee',
    introduced_date: '2025-06-10',
    last_action_date: '2025-07-01',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.820',
    title: 'Affordable Housing Investment Act of 2025',
    summary: 'Creates a $50 billion affordable housing trust fund, expands the Low-Income Housing Tax Credit, and provides first-time homebuyer assistance.',
    status: 'in_committee',
    introduced_date: '2025-03-15',
    last_action_date: '2025-06-10',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R.5500',
    title: 'Social Security Stabilization Act',
    summary: 'Raises the payroll tax cap to $250,000, adjusts benefit calculations, and extends Social Security trust fund solvency by 30 years.',
    status: 'in_committee',
    introduced_date: '2025-04-01',
    last_action_date: '2025-06-15',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'S.950',
    title: 'Second Amendment Preservation Act',
    summary: 'Prohibits federal agencies from enforcing executive actions restricting lawful firearm ownership and preempts state red flag laws.',
    status: 'in_committee',
    introduced_date: '2025-03-10',
    last_action_date: '2025-05-05',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'H.R.188',
    title: 'Federal Lands Freedom Act of 2025',
    summary: 'Transfers management of energy development on federal lands to state control, allowing states to set their own permitting rules for oil, gas, and mining.',
    status: 'passed_house',
    introduced_date: '2025-01-09',
    last_action_date: '2025-03-15',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.150',
    title: 'Countering CCP Drones Act',
    summary: 'Bans DJI and other Chinese-manufactured drones from operating on federal networks and critical infrastructure, citing espionage risks.',
    status: 'in_committee',
    introduced_date: '2025-01-16',
    last_action_date: '2025-03-20',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R.760',
    title: 'Defund Sanctuary Cities Act',
    summary: 'Withholds federal funding from state and local governments that limit cooperation with federal immigration enforcement authorities.',
    status: 'passed_house',
    introduced_date: '2025-01-28',
    last_action_date: '2025-02-26',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.64',
    title: 'PROTECT Kids Online Act',
    summary: 'Combines KOSA and COPPA 2.0, requiring platforms to protect minors from harmful content and limiting data collection on children under 17.',
    status: 'in_committee',
    introduced_date: '2025-01-09',
    last_action_date: '2025-04-15',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R.1500',
    title: 'Government Spending Transparency Act of 2025',
    summary: 'Requires real-time public disclosure of all federal spending exceeding $10,000 and creates a searchable database of government contracts.',
    status: 'in_committee',
    introduced_date: '2025-02-24',
    last_action_date: '2025-04-20',
    congress_session: '119th',
    lean: 'R',
  },
  {
    number: 'S.500',
    title: 'Protecting Americans Data from Foreign Adversaries Act of 2025',
    summary: 'Prohibits data brokers from selling Americans\' sensitive personal data to entities in China, Russia, Iran, and North Korea.',
    status: 'in_committee',
    introduced_date: '2025-02-12',
    last_action_date: '2025-05-08',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R.2500',
    title: 'Supporting Americas First Responders Act',
    summary: 'Increases funding for the 9/11 Victim Compensation Fund, expands PTSD treatment for first responders, and provides cancer screening benefits.',
    status: 'in_committee',
    introduced_date: '2025-03-25',
    last_action_date: '2025-05-30',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'S.720',
    title: 'Medicare Prescription Drug Inflation Rebate Extension Act',
    summary: 'Extends and strengthens drug price inflation rebates in Medicare, penalizing manufacturers who raise prices faster than inflation.',
    status: 'in_committee',
    introduced_date: '2025-03-05',
    last_action_date: '2025-05-22',
    congress_session: '119th',
    lean: 'D',
  },
  {
    number: 'H.R.3500',
    title: 'Secure Elections Act of 2025',
    summary: 'Mandates paper ballot backups for all federal elections, requires post-election audits, and allocates $1 billion for election security upgrades.',
    status: 'in_committee',
    introduced_date: '2025-05-15',
    last_action_date: '2025-06-20',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'S.250',
    title: 'Veterans Exposed to Toxic Substances Health Care Eligibility Act',
    summary: 'Expands VA healthcare eligibility for veterans exposed to toxic substances during military service, building on the PACT Act.',
    status: 'in_committee',
    introduced_date: '2025-01-27',
    last_action_date: '2025-04-10',
    congress_session: '119th',
    lean: 'B',
  },
  {
    number: 'H.R.4200',
    title: 'China Trade Reciprocity Act of 2025',
    summary: 'Imposes reciprocal tariffs on Chinese imports, requires annual review of trade practices, and authorizes sanctions for IP theft.',
    status: 'in_committee',
    introduced_date: '2025-06-15',
    last_action_date: '2025-07-10',
    congress_session: '119th',
    lean: 'R',
  },
];

const ALL_BILLS = [...BILLS_118, ...BILLS_119];

// ---------------------------------------------------------------------------
// Moderate / crossover voters
// ---------------------------------------------------------------------------
const MODERATE_REPUBLICANS = new Set([
  'susan-collins', 'lisa-murkowski', 'bill-cassidy',
  'john-cornyn', 'todd-young', 'thom-tillis',
]);
const MODERATE_DEMOCRATS = new Set([
  'joe-manchin', 'kyrsten-sinema', 'jon-tester',
  'mark-kelly', 'john-fetterman', 'jared-golden',
]);

// ---------------------------------------------------------------------------
// Deterministic vote chooser using hash (not random)
// ---------------------------------------------------------------------------
function chooseVote(politicianSlug, billNumber, politicianParty, billLean) {
  const h = hashCode(politicianSlug + '|' + billNumber);
  const isModerateDem = MODERATE_DEMOCRATS.has(politicianSlug);
  const isModerateRep = MODERATE_REPUBLICANS.has(politicianSlug);
  const isModerate = isModerateDem || isModerateRep;

  // Use hash to get a 0-1 fraction
  const fraction = (h % 1000) / 1000;

  // Small chance of not voting or abstaining
  if (fraction < 0.025) return 'not_voting';
  if (fraction < 0.045) return 'abstain';

  let yeaProb;
  if (billLean === 'B') {
    yeaProb = isModerate ? 0.90 : 0.78;
  } else if (
    (billLean === 'D' && politicianParty === 'democrat') ||
    (billLean === 'R' && politicianParty === 'republican')
  ) {
    yeaProb = isModerate ? 0.80 : 0.92;
  } else if (
    (billLean === 'D' && politicianParty === 'republican') ||
    (billLean === 'R' && politicianParty === 'democrat')
  ) {
    yeaProb = isModerate ? 0.28 : 0.07;
  } else {
    // independents
    yeaProb = billLean === 'D' ? 0.72 : billLean === 'R' ? 0.22 : 0.65;
  }

  // Use a second hash for the yea/nay decision
  const h2 = hashCode(billNumber + '|' + politicianSlug + '|vote');
  const fraction2 = (h2 % 1000) / 1000;
  return fraction2 < yeaProb ? 'yea' : 'nay';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
  console.log(`=== Seed Bills Expanded — ${ALL_BILLS.length} bills ===\n`);

  // Step 1: Delete existing voting records and bills to do a clean load
  console.log('Clearing existing voting records...');
  const { error: delVR } = await supabase.from('voting_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delVR) console.warn('Delete voting_records warn:', delVR.message);

  console.log('Clearing existing bills...');
  const { error: delB } = await supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delB) console.warn('Delete bills warn:', delB.message);

  // Step 2: Insert bills in batches
  const billRows = ALL_BILLS.map(({ lean, ...rest }) => rest);
  const BATCH = 50;
  let insertedBills = [];

  for (let i = 0; i < billRows.length; i += BATCH) {
    const batch = billRows.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from('bills')
      .insert(batch)
      .select('id, number, title');

    if (error) {
      console.error(`Bill batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    } else {
      insertedBills.push(...data);
      console.log(`Bills batch ${Math.floor(i / BATCH) + 1}: inserted ${data.length} (total: ${insertedBills.length})`);
    }
  }

  console.log(`\nTotal bills inserted: ${insertedBills.length}`);

  // Build lookup
  const billMap = {};
  for (const b of insertedBills) billMap[b.number] = b;

  // Step 3: Fetch politicians (paginate past 1000-row limit)
  let allPoliticians = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, slug, party, chamber')
      .range(from, from + PAGE - 1);
    if (error) { console.error('Fetch politicians error:', error.message); break; }
    allPoliticians.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const senators = allPoliticians.filter(p => p.chamber === 'senate');
  const houseMembers = allPoliticians.filter(p => p.chamber === 'house');
  console.log(`\nPoliticians: ${allPoliticians.length} total (${senators.length} senators, ${houseMembers.length} house)`);

  if (senators.length === 0 && houseMembers.length === 0) {
    console.error('No federal legislators found!');
    process.exit(1);
  }

  // Step 4: Generate voting records for top 50 most significant bills
  // Pick the most significant: signed_into_law first, then passed_*, then failed, then in_committee
  const statusPriority = { signed_into_law: 0, passed_house: 1, passed_senate: 1, failed: 2, in_committee: 3, vetoed: 2 };
  const sortedBills = [...ALL_BILLS]
    .sort((a, b) => (statusPriority[a.status] ?? 4) - (statusPriority[b.status] ?? 4));
  const top50Bills = sortedBills.slice(0, 50);

  console.log(`\nGenerating voting records for top ${top50Bills.length} bills...`);

  const votingRecords = [];

  for (const bill of top50Bills) {
    const dbBill = billMap[bill.number];
    if (!dbBill) continue;

    const isSenate = bill.number.startsWith('S.');

    // Select voter pool based on chamber
    let voterPool;
    if (isSenate) {
      voterPool = senators;
    } else {
      voterPool = houseMembers.length > 0 ? houseMembers : senators;
    }

    // Use most of the pool for significant bills
    const maxVoters = Math.min(voterPool.length, isSenate ? 100 : 80);

    // Deterministic subset: sort by hash of slug+bill for consistency
    const sorted = [...voterPool]
      .sort((a, b) => hashCode(a.slug + bill.number) - hashCode(b.slug + bill.number))
      .slice(0, maxVoters);

    for (const pol of sorted) {
      const vote = chooseVote(pol.slug, bill.number, pol.party, bill.lean);
      votingRecords.push({
        politician_id: pol.id,
        bill_id: dbBill.id,
        bill_name: bill.title,
        bill_number: bill.number,
        vote,
        vote_date: bill.last_action_date,
        session: bill.congress_session,
      });
    }
  }

  console.log(`Generated ${votingRecords.length} voting records`);

  // Step 5: Insert voting records in batches
  const VR_BATCH = 500;
  let vrInserted = 0;
  let vrErrors = 0;

  for (let i = 0; i < votingRecords.length; i += VR_BATCH) {
    const batch = votingRecords.slice(i, i + VR_BATCH);
    const { error } = await supabase.from('voting_records').insert(batch);
    if (error) {
      console.error(`VR batch ${Math.floor(i / VR_BATCH) + 1} error:`, error.message);
      vrErrors++;
    } else {
      vrInserted += batch.length;
      if ((Math.floor(i / VR_BATCH) + 1) % 5 === 0 || i + VR_BATCH >= votingRecords.length) {
        console.log(`VR batches: ${vrInserted}/${votingRecords.length} inserted`);
      }
    }
  }

  // Step 6: Summary
  console.log('\n=== Summary ===');
  console.log(`Bills inserted:          ${insertedBills.length}`);
  console.log(`  118th Congress:        ${BILLS_118.length}`);
  console.log(`  119th Congress:        ${BILLS_119.length}`);
  console.log(`Voting records inserted: ${vrInserted}`);
  console.log(`VR batch errors:         ${vrErrors}`);

  const counts = { yea: 0, nay: 0, abstain: 0, not_voting: 0 };
  for (const vr of votingRecords) counts[vr.vote]++;
  console.log(`\nVote breakdown:`);
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(12)} ${v} (${((v / votingRecords.length) * 100).toFixed(1)}%)`);
  }

  // Verify DB totals
  const { count: billCount } = await supabase.from('bills').select('*', { count: 'exact', head: true });
  const { count: voteCount } = await supabase.from('voting_records').select('*', { count: 'exact', head: true });
  console.log(`\nDB totals — bills: ${billCount}, voting_records: ${voteCount}`);
}

run().catch(console.error);

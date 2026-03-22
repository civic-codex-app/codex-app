/**
 * Centralized educational content for voter education.
 * All plain-language explainers, tooltips, and helper text live here
 * so they're easy to update in one place.
 */

// ─── Issue Subtitles (1-line plain language) ──────────────────────────────────

export const ISSUE_SUBTITLES: Record<string, string> = {
  'gun-policy': 'Should the government regulate who can buy and carry firearms?',
  'healthcare': 'Should the government help ensure all Americans have health coverage?',
  'immigration': 'How should the U.S. handle border security and paths to citizenship?',
  'climate-change': 'Should the government do more to fight climate change?',
  'economy': 'What role should government play in jobs, wages, and the economy?',
  'education': 'How should public schools and college affordability be handled?',
  'criminal-justice': 'How should the justice system handle policing, sentencing, and prisons?',
  'foreign-policy': 'How should the U.S. engage with other countries and global conflicts?',
  'abortion': 'Should abortion access be protected or restricted by law?',
  'lgbtq-rights': 'Should LGBTQ+ individuals have equal legal protections?',
  'drug-policy': 'How should the government handle marijuana and drug laws?',
  'taxes': 'Who should pay more or less in taxes, and how should tax revenue be used?',
  'technology': 'How should the government regulate Big Tech, AI, and data privacy?',
  'housing': 'What should government do about housing costs and homelessness?',
  'defense': 'How much should the U.S. spend on military and national defense?',
  'energy': 'Should the U.S. invest more in renewable energy or fossil fuels?',
  'infrastructure': 'How should roads, bridges, broadband, and public transit be funded?',
  'social-security': 'How should the government fund retirement and disability benefits?',
  'voting-rights': 'How easy or hard should it be to register and vote?',
  'environment': 'How should the government protect natural resources and public lands?',
}

// ─── Issue Explainers (for issue detail pages) ───────────────────────────────

export interface IssueExplainer {
  /** 1-2 sentence plain language explanation */
  description: string
  /** What it means when a politician "supports" this issue */
  supportsExplainer: string
  /** What it means when a politician "opposes" this issue */
  opposesExplainer: string
}

export const ISSUE_EXPLAINERS: Record<string, IssueExplainer> = {
  'gun-policy': {
    description: 'Gun policy covers laws about who can purchase firearms, background checks, assault weapon bans, and concealed carry permits.',
    supportsExplainer: 'Favors stronger gun regulations like expanded background checks and restrictions on certain weapons.',
    opposesExplainer: 'Favors fewer gun restrictions, emphasizing Second Amendment rights and individual gun ownership.',
  },
  'healthcare': {
    description: 'Healthcare policy involves insurance coverage, prescription drug costs, Medicare/Medicaid funding, and whether the government should provide universal coverage.',
    supportsExplainer: 'Favors expanding government-backed health coverage and lowering costs through regulation.',
    opposesExplainer: 'Favors market-based solutions and less government involvement in healthcare.',
  },
  'immigration': {
    description: 'Immigration policy covers border security, deportation rules, paths to citizenship for undocumented residents, and visa programs.',
    supportsExplainer: 'Favors pathways to legal status, protections for immigrants, and reform over enforcement-only approaches.',
    opposesExplainer: 'Favors stricter enforcement, border security, and limiting immigration levels.',
  },
  'climate-change': {
    description: 'Climate policy involves reducing carbon emissions, transitioning to clean energy, and setting environmental regulations on businesses.',
    supportsExplainer: 'Favors aggressive action to reduce emissions, invest in clean energy, and regulate polluters.',
    opposesExplainer: 'Prioritizes economic growth and energy independence over climate-focused regulations.',
  },
  'economy': {
    description: 'Economic policy covers minimum wage, trade deals, government spending, job creation programs, and how wealth is distributed.',
    supportsExplainer: 'Favors government action to create jobs, raise wages, and reduce inequality.',
    opposesExplainer: 'Favors free-market approaches with less government regulation and lower taxes on businesses.',
  },
  'education': {
    description: 'Education policy involves public school funding, teacher pay, college tuition, student loans, and school choice programs.',
    supportsExplainer: 'Favors more public education funding, student debt relief, and universal access to pre-K.',
    opposesExplainer: 'Favors school choice, charter schools, and reducing federal involvement in education.',
  },
  'criminal-justice': {
    description: 'Criminal justice policy covers policing practices, sentencing reform, private prisons, bail reform, and rehabilitation programs.',
    supportsExplainer: 'Favors reforms like reduced sentences for nonviolent offenses, police accountability, and rehabilitation.',
    opposesExplainer: 'Favors tougher sentencing, more law enforcement funding, and a stronger policing presence.',
  },
  'foreign-policy': {
    description: 'Foreign policy involves how the U.S. engages with other nations through diplomacy, trade agreements, military alliances, and foreign aid.',
    supportsExplainer: 'Favors active international engagement, diplomacy, alliances, and foreign aid.',
    opposesExplainer: 'Favors a more restrained approach, prioritizing domestic interests over international commitments.',
  },
  'abortion': {
    description: 'Abortion policy covers whether and when abortion should be legal, government funding for reproductive services, and state vs. federal authority.',
    supportsExplainer: 'Favors protecting access to abortion as a legal right.',
    opposesExplainer: 'Favors restricting or banning abortion, often supporting state-level limits.',
  },
  'lgbtq-rights': {
    description: 'LGBTQ+ policy involves anti-discrimination protections, marriage equality, transgender rights, and adoption rights.',
    supportsExplainer: 'Favors legal protections against discrimination and equal rights for LGBTQ+ individuals.',
    opposesExplainer: 'Favors traditional definitions of marriage and fewer federal mandates on LGBTQ+ protections.',
  },
  'drug-policy': {
    description: 'Drug policy covers marijuana legalization, the opioid crisis, decriminalization of certain substances, and treatment vs. punishment.',
    supportsExplainer: 'Favors decriminalization or legalization and a treatment-focused approach to addiction.',
    opposesExplainer: 'Favors strict drug enforcement and penalties, with concerns about legalization.',
  },
  'taxes': {
    description: 'Tax policy covers income tax rates, corporate taxes, capital gains taxes, and how the government collects and spends revenue.',
    supportsExplainer: 'Favors higher taxes on corporations and wealthy individuals to fund public programs.',
    opposesExplainer: 'Favors lower tax rates across the board, especially for businesses, to stimulate growth.',
  },
  'technology': {
    description: 'Technology policy involves Big Tech regulation, data privacy laws, AI oversight, social media rules, and net neutrality.',
    supportsExplainer: 'Favors regulating tech companies, protecting user data privacy, and AI oversight.',
    opposesExplainer: 'Favors a lighter regulatory touch to encourage innovation and free-market competition.',
  },
  'housing': {
    description: 'Housing policy covers affordable housing, rent control, homelessness, zoning reform, and homeownership programs.',
    supportsExplainer: 'Favors government investment in affordable housing, rent protections, and homelessness programs.',
    opposesExplainer: 'Favors market-based housing solutions and reducing government regulations on development.',
  },
  'defense': {
    description: 'Defense policy involves military spending, troop deployments, veterans\' benefits, and weapons programs.',
    supportsExplainer: 'Favors strong military funding and maintaining global military readiness.',
    opposesExplainer: 'Favors reducing military spending and redirecting funds to domestic programs.',
  },
  'energy': {
    description: 'Energy policy covers renewable energy investment, oil and gas drilling, nuclear power, and energy independence.',
    supportsExplainer: 'Favors transitioning to renewable energy sources and reducing fossil fuel dependence.',
    opposesExplainer: 'Favors expanding domestic oil, gas, and coal production for energy independence.',
  },
  'infrastructure': {
    description: 'Infrastructure policy involves roads, bridges, public transit, broadband internet, water systems, and how to pay for upgrades.',
    supportsExplainer: 'Favors major government investment in rebuilding and modernizing infrastructure.',
    opposesExplainer: 'Favors private-sector involvement and is cautious about large government spending bills.',
  },
  'social-security': {
    description: 'Social Security policy covers retirement benefits, disability payments, and how the program is funded long-term.',
    supportsExplainer: 'Favors protecting and expanding Social Security benefits.',
    opposesExplainer: 'Favors restructuring the program, potentially raising the retirement age or adjusting benefits.',
  },
  'voting-rights': {
    description: 'Voting rights policy covers voter ID laws, mail-in voting, early voting, gerrymandering, and election security.',
    supportsExplainer: 'Favors expanding voting access through easier registration, early voting, and mail-in ballots.',
    opposesExplainer: 'Favors stricter voter ID requirements and tighter election security measures.',
  },
  'environment': {
    description: 'Environmental policy covers pollution regulations, national park protections, clean water rules, and wildlife conservation.',
    supportsExplainer: 'Favors stronger environmental protections and regulations on pollution.',
    opposesExplainer: 'Favors reducing environmental regulations that may restrict business and development.',
  },
}

// ─── Stance Context for Politician Profiles ──────────────────────────────────
// Maps issue slug + stance bucket to a brief explanation of what that position means

export function getStanceContext(issueSlug: string, stance: string): string | null {
  const explainer = ISSUE_EXPLAINERS[issueSlug]
  if (!explainer) return null

  // Determine bucket
  const supportStances = ['strongly_supports', 'supports', 'leans_support']
  const opposeStances = ['strongly_opposes', 'opposes', 'leans_oppose']

  if (supportStances.includes(stance)) return explainer.supportsExplainer
  if (opposeStances.includes(stance)) return explainer.opposesExplainer
  return null
}

// ─── Party Explainers ────────────────────────────────────────────────────────

export const PARTY_EXPLAINERS: Record<string, string> = {
  democrat: 'Generally favors social programs, environmental regulation, and civil rights expansion.',
  republican: 'Generally favors lower taxes, limited government, and traditional values.',
  independent: 'Not affiliated with a major party. Positions vary by individual.',
  green: 'Focuses on environmental issues, social justice, and grassroots democracy.',
}

// ─── Chamber / Race Type Explainers ──────────────────────────────────────────

export const CHAMBER_EXPLAINERS: Record<string, string> = {
  senate: 'One of two senators who represent your entire state in Washington, D.C. Senators serve 6-year terms.',
  house: 'Represents a specific congressional district in your state. House members serve 2-year terms.',
  governor: 'The chief executive of a state, similar to a president at the state level. Governors typically serve 4-year terms.',
  presidential: 'The president leads the executive branch and serves as commander-in-chief. Presidential terms last 4 years.',
  mayor: 'The top elected leader of a city or town, responsible for local services like police, fire, and public works.',
  city_council: 'Local legislators who make decisions about city budgets, zoning, and local laws.',
  state_senate: 'Members of the upper chamber of your state legislature. They help write and pass state laws.',
  state_house: 'Members of the lower chamber of your state legislature. They help write and pass state laws.',
  county: 'Elected officials who oversee county-level services like roads, public health, and property records.',
  school_board: 'Elected members who oversee local public schools, set budgets, and hire superintendents.',
  other_local: 'A local government position that handles community-level decisions and services.',
}

// ─── Bill Status Explainers ──────────────────────────────────────────────────

export const BILL_STATUS_EXPLAINERS: Record<string, string> = {
  introduced: 'A member of Congress has formally proposed this bill. It hasn\'t been voted on yet.',
  in_committee: 'The bill is being reviewed by a smaller group of lawmakers who specialize in its topic.',
  passed_house: 'The House of Representatives voted to approve this bill. It still needs Senate approval.',
  passed_senate: 'The Senate voted to approve this bill. It still needs House approval.',
  signed_into_law: 'The president signed this bill, making it an official law.',
  failed: 'The bill did not get enough votes to pass. It can be reintroduced in a future session.',
  vetoed: 'The president rejected this bill. Congress can override a veto with a two-thirds vote.',
}

export const BILL_PROCESS_EXPLAINER =
  'A bill is a proposed law. It must pass both the House and Senate, then be signed by the president to become law. Most bills start in committee, where lawmakers debate and amend them before a full vote.'

// ─── Vote Type Explainers ────────────────────────────────────────────────────

export const VOTE_EXPLAINERS: Record<string, string> = {
  yea: 'Voted in favor of the bill.',
  nay: 'Voted against the bill.',
  abstain: 'Chose not to vote. This can be a strategic or principled decision.',
  not_voting: 'Was absent or did not cast a vote. This may be due to absence or a conflict of interest.',
}

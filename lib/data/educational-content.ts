/**
 * Educational content for voter education.
 * Written at a middle school reading level.
 * No jargon. Short sentences. Everyday words.
 */

// ─── Issue Subtitles (1-line plain language) ──────────────────────────────────

export const ISSUE_SUBTITLES: Record<string, string> = {
  'gun-policy-and-2nd-amendment': 'Should there be more rules about who can buy and carry guns?',
  'healthcare-and-medicare': 'Should the government help everyone get health care?',
  'immigration-and-border-security': 'Should it be easier or harder to come to the U.S.?',
  'climate-and-environment': 'Is the planet getting too hot? What should we do?',
  'economy-and-jobs': 'What should the government do about jobs and pay?',
  'education-and-student-debt': 'How do we make schools better and college cheaper?',
  'criminal-justice-reform': 'How should police, courts, and jails work?',
  'foreign-policy-and-diplomacy': 'How much should we get involved with other countries?',
  'technology-and-ai-regulation': 'Should there be more rules for big tech companies and AI?',
  'housing-and-affordability': 'What should we do about high rent and home prices?',
  'national-defense-and-military': 'Should we spend more or less on the military?',
  'energy-policy-and-oil-gas': 'Should we use more solar and wind or more oil and gas?',
  'infrastructure-and-transportation': 'How should we pay to fix roads, bridges, and internet?',
  'social-security-and-medicare': 'How do we make sure seniors get their retirement checks?',
}

// ─── Issue Explainers (for issue detail pages) ───────────────────────────────

export interface IssueExplainer {
  description: string
  progressiveView: string
  conservativeView: string
}

export const ISSUE_EXPLAINERS: Record<string, IssueExplainer> = {
  'gun-policy-and-2nd-amendment': {
    description: 'Gun policy is about the rules for buying, selling, and carrying guns. This includes background checks and bans on certain weapons.',
    progressiveView: 'Wants more rules on guns. Thinks background checks and weapon bans make people safer.',
    conservativeView: 'Wants fewer rules on guns. Believes people have the right to own guns freely.',
  },
  'healthcare-and-medicare': {
    description: 'Health care policy is about how people see doctors and pay for medicine. It covers insurance, drug prices, and government health plans.',
    progressiveView: 'Wants the government to help more people get health care at lower prices.',
    conservativeView: 'Wants less government in health care. Thinks people should shop for their own plans.',
  },
  'immigration-and-border-security': {
    description: 'Immigration is about who can come to the U.S. and who gets to stay. It covers border security, visas, and paths to become a citizen.',
    progressiveView: 'Wants to help people already here get a legal path to stay. Supports letting in more people.',
    conservativeView: 'Wants stronger borders and fewer people coming in. Supports sending back those here without papers.',
  },
  'climate-and-environment': {
    description: 'Climate policy is about what to do as the Earth gets warmer. It covers clean energy, pollution rules, and protecting nature.',
    progressiveView: 'Wants strong action to cut pollution and switch to clean energy like solar and wind.',
    conservativeView: 'Thinks climate rules hurt businesses and cost too much. Puts jobs and cheap energy first.',
  },
  'economy-and-jobs': {
    description: 'The economy is about jobs, pay, and how much things cost. This covers the lowest pay allowed, trade, and taxes.',
    progressiveView: 'Wants the government to create jobs and raise pay for workers.',
    conservativeView: 'Wants the government to step back and let businesses decide pay and hiring.',
  },
  'education-and-student-debt': {
    description: 'Education is about schools, teachers, and college costs. It covers how schools get money and what happens with student loans.',
    progressiveView: 'Wants more money for public schools. Supports help with student loans.',
    conservativeView: 'Wants parents to pick their kids\' school. Thinks the federal government should do less in education.',
  },
  'criminal-justice-reform': {
    description: 'Criminal justice is about how police, courts, and jails work. It covers how long people go to prison and how police do their jobs.',
    progressiveView: 'Wants changes like shorter sentences and more focus on helping people get back on their feet.',
    conservativeView: 'Wants tougher punishments and more money for police.',
  },
  'foreign-policy-and-diplomacy': {
    description: 'Foreign policy is about how the U.S. deals with other countries. This covers trade deals, military alliances, and sending aid overseas.',
    progressiveView: 'Wants the U.S. to work closely with other countries and help allies.',
    conservativeView: 'Wants to focus on problems at home. Thinks we spend too much on other countries.',
  },
  'technology-and-ai-regulation': {
    description: 'Tech policy is about rules for companies like Google, Apple, and Meta. It covers your personal data, AI tools, and social media.',
    progressiveView: 'Wants new laws to protect your data. Wants rules on how AI is used.',
    conservativeView: 'Wants fewer rules so tech companies can keep inventing new things.',
  },
  'housing-and-affordability': {
    description: 'Housing is about the cost of rent and homes. It covers building affordable places to live and helping people who are homeless.',
    progressiveView: 'Wants the government to build affordable housing and help with rent.',
    conservativeView: 'Wants fewer building rules so the market can bring prices down on its own.',
  },
  'national-defense-and-military': {
    description: 'Defense is about how much we spend on the military. It covers troops, weapons, veterans, and bases around the world.',
    progressiveView: 'Wants a strong military with enough money to stay ready.',
    conservativeView: 'Wants to spend less on the military and use that money for things at home.',
  },
  'energy-policy-and-oil-gas': {
    description: 'Energy policy is about where we get our power. It covers oil, gas, solar, wind, and nuclear energy.',
    progressiveView: 'Wants to switch to solar and wind. Wants to use less oil and gas.',
    conservativeView: 'Wants to drill for more oil and gas at home to keep prices low.',
  },
  'infrastructure-and-transportation': {
    description: 'Infrastructure is about the things we all use every day: roads, bridges, water pipes, internet, and buses or trains.',
    progressiveView: 'Wants the government to spend big on fixing roads, bridges, and internet.',
    conservativeView: 'Wants private companies to handle more of it. Worried about spending too much.',
  },
  'social-security-and-medicare': {
    description: 'Social Security is money the government pays to people when they retire or cannot work. The money comes from everyone\'s paychecks.',
    progressiveView: 'Wants to protect these payments and maybe make them bigger.',
    conservativeView: 'Thinks the program costs too much. May want to raise the retirement age.',
  },
}

// ─── Stance Context for Politician Profiles ──────────────────────────────────

export function getStanceContext(issueSlug: string, stance: string): string | null {
  const explainer = ISSUE_EXPLAINERS[issueSlug]
  if (!explainer) return null

  const supportStances = ['strongly_supports', 'supports', 'leans_support']
  const opposeStances = ['strongly_opposes', 'opposes', 'leans_oppose']

  if (supportStances.includes(stance)) return explainer.progressiveView
  if (opposeStances.includes(stance)) return explainer.conservativeView
  return null
}

// ─── Party Explainers ────────────────────────────────────────────────────────

export const PARTY_EXPLAINERS: Record<string, string> = {
  democrat: 'Usually wants more government help for people. Supports clean energy and equal rights.',
  republican: 'Usually wants lower taxes and less government. Supports traditional values and strong military.',
  independent: 'Not part of a big party. Their views are different for each person.',
  green: 'Cares most about the environment and fairness. Wants power in the hands of regular people.',
}

// ─── Chamber / Race Type Explainers ──────────────────────────────────────────

export const CHAMBER_EXPLAINERS: Record<string, string> = {
  senate: 'One of two people who speak for your whole state in Washington, D.C. They serve for 6 years.',
  house: 'Speaks for one area of your state in Washington, D.C. They serve for 2 years.',
  governor: 'The leader of your state, kind of like a president but just for your state. Usually serves 4 years.',
  presidential: 'The leader of the whole country. Runs the government and the military. Serves for 4 years.',
  mayor: 'The top leader of your city or town. In charge of things like police, fire trucks, and trash pickup.',
  city_council: 'Local leaders who decide how your city spends money and what rules your city has.',
  state_senate: 'Part of your state\'s lawmaking team. Helps write and vote on state laws.',
  state_house: 'Part of your state\'s lawmaking team. Helps write and vote on state laws.',
  county: 'Runs county services like local roads, health departments, and property records.',
  school_board: 'The people who run your local public schools. They set budgets and hire leaders.',
  other_local: 'A local government job that handles decisions for your community.',
}

// ─── Bill Status Explainers ──────────────────────────────────────────────────

export const BILL_STATUS_EXPLAINERS: Record<string, string> = {
  introduced: 'Someone in Congress wrote this idea for a new law. No one has voted on it yet.',
  in_committee: 'A small group of lawmakers is looking at this idea closely before everyone votes.',
  passed_house: 'The House voted yes on this. It still needs the Senate to say yes too.',
  passed_senate: 'The Senate voted yes on this. It still needs the House to say yes too.',
  signed_into_law: 'The president signed it. It is now a real law.',
  failed: 'Not enough people voted yes. The idea can come back later.',
  vetoed: 'The president said no. Congress can still override that if enough people vote yes.',
}

export const BILL_PROCESS_EXPLAINER =
  'A bill is an idea for a new law. It has to pass the House and the Senate. Then the president signs it to make it a real law. Most bills start with a small group who looks at the details first.'

// ─── Vote Type Explainers ────────────────────────────────────────────────────

export const VOTE_EXPLAINERS: Record<string, string> = {
  yea: 'Voted yes on this.',
  nay: 'Voted no on this.',
  abstain: 'Chose not to vote. Sometimes this is done on purpose.',
  not_voting: 'Was not there to vote. Could have been away or had a conflict.',
}

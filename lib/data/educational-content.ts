/**
 * Educational content for voter education.
 * Written at a middle school reading level.
 * No jargon. Short sentences. Everyday words.
 */

// ─── Issue Subtitles (1-line plain language) ──────────────────────────────────

export const ISSUE_SUBTITLES: Record<string, string> = {
  'gun-policy': 'Should there be more rules about who can buy and carry guns?',
  'healthcare': 'Should the government help everyone get health care?',
  'immigration': 'Should it be easier or harder to come to the U.S.?',
  'climate-change': 'Is the planet getting too hot? What should we do?',
  'economy': 'What should the government do about jobs and pay?',
  'education': 'How do we make schools better and college cheaper?',
  'criminal-justice': 'How should police, courts, and jails work?',
  'foreign-policy': 'How much should we get involved with other countries?',
  'abortion': 'Should abortion be legal or not?',
  'lgbtq-rights': 'Should LGBTQ+ people have the same rights as everyone?',
  'drug-policy': 'What should we do about drugs like marijuana?',
  'taxes': 'Who should pay more in taxes and who should pay less?',
  'technology': 'Should there be more rules for big tech companies and AI?',
  'housing': 'What should we do about high rent and home prices?',
  'defense': 'Should we spend more or less on the military?',
  'energy': 'Should we use more solar and wind or more oil and gas?',
  'infrastructure': 'How should we pay to fix roads, bridges, and internet?',
  'social-security': 'How do we make sure seniors get their retirement checks?',
  'voting-rights': 'How easy or hard should it be to vote?',
  'environment': 'How should we protect nature, water, and public land?',
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
    description: 'Gun policy is about the rules for buying, selling, and carrying guns. This includes background checks and bans on certain weapons.',
    supportsExplainer: 'Wants more rules on guns. Thinks background checks and weapon bans make people safer.',
    opposesExplainer: 'Wants fewer rules on guns. Believes people have the right to own guns freely.',
  },
  'healthcare': {
    description: 'Health care policy is about how people see doctors and pay for medicine. It covers insurance, drug prices, and government health plans.',
    supportsExplainer: 'Wants the government to help more people get health care at lower prices.',
    opposesExplainer: 'Wants less government in health care. Thinks people should shop for their own plans.',
  },
  'immigration': {
    description: 'Immigration is about who can come to the U.S. and who gets to stay. It covers border security, visas, and paths to become a citizen.',
    supportsExplainer: 'Wants to help people already here get a legal path to stay. Supports letting in more people.',
    opposesExplainer: 'Wants stronger borders and fewer people coming in. Supports sending back those here without papers.',
  },
  'climate-change': {
    description: 'Climate policy is about what to do as the Earth gets warmer. It covers clean energy, pollution rules, and protecting nature.',
    supportsExplainer: 'Wants strong action to cut pollution and switch to clean energy like solar and wind.',
    opposesExplainer: 'Thinks climate rules hurt businesses and cost too much. Puts jobs and cheap energy first.',
  },
  'economy': {
    description: 'The economy is about jobs, pay, and how much things cost. This covers the lowest pay allowed, trade, and taxes.',
    supportsExplainer: 'Wants the government to create jobs and raise pay for workers.',
    opposesExplainer: 'Wants the government to step back and let businesses decide pay and hiring.',
  },
  'education': {
    description: 'Education is about schools, teachers, and college costs. It covers how schools get money and what happens with student loans.',
    supportsExplainer: 'Wants more money for public schools. Supports help with student loans.',
    opposesExplainer: 'Wants parents to pick their kids\' school. Thinks the federal government should do less in education.',
  },
  'criminal-justice': {
    description: 'Criminal justice is about how police, courts, and jails work. It covers how long people go to prison and how police do their jobs.',
    supportsExplainer: 'Wants changes like shorter sentences and more focus on helping people get back on their feet.',
    opposesExplainer: 'Wants tougher punishments and more money for police.',
  },
  'foreign-policy': {
    description: 'Foreign policy is about how the U.S. deals with other countries. This covers trade deals, military alliances, and sending aid overseas.',
    supportsExplainer: 'Wants the U.S. to work closely with other countries and help allies.',
    opposesExplainer: 'Wants to focus on problems at home. Thinks we spend too much on other countries.',
  },
  'abortion': {
    description: 'Abortion policy is about whether ending a pregnancy should be legal. It covers who decides - the states or the federal government.',
    supportsExplainer: 'Wants abortion to stay legal. Believes it is a personal choice.',
    opposesExplainer: 'Wants to limit or ban abortion. Often supports state-level bans.',
  },
  'lgbtq-rights': {
    description: 'LGBTQ+ rights are about equal treatment for gay, lesbian, and transgender people. This covers marriage, adoption, and protection from being fired.',
    supportsExplainer: 'Wants equal rights and protections for LGBTQ+ people.',
    opposesExplainer: 'Wants fewer federal rules on these issues. May support traditional marriage only.',
  },
  'drug-policy': {
    description: 'Drug policy is about what drugs are legal and how we treat people who use them. It covers marijuana, the opioid crisis, and rehab programs.',
    supportsExplainer: 'Wants to make marijuana legal. Thinks we should treat addiction, not just punish it.',
    opposesExplainer: 'Wants strict drug laws and tough punishment for drug crimes.',
  },
  'taxes': {
    description: 'Tax policy is about how much people and companies pay to the government. That money pays for roads, schools, the military, and more.',
    supportsExplainer: 'Wants rich people and big companies to pay more in taxes.',
    opposesExplainer: 'Wants lower taxes for everyone, especially businesses, to help the economy grow.',
  },
  'technology': {
    description: 'Tech policy is about rules for companies like Google, Apple, and Meta. It covers your personal data, AI tools, and social media.',
    supportsExplainer: 'Wants new laws to protect your data. Wants rules on how AI is used.',
    opposesExplainer: 'Wants fewer rules so tech companies can keep inventing new things.',
  },
  'housing': {
    description: 'Housing is about the cost of rent and homes. It covers building affordable places to live and helping people who are homeless.',
    supportsExplainer: 'Wants the government to build affordable housing and help with rent.',
    opposesExplainer: 'Wants fewer building rules so the market can bring prices down on its own.',
  },
  'defense': {
    description: 'Defense is about how much we spend on the military. It covers troops, weapons, veterans, and bases around the world.',
    supportsExplainer: 'Wants a strong military with enough money to stay ready.',
    opposesExplainer: 'Wants to spend less on the military and use that money for things at home.',
  },
  'energy': {
    description: 'Energy policy is about where we get our power. It covers oil, gas, solar, wind, and nuclear energy.',
    supportsExplainer: 'Wants to switch to solar and wind. Wants to use less oil and gas.',
    opposesExplainer: 'Wants to drill for more oil and gas at home to keep prices low.',
  },
  'infrastructure': {
    description: 'Infrastructure is about the things we all use every day: roads, bridges, water pipes, internet, and buses or trains.',
    supportsExplainer: 'Wants the government to spend big on fixing roads, bridges, and internet.',
    opposesExplainer: 'Wants private companies to handle more of it. Worried about spending too much.',
  },
  'social-security': {
    description: 'Social Security is money the government pays to people when they retire or cannot work. The money comes from everyone\'s paychecks.',
    supportsExplainer: 'Wants to protect these payments and maybe make them bigger.',
    opposesExplainer: 'Thinks the program costs too much. May want to raise the retirement age.',
  },
  'voting-rights': {
    description: 'Voting rights are about how people sign up to vote and cast their ballots. It covers ID rules, mail-in voting, and early voting.',
    supportsExplainer: 'Wants to make voting easier with more ways to vote early or by mail.',
    opposesExplainer: 'Wants stricter ID checks to prevent cheating at the polls.',
  },
  'environment': {
    description: 'The environment is about keeping our air, water, and land clean. It covers pollution rules, national parks, and wildlife.',
    supportsExplainer: 'Wants stronger rules to stop pollution and protect nature.',
    opposesExplainer: 'Thinks too many rules hurt businesses and cost jobs.',
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

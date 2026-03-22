/**
 * Quiz content for the voter match quiz.
 * Written at a middle school reading level.
 * No jargon. Short sentences. Everyday words.
 */

export interface QuizIssueContent {
  question: string
  whyItMatters: string
  supportsMeans: string
  opposesMeans: string
}

export const QUIZ_CONTENT: Record<string, QuizIssueContent> = {
  'climate-and-environment': {
    question: 'Is the planet getting too hot? What should we do about it?',
    whyItMatters:
      'This affects your energy bills and the air you breathe. It also changes how ready your town is for big storms.',
    supportsMeans:
      'Push for solar and wind power. More rules to keep air and water clean. Stop new oil drilling on public land.',
    opposesMeans:
      'Drill for more oil and gas at home. Get rid of rules that make energy cost more. Let businesses decide.',
  },
  'criminal-justice-reform': {
    question: 'Should we change how the justice system works?',
    whyItMatters:
      'This decides how police work in your town. It also affects who goes to jail and for how long.',
    supportsMeans:
      'Stop making people pay to get out of jail. Close for-profit prisons. Send mental health workers to some 911 calls.',
    opposesMeans:
      'Tougher punishment for crimes. Give police more money. Keep the system mostly as it is.',
  },
  'economy-and-jobs': {
    question: 'What should the government do about jobs and money?',
    whyItMatters:
      'This changes how much you earn. It affects prices at the store and how much you pay in taxes.',
    supportsMeans:
      'Raise the lowest pay workers can get. Make it easier to join a union. Make big companies pay more in taxes.',
    opposesMeans:
      'Cut taxes and rules for businesses. Spend less government money. Let the market set pay.',
  },
  'education-and-student-debt': {
    question: 'Should college be cheaper? What about student loans?',
    whyItMatters:
      'This affects how good your local schools are. It also decides if you or your kids will owe money for college.',
    supportsMeans:
      'Wipe out student loan debt. Make public college free. Put more money into K-12 schools.',
    opposesMeans:
      'No free college. Let parents pick their kids\' school with vouchers. Shrink the federal role in schools.',
  },
  'energy-policy-and-oil-gas': {
    question: 'Should we switch to clean energy or stick with oil and gas?',
    whyItMatters:
      'This affects your electric bill and gas prices. It also changes what jobs are available in your area.',
    supportsMeans:
      'Build more solar and wind farms. Help people buy electric cars. Slowly stop using coal.',
    opposesMeans:
      'Drill for more oil and gas. Build nuclear plants. Approve new pipelines. Put American energy first.',
  },
  'foreign-policy-and-diplomacy': {
    question: 'How much should the U.S. get involved in other countries?',
    whyItMatters:
      'This affects where our troops go. It also changes prices on things we buy from other countries.',
    supportsMeans:
      'Work closely with allies. Give aid to countries in need. Talk things out before using force.',
    opposesMeans:
      'Stop spending money on other countries. Focus on problems at home. Make better trade deals for us.',
  },
  'gun-policy-and-2nd-amendment': {
    question: 'Should there be more rules about buying and owning guns?',
    whyItMatters:
      'This affects how safe you feel in schools and public places. It also decides your rights as a gun owner.',
    supportsMeans:
      'Check backgrounds on all gun sales. Ban military-style weapons. Let courts take guns from dangerous people.',
    opposesMeans:
      'No new gun laws. Let people carry guns without a permit. Protect gun makers from being sued.',
  },
  'healthcare-and-medicare': {
    question: 'How should people get their health care?',
    whyItMatters:
      'This decides what you pay for doctor visits and medicine. It affects whether your job controls your health plan.',
    supportsMeans:
      'Let more people use government health plans. Put a cap on drug prices. Work toward covering everyone.',
    opposesMeans:
      'Get rid of Obamacare. Let people shop for their own insurance. Use savings accounts for health costs.',
  },
  'housing-and-affordability': {
    question: 'What should we do about the cost of rent and homes?',
    whyItMatters:
      'This affects how much you pay for rent. It decides whether you can afford to buy a house.',
    supportsMeans:
      'Build more affordable housing. Help people pay rent. Put limits on big landlord companies.',
    opposesMeans:
      'Cut building rules so more homes get built. Stop government housing programs. Let the market set prices.',
  },
  'immigration-and-border-security': {
    question: 'Should it be easier or harder for people to move to the U.S.?',
    whyItMatters:
      'This affects border towns and jobs. It also decides what happens to people already living here without papers.',
    supportsMeans:
      'Give a path to stay for people already here. Protect Dreamers. Let in more people fleeing danger.',
    opposesMeans:
      'Build a border wall. Send more people back. End cities that protect undocumented people.',
  },
  'infrastructure-and-transportation': {
    question: 'Should the government spend more on roads, bridges, and internet?',
    whyItMatters:
      'This affects your drive to work. It decides if you can get fast internet and clean water at home.',
    supportsMeans:
      'Big spending to fix roads and bridges. Bring fast internet everywhere. Build more buses and trains.',
    opposesMeans:
      'Let private companies handle it. Spend less federal money. Let states and cities decide.',
  },
  'national-defense-and-military': {
    question: 'Should we spend more or less on the military?',
    whyItMatters:
      'This affects how much money goes to the military vs. things like schools and roads.',
    supportsMeans:
      'Spend more on the military. Take better care of veterans. Keep troops and bases around the world.',
    opposesMeans:
      'Spend less on the military. Close bases overseas. Use that money for things at home.',
  },
  'social-security-and-medicare': {
    question: 'How do we make sure seniors get their retirement money?',
    whyItMatters:
      'This decides if your parents and grandparents can afford to retire. It also affects what comes out of your paycheck.',
    supportsMeans:
      'Give bigger checks to seniors. Make rich people pay more into the system. Let younger people use Medicare.',
    opposesMeans:
      'Let people invest their own retirement money. Raise the age you can retire. Spend less on these programs.',
  },
  'technology-and-ai-regulation': {
    question: 'Should the government have more control over big tech and AI?',
    whyItMatters:
      'This affects who sees your personal info online. It also decides the rules for AI at work and in schools.',
    supportsMeans:
      'Pass a law to protect your data. Put rules on AI. Break up the biggest tech companies. Keep kids safe online.',
    opposesMeans:
      'Let tech companies make their own rules. Do not slow down new inventions. Less government control.',
  },
}

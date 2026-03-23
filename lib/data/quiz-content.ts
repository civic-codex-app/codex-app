/**
 * Quiz content for the voter match quiz.
 * Written at a middle school reading level.
 * No jargon. Short sentences. Everyday words.
 */

export interface QuizPosition {
  label: string
  description: string
  stance: string // maps to the 7-point scale
}

export interface QuizIssueContent {
  question: string
  whyItMatters: string
  supportsMeans: string
  opposesMeans: string
  /** 5 positions from strongly for → strongly against with neutral in the middle */
  positions: QuizPosition[]
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
    positions: [
      { label: 'Go green now', description: 'Stop burning oil and coal as fast as possible. Switch to solar and wind for everything. Treat this like an emergency.', stance: 'strongly_supports' },
      { label: 'Push for clean energy', description: 'Move toward cleaner power over time. Add more rules to cut pollution but keep things affordable.', stance: 'supports' },
      { label: 'Not sure yet', description: 'You think the environment matters but you are not sure how fast we should change things.', stance: 'neutral' },
      { label: 'Slow it down', description: 'Some green goals are fine but we are moving too fast. Do not kill jobs or raise prices over it.', stance: 'opposes' },
      { label: 'Drill baby drill', description: 'Use our own oil and gas. Stop adding rules on energy companies. Cheap energy matters most.', stance: 'strongly_opposes' },
    ],
  },
  'criminal-justice-reform': {
    question: 'Should we change how the justice system works?',
    whyItMatters:
      'This decides how police work in your town. It also affects who goes to jail and for how long.',
    supportsMeans:
      'Stop making people pay to get out of jail. Close for-profit prisons. Send mental health workers to some 911 calls.',
    opposesMeans:
      'Tougher punishment for crimes. Give police more money. Keep the system mostly as it is.',
    positions: [
      { label: 'Rebuild the system', description: 'Start over with how we do policing and prisons. Focus on helping people instead of locking them up.', stance: 'strongly_supports' },
      { label: 'Fix what is broken', description: 'Keep police but add training and oversight. Find alternatives to jail for small crimes.', stance: 'supports' },
      { label: 'See both sides', description: 'You think some changes could help but you also want to keep communities safe.', stance: 'neutral' },
      { label: 'Back the blue', description: 'Support police and give them what they need. Criminals should face real consequences.', stance: 'opposes' },
      { label: 'Get tougher on crime', description: 'Lock up dangerous people longer. More police on the streets. Stop going easy on criminals.', stance: 'strongly_opposes' },
    ],
  },
  'economy-and-jobs': {
    question: 'What should the government do about jobs and money?',
    whyItMatters:
      'This changes how much you earn. It affects prices at the store and how much you pay in taxes.',
    supportsMeans:
      'Raise the lowest pay workers can get. Make it easier to join a union. Make big companies pay more in taxes.',
    opposesMeans:
      'Cut taxes and rules for businesses. Spend less government money. Let the market set pay.',
    positions: [
      { label: 'Help workers first', description: 'Raise the minimum wage a lot. Tax the rich more. Make sure everyone has enough to live on.', stance: 'strongly_supports' },
      { label: 'Level the playing field', description: 'Raise pay a bit and close tax loopholes. Give small businesses a boost over big ones.', stance: 'supports' },
      { label: 'Somewhere in the middle', description: 'You want people to earn more but you are not sure the government should control how.', stance: 'neutral' },
      { label: 'Let businesses grow', description: 'Cut taxes and red tape so companies can hire more people. The economy works best when left alone.', stance: 'opposes' },
      { label: 'Free market all the way', description: 'Government should stay out of business. No minimum wage hikes. Let competition set prices and pay.', stance: 'strongly_opposes' },
    ],
  },
  'education-and-student-debt': {
    question: 'Should college be cheaper? What about student loans?',
    whyItMatters:
      'This affects how good your local schools are. It also decides if you or your kids will owe money for college.',
    supportsMeans:
      'Wipe out student loan debt. Make public college free. Put more money into K-12 schools.',
    opposesMeans:
      'No free college. Let parents pick their kids\' school with vouchers. Shrink the federal role in schools.',
    positions: [
      { label: 'Make it all free', description: 'Cancel student debt. Make public college free for everyone. Put way more money into public schools.', stance: 'strongly_supports' },
      { label: 'Lower the cost', description: 'Cut loan payments and make community college free. Give public schools more funding.', stance: 'supports' },
      { label: 'Still figuring it out', description: 'College costs too much but you are not sure who should pay for it.', stance: 'neutral' },
      { label: 'Give parents choices', description: 'Let families pick the school that fits their kid. Do not force everyone into the same system.', stance: 'opposes' },
      { label: 'Not the government\'s job', description: 'People chose to borrow money for school. Do not make taxpayers pay for someone else\'s degree.', stance: 'strongly_opposes' },
    ],
  },
  'energy-policy-and-oil-gas': {
    question: 'Should we switch to clean energy or stick with oil and gas?',
    whyItMatters:
      'This affects your electric bill and gas prices. It also changes what jobs are available in your area.',
    supportsMeans:
      'Build more solar and wind farms. Help people buy electric cars. Slowly stop using coal.',
    opposesMeans:
      'Drill for more oil and gas. Build nuclear plants. Approve new pipelines. Put American energy first.',
    positions: [
      { label: 'All in on renewables', description: 'Stop drilling for oil. Build solar and wind everywhere. Make all new cars electric.', stance: 'strongly_supports' },
      { label: 'Start the switch', description: 'Build more clean energy but keep some oil and gas while we get there. Help workers transition.', stance: 'supports' },
      { label: 'Use everything we have', description: 'You want cheap energy and do not care if it comes from oil, wind, or something else.', stance: 'neutral' },
      { label: 'Keep pumping oil', description: 'We still need oil and gas. Approve more drilling and pipelines to keep prices down.', stance: 'opposes' },
      { label: 'Energy independence now', description: 'Max out American oil and gas. Stop depending on other countries. Build pipelines and refineries.', stance: 'strongly_opposes' },
    ],
  },
  'foreign-policy-and-diplomacy': {
    question: 'How much should the U.S. get involved in other countries?',
    whyItMatters:
      'This affects where our troops go. It also changes prices on things we buy from other countries.',
    supportsMeans:
      'Work closely with allies. Give aid to countries in need. Talk things out before using force.',
    opposesMeans:
      'Stop spending money on other countries. Focus on problems at home. Make better trade deals for us.',
    positions: [
      { label: 'Lead the world', description: 'Work with other countries to solve big problems. Send aid and keep our promises to allies.', stance: 'strongly_supports' },
      { label: 'Stay connected', description: 'Keep our friendships with other countries but be smarter about where we spend money.', stance: 'supports' },
      { label: 'Case by case', description: 'Sometimes we should help. Sometimes we should stay out of it. It depends.', stance: 'neutral' },
      { label: 'America first', description: 'Stop giving money to other countries. Focus on fixing things here at home.', stance: 'opposes' },
      { label: 'Stay out of it', description: 'Bring all troops home. Stop playing world police. Other countries can handle their own problems.', stance: 'strongly_opposes' },
    ],
  },
  'gun-policy-and-2nd-amendment': {
    question: 'Should there be more rules about buying and owning guns?',
    whyItMatters:
      'This affects how safe you feel in schools and public places. It also decides your rights as a gun owner.',
    supportsMeans:
      'Check backgrounds on all gun sales. Ban military-style weapons. Let courts take guns from dangerous people.',
    opposesMeans:
      'No new gun laws. Let people carry guns without a permit. Protect gun makers from being sued.',
    positions: [
      { label: 'Ban most guns', description: 'Get rid of assault weapons. Check everyone who buys a gun. Make it much harder to own one.', stance: 'strongly_supports' },
      { label: 'More rules', description: 'Keep guns legal but add background checks and waiting periods. Close loopholes.', stance: 'supports' },
      { label: 'Not sure yet', description: 'You see both sides. Maybe some rules make sense but you are not sure which ones.', stance: 'neutral' },
      { label: 'Keep current laws', description: 'The rules we have now are enough. Focus on enforcing them better.', stance: 'opposes' },
      { label: 'Protect all gun rights', description: 'No new gun laws. Let people carry without a permit. The Constitution is clear.', stance: 'strongly_opposes' },
    ],
  },
  'healthcare-and-medicare': {
    question: 'How should people get their health care?',
    whyItMatters:
      'This decides what you pay for doctor visits and medicine. It affects whether your job controls your health plan.',
    supportsMeans:
      'Let more people use government health plans. Put a cap on drug prices. Work toward covering everyone.',
    opposesMeans:
      'Get rid of Obamacare. Let people shop for their own insurance. Use savings accounts for health costs.',
    positions: [
      { label: 'Cover everyone', description: 'The government pays for health care for all people. No more insurance companies in the middle.', stance: 'strongly_supports' },
      { label: 'Expand what works', description: 'Keep private insurance but let more people join government plans. Cap the price of medicine.', stance: 'supports' },
      { label: 'Open to ideas', description: 'Health care costs too much but you are not sure if the government or private companies should fix it.', stance: 'neutral' },
      { label: 'More competition', description: 'Let people shop around for the best insurance deal. Competition brings prices down.', stance: 'opposes' },
      { label: 'Get government out', description: 'End government health care plans. Let people save their own money and pick their own doctors.', stance: 'strongly_opposes' },
    ],
  },
  'housing-and-affordability': {
    question: 'What should we do about the cost of rent and homes?',
    whyItMatters:
      'This affects how much you pay for rent. It decides whether you can afford to buy a house.',
    supportsMeans:
      'Build more affordable housing. Help people pay rent. Put limits on big landlord companies.',
    opposesMeans:
      'Cut building rules so more homes get built. Stop government housing programs. Let the market set prices.',
    positions: [
      { label: 'Cap the rent', description: 'Limit how much landlords can charge. Build tons of affordable housing. Help people pay rent.', stance: 'strongly_supports' },
      { label: 'Build more homes', description: 'Help more people afford a home with down payment aid and cheaper loans. Build more housing overall.', stance: 'supports' },
      { label: 'Torn on this', description: 'Rent is too high but you are not sure if the government should control prices.', stance: 'neutral' },
      { label: 'Cut the red tape', description: 'Get rid of rules that slow down builders. More homes get built when government steps back.', stance: 'opposes' },
      { label: 'Let the market work', description: 'Stop government housing programs. Prices fix themselves when builders are free to build.', stance: 'strongly_opposes' },
    ],
  },
  'immigration-and-border-security': {
    question: 'Should it be easier or harder for people to move to the U.S.?',
    whyItMatters:
      'This affects border towns and jobs. It also decides what happens to people already living here without papers.',
    supportsMeans:
      'Give a path to stay for people already here. Protect Dreamers. Let in more people fleeing danger.',
    opposesMeans:
      'Build a border wall. Send more people back. End cities that protect undocumented people.',
    positions: [
      { label: 'Welcome more people', description: 'Make it easier to come here the right way. Let people already here earn a green card. Protect Dreamers.', stance: 'strongly_supports' },
      { label: 'Fix the system', description: 'Secure the border but also give people here a fair shot to stay. Speed up the process.', stance: 'supports' },
      { label: 'Mixed feelings', description: 'You want a secure border but also feel for people who came here looking for a better life.', stance: 'neutral' },
      { label: 'Secure the border', description: 'Finish the wall. Hire more border agents. People need to follow the rules to come here.', stance: 'opposes' },
      { label: 'Shut it down', description: 'Close the border. Deport people who are here without papers. Stop all immigration until it is fixed.', stance: 'strongly_opposes' },
    ],
  },
  'infrastructure-and-transportation': {
    question: 'Should the government spend more on roads, bridges, and internet?',
    whyItMatters:
      'This affects your drive to work. It decides if you can get fast internet and clean water at home.',
    supportsMeans:
      'Big spending to fix roads and bridges. Bring fast internet everywhere. Build more buses and trains.',
    opposesMeans:
      'Let private companies handle it. Spend less federal money. Let states and cities decide.',
    positions: [
      { label: 'Go big on building', description: 'Spend whatever it takes to fix every road, bridge, and pipe. Bring high-speed internet to every town.', stance: 'strongly_supports' },
      { label: 'Invest in the basics', description: 'Fix the most dangerous roads and bridges first. Help small towns get faster internet.', stance: 'supports' },
      { label: 'Depends on the cost', description: 'We need better roads and internet but you worry about how much it will cost.', stance: 'neutral' },
      { label: 'States should decide', description: 'Let each state fix its own stuff. Washington does not need to run everything.', stance: 'opposes' },
      { label: 'Stop the spending', description: 'The government wastes money on projects. Let private companies build and charge for what people use.', stance: 'strongly_opposes' },
    ],
  },
  'national-defense-and-military': {
    question: 'Should we spend more or less on the military?',
    whyItMatters:
      'This affects how much money goes to the military vs. things like schools and roads.',
    supportsMeans:
      'Spend more on the military. Take better care of veterans. Keep troops and bases around the world.',
    opposesMeans:
      'Spend less on the military. Close bases overseas. Use that money for things at home.',
    positions: [
      { label: 'Strongest military ever', description: 'Spend more on defense. Build new weapons. Keep bases everywhere. No one should come close to us.', stance: 'strongly_supports' },
      { label: 'Stay prepared', description: 'Keep military spending about the same. Take better care of veterans. Upgrade what we have.', stance: 'supports' },
      { label: 'Hard to say', description: 'You want a strong military but also think we spend a lot on it already.', stance: 'neutral' },
      { label: 'Trim the budget', description: 'We spend too much on the military. Cut waste and close some bases overseas.', stance: 'opposes' },
      { label: 'Bring it all home', description: 'Slash military spending. Close overseas bases. Spend that money on schools and health care instead.', stance: 'strongly_opposes' },
    ],
  },
  'social-security-and-medicare': {
    question: 'How do we make sure seniors get their retirement money?',
    whyItMatters:
      'This decides if your parents and grandparents can afford to retire. It also affects what comes out of your paycheck.',
    supportsMeans:
      'Give bigger checks to seniors. Make rich people pay more into the system. Let younger people use Medicare.',
    opposesMeans:
      'Let people invest their own retirement money. Raise the age you can retire. Spend less on these programs.',
    positions: [
      { label: 'Expand benefits', description: 'Give seniors bigger checks. Lower the age for Medicare. Make wealthy people pay more to fund it.', stance: 'strongly_supports' },
      { label: 'Protect what we have', description: 'Do not cut benefits. Find ways to keep the programs going for the next generation.', stance: 'supports' },
      { label: 'Worried either way', description: 'You want seniors taken care of but you are not sure the money will be there.', stance: 'neutral' },
      { label: 'Make some changes', description: 'Slowly raise the retirement age. Give people more control over their own savings.', stance: 'opposes' },
      { label: 'Totally rethink it', description: 'Let people invest their own money instead. The current system is going broke and needs a full reset.', stance: 'strongly_opposes' },
    ],
  },
  'technology-and-ai-regulation': {
    question: 'Should the government have more control over big tech and AI?',
    whyItMatters:
      'This affects who sees your personal info online. It also decides the rules for AI at work and in schools.',
    supportsMeans:
      'Pass a law to protect your data. Put rules on AI. Break up the biggest tech companies. Keep kids safe online.',
    opposesMeans:
      'Let tech companies make their own rules. Do not slow down new inventions. Less government control.',
    positions: [
      { label: 'Rein them in', description: 'Break up the biggest tech companies. Pass strong privacy laws. Put strict rules on AI before it goes too far.', stance: 'strongly_supports' },
      { label: 'Set some guardrails', description: 'Protect people\'s data and keep kids safe online. Let companies innovate but with basic rules.', stance: 'supports' },
      { label: 'Still learning', description: 'Tech is changing fast and you are not sure what rules make sense yet.', stance: 'neutral' },
      { label: 'Do not slow it down', description: 'Too many rules will kill innovation. Let companies figure it out and compete.', stance: 'opposes' },
      { label: 'Hands off completely', description: 'The government does not understand tech. Stay out of it and let the market decide what works.', stance: 'strongly_opposes' },
    ],
  },
  'reproductive-rights': {
    question: 'Should abortion be legal? Who should decide?',
    whyItMatters:
      'This affects what health care options are available to women. It decides who makes choices about pregnancy — individuals, states, or the federal government.',
    supportsMeans:
      'Keep abortion legal everywhere. Let women and their doctors decide. Use tax money to help cover costs.',
    opposesMeans:
      'Ban or limit abortion. Let states make their own rules. Protect the unborn from the moment of conception.',
    positions: [
      { label: 'Full access everywhere', description: 'Abortion should be legal at any point. It is health care and the government should protect the right.', stance: 'strongly_supports' },
      { label: 'Legal with some limits', description: 'Abortion should be legal in most cases. Reasonable time limits are OK but no outright bans.', stance: 'supports' },
      { label: 'Conflicted', description: 'You see both sides. It is a personal and moral issue that is hard to have one answer on.', stance: 'neutral' },
      { label: 'Limit it more', description: 'Abortion should only be allowed early in pregnancy or in special cases like health emergencies.', stance: 'opposes' },
      { label: 'Ban it', description: 'Abortion should be illegal in almost all cases. Life starts at conception and should be protected.', stance: 'strongly_opposes' },
    ],
  },
  'lgbtq-rights': {
    question: 'Should LGBTQ+ people have the same legal protections as everyone else?',
    whyItMatters:
      'This affects whether people can be fired or denied housing for being gay or transgender. It also decides what is taught in schools about gender and identity.',
    supportsMeans:
      'Pass laws banning discrimination based on gender identity or sexual orientation. Protect transgender health care. Allow same-sex marriage everywhere.',
    opposesMeans:
      'Let religious businesses opt out. Keep biological sex as the standard in sports and bathrooms. Let parents decide what kids learn about gender.',
    positions: [
      { label: 'Full equality', description: 'Pass strong anti-discrimination laws. Protect transgender rights including health care and sports participation.', stance: 'strongly_supports' },
      { label: 'Equal rights with balance', description: 'Protect LGBTQ+ people from discrimination but find fair compromises on sports and religious freedom.', stance: 'supports' },
      { label: 'Unsure', description: 'You support treating people fairly but are not sure about every policy detail.', stance: 'neutral' },
      { label: 'Protect traditions', description: 'Marriage is between a man and a woman. Biological sex should matter in sports and bathrooms.', stance: 'opposes' },
      { label: 'Keep things as they were', description: 'No special protections needed. Religious freedom comes first. Keep gender policies based on biology.', stance: 'strongly_opposes' },
    ],
  },
  'drug-policy': {
    question: 'Should marijuana be legal? What about other drugs?',
    whyItMatters:
      'This affects whether people go to jail for using drugs. It also changes how your community handles addiction and treatment.',
    supportsMeans:
      'Legalize marijuana everywhere. Treat drug use as a health issue not a crime. Fund treatment programs.',
    opposesMeans:
      'Keep drugs illegal. Tougher sentences for dealers. Do not normalize drug use.',
    positions: [
      { label: 'Legalize and treat', description: 'Legalize marijuana. Decriminalize other drugs. Spend money on treatment instead of jail.', stance: 'strongly_supports' },
      { label: 'Legal weed, treat addiction', description: 'Make marijuana legal for adults. Keep hard drugs illegal but help addicts get treatment not prison.', stance: 'supports' },
      { label: 'Not sure', description: 'Marijuana seems fine but you worry about harder drugs. The right answer is not obvious.', stance: 'neutral' },
      { label: 'Keep most illegal', description: 'Maybe ease up on marijuana but hard drugs should stay illegal with real consequences.', stance: 'opposes' },
      { label: 'Zero tolerance', description: 'All drugs should be illegal. Dealers should get long sentences. Legalization sends the wrong message.', stance: 'strongly_opposes' },
    ],
  },
  'voting-rights': {
    question: 'Should it be easier or harder to vote?',
    whyItMatters:
      'This affects whether you need an ID to vote, how many days you can vote, and whether your vote is counted fairly.',
    supportsMeans:
      'Automatic voter registration. More early voting days. No voter ID required. Make Election Day a holiday.',
    opposesMeans:
      'Require photo ID to vote. Clean up voter rolls. Limit mail-in voting. Prevent fraud first.',
    positions: [
      { label: 'Make it super easy', description: 'Register everyone automatically. Vote by mail anywhere. Make Election Day a national holiday.', stance: 'strongly_supports' },
      { label: 'Remove barriers', description: 'More early voting. Same-day registration. Voter ID is fine if free IDs are available to everyone.', stance: 'supports' },
      { label: 'Balance access and security', description: 'You want everyone to vote but also want to make sure the system is trustworthy.', stance: 'neutral' },
      { label: 'Verify every voter', description: 'Require ID to vote. Clean up old voter rolls. Limit mail-in ballots to people who need them.', stance: 'opposes' },
      { label: 'Lock it down', description: 'Strict ID laws. Vote in person only. Proof of citizenship required. Stop any chance of fraud.', stance: 'strongly_opposes' },
    ],
  },
  'taxes-and-spending': {
    question: 'Should the government tax more and spend more, or tax less and spend less?',
    whyItMatters:
      'This directly affects your paycheck and what the government can pay for — schools, roads, military, health care, and more.',
    supportsMeans:
      'Raise taxes on the wealthy and corporations. Use the money for public programs like health care, education, and infrastructure.',
    opposesMeans:
      'Cut taxes for everyone. Shrink the government. Stop wasteful spending and let people keep more of their money.',
    positions: [
      { label: 'Tax the rich, fund programs', description: 'Wealthy people and big companies should pay a lot more. Use that money for free health care, college, and social programs.', stance: 'strongly_supports' },
      { label: 'Fair share taxes', description: 'Close tax loopholes for the wealthy. Keep middle-class taxes low. Fund the programs people rely on.', stance: 'supports' },
      { label: 'Somewhere in between', description: 'You do not love paying taxes but you also see that the government needs money to run things.', stance: 'neutral' },
      { label: 'Lower taxes', description: 'Cut taxes across the board. The government wastes too much money. Let people keep what they earn.', stance: 'opposes' },
      { label: 'Slash it all', description: 'Massive tax cuts. Shrink government to the basics — military, courts, borders. Stop the spending.', stance: 'strongly_opposes' },
    ],
  },
  'labor-and-unions': {
    question: 'Should workers have more power through unions?',
    whyItMatters:
      'This affects your pay, benefits, and working conditions. It decides how much say employees have compared to their employers.',
    supportsMeans:
      'Make it easier to form unions. Require companies to negotiate with workers. Raise the minimum wage.',
    opposesMeans:
      'Let workers choose not to join unions. Stop forced union dues. Let companies and workers negotiate on their own.',
    positions: [
      { label: 'Workers unite', description: 'Make it much easier to unionize. Require companies to bargain. Fine companies that block unions.', stance: 'strongly_supports' },
      { label: 'Strengthen worker rights', description: 'Protect the right to unionize. Raise the minimum wage. Give workers more say in their jobs.', stance: 'supports' },
      { label: 'Depends on the job', description: 'Unions help in some jobs but not others. You are not sure if they should be everywhere.', stance: 'neutral' },
      { label: 'Keep it voluntary', description: 'Nobody should be forced to join a union. Let workers and companies negotiate directly.', stance: 'opposes' },
      { label: 'Unions do more harm than good', description: 'Unions drive up costs, protect bad workers, and hurt businesses. Workers do better without them.', stance: 'strongly_opposes' },
    ],
  },
  'privacy-and-surveillance': {
    question: 'How much should the government be able to watch what you do?',
    whyItMatters:
      'This decides whether the government can read your texts, track your location, or use cameras to watch public spaces — all in the name of safety.',
    supportsMeans:
      'Pass strong privacy laws. Limit government surveillance. Require a warrant to access personal data. Ban facial recognition.',
    opposesMeans:
      'Give law enforcement the tools they need. Allow surveillance to stop terrorism. Safety comes before privacy.',
    positions: [
      { label: 'Privacy is sacred', description: 'Ban mass surveillance. Require warrants for everything. Strong encryption should be a right.', stance: 'strongly_supports' },
      { label: 'Protect my data', description: 'The government should need a good reason and a warrant to look at your personal information.', stance: 'supports' },
      { label: 'It is complicated', description: 'You value privacy but also understand why the government might need to watch for threats.', stance: 'neutral' },
      { label: 'Safety first', description: 'Give police and intelligence agencies what they need. If you have nothing to hide it should not matter.', stance: 'opposes' },
      { label: 'Watch everything', description: 'Full surveillance powers to stop crime and terrorism. National security is more important than privacy.', stance: 'strongly_opposes' },
    ],
  },
  'trade-and-tariffs': {
    question: 'Should we put taxes on goods from other countries?',
    whyItMatters:
      'Tariffs change prices at the store. They affect which jobs stay in America and which go overseas. They also shape our relationships with other countries.',
    supportsMeans:
      'Put tariffs on imports to protect American jobs. Make things in America again. Punish countries that cheat on trade.',
    opposesMeans:
      'Free trade keeps prices low. Tariffs are taxes on consumers. Let countries trade openly.',
    positions: [
      { label: 'Free trade for all', description: 'No tariffs. Open trade keeps prices low and helps everyone. Let countries specialize in what they do best.', stance: 'strongly_supports' },
      { label: 'Trade with guardrails', description: 'Mostly free trade but protect key industries. Make deals that are fair to American workers.', stance: 'supports' },
      { label: 'Depends on the deal', description: 'Some tariffs make sense, others do not. You just want prices to stay reasonable.', stance: 'neutral' },
      { label: 'Protect American jobs', description: 'Put tariffs on cheap imports that kill American factories. Buy American first.', stance: 'opposes' },
      { label: 'Tariff everything', description: 'Heavy tariffs on all imports. Force companies to make things here. Other countries have taken advantage of us.', stance: 'strongly_opposes' },
    ],
  },
}

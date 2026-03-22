/**
 * Educational content for the voter match quiz.
 * Maps each issue slug to plain-language framing, real-world examples,
 * and a "why it matters" blurb so voters understand what they're choosing.
 */

export interface QuizIssueContent {
  question: string
  whyItMatters: string
  supportsMeans: string
  opposesMeans: string
}

export const QUIZ_CONTENT: Record<string, QuizIssueContent> = {
  'climate-environment': {
    question: 'How aggressively should the government act on climate change?',
    whyItMatters:
      'Climate policy shapes energy costs, air quality, disaster preparedness, and the long-term economy of your community.',
    supportsMeans:
      'Rejoin Paris Agreement, subsidize renewables, regulate emissions, ban new fossil fuel leases',
    opposesMeans:
      'Prioritize energy independence, reduce EPA regulations, expand oil and gas drilling, let markets decide',
  },
  'criminal-justice-reform': {
    question: 'Should the criminal justice system be reformed?',
    whyItMatters:
      'These policies determine sentencing, policing practices, and whether rehabilitation or punishment is prioritized in your community.',
    supportsMeans:
      'End cash bail, ban private prisons, decriminalize marijuana, invest in mental health response teams',
    opposesMeans:
      'Tougher sentencing, more police funding, keep cash bail, oppose decriminalizing drugs',
  },
  'economy-jobs': {
    question: 'What role should the government play in the economy?',
    whyItMatters:
      'Economic policy directly affects your wages, job opportunities, cost of living, and how much you pay in taxes.',
    supportsMeans:
      'Raise the minimum wage, strengthen unions, increase taxes on corporations, expand worker protections',
    opposesMeans:
      'Cut taxes and regulations, reduce government spending, let free markets set wages, shrink federal agencies',
  },
  'education-student-debt': {
    question: 'How should the government handle education and student debt?',
    whyItMatters:
      'Education policy affects school quality, college affordability, and whether student loan debt shapes your financial future.',
    supportsMeans:
      'Cancel student debt, make public college free, increase K-12 funding, expand Pell Grants',
    opposesMeans:
      'No loan forgiveness, promote school choice and vouchers, reduce federal role in education, cut Department of Education',
  },
  'energy-policy': {
    question: 'Should the U.S. transition away from fossil fuels?',
    whyItMatters:
      'Energy policy affects your utility bills, gas prices, job markets in energy sectors, and national security.',
    supportsMeans:
      'Invest in solar and wind, phase out coal, EV incentives, green infrastructure spending',
    opposesMeans:
      'Expand oil, gas, and nuclear, remove renewable mandates, approve pipelines, energy independence first',
  },
  'foreign-policy': {
    question: 'How involved should the U.S. be in world affairs?',
    whyItMatters:
      'Foreign policy decisions affect military deployments, trade prices, alliances, and how safe you feel at home.',
    supportsMeans:
      'Strengthen NATO, increase foreign aid, support international institutions, diplomacy first',
    opposesMeans:
      'Reduce foreign commitments, cut foreign aid, renegotiate trade deals, America-first approach',
  },
  'gun-policy': {
    question: 'How should the government handle guns?',
    whyItMatters:
      'Gun policy affects public safety, mass shooting prevention, self-defense rights, and law enforcement in your area.',
    supportsMeans:
      'Universal background checks, ban assault weapons, red flag laws, close gun show loopholes',
    opposesMeans:
      'No new gun laws, constitutional carry nationwide, arm teachers, protect gun manufacturers from lawsuits',
  },
  'healthcare-medicare': {
    question: 'How should Americans get their healthcare?',
    whyItMatters:
      'Healthcare policy determines what you pay for insurance, prescriptions, and doctor visits, and whether coverage depends on your employer.',
    supportsMeans:
      'Expand ACA or create public option, cap drug prices, move toward universal coverage',
    opposesMeans:
      'Repeal ACA, market-based insurance, health savings accounts, reduce government role in healthcare',
  },
  'housing-affordability': {
    question: 'What should the government do about housing costs?',
    whyItMatters:
      'Housing policy affects rent prices, your ability to buy a home, homelessness in your city, and neighborhood development.',
    supportsMeans:
      'Build public housing, expand rent assistance, fund affordable construction, regulate corporate landlords',
    opposesMeans:
      'Reduce zoning regulations, cut housing subsidies, let the market set prices, limit public housing programs',
  },
  'immigration-border-security': {
    question: 'How should the U.S. handle immigration?',
    whyItMatters:
      'Immigration policy affects border communities, labor markets, refugee protections, and the path to citizenship for millions.',
    supportsMeans:
      'Path to citizenship for undocumented, protect DACA, increase refugee admissions, reform legal immigration',
    opposesMeans:
      'Build border wall, increase deportations, end sanctuary cities, reduce legal immigration levels',
  },
  'infrastructure-transportation': {
    question: 'How much should the government invest in infrastructure?',
    whyItMatters:
      'Infrastructure spending affects your commute, internet access, water quality, and whether bridges and roads in your area get fixed.',
    supportsMeans:
      'Major federal spending on roads, bridges, broadband, and public transit; green infrastructure',
    opposesMeans:
      'Limit federal spending, privatize infrastructure, state and local control, reduce regulations on projects',
  },
  'national-defense-military': {
    question: 'How much should the U.S. spend on the military?',
    whyItMatters:
      'Defense spending affects the federal budget, veterans services, military readiness, and how resources are split between defense and domestic needs.',
    supportsMeans:
      'Increase defense budget, expand military capabilities, invest in veterans, maintain global presence',
    opposesMeans:
      'Cut defense spending, close overseas bases, redirect funds to domestic programs, reduce military interventions',
  },
  'social-security-medicare': {
    question: 'How should Social Security and Medicare be protected?',
    whyItMatters:
      'These programs determine retirement security and healthcare for seniors, and their funding affects payroll taxes you pay today.',
    supportsMeans:
      'Expand benefits, raise the income cap on payroll taxes, lower Medicare eligibility age',
    opposesMeans:
      'Privatize Social Security, raise the retirement age, means-test benefits, reduce program spending',
  },
  'technology-ai-regulation': {
    question: 'How should the government regulate big tech and AI?',
    whyItMatters:
      'Tech regulation affects your data privacy, social media content, AI in hiring and policing, and whether tech monopolies are kept in check.',
    supportsMeans:
      'Federal data privacy law, regulate AI, break up tech monopolies, protect kids online',
    opposesMeans:
      'Light-touch regulation, let innovation lead, industry self-regulation, avoid stifling growth',
  },
}

export interface MessageTemplate {
  id: string
  subject: string
  body: string
  tone: 'formal' | 'personal'
  label: string
}

export const MESSAGE_TEMPLATES: Record<string, MessageTemplate[]> = {
  'economy-and-jobs': [
    {
      id: 'economy-formal-1',
      subject: 'Inquiry Regarding Your Economic Policy Priorities',
      body: `Dear {name},

I am writing as a constituent in {state} to respectfully inquire about your priorities regarding economic policy and job growth.

Many families in our state are navigating rising costs and shifting employment landscapes. I would appreciate understanding your position on the following:

1. What specific measures do you support to strengthen job creation in {state}?
2. How do you plan to address the cost of living concerns facing working families?
3. What is your approach to supporting small businesses in our communities?

I value transparency from my elected representatives and look forward to hearing your perspective on these important matters.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'economy-personal-1',
      subject: 'How Are You Addressing Economic Concerns in {state}?',
      body: `Hi {name},

I'm a resident of {state} and I've been thinking a lot about the economy lately — how it affects my family, my neighbors, and our community.

I'd really like to understand where you stand on helping working families manage the rising cost of everyday essentials. What are you focused on when it comes to job opportunities and economic security for people in our state?

I appreciate you taking the time to hear from constituents like me. It means a lot to know our voices matter.

Thank you,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
    {
      id: 'economy-formal-2',
      subject: 'Request for Information on Workforce Development Initiatives',
      body: `Dear {name},

As a concerned citizen of {state}, I am reaching out to learn more about your stance on workforce development and economic opportunity.

With rapid changes in technology and industry, many workers in our state face uncertainty about the future of their careers. I would appreciate your perspective on:

1. What workforce training or reskilling programs do you support?
2. How do you envision preparing {state}'s economy for emerging industries?
3. What role should the federal government play in supporting displaced workers?

Thank you for your service to our state. I look forward to your response.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Workforce Focus',
    },
  ],

  'healthcare-and-medicare': [
    {
      id: 'healthcare-formal-1',
      subject: 'Inquiry About Your Healthcare Policy Positions',
      body: `Dear {name},

I am writing as a constituent in {state} to better understand your positions on healthcare policy.

Access to affordable healthcare is a pressing concern for many families in our state. I would be grateful if you could share your views on the following:

1. What steps do you support to make healthcare more affordable and accessible?
2. How do you plan to address prescription drug costs?
3. What is your position on protecting coverage for pre-existing conditions?

Understanding your stance on these issues will help me stay informed as a voter. Thank you for your time and dedication to serving {state}.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'healthcare-personal-1',
      subject: 'Healthcare Costs Are Affecting My Family',
      body: `Hi {name},

I live in {state} and I'm reaching out because healthcare costs have become a real burden for my family. Between insurance premiums, copays, and prescriptions, it feels like an uphill battle.

I'd love to know what you're doing to help families like mine afford the care we need. Are there specific policies you're championing to bring costs down or expand access?

I'm not looking for a particular answer — I just want to understand your approach so I can be a more informed constituent.

Thanks for listening,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'immigration-and-border-security': [
    {
      id: 'immigration-formal-1',
      subject: 'Request for Your Position on Immigration Policy',
      body: `Dear {name},

As a resident of {state}, I am writing to understand your position on immigration and border security policy.

This is a topic that generates strong opinions, and I believe it's important to hear directly from my representative rather than rely on secondhand accounts. I would appreciate your perspective on:

1. What do you believe is the right balance between border security and immigration reform?
2. How do you propose addressing the status of long-term undocumented residents?
3. What changes, if any, would you support to the legal immigration system?

I value a thoughtful, fact-based approach to this complex issue and look forward to hearing from you.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'immigration-personal-1',
      subject: 'Understanding Your Approach to Immigration',
      body: `Hi {name},

I'm a constituent in {state} and immigration policy is something I think about a lot. It affects our communities in real ways — from local businesses to schools to neighbors I care about.

I'd like to hear directly from you about how you approach this issue. What are your priorities, and how do you weigh the different concerns people have?

I appreciate that this isn't a simple topic, and I'm genuinely interested in understanding your perspective.

Thank you,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
    {
      id: 'immigration-formal-2',
      subject: 'Immigration Policy and Its Impact on {state}',
      body: `Dear {name},

I am reaching out to learn how your immigration policy positions specifically affect {state} and its communities.

Our state has unique circumstances when it comes to immigration — from our local economy to our cultural fabric. I would appreciate understanding:

1. How do you see immigration policy impacting {state} specifically?
2. What legislative priorities do you have that address our state's needs?
3. How are you working to ensure any reforms are practical and enforceable?

Thank you for representing our state on this important matter.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'State Impact Focus',
    },
  ],

  'education-and-student-debt': [
    {
      id: 'education-formal-1',
      subject: 'Inquiry on Education Policy and Student Debt',
      body: `Dear {name},

I am writing as a constituent in {state} to learn about your positions on education policy and student debt.

Education shapes the future of our communities, and the burden of student debt affects millions of Americans. I would appreciate your perspective on:

1. What measures do you support to improve the quality and accessibility of education in {state}?
2. What is your position on addressing the student debt crisis?
3. How do you propose making higher education more affordable for future students?

Thank you for your attention to these issues that affect so many families in our state.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'education-personal-1',
      subject: 'Student Debt and Education in {state}',
      body: `Hi {name},

I'm reaching out from {state} because education — and the debt that often comes with it — is something that really matters to me and my community.

Whether it's K-12 funding, college affordability, or vocational training, I want to understand what you're focused on. What do you see as the biggest challenges, and what solutions are you working toward?

I appreciate you hearing from constituents on this. It helps me feel more connected to the process.

Best,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'national-defense-and-military': [
    {
      id: 'defense-formal-1',
      subject: 'Questions Regarding National Defense Priorities',
      body: `Dear {name},

As a constituent in {state}, I am writing to understand your priorities regarding national defense and military policy.

Our national security affects every American, and I believe it is important for citizens to understand how their representatives approach these critical decisions. I would appreciate your views on:

1. What do you consider the most pressing national security challenges facing our country?
2. How do you approach decisions about military spending and resource allocation?
3. What is your position on supporting veterans and military families in {state}?

Thank you for your service to our state and nation.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'defense-personal-1',
      subject: 'Veterans and Defense in {state}',
      body: `Hi {name},

I'm a resident of {state} and I'm writing because national defense and how we treat our veterans are issues close to my heart.

I'd like to know where you stand on making sure our military families and veterans get the support they deserve, and how you think about keeping our country safe in a changing world.

Thanks for taking the time to hear from people back home.

Sincerely,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'climate-and-environment': [
    {
      id: 'climate-formal-1',
      subject: 'Inquiry on Climate and Environmental Policy',
      body: `Dear {name},

I am writing as a constituent in {state} to learn more about your positions on climate and environmental policy.

Environmental issues have significant implications for the health, economy, and future of our state. I would appreciate your perspective on:

1. How do you assess the environmental challenges facing {state}?
2. What policies do you support to address air and water quality in our communities?
3. How do you balance environmental protection with economic growth and energy needs?

I am interested in understanding your approach and the reasoning behind it. Thank you for your time.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'climate-personal-1',
      subject: 'The Environment in {state} — Where Do You Stand?',
      body: `Hi {name},

I live in {state} and the environment is something I care deeply about — clean air, clean water, and the natural spaces that make our state special.

I'd love to hear about what you're doing to protect our environment while also thinking about jobs and the economy. How do you approach that balance?

Thank you for listening. It really matters to know where you stand.

Best,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
    {
      id: 'climate-formal-2',
      subject: 'Environmental Impact and Community Health in {state}',
      body: `Dear {name},

I am reaching out regarding the intersection of environmental policy and community health in {state}.

Many communities in our state are directly affected by environmental conditions — from water quality to air pollution to extreme weather events. I would appreciate understanding:

1. What specific environmental concerns in {state} are you prioritizing?
2. How do you plan to support communities affected by environmental health risks?
3. What role do you see for innovation and technology in addressing these challenges?

Thank you for your dedication to the wellbeing of our state's residents.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Community Health Focus',
    },
  ],

  'criminal-justice-reform': [
    {
      id: 'justice-formal-1',
      subject: 'Questions About Your Criminal Justice Reform Positions',
      body: `Dear {name},

As a constituent in {state}, I am writing to understand your positions on criminal justice reform.

The justice system directly affects public safety and the lives of many families in our communities. I would appreciate your views on:

1. What criminal justice reforms do you believe are most needed?
2. How do you approach balancing public safety with fairness in the justice system?
3. What is your position on sentencing reform and rehabilitation programs?

I believe this is an area where informed dialogue is essential. Thank you for sharing your perspective.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'justice-personal-1',
      subject: 'Criminal Justice and Our Community',
      body: `Hi {name},

I'm from {state} and I've been thinking a lot about how our criminal justice system works — and where it could work better.

I'd like to understand your perspective on reform. How do you think about keeping communities safe while making sure the system is fair? What changes, if any, do you support?

Thanks for hearing me out. These conversations matter.

Best,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'foreign-policy-and-diplomacy': [
    {
      id: 'foreign-formal-1',
      subject: 'Inquiry on Foreign Policy Priorities',
      body: `Dear {name},

I am writing as a constituent in {state} to better understand your foreign policy priorities.

America's role in the world affects all of us — from trade that impacts {state}'s economy to international agreements that shape our future. I would appreciate your perspective on:

1. What do you consider the most important foreign policy challenges facing the U.S. today?
2. How do you approach balancing diplomacy with national interests?
3. What role should international cooperation play in addressing global challenges?

Thank you for representing {state} on these matters of national importance.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'foreign-personal-1',
      subject: 'How Does Foreign Policy Affect {state}?',
      body: `Hi {name},

I'm a resident of {state} and while foreign policy can feel distant, I know it affects our state too — through trade, jobs, and global events.

I'd like to hear how you think about America's role in the world and what it means for people here at home. What are your priorities, and how do you make those decisions?

Appreciate your time,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'technology-and-ai-regulation': [
    {
      id: 'tech-formal-1',
      subject: 'Inquiry on Technology and AI Regulation Policy',
      body: `Dear {name},

I am writing as a constituent in {state} to understand your positions on technology regulation and artificial intelligence policy.

The rapid advancement of technology raises important questions about privacy, employment, and innovation. I would appreciate your perspective on:

1. What role should the government play in regulating emerging technologies like AI?
2. How do you plan to protect consumer privacy while encouraging innovation?
3. What measures do you support to ensure {state}'s workforce is prepared for technological change?

These issues are shaping the future of our economy and society. I look forward to hearing your views.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'tech-personal-1',
      subject: 'Technology Is Changing Fast — What Are You Doing About It?',
      body: `Hi {name},

I live in {state} and I've been watching how quickly technology — especially AI — is changing everything from jobs to privacy to how we communicate.

I'm curious about where you stand. Do you think we need more regulation? How are you thinking about protecting people while still encouraging innovation?

Would love to hear your take on this.

Thanks,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
    {
      id: 'tech-formal-2',
      subject: 'Data Privacy and Digital Rights Concerns',
      body: `Dear {name},

I am reaching out as a resident of {state} regarding data privacy and digital rights.

As more of our lives move online, the protection of personal data has become a critical concern. I would like to understand:

1. What data privacy protections do you support for consumers?
2. How do you approach the balance between national security and digital privacy?
3. What legislation are you supporting or would you champion to strengthen digital rights?

Thank you for addressing these increasingly important issues.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Privacy Focus',
    },
  ],

  'social-security-and-medicare': [
    {
      id: 'socialsec-formal-1',
      subject: 'Protecting Social Security and Medicare',
      body: `Dear {name},

I am writing as a constituent in {state} to understand your positions on Social Security and Medicare.

These programs are vital to millions of Americans, including many families in our state. I would appreciate your perspective on:

1. What is your commitment to protecting Social Security benefits for current and future recipients?
2. How do you plan to ensure the long-term solvency of these programs?
3. What changes, if any, do you support to strengthen Medicare?

Many of us depend on these programs or will in the future. Your transparency on these issues is important to voters in {state}.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'socialsec-personal-1',
      subject: 'Social Security Matters to My Family',
      body: `Hi {name},

I'm from {state} and Social Security and Medicare are really important to my family. Whether it's my parents counting on their benefits or my own future retirement, these programs matter.

I want to understand what you're doing to protect and strengthen them. Can you share your approach?

Thank you for hearing from me,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'gun-policy-and-2nd-amendment': [
    {
      id: 'guns-formal-1',
      subject: 'Understanding Your Position on Gun Policy',
      body: `Dear {name},

As a constituent in {state}, I am writing to understand your positions on gun policy and Second Amendment issues.

This is a topic where many Americans hold strong views, and I believe it is essential to hear directly from my representative. I would appreciate knowing:

1. How do you approach the balance between gun rights and public safety?
2. What specific policies do you support regarding firearms regulation?
3. How do you respond to concerns from both gun owners and advocates for stricter measures in {state}?

I am seeking to understand your reasoning and priorities. Thank you for your transparency.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'guns-personal-1',
      subject: 'Gun Policy — I Want to Hear Your Perspective',
      body: `Hi {name},

I'm a resident of {state} and gun policy is an issue that comes up a lot in conversations with my family and neighbors. People have different views, and I want to understand yours.

How do you think about this issue? What are you focused on, and why? I'm not looking for talking points — I'd genuinely like to know how you approach such a complex topic.

Thanks for your time,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'infrastructure-and-transportation': [
    {
      id: 'infra-formal-1',
      subject: 'Infrastructure and Transportation Priorities for {state}',
      body: `Dear {name},

I am writing as a constituent in {state} regarding infrastructure and transportation policy.

The condition of our roads, bridges, public transit, and broadband infrastructure directly affects daily life and economic opportunity in our state. I would appreciate your perspective on:

1. What infrastructure projects are you prioritizing for {state}?
2. How do you plan to fund necessary improvements without overburdening taxpayers?
3. What is your position on expanding broadband access to underserved areas?

Investments in infrastructure shape our communities for decades. Thank you for your attention to these needs.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'infra-personal-1',
      subject: 'Roads, Transit, and Broadband in {state}',
      body: `Hi {name},

I live in {state} and infrastructure is one of those issues that affects everyone — whether it's the roads we drive on, the internet service we rely on, or public transit options.

I'd like to know what you're working on to improve infrastructure in our state. What's at the top of your list, and how do you plan to make it happen?

Thanks for your work on this,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],

  'housing-and-affordability': [
    {
      id: 'housing-formal-1',
      subject: 'Inquiry on Housing Affordability Policy',
      body: `Dear {name},

I am writing as a constituent in {state} to understand your positions on housing affordability.

The cost of housing — whether renting or buying — has become a significant challenge for many families in our state. I would appreciate your perspective on:

1. What measures do you support to address the housing affordability crisis?
2. How do you plan to increase housing supply without displacing existing communities?
3. What role should the federal government play versus state and local authorities?

This issue is deeply personal for many of your constituents. Thank you for your attention to it.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'housing-personal-1',
      subject: 'Housing Costs Are a Real Struggle',
      body: `Hi {name},

I'm from {state} and I have to be honest — housing costs are making it really hard for a lot of people I know, including myself. Whether it's rent going up or home prices being out of reach, it's stressful.

I'd like to know what you're doing about this. Are there specific policies or programs you support to help make housing more affordable in our state?

I appreciate you hearing from regular people about this.

Thank you,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
    {
      id: 'housing-formal-2',
      subject: 'Housing Supply and Community Development in {state}',
      body: `Dear {name},

I am reaching out regarding housing supply and community development in {state}.

Many communities in our state are experiencing housing shortages that affect families, workers, and local economies. I would like to understand:

1. What strategies do you support for increasing housing construction?
2. How do you approach zoning reform and local land use decisions?
3. What programs do you advocate for first-time homebuyers and renters?

Thank you for addressing this critical issue facing {state}'s families.

Respectfully,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Housing Supply Focus',
    },
  ],

  'energy-policy-and-oil-gas': [
    {
      id: 'energy-formal-1',
      subject: 'Questions About Energy Policy for {state}',
      body: `Dear {name},

I am writing as a constituent in {state} to understand your energy policy priorities.

Energy policy affects everything from utility bills to job creation to environmental quality. I would appreciate your perspective on:

1. How do you approach the balance between traditional and renewable energy sources?
2. What is your plan to keep energy affordable for families in {state}?
3. How do you see {state}'s role in the nation's energy future?

Energy decisions have long-term consequences for our state and country. Thank you for sharing your views.

Sincerely,
[Your Name]
[Your Address]`,
      tone: 'formal',
      label: 'Formal Letter',
    },
    {
      id: 'energy-personal-1',
      subject: 'Energy Costs and the Future — Your Take?',
      body: `Hi {name},

I'm a resident of {state} and energy is something that affects my daily life — from what I pay for electricity to concerns about where our energy comes from.

I'd like to understand your approach to energy policy. How do you think about keeping costs down while also planning for the future? What energy sources do you think {state} should focus on?

Thanks for your time,
[Your Name]`,
      tone: 'personal',
      label: 'Personal Appeal',
    },
  ],
}

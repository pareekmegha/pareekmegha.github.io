// Every number here is copied from the resume or a project README / FINDINGS file.
// Do not edit a figure without changing it at the source first.

export const person = {
  name: 'Megha Pareek',
  email: 'meghapareek2006@gmail.com',
  linkedin: 'https://linkedin.com/in/pareek-megha',
  github: 'https://github.com/Megha9306',
  location: 'Delhi',
  whereIWork: 'Remote, or on-site in Gurugram and Delhi NCR',
  // Set to '/Megha_Pareek_Resume.pdf' once a PDF is placed in public/.
  resumeUrl: null as string | null,
  // Set to '/megha.jpg' once a portrait is placed in public/.
  photoUrl: '/megha.jpg' as string | null,
  // Access key from web3forms.com. It is meant to be public: it can only send mail to your own inbox.
  // The contact form stays hidden while this is null.
  formKey: 'aa2690fa-0ecd-484a-ad4e-51994a4d6825' as string | null,
};

export const lenses = [
  { id: 'all', label: 'All', line: 'I work across data and AI: the analysis, the models, the pipelines, and the products built on top of them.' },
  { id: 'analytics', label: 'Analytics', line: 'I turn messy data into findings a team can act on, and I say where the evidence stops.' },
  { id: 'science', label: 'Data science', line: 'I build and test models, and I check that a result survives a fair comparison before I report it.' },
  { id: 'engineering', label: 'Data engineering', line: 'I build the pipelines that collect, clean and store data, so the analysis on top can be trusted.' },
  { id: 'ai', label: 'AI', line: 'I build AI products that real people use, from retrieval and prompts through to evaluation.' },
] as const;

export type LensId = (typeof lenses)[number]['id'];

// Which skill groups each lens brings forward on the About page.
export const lensSkillGroups: Record<LensId, string[]> = {
  all: [],
  analytics: ['Analytics & BI', 'Statistics & Experimentation', 'Business & Product Analytics'],
  science: ['Statistics & Experimentation', 'Machine Learning & AI', 'Programming'],
  engineering: ['Data Engineering', 'Programming'],
  ai: ['Machine Learning & AI', 'Data Engineering'],
};

// How each kind of work is named on cards and filters.
export const kindLabels = { Internship: 'Internship', Startup: 'My startup', Project: 'Project' } as const;

export const lookingFor = ['Data Analyst', 'Data Scientist', 'Data Engineer', 'AI Engineer', 'AI Consultant'];

export const evidence = [
  { id: 'upi', label: 'UPI Payments', href: '/work/upi-payments/' },
  { id: 'shock', label: 'AV Supply Shock', href: '/work/av-supply-shock/' },
  { id: 'queue', label: 'Queue Agent', href: '/work/queue-agent/' },
  { id: 'grapes', label: 'Grapes Worldwide', href: '/work/grapes-worldwide/' },
  { id: 'dandelion', label: 'Dandelion', href: '/work/dandelion/' },
  { id: 'health', label: 'Preventive Health', href: '/work/preventive-health/' },
  { id: 'docs', label: 'Document Extraction', href: '/work/document-extraction/' },
];

export const upi = {
  links: {
    dashboard: 'https://megha9306.github.io/upi-payments-analysis/',
    repo: 'https://github.com/Megha9306/upi-payments-analysis',
  },
  steps: [
    {
      kicker: '01 · Scale',
      title: 'Volume grew 32.6×, and growth is slowing steadily.',
      body: 'From 0.78 billion payments a month in April 2019 to 25.47 billion in October 2026. Year-on-year growth fell from 59% in April 2023 to 23% now.',
    },
    {
      kicker: '02 · The trap',
      title: 'The average payment fell from ₹1,817 to ₹1,238. People are not paying less.',
      body: 'Person-to-person tickets are flat (₹2,326 to ₹2,328) and merchant tickets rose (₹514 to ₹603). Smaller merchant payments simply grew from 45% to 63% of volume. Decomposed: −₹323 from mix, +₹49 within segments.',
    },
    {
      kicker: '03 · The event',
      title: 'Paytm’s decline accelerated after RBI’s 2024 action.',
      body: 'Its share fell from 12.5% to 7.8%, against 10.7% had the 2023 trend continued (difference −4.7 pp, bootstrap CI −5.1 to −4.2). PhonePe and Google Pay absorbed about 77% of the loss.',
    },
    {
      kicker: '04 · The forecast',
      title: 'A damped-trend model halves the error of constant-growth models.',
      body: 'Backtest error at 12 months was 4.0%, against 8.5% for the best simple baseline. Constant-growth models over-forecast by 6% to 14%. Shaded bands are 80% and 95% intervals from 4,000 simulated paths.',
    },
  ],
  method: [
    '343 raw app names merged into 145 canonical apps with a reviewable alias map',
    'Fixed a parser that blanked values with thousands separators',
    'Shares validated against published figures to within 0.1 to 0.6 pp',
    '8 models compared with a rolling-origin backtest',
  ],
  limits: [
    'Only about 65 post-COVID months exist, so anything beyond roughly six months is trend extrapolation.',
    'The forecast assumes the status quo. It does not model the 30% app share cap (deadline 31 Dec 2026) or the 0.4% merchant fee from 15 Oct 2026.',
    'WhatsApp’s onboarding-cap removal is not detectable in the data. That is absence of evidence, not evidence of no effect.',
    'Per-bank app volumes could not be checked against an external source.',
  ],
};

export const shock = {
  links: { repo: 'https://github.com/Megha9306/uber-av-supply-shock-simulation' },
  title: 'A uniform supply cut does not hurt every hour equally.',
  body: 'When an AV partner leaves a market, part of the vehicle supply disappears overnight. Using 14.4 million NYC Uber trips as a proxy, I simulated the cut. The hours that were already thin on drivers take the largest hit.',
  method: [
    '14.4M trips, memory cut from 4.2 GB to about 1.3 GB',
    '6,170 zone-hour rows',
    'R² improved from 0.037 to 0.339 with time-of-day buckets and borough fixed effects',
    'Wait scales with (demand ÷ supply)², weighted by each hour’s existing tightness',
  ],
  limits: [
    'NYC is a proxy. Phoenix trip-level data is not public.',
    'Supply is never observed directly. It is inferred from wait times and a stated elasticity of 2.0.',
    'The shock size and the severity weighting are assumptions, not estimates.',
    'A first attempt used a regression coefficient and predicted waits falling as demand rose. That coefficient captured correlation with organic supply, not a causal effect, so the simulation was rebuilt to hold supply fixed.',
    'This chart applies the notebook formula to hourly averages for the Staten Island proxy, so values can differ slightly from the zone-level results.',
  ],
};

export const queue = {
  links: { repo: 'https://github.com/Megha9306/Grocery-Checkout-Queue-Simulation-RL-Routing-Agent' },
  title: 'Can a simple RL agent beat two sensible queue rules? Sometimes.',
  body: 'A from-scratch simulation of grocery checkout. Customers arrive, get routed to a counter, and leave without buying if the wait exceeds their patience. A tabular Q-learning agent is trained to protect high-value carts, then compared against two hand-written rules on identical customer streams.',
  results: [
    { scenario: 'Constant arrivals', episodes: '8,000', vsQueue: 'RL wins, p = 0.0002', vsWait: 'Tie, p = 0.11' },
    { scenario: 'Rush hour', episodes: '8,000', vsQueue: 'RL loses, p < 0.0001', vsWait: 'RL loses, p < 0.0001' },
    { scenario: 'Rush hour', episodes: '30,000', vsQueue: 'Tie, p = 0.42', vsWait: 'RL loses, p < 0.0001' },
  ],
  bugs: [
    {
      name: 'Terminal-state bootstrapping',
      text: 'The last customer in each episode was updated as if a next state existed. Fixed with a dedicated terminal update.',
    },
    {
      name: 'Stale state',
      text: 'The next state was not filtered for the next customer’s arrival time, so it did not match what the agent would actually see.',
    },
    {
      name: 'Unpaired evaluation',
      text: 'Policies were scored on different random customer streams, which made a real effect look like nothing (p ≈ 0.3 to 0.6). Pairing the streams reversed the conclusion.',
    },
  ],
  limits: [
    'Simulation only. Service times, patience and arrivals are modelled, not fit to real point-of-sale data.',
    'Tabular Q-learning needs manual state buckets, which caps how rich the state can get.',
    'Two counters and two arrival scenarios, not a full sweep.',
    'The live demo here is a browser re-implementation of the notebook’s rules. The table reports the notebook’s results. Training is stochastic, so a run in your browser can land on a win, a tie or occasionally a loss against shortest-queue.',
  ],
};

export const experience = [
  {
    id: 'grapes',
    role: 'AI Engineer Intern (CPO Track)',
    org: 'Grapes Worldwide',
    dates: 'Feb 2026 – Jun 2026',
    points: [
      'Developed Influence Model 2.0, a feature-engineered ranking system scoring 500+ influencer profiles on normalized engagement metrics.',
      'Built Python ETL and ingestion pipelines with Playwright, Apify, Firecrawl, Redis and PostgreSQL.',
      'Created a consensus-based evaluation framework combining several predictive models, used across 10+ enterprise brands.',
      'Collected and analysed data from four competitor marketplaces, Reddit and Meta Ad Library for business intelligence reports.',
    ],
    stats: [
      { value: '500+', label: 'profiles scored' },
      { value: '~3 h', label: 'manual evaluation saved per day' },
      { value: '~70%', label: 'fewer redundant API requests' },
    ],
  },
  {
    id: 'dandelion',
    role: 'Co-Founder & AI Engineer',
    org: 'Dandelion',
    dates: 'Oct 2025 – Present',
    points: [
      'Built an adaptive learning platform using NLP, retrieval-augmented generation and personalized recommendations.',
      'Deployed across three institutions for 50+ students, with effectiveness reviewed by five educators.',
      'Won 1st place at the Applied AI Challenge among 20+ teams, plus the Most Engaging Chatbot Award.',
    ],
    stats: [
      { value: '3', label: 'institutions' },
      { value: '50+', label: 'students' },
      { value: '1st', label: 'of 20+ teams' },
    ],
  },
];

// Descriptions are deliberately general: the internship work is under a confidentiality agreement.
export const toolkit = {
  tools: [
    { name: 'Influencer ranking', detail: 'Scores and ranks influencer profiles on normalized engagement, then tracks how campaigns perform.' },
    { name: 'Brand research', detail: 'Studies a brand\u2019s web presence and asks several AI models the same question, keeping what they agree on.' },
    { name: 'Social reporting', detail: 'Brings social metrics from several platforms into one dashboard, with competitor benchmarks and exportable reports.' },
    { name: 'Content calendar', detail: 'Plans, publishes and measures social content across platforms.' },
    { name: 'Media relations', detail: 'A database of publishers and journalists for planning outreach.' },
  ],
  hub: { name: 'One platform', detail: 'A single login, database and dashboard that brings the tools together, with a shared task queue behind them.' },
};

type Skill = { name: string; used: string[] };

export const skills: { group: string; items: Skill[] }[] = [
  {
    group: 'Analytics & BI',
    items: [
      { name: 'SQL', used: ['grapes'] },
      { name: 'Excel / Google Sheets', used: [] },
      { name: 'Power BI', used: [] },
      { name: 'Tableau', used: [] },
      { name: 'Power Query', used: [] },
      { name: 'DAX', used: [] },
      { name: 'EDA', used: ['upi', 'shock'] },
      { name: 'Data cleaning', used: ['upi', 'shock', 'grapes'] },
      { name: 'Data visualisation', used: ['upi', 'shock'] },
      { name: 'KPI analysis', used: ['upi', 'grapes'] },
    ],
  },
  {
    group: 'Programming',
    items: [
      { name: 'Python', used: ['upi', 'shock', 'queue', 'grapes', 'health', 'docs'] },
      { name: 'Pandas', used: ['upi', 'shock', 'health'] },
      { name: 'NumPy', used: ['upi', 'shock', 'queue'] },
      { name: 'Matplotlib', used: ['upi', 'shock', 'queue'] },
      { name: 'Seaborn', used: [] },
      { name: 'TypeScript', used: ['dandelion', 'grapes'] },
    ],
  },
  {
    group: 'Statistics & Experimentation',
    items: [
      { name: 'Hypothesis testing', used: ['upi', 'queue'] },
      { name: 't-tests', used: ['queue'] },
      { name: 'Confidence intervals', used: ['upi'] },
      { name: 'Regression analysis', used: ['upi', 'shock'] },
      { name: 'Correlation analysis', used: ['upi'] },
      { name: 'Time series analysis', used: ['upi'] },
      { name: 'Feature engineering', used: ['shock', 'grapes', 'health'] },
      { name: 'ANOVA', used: [] },
      { name: 'Chi-square tests', used: [] },
      { name: 'A/B testing', used: [] },
    ],
  },
  {
    group: 'Business & Product Analytics',
    items: [
      { name: 'Root cause analysis', used: ['upi'] },
      { name: 'Business performance analysis', used: ['upi', 'grapes'] },
      { name: 'Customer segmentation', used: [] },
      { name: 'Funnel analysis', used: [] },
      { name: 'Cohort analysis', used: [] },
      { name: 'Retention analysis', used: [] },
    ],
  },
  {
    group: 'Data Engineering',
    items: [
      { name: 'ETL pipelines', used: ['grapes', 'docs'] },
      { name: 'PostgreSQL', used: ['grapes'] },
      { name: 'Redis', used: ['grapes'] },
      { name: 'MongoDB Atlas', used: ['dandelion'] },
      { name: 'FastAPI', used: ['grapes'] },
      { name: 'API integration', used: ['grapes', 'dandelion'] },
      { name: 'Data validation', used: ['docs', 'upi'] },
      { name: 'Playwright', used: ['grapes'] },
      { name: 'Apify', used: ['grapes'] },
      { name: 'Firecrawl', used: ['grapes'] },
    ],
  },
  {
    group: 'Machine Learning & AI',
    items: [
      { name: 'Scikit-learn', used: ['health', 'grapes'] },
      { name: 'XGBoost', used: ['health'] },
      { name: 'NLP', used: ['dandelion'] },
      { name: 'RAG', used: ['dandelion'] },
      { name: 'TF-IDF', used: [] },
      { name: 'Streamlit', used: ['health'] },
      { name: 'Git / GitHub', used: ['upi', 'shock', 'queue'] },
    ],
  },
];

export const education = [
  { school: 'Masters’ Union', degree: 'B.Tech., Data Science & AI', dates: '2025 – 2029' },
  { school: 'IIT Guwahati', degree: 'B.Sc. (Hons.), Data Science & AI', dates: '2025 – 2029' },
];

export const awards = [
  { title: '1st place, Applied AI Challenge', detail: 'Among 20+ teams, with Dandelion', image: null as string | null },
  { title: 'Most Engaging Chatbot Award', detail: 'Applied AI Challenge', image: null as string | null },
];

// Add real quotes here once permission is given. The section stays hidden while this is empty.
export const quotes: { text: string; name: string; role: string }[] = [];

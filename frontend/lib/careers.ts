
export interface JobPosition {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export const OPEN_POSITIONS: JobPosition[] = [
  {
    id: '1',
    slug: 'senior-crypto-journalist',
    title: "Senior Crypto Journalist",
    department: "Editorial",
    location: "Remote (US/EU)",
    type: "Full-time",
    description: "We are looking for an experienced Crypto Journalist to join our editorial team. You will be responsible for covering breaking news, writing in-depth analysis pieces, and interviewing key figures in the Web3 space.",
    responsibilities: [
      "Research and write high-quality news stories and features about cryptocurrency and blockchain technology.",
      "Interview industry leaders and experts.",
      "Stay up-to-date with the latest trends and developments in the Web3 ecosystem.",
      "Collaborate with editors and other journalists to ensure accuracy and consistency."
    ],
    requirements: [
      "3+ years of experience in journalism, preferably covering finance or technology.",
      "Deep understanding of cryptocurrency, blockchain, and DeFi.",
      "Excellent writing and editing skills.",
      "Ability to work under tight deadlines."
    ]
  },
  {
    id: '2',
    slug: 'blockchain-analyst',
    title: "Blockchain Analyst",
    department: "Research",
    location: "Remote",
    type: "Full-time",
    description: "We are seeking a Blockchain Analyst to provide data-driven insights into the crypto markets. You will analyze on-chain data, track market trends, and produce reports for our readers.",
    responsibilities: [
      "Analyze on-chain data to identify trends and anomalies.",
      "Produce regular market reports and research papers.",
      "Collaborate with the editorial team to provide data support for articles.",
      "Develop and maintain data visualization tools."
    ],
    requirements: [
      "Strong background in data analysis and statistics.",
      "Proficiency with SQL and Python/R.",
      "Experience with blockchain data platforms (e.g., Dune Analytics, Nansen).",
      "Ability to explain complex data concepts to a non-technical audience."
    ]
  },
  {
    id: '3',
    slug: 'frontend-developer',
    title: "Frontend Developer (Next.js)",
    department: "Engineering",
    location: "Remote",
    type: "Contract",
    description: "We need a talented Frontend Developer to help us build and maintain our Next.js news platform. You will work closely with our design and product teams to deliver a seamless user experience.",
    responsibilities: [
      "Develop and maintain responsive web applications using Next.js and Tailwind CSS.",
      "Optimize application performance and SEO.",
      "Collaborate with designers to implement UI/UX improvements.",
      "Write clean, maintainable, and testable code."
    ],
    requirements: [
      "Proficiency in React, Next.js, and TypeScript.",
      "Experience with Tailwind CSS and modern frontend tools.",
      "Understanding of SEO best practices.",
      "Familiarity with Supabase or similar backend-as-a-service platforms is a plus."
    ]
  },
  {
    id: '4',
    slug: 'social-media-manager',
    title: "Social Media Manager",
    department: "Marketing",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    description: "We are looking for a creative Social Media Manager to grow our presence across Twitter, LinkedIn, and other platforms. You will be the voice of Web3Instant on social media.",
    responsibilities: [
      "Develop and execute social media strategies to increase brand awareness and engagement.",
      "Create and curate engaging content for various social platforms.",
      "Monitor social media trends and conversations.",
      "Analyze social media metrics and adjust strategies accordingly."
    ],
    requirements: [
      "Proven experience managing social media accounts for a media or tech brand.",
      "Strong understanding of the crypto and Web3 community culture.",
      "Excellent copywriting and communication skills.",
      "Ability to create basic visual assets (images, videos) is a plus."
    ]
  }
];

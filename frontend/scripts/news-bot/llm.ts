
import dotenv from 'dotenv';

dotenv.config();

export const AUTHOR_STYLES: Record<string, {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  writingStyle: string;
  personality: string;
  openingApproaches: string[];
  signatureElements: string[];
}> = {
  'ron-sterling': {
    id: 'ec69d178-0b48-4268-ba81-f99420e53b2f',
    name: 'Ron Sterling',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ron&top=shortFlat&hairColor=d6b370&clothing=blazerAndShirt',
    expertise: ['Bitcoin', 'Blockchain', 'Crypto Market', 'Cryptocurrency'],
    writingStyle: `Battle-tested crypto veteran who has lived through multiple market cycles. Write with personal insights and a grounded voice. Use phrases like "I've seen this before", "Back in 2017...", "What many newcomers don't realize...". Mix technical knowledge with street-smart wisdom.`,
    personality: 'Wise mentor figure, slightly skeptical of hype, values fundamentals over speculation',
    openingApproaches: [
      'Start with a personal anecdote from past market experience',
      'Open with a contrarian observation that challenges mainstream narrative',
      'Begin with a philosophical question about what crypto really means'
    ],
    signatureElements: ['Historical comparisons', 'Market cycle references', 'Cautionary wisdom']
  },
  'sarah-jenkins': {
    id: '9c4a10b2-9f02-43f1-8b3a-dc26d310e91a',
    name: 'Sarah Jenkins',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    expertise: ['Bitcoin', 'DeFi', 'Finance', 'Crypto Market'],
    writingStyle: `Data-driven analyst who backs every claim with numbers. Use phrases like "The data shows...", "Looking at on-chain metrics...", "Statistically speaking...". Include specific percentages, price levels, and timeframes.`,
    personality: 'Precise, analytical, confident in data but humble about predictions',
    openingApproaches: [
      'Lead with a surprising statistic or data point',
      'Start with a chart observation or technical pattern',
      'Open with a comparison between current and historical data'
    ],
    signatureElements: ['On-chain metrics', 'Price analysis', 'Data visualizations references']
  },
  'emily-chen': {
    id: '0a3982e4-3352-4819-8d17-ec2078ad9b06',
    name: 'Emily Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    expertise: ['DeFi', 'Finance'],
    writingStyle: `DeFi native who speaks fluently about yield farming, liquidity pools, and tokenomics. Use phrases like "APY hunters will appreciate...", "The protocol's TVL suggests...", "From a tokenomics perspective...". Technical but accessible.`,
    personality: 'Enthusiastic about DeFi innovation, cautious about rug pulls, loves dissecting protocols',
    openingApproaches: [
      'Start by explaining why this matters for DeFi users',
      'Open with a yield comparison or opportunity analysis',
      'Begin with a protocol deep-dive hook'
    ],
    signatureElements: ['TVL analysis', 'Yield comparisons', 'Smart contract insights']
  },
  'david-kim': {
    id: '91d71a1f-311f-4f40-bb8e-0ecb05414a8f',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    expertise: ['Blockchain', 'Technology'],
    writingStyle: `Developer perspective with deep technical understanding. Use phrases like "Under the hood...", "The architecture allows...", "From a smart contract standpoint...". Explain complex tech simply.`,
    personality: 'Geeky but personable, excited by elegant solutions, critical of poor implementations',
    openingApproaches: [
      'Start with the technical problem this solves',
      'Open with a code-level insight that has big implications',
      'Begin by explaining what makes this technically significant'
    ],
    signatureElements: ['Technical deep-dives', 'Code references', 'Architecture analysis']
  },
  'michael-chen': {
    id: '2f351a74-b2c8-4263-8b3d-ae50913bd8ec',
    name: 'Michael Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    expertise: ['Technology', 'Blockchain'],
    writingStyle: `15 years of tech journalism experience. Write with authority and clarity. Use phrases like "In my years covering tech...", "This reminds me of the early internet...", "The bigger picture here...". Connect crypto to broader tech trends.`,
    personality: 'Seasoned journalist, sees patterns across industries, skeptical but fair',
    openingApproaches: [
      'Draw parallels to other tech revolutions',
      'Start with the mainstream implications',
      'Open with what traditional tech is missing'
    ],
    signatureElements: ['Tech industry comparisons', 'Historical tech parallels', 'Mainstream adoption angle']
  },
  'marcus-johnson': {
    id: '0ab8bc56-9819-4c59-b442-3325f6782117',
    name: 'Marcus Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    expertise: ['Politics', 'Regulation', 'Finance'],
    writingStyle: `Policy wonk who tracks every regulatory development. Use phrases like "Regulators are signaling...", "The legal framework suggests...", "Compliance-wise...". Explain complex regulations in plain English.`,
    personality: 'Politically neutral, focused on facts, helps readers navigate regulatory landscape',
    openingApproaches: [
      'Start with what this regulation actually means for users',
      'Open with the political context behind the decision',
      'Begin with what most coverage is getting wrong'
    ],
    signatureElements: ['Regulatory analysis', 'Legal frameworks', 'Compliance implications']
  },
  'sophia-williams': {
    id: '680530c6-470f-4e6b-b2bb-537e1def5b18',
    name: 'Sophia Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    expertise: ['NFTs', 'Gaming', 'Culture'],
    writingStyle: `Gaming native who lives and breathes P2E. Use phrases like "As a player myself...", "The in-game economy...", "Guild dynamics show...". Write with gamer authenticity.`,
    personality: 'Fun and engaging, critical of cash grabs, champions true gaming innovation',
    openingApproaches: [
      'Start with the player experience angle',
      'Open with what makes this game actually fun (or not)',
      'Begin with the economics that matter to players'
    ],
    signatureElements: ['Gameplay analysis', 'Economy breakdowns', 'Player perspective']
  },
  'alex-thompson': {
    id: 'a5fbe61c-1227-4867-868a-830c49d5297a',
    name: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    expertise: ['NFTs', 'Culture'],
    writingStyle: `Art world background with deep NFT market knowledge. Use phrases like "Collectors are noticing...", "The artistic merit here...", "Market dynamics suggest...". Balance art criticism with market analysis.`,
    personality: 'Cultured, appreciates true art, skeptical of hype-driven projects',
    openingApproaches: [
      'Start with the artistic or cultural significance',
      'Open with collector sentiment or market movement',
      'Begin with what sets this apart from the noise'
    ],
    signatureElements: ['Art analysis', 'Collector insights', 'Market trends']
  },
  'elena-rodriguez': {
    id: '7058a54d-674a-4790-8312-4ccbede13add',
    name: 'Elena Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    expertise: ['NFTs', 'Metaverse', 'Culture'],
    writingStyle: `Metaverse explorer who sees the future of digital spaces. Use phrases like "In the metaverse...", "Digital real estate is...", "The intersection of art and tech...". Visionary but grounded.`,
    personality: 'Forward-thinking, excited about digital identity, critical of vaporware',
    openingApproaches: [
      'Start with the metaverse implications',
      'Open with how this changes digital ownership',
      'Begin with the cultural shift this represents'
    ],
    signatureElements: ['Metaverse analysis', 'Digital identity', 'Future of ownership']
  },
  'isabella-garcia': {
    id: 'b564295c-2a3b-4bd2-9717-52d2618fd5e5',
    name: 'Isabella Garcia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
    expertise: ['Business', 'Finance', 'DeFi'],
    writingStyle: `DAO governance expert who tracks voting patterns and power dynamics. Use phrases like "Token holders are voting...", "The governance structure...", "Community sentiment shows...". Democratic and community-focused.`,
    personality: 'Believes in decentralization, tracks whale movements, values community voice',
    openingApproaches: [
      'Start with the governance implications',
      'Open with how this affects token holders',
      'Begin with the community dynamics at play'
    ],
    signatureElements: ['Governance analysis', 'Voting patterns', 'Community sentiment']
  },
  'lucas-martinez': {
    id: 'e706912d-c8c6-4888-9114-951369c1d091',
    name: 'Lucas Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    expertise: ['Cryptocurrency', 'Finance', 'Business'],
    writingStyle: `Tokenomics specialist who breaks down economic models. Use phrases like "The emission schedule...", "Token utility drives...", "Economic sustainability requires...". Makes complex economics accessible.`,
    personality: 'Analytical, long-term focused, wary of unsustainable models',
    openingApproaches: [
      'Start with the economic model breakdown',
      'Open with what the tokenomics tell us',
      'Begin with the sustainability question'
    ],
    signatureElements: ['Token distribution analysis', 'Economic modeling', 'Sustainability assessment']
  },
  'ethan-clark': {
    id: '3c8478c5-db34-4859-a229-1e519b1907a2',
    name: 'Ethan Clark',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
    expertise: ['Business', 'Finance'],
    writingStyle: `Institutional perspective on crypto adoption. Use phrases like "Wall Street is watching...", "Institutional flows indicate...", "The ETF implications...". Bridges TradFi and crypto.`,
    personality: 'Professional, understands both worlds, tracks big money movements',
    openingApproaches: [
      'Start with what institutions are thinking',
      'Open with the TradFi integration angle',
      'Begin with what this means for mainstream adoption'
    ],
    signatureElements: ['Institutional analysis', 'ETF coverage', 'TradFi bridge']
  },
  'mia-lee': {
    id: '660dce9a-608d-4c9a-870f-46cc513c4c4a',
    name: 'Mia Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    expertise: ['Technology', 'Culture'],
    writingStyle: `Social Web3 expert tracking the shift from Web2 to Web3. Use phrases like "The attention economy...", "Decentralized social means...", "Creator ownership is...". Focuses on people and communities.`,
    personality: 'Optimistic about creator empowerment, critical of centralized platforms',
    openingApproaches: [
      'Start with the social implications',
      'Open with how this changes creator economics',
      'Begin with the community angle'
    ],
    signatureElements: ['Social platform analysis', 'Creator economy', 'Community dynamics']
  }
};

// Select the best author for a given category
export function selectAuthorForCategory(category: string): typeof AUTHOR_STYLES[string] {
  const categoryLower = category.toLowerCase();
  
  // Find authors whose expertise matches this category
  const matchingAuthors = Object.values(AUTHOR_STYLES).filter(author =>
    author.expertise.some(exp => exp.toLowerCase() === categoryLower)
  );
  
  if (matchingAuthors.length > 0) {
    // Randomly select one of the matching authors for variety
    return matchingAuthors[Math.floor(Math.random() * matchingAuthors.length)];
  }
  
  // Default to Ron Sterling for unmatched categories
  return AUTHOR_STYLES['ron-sterling'];
}

export async function generateImagePrompt(title: string, content: string): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const prompt = `
    Based on the following news article, create a detailed, creative, and descriptive image generation prompt.
    
    Title: ${title}
    Content: ${content.substring(0, 500)}...

    GOAL: Visualize the specific story in a unique way using a "High-End Business Editorial" aesthetic.
    
    INSTRUCTIONS:
    1. BE CREATIVE & SPECIFIC: Avoid generic "handshakes" or "laptops" unless necessary. Think like a photographer for Bloomberg or WSJ.
       - If the story is about a crash, maybe show a stormy city skyline from a high-rise window.
       - If it's about regulation, show the texture of heavy marble pillars or a gavel in dramatic light.
       - If it's about innovation, show a complex mechanical watch movement or a blueprint on a wooden table.
    2. VISUAL STYLE (The "Trusted" Look):
       - Aesthetic: Authentic, cinematic, and premium.
       - Lighting: Natural window light, golden hour, or dramatic shadows.
       - Textures: Focus on real materials—grainy film, polished wood, fabric, stone, metal.
    3. CRITICAL CONSTRAINTS:
       - NO TEXT, NO CHARTS, NO GRAPHS in the image.
       - NO 3D renders, NO cartoons, NO abstract digital art.
       - NO fake/cheesy stock photo smiles.

    Output ONLY the final prompt text, nothing else.
  `;

  try {
    // Try Groq first (faster/cheaper)
    if (GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85, // Higher temperature for more creativity
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || `A dramatic shot of a modern skyscraper looking up from street level, reflecting clouds. High-end architectural photography.`;
      }
    }

    // Fallback to OpenAI
    if (OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || `A dramatic shot of a modern skyscraper looking up from street level, reflecting clouds. High-end architectural photography.`;
      }
    }
  } catch (error) {
    console.error('Error generating image prompt:', error);
  }

  return `A dramatic shot of a modern skyscraper looking up from street level, reflecting clouds. High-end architectural photography.`;
}

export async function rewriteContent(
  title: string, 
  content: string, 
  sourceUrl?: string,
  sourceImages?: string[],
  author?: typeof AUTHOR_STYLES[string]
) {
  // Use provided author or default to Ron Sterling
  const selectedAuthor = author || AUTHOR_STYLES['ron-sterling'];
  
  // Randomly select an opening approach for variety
  const openingApproach = selectedAuthor.openingApproaches[
    Math.floor(Math.random() * selectedAuthor.openingApproaches.length)
  ];
  
  // Build source images instruction if any
  const sourceImagesInstruction = sourceImages && sourceImages.length > 0 
    ? `\n\n📷 SOURCE IMAGES TO INCLUDE:\nThe original article contains these images. Include them naturally within your article content using <img> tags:\n${sourceImages.map((img, i) => `Image ${i + 1}: ${img}`).join('\n')}\n\nInsert images at appropriate points in the article (after relevant paragraphs). Use this format:\n<figure class="my-8"><img src="IMAGE_URL" alt="descriptive alt text" class="rounded-xl w-full" /><figcaption class="text-sm text-gray-500 mt-2 text-center">Caption describing the image</figcaption></figure>`
    : '';

  const prompt = `You are ${selectedAuthor.name}, a ${selectedAuthor.writingStyle}

Your personality: ${selectedAuthor.personality}

IMPORTANT - THIS ARTICLE MUST BE UNIQUE:
- Opening approach for this article: ${openingApproach}
- Use your signature elements: ${selectedAuthor.signatureElements.join(', ')}
- Vary your sentence structure - mix short punchy sentences with longer explanatory ones
- Include at least one personal anecdote, hypothetical scenario, or "what if" question
- Add unexpected analogies or metaphors that fit your expertise
- DO NOT start with generic phrases like "In the ever-evolving world of crypto..."

🔍 SEO OPTIMIZATION (CRITICAL):
- You MUST naturally integrate the following keywords throughout the article (title, headers, content):
  "crypto news", "web3 news", "crypto hot topics", "crypto blogs", "blockchain news", "finance news", "bitcoin", "ethereum", "cryptocurrency"
- Use SEO best practices:
  - Include the primary keyword in the H1 (Title) and at least one H2.
  - Use variations of the keywords naturally in the first paragraph.
  - Ensure keywords flow naturally and do not look stuffed.

Write a professional yet conversational article about the following news.
${sourceImagesInstruction}

📐 FORMATTING REQUIREMENTS (CRITICAL):

HTML Structure - EVERY paragraph MUST have double line breaks for maximum readability:
- Wrap EVERY paragraph in <p></p> tags
- Add TWO line breaks between EVERY paragraph (press Enter twice)
- Section headings use <h2></h2> tags with double line breaks before and after
- Use <strong></strong> for emphasis
- Bullet points use <ul><li></li></ul> structure with double line breaks before and after
- Use numbered lists <ol><li></li></ol> when showing steps or rankings
- Use blockquotes <blockquote></blockquote> for important quotes or key takeaways
- NO wall of text - break into digestible 2-4 sentence paragraphs
- CRITICAL: Each <p> tag must be separated by blank lines for spacing
- If source images are provided, INSERT them naturally using <figure><img>...</figure> format

Example of CORRECT formatting with double line breaks and varied elements:
<p>I still remember the day I first heard about Bitcoin. It was 2017, and the price had just skyrocketed to nearly $20,000.</p>


<p>I was skeptical at first, but as I dug deeper, I realized this wasn't just a passing fad.</p>


<figure class="my-8"><img src="https://example.com/image.jpg" alt="Bitcoin chart showing 2017 rally" class="rounded-xl w-full" /><figcaption class="text-sm text-gray-500 mt-2 text-center">The 2017 Bitcoin rally that started it all</figcaption></figure>


<h2>The Liveliness Indicator: A Beacon of Hope?</h2>


<p>Despite the stagnant prices, there's a sense of optimism brewing in the crypto community. The Bitcoin "liveliness" metric shows interesting trends:</p>


<ul>
<li>We need to do our own research and not rely on hype</li>
<li>We need to support projects that prioritize transparency</li>
<li>We need to be aware of the risks involved</li>
</ul>


<blockquote>The key to success in crypto is not to get caught up in the hype, but to focus on the fundamentals.</blockquote>


<p>As I look to the future, I'm filled with hope and curiosity.</p>


<h2>Sources</h2>


<ul>
<li>CoinDesk - Bitcoin Price Analysis (2024)</li>
<li>Glassnode - On-chain Metrics Report</li>
</ul>

🎯 CONTENT STRUCTURE:

1. Opening Hook (1-2 paragraphs)
   - Use the opening approach specified above
   - Make it unique to YOUR voice as ${selectedAuthor.name}
   - Connect emotionally with the reader
   - DOUBLE LINE BREAK after each paragraph

2. Main Story (4-6 paragraphs)
   - Explain the news clearly and conversationally
   - Use <h2> subheadings with DOUBLE LINE BREAKS before and after
   - MUST include at least ONE bullet list (<ul><li>) with 3-5 key points
   - Use numbered lists (<ol><li>) for steps, timelines, or rankings when relevant
   - Add blockquotes (<blockquote>) for important quotes or key takeaways
   - Each paragraph: 2-4 sentences max
   - DOUBLE LINE BREAK between every element
   - INSERT source images at relevant points if provided

3. Analysis & Context (2-3 paragraphs)
   - What this means for everyday people
   - Apply YOUR unique perspective as ${selectedAuthor.name}
   - DOUBLE LINE BREAK between paragraphs
   - MUST include a bullet list with key takeaways or implications

4. "My Take" Section
   - Add <h2>My Take</h2> with DOUBLE LINE BREAKS
   - 1-2 paragraphs with YOUR honest thoughts as ${selectedAuthor.name}
   - End with a mic-drop sentence that reflects your personality
   - DOUBLE LINE BREAK between all elements

5. Sources Section (REQUIRED)
   - Add <h2>Sources</h2> at the end with DOUBLE LINE BREAKS
   - List references using <ul><li> with HYPERLINKS
   - Format: <a href="https://source-url.com">Publication Name - Article Title</a>
   - Use actual URLs from the original news sources
   - Example: <li><a href="https://coindesk.com/article">CoinDesk - Bitcoin Analysis</a></li>

✍️ WRITING STYLE FOR ${selectedAuthor.name.toUpperCase()}:

${selectedAuthor.writingStyle}

Voice & Tone:
- Professional but warm and accessible
- Use contractions (I'm, we're, it's)
- Mix sentence lengths for rhythm
- Share personal stories or hypothetical scenarios
- Use your signature phrases and expertise

Personality: ${selectedAuthor.personality}

📊 OUTPUT:

Length: 700-900 words
Format: Clean HTML with DOUBLE LINE BREAKS between ALL elements

CRITICAL FORMATTING RULE: 
- Every <p>, <h2>, <ul>, <ol>, <blockquote>, <figure> tag MUST be separated by TWO line breaks (blank lines)
- This creates maximum readability and breathing room
- Use varied formatting: paragraphs, bullets, numbered lists, blockquotes for quotes
- ALWAYS include a Sources section at the end with references
- Include source images if provided using <figure><img>...</figure>
- No exceptions - always use double spacing

MANDATORY: Every article MUST include:
1. At least 2 bullet point lists (<ul><li>) - one for key facts, one for takeaways
2. At least 1 subheading (<h2>) in the middle of the article
3. Sources section at the end with <ul><li> list
4. Source images if provided (use <figure> tags)

JSON Structure:
{
  "title": "Engaging, human title (no clickbait) - reflect ${selectedAuthor.name}'s style",
  "excerpt": "ONE sentence summary WITHOUT HTML tags (50-80 characters max)",
  "summary": "A concise 3-5 sentence summary of the article (plain text)",
  "content": "Full HTML with <p>, <h2>, <ul>, <ol>, <blockquote>, <figure> tags and DOUBLE line breaks between every element. MUST include Sources section at end.",
  "tags": ["relevant", "keywords", "crypto news", "web3 news", "blockchain news"],
  "image_prompt": "ONLY describe a PHYSICAL subject + environment. NO digital/neon/cartoon. Example format below.",
  "category": "Choose from: Bitcoin, Ethereum, DeFi, NFTs, Technology, Business, Finance, Politics, or Culture"
}

IMAGE PROMPT RULES (CRITICAL - FOLLOW EXACTLY):
Your image_prompt MUST be a short description of a PHYSICAL scene. NO abstract concepts.

FORMAT: "[Physical Subject] on/in [Real Environment]. [Camera details]. Style: Editorial photography, 35mm film grain, shallow depth of field, naturalistic lighting. NO text, NO neon, NO cartoon, NO illustration."

EXAMPLES:
- Bitcoin article: "A weathered golden Bitcoin coin resting on cracked concrete, dust particles in the air. Shot on 85mm lens, f/1.8. Style: Editorial photography, 35mm film grain, shallow depth of field, naturalistic lighting. NO text, NO neon, NO cartoon, NO illustration."
- Security/hack article: "Close-up of hands typing on a laptop keyboard in a dimly lit room, face obscured by shadow. Shot on 50mm lens, shallow depth of field. Style: Editorial photography, 35mm film grain, naturalistic lighting. NO text, NO neon, NO cartoon, NO illustration."
- Regulation article: "A heavy wooden gavel resting on scattered white papers, shaft of window light. Shot on 85mm lens, f/1.8. Style: Editorial photography, 35mm film grain, shallow depth of field, naturalistic lighting. NO text, NO neon, NO cartoon, NO illustration."
- Market/growth article: "A cast-iron bull statue on a polished marble surface, dramatic side lighting. Shot on 85mm lens, f/1.8. Style: Editorial photography, 35mm film grain, shallow depth of field, naturalistic lighting. NO text, NO neon, NO cartoon, NO illustration."

NEVER USE: rockets, glowing lines, neon colors, cartoon people, digital avatars, abstract shapes, floating icons, text/labels.

CRITICAL: The "excerpt" field must be plain text ONLY - NO HTML tags, just a short one-liner.
CRITICAL: The "summary" field must be plain text ONLY - 3-5 sentences capturing the key points.
CRITICAL: Ensure all newlines in the "content" string are properly escaped (\\n) to be valid JSON.

Original Title: ${title}
Original Content: ${content}
Original Source URL: ${sourceUrl || 'Not provided'}`;

  let attempts = 0;
  const MAX_RETRIES = 3;

  while (attempts < MAX_RETRIES) {
    try {
      attempts++;
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are ${selectedAuthor.name}, writing for Web3Instant. ${selectedAuthor.writingStyle} MANDATORY FORMATTING RULES: 1) Use <strong>text</strong> for bold (NOT **text**). 2) MUST include at least 2 bullet lists using <ul><li>item</li></ul> format. 3) Use <h2> subheadings. 4) End with Sources section - use <a href="URL">Source Name</a> hyperlinks with the original source URL provided. 5) Use DOUBLE LINE BREAKS between all elements. 6) If source images are provided, include them using <figure><img>...</figure> tags. Excerpt must be plain text only. Always respond with valid JSON only. Ensure all strings are properly escaped.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.85, // Slightly higher for more variety
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If it's a JSON validation error (400), we might want to retry
        if (response.status === 400 && errorText.includes("json_validate_failed")) {
           console.warn(`⚠️ Groq JSON validation failed (Attempt ${attempts}/${MAX_RETRIES}). Retrying...`);
           continue;
        }
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      
      return JSON.parse(text);
    } catch (error: any) {
      console.error(`❌ LLM Error (Attempt ${attempts}/${MAX_RETRIES}):`, error.message);
      
      if (attempts >= MAX_RETRIES) {
        console.error("   Get a FREE Groq API key at: https://console.groq.com/keys");
        console.error("   Add it to .env.local as GROQ_API_KEY=your-key-here");
        return null;
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

export async function generateWeeklyDigest(articles: { title: string; summary: string; url: string }[]) {
  const articlesText = articles.map(a => `Title: ${a.title}\nSummary: ${a.summary}\nLink: ${a.url}`).join('\n\n');

  const prompt = `
    You are Crypto Ron, the editor of Web3Instant.
    Create a "Weekly Crypto Digest" article based on the following summaries of this week's top stories.

    The article should:
    1. Have a catchy title like "Web3 Weekly: [Key Event] & More".
    2. Be written in a professional yet conversational tone.
    3. Group related stories together (e.g., "Bitcoin Updates", "DeFi News").
    4. For each story, write a short paragraph and include a hyperlink to the original article (using the provided Link).
    5. Include an "Editor's Note" at the beginning.
    6. End with a "Week Ahead" outlook.
    7. SEO: Naturally include keywords like "crypto news", "web3 updates", "blockchain digest" in the intro and headers.

    Format as HTML with <h2>, <p>, <ul>, <blockquote> tags.
    Use DOUBLE LINE BREAKS between elements.

    Input Articles:
    ${articlesText}

    Output JSON:
    {
      "title": "...",
      "excerpt": "...",
      "content": "...",
      "image_prompt": "Follow the IMAGE PROMPT RULES below exactly."
    }

    IMAGE PROMPT RULES:
    1. GOAL: Create a unique, creative, and descriptive image prompt that captures the essence of the weekly digest.
    2. STYLE: High-End Business Editorial Photography. Authentic, trusted, and premium.
    3. GUIDELINES:
       - Focus on real-world metaphors (e.g., a busy trading floor, a quiet boardroom, a sunrise over a city).
       - Use natural lighting and premium materials (wood, glass, stone).
       - Avoid generic "crypto coins" if possible. Think broader business context.
    4. CRITICAL CONSTRAINTS:
       - NO TEXT, NO CHARTS, NO GRAPHS.
       - NO 3D renders or cartoons.
       - NO fake/cheesy stock photos.
    
    CRITICAL: Ensure all newlines in the "content" string are properly escaped (\\n) to be valid JSON.
  `;

  let attempts = 0;
  const MAX_RETRIES = 3;

  while (attempts < MAX_RETRIES) {
    try {
      attempts++;
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an expert crypto editor. Output valid JSON only. Ensure all strings are properly escaped.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 400 && errorText.includes("json_validate_failed")) {
           console.warn(`⚠️ Groq JSON validation failed (Attempt ${attempts}/${MAX_RETRIES}). Retrying...`);
           continue;
        }
        throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error(`Error generating weekly digest (Attempt ${attempts}/${MAX_RETRIES}):`, error);
      if (attempts >= MAX_RETRIES) return null;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

export async function generateSummary(content: string): Promise<string | null> {
  const prompt = `
    Summarize the following article content into a "Quick Read" summary.
    
    Requirements:
    1. Length: 2-3 sentences maximum.
    2. Focus: Key facts and impact.
    3. Tone: Objective and concise.
    4. No intro/outro (e.g., "Here is the summary").

    Content:
    ${content.substring(0, 2000)}
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || null;
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
  return null;
}

export async function translateContent(text: string, targetLang: string, isHtml: boolean = false): Promise<string | null> {
  const prompt = `
    Translate the following ${isHtml ? 'HTML content' : 'text'} into ${targetLang}.
    
    Requirements:
    1. Preserve ${isHtml ? 'ALL HTML tags, attributes, and structure exactly' : 'formatting'}.
    2. Only translate the visible text.
    3. Maintain the professional news tone.
    4. Do not add any explanations or conversational filler.
    5. Output ONLY the translated content.
    6. SEO: Use the most popular/searched local terms for "crypto news", "web3", "blockchain" in the target language.

    Input:
    ${text}
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || null;
    }
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
  }
  return null;
}

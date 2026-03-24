import type { AgentProfileData } from "@/features/agent-page/AgentPage";

/**
 * Hardcoded demo agent profiles.
 * These render on the landing page and serve as client-side fallback
 * when the database is unavailable for known demo slugs.
 */
export const DEMO_AGENTS: AgentProfileData[] = [
  {
    slug: "sarah-chen",
    name: "Sarah Chen",
    title: "Luxury Property Specialist",
    brokerage: "Kevv Realty",
    phone: "(415) 555-0188",
    email: "sarah@kevvrealty.com",
    licenseState: "CA",
    serviceAreas: ["San Francisco", "Palo Alto", "Menlo Park", "Atherton"],
    specialties: [
      "Luxury Homes",
      "Investment Properties",
      "New Construction",
      "Relocation Services",
    ],
    languages: ["English", "Mandarin", "Cantonese"],
    yearsExperience: 12,
    bio: "With over a decade of experience in Silicon Valley's most prestigious neighborhoods, I specialize in connecting discerning buyers with exceptional properties. My deep understanding of both the local market and international buyer needs — combined with fluency in English, Mandarin, and Cantonese — allows me to provide truly personalized service. Whether you're searching for a modern estate in Atherton or a charming Victorian in Pacific Heights, I'm here to guide you every step of the way.",
    photoUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop&crop=faces",
    colorScheme: "gold",
    socialLinks: {
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
    awards: [
      "Top 1% of Agents Nationwide — 2024",
      "Diamond Circle Award — 2023",
      "$50M+ in Sales Volume — 2024",
    ],
    transactions: [
      { address: "1255 Pacific Ave", city: "San Francisco", price: "$4,250,000", type: "Sold" },
      { address: "320 University Ave", city: "Palo Alto", price: "$3,800,000", type: "Sold" },
      { address: "88 Atherton Ave", city: "Atherton", price: "$6,100,000", type: "Listed" },
      { address: "415 Menlo Oaks Dr", city: "Menlo Park", price: "$2,950,000", type: "Sold" },
    ],
    testimonials: [
      {
        name: "David & Lisa W.",
        text: "Sarah made our home-buying experience in a new country seamless. Her bilingual skills and deep market knowledge were invaluable. We found our dream home in Palo Alto within two weeks!",
        rating: 5,
      },
      {
        name: "James K.",
        text: "Incredibly professional and responsive. Sarah's negotiation skills saved us over $200K on our purchase. Highly recommend for anyone looking in the Bay Area.",
        rating: 5,
      },
      {
        name: "Michelle T.",
        text: "Sarah sold our home for 15% above asking in just 5 days. Her staging recommendations and marketing strategy were outstanding.",
        rating: 5,
      },
    ],
    neighborhoodKnowledge: {},
    templateId: "classic",
    tier: "pro",
  },
  {
    slug: "michael-brooks",
    name: "Michael Brooks",
    title: "Residential Real Estate Advisor",
    brokerage: "Brookstone Realty",
    phone: "(770) 555-0234",
    email: "michael@brookstone.com",
    licenseState: "GA",
    serviceAreas: ["Atlanta", "Buckhead", "Roswell", "Alpharetta"],
    specialties: [
      "First-Time Buyers",
      "Family Homes",
      "Suburban Communities",
      "Negotiation Strategy",
    ],
    languages: ["English", "Spanish"],
    yearsExperience: 8,
    bio: "As a lifelong Atlanta native and father of three, I understand what families need in a home. I specialize in helping first-time buyers navigate the process with confidence and finding growing families the perfect neighborhood. My approach is straightforward, honest, and always focused on getting you the best deal. Let's find the place where you'll make your next great memories.",
    photoUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1000&fit=crop&crop=faces",
    colorScheme: "navy",
    socialLinks: {
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
    },
    awards: [
      "Rookie of the Year — 2018",
      "Top Producer — Buckhead Region 2023",
    ],
    transactions: [
      { address: "4521 Peachtree Rd NE", city: "Buckhead", price: "$1,250,000", type: "Sold" },
      { address: "189 Magnolia St", city: "Roswell", price: "$685,000", type: "Sold" },
      { address: "742 Windward Pkwy", city: "Alpharetta", price: "$520,000", type: "Sold" },
      { address: "55 Midtown Lofts", city: "Atlanta", price: "$410,000", type: "Listed" },
    ],
    testimonials: [
      {
        name: "Amanda & Carlos R.",
        text: "Michael was incredible with our first home purchase. He patiently explained everything and never made us feel rushed. We love our new home in Roswell!",
        rating: 5,
      },
      {
        name: "The Johnson Family",
        text: "After relocating from up north, Michael helped us find the perfect family home near great schools within our budget. Couldn't have done it without him.",
        rating: 5,
      },
    ],
    neighborhoodKnowledge: {},
    templateId: "classic",
    tier: "free",
  },
];

/** Lookup a demo agent by slug — returns undefined if not a demo slug */
export function getDemoAgent(slug: string): AgentProfileData | undefined {
  return DEMO_AGENTS.find((a) => a.slug === slug);
}

/** Mock leads for demo dashboard */
export const DEMO_LEADS = [
  {
    id: 1,
    name: "Emily Rodriguez",
    email: "emily.r@gmail.com",
    phone: "(415) 555-9821",
    agentSlug: "sarah-chen",
    source: "ai_chat",
    sessionId: "demo-session-1",
    conversationSummary: "Looking for a 3BR home in Palo Alto near good schools. Budget around $3M. Timeline: 3 months.",
    leadScore: "hot" as const,
    extractedBudget: "$2.8M–$3.2M",
    extractedArea: "Palo Alto",
    extractedTimeline: "3 months",
    extractedIntent: "buying",
    status: "new" as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "James Liu",
    email: "james.liu@outlook.com",
    phone: "(650) 555-4432",
    agentSlug: "sarah-chen",
    source: "ai_chat",
    sessionId: "demo-session-2",
    conversationSummary: "Interested in investment properties in San Francisco. Has experience with rentals. Budget $1.5M–$2M.",
    leadScore: "warm" as const,
    extractedBudget: "$1.5M–$2M",
    extractedArea: "San Francisco",
    extractedTimeline: "6 months",
    extractedIntent: "investing",
    status: "contacted" as const,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Rachel Kim",
    email: "rachel.kim@yahoo.com",
    phone: null,
    agentSlug: "sarah-chen",
    source: "contact_form",
    sessionId: null,
    conversationSummary: "Submitted contact form asking about listing her Menlo Park condo.",
    leadScore: "warm" as const,
    extractedBudget: null,
    extractedArea: "Menlo Park",
    extractedTimeline: "1 month",
    extractedIntent: "selling",
    status: "qualified" as const,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: "David Chen",
    email: "d.chen@techcorp.com",
    phone: "(408) 555-7766",
    agentSlug: "sarah-chen",
    source: "ai_chat",
    sessionId: "demo-session-3",
    conversationSummary: "Relocating from NYC. Looking for luxury home in Atherton area. Budget $5M+.",
    leadScore: "hot" as const,
    extractedBudget: "$5M+",
    extractedArea: "Atherton",
    extractedTimeline: "2 months",
    extractedIntent: "buying",
    status: "new" as const,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: "Michelle Wang",
    email: "m.wang@gmail.com",
    phone: null,
    agentSlug: "sarah-chen",
    source: "ai_chat",
    sessionId: "demo-session-4",
    conversationSummary: "Just browsing, asked general questions about the Palo Alto market trends.",
    leadScore: "cold" as const,
    extractedBudget: null,
    extractedArea: "Palo Alto",
    extractedTimeline: null,
    extractedIntent: "browsing",
    status: "new" as const,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    name: "Mark Thompson",
    email: "mark.t@stanford.edu",
    phone: "(650) 555-1199",
    agentSlug: "sarah-chen",
    source: "ai_chat",
    sessionId: "demo-session-5",
    conversationSummary: "Stanford professor looking for a home near campus. Interested in Menlo Park. Pre-approved for $2.5M.",
    leadScore: "hot" as const,
    extractedBudget: "$2.5M",
    extractedArea: "Menlo Park",
    extractedTimeline: "1 month",
    extractedIntent: "buying",
    status: "converted" as const,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/** Mock chat transcripts for demo conversation view */
export const DEMO_CONVERSATIONS: Record<string, Array<{ role: string; content: string }>> = {
  "demo-session-1": [
    { role: "user", content: "Hi, I'm looking for a 3-bedroom home near good schools in Palo Alto. What's available?" },
    { role: "assistant", content: "Great question! Palo Alto has excellent school options — Gunn and Paly are both top-rated. Right now, the median price for a 3BR in the area is around $3.2M, but there are some options in the $2.8M–$3.2M range.\n\nAre you looking to move soon, or just starting your search?" },
    { role: "user", content: "We're hoping to move within 3 months. We have two kids starting school in fall." },
    { role: "assistant", content: "That's a great timeline — you'll have some good options before the summer rush. For families, I'd recommend looking at the Duveneck/St. Francis or Old Palo Alto neighborhoods. They're walkable to both Addison and Duveneck elementary schools.\n\nWould you like me to connect you with Sarah Chen? She specializes in family relocations in Palo Alto and just helped another family find a home near Gunn." },
    { role: "user", content: "Yes, that would be great! Our budget is around $3 million." },
    { role: "assistant", content: "Perfect! I'll pass your details along to Sarah. She'll reach out within 24 hours with some curated listings in the $2.8M–$3.2M range near top schools. In the meantime, feel free to ask me anything else about the Palo Alto market! 🏡" },
  ],
  "demo-session-3": [
    { role: "user", content: "I'm relocating from NYC to the Bay Area. Looking for luxury homes in Atherton." },
    { role: "assistant", content: "Welcome to the Bay Area! Atherton is consistently ranked one of the most exclusive zip codes in the country — beautiful tree-lined estates, incredible privacy, and excellent proximity to both Stanford and Sand Hill Road.\n\nJust out of curiosity, what's driving the move? Work relocation, or looking for a change of pace?" },
    { role: "user", content: "New role at a tech company. Budget is $5M+. Need something move-in ready." },
    { role: "assistant", content: "At $5M+, you'll have excellent options in Atherton. Move-in ready estates in that range typically feature 4-6 bedrooms, resort-style grounds, and often a pool.\n\nSarah Chen actually just closed a $6.2M deal in Atherton last month — she knows the inventory intimately. Would you like her to set up a private tour? She can fly out to meet you in NYC if that's easier for the initial consult." },
    { role: "user", content: "That sounds perfect. When is she available?" },
    { role: "assistant", content: "I'll have Sarah reach out today with her availability. She typically does virtual walkthrough tours first, then in-person tours when you visit. She'll also send you a curated shortlist of the best move-in ready properties currently on and off-market in Atherton. 🏠✨" },
  ],
  "demo-session-5": [
    { role: "user", content: "I'm a professor at Stanford looking for a home nearby. What's available in Menlo Park?" },
    { role: "assistant", content: "Great choice! Menlo Park is very popular with Stanford faculty — it's a short commute and has a wonderful downtown. The market there ranges from $2M–$5M+ depending on the neighborhood.\n\nAre you looking to buy, or would you prefer to rent first?" },
    { role: "user", content: "Buy. I'm pre-approved for $2.5M. Need at least 3 bedrooms." },
    { role: "assistant", content: "At $2.5M with pre-approval, you're in a strong position for Menlo Park. I'd recommend looking at the Felton Gables or Sharon Heights neighborhoods — both are within 10 minutes of campus and have great 3-4BR options.\n\nSarah Chen has helped several Stanford faculty members find homes in this area. Would you like her to send you some listings?" },
    { role: "user", content: "Yes please, the sooner the better. I start next month." },
    { role: "assistant", content: "I'll make sure Sarah prioritizes your search — with a 1-month timeline, she can focus on properties ready for quick close. She'll reach out today with a personalized list. Congratulations on the new position at Stanford! 🎓" },
  ],
};

/** Mock analytics for demo dashboard */
export const DEMO_ANALYTICS = {
  totalLeads: 6,
  totalConversations: 23,
  conversionRate: 17,
};

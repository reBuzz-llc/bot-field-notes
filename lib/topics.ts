// Topic hubs (owner, 2026-10-10: "I need lots of inbound and outbound links"). Every entry is filed under the topics its
// title and text are about; each topic has a page listing its entries and its neighbours, and the first mention of a
// topic in an entry's text links to that page. One list, so the hubs, the in-text links and the schema agree.
import { ALL_POSTS, type Post } from "./posts";

export type Topic = {
  slug: string;
  name: string;
  blurb: string;
  /** What files an entry under this topic (title, summary and findings). */
  match: RegExp;
  /** Phrases in running text that link to the topic page (first mention per page). */
  phrases: string[];
};

export const TOPICS: Topic[] = [
  {
    slug: "online-ordering",
    name: "Online ordering",
    blurb: "How small restaurants, cafes and shops take orders online, what the systems cost and what they lose without one.",
    match: /online order|ordering system|order online|order ahead/i,
    phrases: ["online ordering", "ordering system", "order online"],
  },
  {
    slug: "pos-systems",
    name: "POS systems",
    blurb: "Point-of-sale systems for small businesses and franchise chains: what they do, what they cost, what they connect to.",
    match: /\bPOS\b|point[- ]of[- ]sale/,
    phrases: ["point of sale", "point-of-sale", "POS system", "POS"],
  },
  {
    slug: "delivery-apps",
    name: "Delivery apps",
    blurb: "DoorDash, Uber Eats and Grubhub: commissions, how small restaurants use them, and bringing their orders into one place.",
    match: /doordash|uber ?eats|grubhub|delivery app|third-party delivery/i,
    phrases: ["DoorDash", "Uber Eats", "Grubhub", "delivery apps"],
  },
  {
    slug: "ai-agents",
    name: "AI agents for small business",
    blurb: "What AI agents and automation agencies sell to small businesses, at what price, and what actually helps.",
    match: /\bAI agents?\b|agentic|AI automation|AI assistant|chatbot/i,
    phrases: ["AI agents", "AI agent", "AI automation", "chatbot"],
  },
  {
    slug: "free-ai-tools",
    name: "Free AI APIs and tools",
    blurb: "Free, card-free AI model providers, APIs and developer tools, with their limits as their own pages state them.",
    match: /free tier|free AI|API key|\bLLM\b|model provider|groq|gemini|openrouter|ollama|card-free|no card/i,
    phrases: ["free tier", "free AI", "model provider", "API key"],
  },
  {
    slug: "small-business-websites",
    name: "Small business websites",
    blurb: "Outdated, broken and missing websites, website care and redesigns for local businesses.",
    match: /website (care|redesign|maintenance|builder)|web ?design|outdated (web)?site|broken (web)?site|no website|landing page|mobile layout/i,
    phrases: ["website care", "web design", "no website", "landing page", "website redesign"],
  },
  {
    slug: "online-booking",
    name: "Online booking",
    blurb: "Booking and appointment tools for salons, gyms, clinics and studios, and what phone-only booking costs them.",
    match: /booking|appointment|reservation|scheduling/i,
    phrases: ["online booking", "booking tool", "appointment", "reservations"],
  },
  {
    slug: "local-marketing",
    name: "Local marketing and SEO",
    blurb: "Google listings, reviews, social media and search for local businesses.",
    match: /\bSEO\b|google (business|listing|maps)|reviews|social media|instagram|local marketing|search engine/i,
    phrases: ["Google Business Profile", "Google listing", "SEO", "social media", "reviews"],
  },
  {
    slug: "agency-pricing",
    name: "Agency pricing and packages",
    blurb: "What agencies charge small businesses for websites, marketing, development and retainers, and how packages are built.",
    match: /pricing|retainer|package|rate card|per month|\/month|hourly rate/i,
    phrases: ["pricing", "retainer", "rate card", "packages"],
  },
  {
    slug: "email-outreach",
    name: "Business email and outreach",
    blurb: "Business email addresses, verification and first-contact outreach to small businesses.",
    match: /business email|email verif|deliverab|outreach|cold email|contact form/i,
    phrases: ["business email", "email verification", "outreach", "contact form"],
  },
  {
    slug: "whatsapp-business",
    name: "WhatsApp for business",
    blurb: "How small businesses use WhatsApp to take orders, bookings and questions.",
    match: /whatsapp/i,
    phrases: ["WhatsApp"],
  },
  {
    slug: "franchise-chains",
    name: "Franchise chains",
    blurb: "Franchise and multi-location brands: their systems, their growth and what they need across locations.",
    match: /franchis|multi-location|multi-unit/i,
    phrases: ["franchise", "franchises", "multi-location"],
  },
  {
    slug: "new-york-small-business",
    name: "New York small businesses",
    blurb: "Restaurants, shops, clinics, salons and studios across Manhattan, Brooklyn and Queens.",
    match: /new york|\bNYC\b|brooklyn|manhattan|queens/i,
    phrases: ["New York City", "Brooklyn", "Manhattan", "Queens", "NYC"],
  },
];

const textOf = (p: Post) => [p.title, p.summary, ...p.findings.map((f) => `${f.title} ${f.body}`)].join("\n");

const BY_POST = new Map<string, Topic[]>(ALL_POSTS.map((p) => [p.slug, TOPICS.filter((t) => t.match.test(textOf(p)))]));

export const topicsOf = (p: Post) => BY_POST.get(p.slug) ?? [];
export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);
export const topicPath = (slug: string) => `/topics/${slug}`;
/** A topic's entries, newest first, the ones search engines index before the hidden ones. */
export const postsInTopic = (slug: string) => ALL_POSTS.filter((p) => topicsOf(p).some((t) => t.slug === slug));
/** Topics that share the most entries with this one. */
export function neighbourTopics(slug: string, limit = 4): Topic[] {
  const mine = new Set(postsInTopic(slug).map((p) => p.slug));
  return TOPICS.filter((t) => t.slug !== slug)
    .map((t) => ({ t, n: postsInTopic(t.slug).filter((p) => mine.has(p.slug)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((x) => x.t);
}

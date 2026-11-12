// The ramen-agents facts the launch pages quote (creatorCC queue 310). The week's numbers are the Validator's own:
// rows in each running agent's actions table from 2026-11-02 00:00 to 2026-11-06 20:00 (refused = a "rejected"
// verdict; accepted outputs by action type), and the model calls of 2026-11-06 from usage-history.json. No lead,
// person or place is named anywhere these are used.
export const REPO = "https://github.com/reBuzz-llc/ramen-agents";
/** The brochure's page (owner, 2026-11-09, creatorCC queue 384): the PDF embedded with Download and Back, so a reader
 *  is never left in the browser's PDF viewer; the raw file stays for the download. */
export const BROCHURE = "/brochure";
export const BROCHURE_PDF = "/ramen-agents-brochure.pdf";
/** The demo GIF (owner, 2026-11-12: a browser kept showing the old one from its cache): each re-recording is saved under
 *  a new dated name, public/ramen-agents-world-<YYYY-MM-DD>.gif, and this line points at it; the old file is removed.
 *  tests/media.test.ts checks the name is dated and the file is there. */
export const DEMO_GIF = "/ramen-agents-world-2026-11-12.gif";

export const WEEK = {
  from: "2 November",
  to: "6 November 2026",
  agents: 7,
  actions: 9575,
  refused: 2807,
  leads: 37,
  drafts: 240,
  cellsFilled: 52,
  notes: 251,
  packages: 16,
  providersFound: 9,
  emailsSent: 0,
  // one day, 2026-11-06
  callsOneDay: 2242,
  tokensOneDay: "13.5 million",
  // the Validator's draft sample of the week before (week-in-review.md, 2026-11-02)
  draftSample: { passed: 6, of: 30 },
} as const;

export const refusedShare = Math.round((100 * WEEK.refused) / WEEK.actions);
export const n = (x: number) => x.toLocaleString("en-US");

/** The pages that answer a searched question; linked from /ramen-agents, the launch post, the sitemap and llms.txt. */
export const QUESTIONS = [
  { path: "/free-ai-agent-for-lead-generation", title: "Is there a free AI agent for lead generation?" },
  { path: "/run-ai-agents-on-free-api-tiers", title: "How do you run AI agents on free API tiers?" },
  { path: "/ai-agents-for-small-business-no-budget", title: "AI agents for a small business with no budget" },
] as const;

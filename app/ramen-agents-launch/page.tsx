import CopyBox from "../copy-box";
import { SITE, canonical } from "@/lib/site";
import { BROCHURE, DEMO_GIF, QUESTIONS, REPO, WEEK, n, refusedShare } from "@/lib/ramen";

// The ramen-agents launch post (creatorCC queue 310, owner 2026-11-06): the owner's own words, this week's real
// numbers from the Validator, what is rough, the ask, and the ready-to-paste texts for HN, Reddit and LinkedIn.
// No place, person or lead is named; signed reBuzz LLC.
const TITLE = "We open-sourced the AI agent team that runs our small agency, for free";
const DESCRIPTION =
  "ramen-agents: seven AI agents that find leads, draft the first email and research the market, on free API tiers only. This week's real numbers, what is still rough, and how to try it.";

const HN_TITLE = "Show HN: ramen-agents – a free AI agent team for a small business (runs on free API tiers)";
const HN_TEXT = `ramen-agents is the agent team we run daily at our small agency: seven agents that find small-business leads, draft the first email, fill gaps on each lead, research pricing and look for free tools, steered by a CEO agent. A Validator checks every write against rules in code. It runs only on free model tiers (Groq, Gemini, Z.ai, Ollama Cloud) and keyless search, so it costs nothing. Agents can't create accounts, spend money or collect personal data. This week: ${n(WEEK.actions)} actions, ${refusedShare}% refused by the Validator, ${WEEK.leads} leads, ${WEEK.drafts} drafts, and zero emails sent, because the drafts still need a human. There is a ten-minute demo that needs no key. Feedback on the fence and the free-tier routing is welcome.

${REPO}`;
const REDDIT_TEXT = `I run a small agency with no software budget, so we built a team of AI agents that runs only on free API tiers. It finds small-business leads, drafts the first email, fills in missing details and researches pricing, and a local dashboard shows the agents working as a little pixel world. It costs $0: free model tiers, keyless search, no card anywhere, and it runs on your own laptop. The agents can't sign up for anything or spend money. This week they found ${WEEK.leads} leads and wrote ${WEEK.drafts} drafts; we still send by hand. Open source, Apache-2.0: ${REPO}`;
const LINKEDIN_TEXT = `We open-sourced ramen-agents: the free AI agent team that finds leads and drafts outreach for our small agency, running only on free API tiers.
$0 a month, no card, and a fence in the code: no accounts, no spending, no personal data. ${REPO}`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: canonical("/ramen-agents-launch") },
  openGraph: { type: "article", title: TITLE, description: DESCRIPTION, images: [{ url: DEMO_GIF, width: 1280, height: 852 }] },
};

export default function Launch() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: "2026-11-06",
    author: { "@type": "Organization", name: SITE.publisher },
    publisher: { "@type": "Organization", name: SITE.publisher },
    mainEntityOfPage: canonical("/ramen-agents-launch"),
    about: { "@type": "SoftwareSourceCode", name: "ramen-agents", codeRepository: REPO },
  };
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="text-sm text-muted">6 November 2026 · from the founder of {SITE.publisher}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance">{TITLE}</h1>

      <article className="mt-6 space-y-4 text-ink/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
        <p>
          I run a small agency. Since September a team of seven AI agents has worked next to us every day: one finds
          businesses that could use our help, one writes the first email, one fills in what is missing on each lead, one
          researches the market, one prices our service packages, a scout looks for free tools, and a CEO agent steers
          them. A Validator checks everything they write before it reaches our board. Today I am opening the code as{" "}
          <strong>ramen-agents</strong>, under Apache-2.0.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- an animated GIF, served as is */}
        <img
          src={DEMO_GIF}
          alt="The ramen-agents dashboard: a pixel world where each agent works at its own desk, its screen showing what it is doing right now, the mailbox, the web terminal and the stopped agents asleep on the right. Business names are swapped for samples."
          width={1280}
          height={852}
          className="h-auto w-full rounded-xl border border-line"
        />
        <h2>Who it is for</h2>
        <p>
          A founder or a small agency with time and a laptop, but no budget for software, ads or an agency. The name comes
          from &ldquo;ramen profitable&rdquo;: living on ramen while the company finds its feet.
        </p>
        <h2>What it costs</h2>
        <p>
          Nothing. The agents think with the free tiers model providers already give away (Groq, Gemini, Z.ai, Ollama
          Cloud and others, on our <a href="/free-ai-apis" className="text-accent hover:underline">free AI APIs list</a>),
          search with keyless engines, and no step asks for a card. No agent can create an account, spend money or collect
          personal data. That fence is in the code, not in a prompt.
        </p>
        <h2>This week in numbers</h2>
        <p>From the Validator&rsquo;s own logs, {WEEK.from} to {WEEK.to}:</p>
        <ul>
          <li>
            {n(WEEK.actions)} actions by {WEEK.agents} agents; the Validator refused {n(WEEK.refused)} of them ({refusedShare}%).
          </li>
          <li>
            {WEEK.leads} new leads, {WEEK.drafts} first-email drafts, {WEEK.cellsFilled} missing details filled,{" "}
            {WEEK.notes} research notes, {WEEK.packages} package drafts and {WEEK.providersFound} free providers found.
          </li>
          <li>
            On one day, {n(WEEK.callsOneDay)} model calls and about {WEEK.tokensOneDay} tokens. Our bill: $0.
          </li>
        </ul>
        <h2>What is rough</h2>
        <ul>
          <li>
            Emails sent this week: {WEEK.emailsSent}. The drafts are not good enough to send unread: in a sample of{" "}
            {WEEK.draftSample.of}, {WEEK.draftSample.passed} passed every check. Our team reads, fixes and sends by hand.
          </li>
          <li>Free tiers come and go. Some providers in our chain stopped answering this month; the chain moves on, but you will notice.</li>
          <li>Almost a third of what the agents try is refused. That is the fence working, but it is also wasted calls.</li>
          <li>The always-on setup is written for a Mac. Linux should work; Windows is untested.</li>
        </ul>
        <h2>The ask</h2>
        <p>
          Try the ten-minute demo: it needs no key and no network. Then tell us what broke, which free provider we are
          missing, or what you would point it at. Issues and discussions are open, and a star helps other founders find it.
        </p>
        <p className="flex flex-wrap items-center gap-3">
          <a
            href={REPO}
            rel="noopener"
            className="inline-block rounded-full bg-accent px-4 py-1.5 font-semibold hover:opacity-90"
            style={{ color: "var(--color-bg)" }} // globals.css's unlayered `a { color: inherit }` outranks a text-* class
          >
            ramen-agents on GitHub
          </a>
          <a href={BROCHURE} download className="text-accent hover:underline">
            The brochure (PDF)
          </a>
        </p>
        <p className="font-semibold">&mdash; {SITE.publisher}</p>
      </article>

      <section aria-labelledby="share" className="mt-12">
        <h2 id="share" className="text-xl font-semibold">
          Share it
        </h2>
        <p className="mt-1 text-sm text-muted">Ready to paste. Read each community&rsquo;s self-promotion rule before posting.</p>
        <div className="mt-4">
          <CopyBox
            items={[
              { label: "Hacker News: title", text: HN_TITLE },
              { label: "Hacker News: text", text: HN_TEXT },
              { label: "Reddit (r/smallbusiness, r/selfhosted)", text: REDDIT_TEXT },
              { label: "LinkedIn", text: LINKEDIN_TEXT },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="more" className="mt-12">
        <h2 id="more" className="text-xl font-semibold">
          Questions people ask
        </h2>
        <ul className="mt-2 space-y-1">
          {QUESTIONS.map((q) => (
            <li key={q.path}>
              <a href={q.path} className="text-accent hover:underline">
                {q.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

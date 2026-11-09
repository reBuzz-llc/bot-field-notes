import QuestionPage from "../question-page";
import { canonical } from "@/lib/site";
import { REPO, WEEK, n, refusedShare } from "@/lib/ramen";

const PATH = "/free-ai-agent-for-lead-generation";
const QUESTION = "Is there a free AI agent for lead generation?";

export const metadata = {
  title: "A free AI agent for lead generation (open source, no card)",
  description:
    "Yes: ramen-agents is an open-source AI agent team that finds small-business leads, checks each email, notes an observed gap and drafts the first email, on free API tiers only. How it works and what it will not do.",
  alternates: { canonical: canonical(PATH) },
};

const FAQS = [
  { q: "Does it cost anything?", a: "No. It runs on free model tiers and keyless search; no step asks for a card." },
  { q: "Does it send the emails?", a: "No. It drafts them; a person reads, fixes and sends. There is no send step in the code." },
  { q: "Where do the leads come from?", a: "Public business listings and the businesses' own websites. A business without a website still counts, with its listing page as the proof." },
  { q: "Does it collect personal data?", a: "No. It records a business's public contact only, and the Validator refuses anything else before it is written." },
];

export default function Page() {
  return (
    <QuestionPage
      path={PATH}
      question={QUESTION}
      faqs={FAQS}
      answer={
        <p>
          Yes. <strong>ramen-agents</strong> is an open-source team of AI agents that finds small-business leads, checks each
          email, writes down the gap it saw on the business&rsquo;s own pages and drafts a first email. It runs on free API
          tiers only, so it costs nothing, and a person still sends every email.
        </p>
      }
    >
      <h2>How the agents find a lead</h2>
      <p>Three agents share the work, and a fourth checks it:</p>
      <ul>
        <li>
          <strong>Lead Gen</strong> searches public business listings and opens each business&rsquo;s own website. It records
          a lead only with a source page that shows the business is real and reachable.
        </li>
        <li>
          <strong>Lead Enricher</strong> fills what is missing on each lead: the email&rsquo;s check (with free verification
          APIs), the map link, a WhatsApp number when the business lists one, and the pain point.
        </li>
        <li>
          <strong>Outreach Writer</strong> drafts the first email from the lead&rsquo;s pain point and the package that fits it.
        </li>
        <li>
          <strong>The Validator</strong> checks every write against rules in code before it reaches the board, and refuses
          what breaks them: no source, a repeat, an invented figure, a personal address.
        </li>
      </ul>
      <h2>The pain point is something the agent saw</h2>
      <p>
        Each lead carries three short lines: the gap the agent observed on the business&rsquo;s own pages (no online
        booking, a menu that is only a photo, no website at all), what the business could try itself, and what we would
        propose. A vague line such as &ldquo;could improve its online presence&rdquo; is refused at write time.
      </p>
      <h2>What one week looks like</h2>
      <p>
        From {WEEK.from} to {WEEK.to}, our own agents found {WEEK.leads} new leads, filled {WEEK.cellsFilled} missing
        details and wrote {WEEK.drafts} first-email drafts. The Validator refused {refusedShare}% of {n(WEEK.actions)} actions.
        Fewer, checked leads is the point: the team only has so many hours to read and send.
      </p>
      <h2>What it will not do</h2>
      <ul>
        <li>Sign in anywhere, create an account or scrape a site that needs one.</li>
        <li>Send an email or a message. Drafts wait for a person.</li>
        <li>Record a person&rsquo;s private address, phone or social profile.</li>
        <li>Spend money. Paid APIs are not in its chain.</li>
      </ul>
      <p>
        Try it: the{" "}
        <a href={REPO} rel="noopener" className="text-accent-ink hover:underline">
          repository
        </a>{" "}
        has a ten-minute demo with no key, then a setup an AI coding agent can walk through with you.
      </p>
    </QuestionPage>
  );
}

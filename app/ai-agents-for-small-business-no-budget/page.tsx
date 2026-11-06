import QuestionPage from "../question-page";
import { canonical } from "@/lib/site";
import { REPO, WEEK } from "@/lib/ramen";

const PATH = "/ai-agents-for-small-business-no-budget";
const QUESTION = "Can a small business with no budget use AI agents?";

export const metadata = {
  title: "AI agents for a small business with no budget",
  description:
    "What a small business can hand to AI agents for $0: finding leads, drafting first emails, researching competitors' prices and keeping notes with sources. What to keep for people, and a free open-source team to start with.",
  alternates: { canonical: canonical(PATH) },
};

const FAQS = [
  { q: "What should I give agents first?", a: "Slow, daily research: finding businesses that fit, reading competitors' prices, keeping notes with sources." },
  { q: "What should stay with people?", a: "Anything sent in your name, anything that costs money, and the final word on a client." },
  { q: "Do I need to code?", a: "A little, or an AI coding agent: the setup is a checklist an AI coding agent can walk through with you." },
  { q: "What does it need to run?", a: "A laptop that stays on, free API keys from a few model providers, and a spreadsheet-like board for the leads." },
];

export default function Page() {
  return (
    <QuestionPage
      path={PATH}
      question={QUESTION}
      faqs={FAQS}
      answer={
        <p>
          Yes, if you give the agents the slow research work and keep the sending and the spending for people. Free model
          tiers and keyless search are enough to run a small team of agents every day. <strong>ramen-agents</strong> is the
          free, open-source team we built for our own small agency.
        </p>
      }
    >
      <h2>What agents do well for a small business</h2>
      <ul>
        <li>
          <strong>Finding businesses that fit.</strong> Reading public listings and websites, and recording only the ones
          with a reason to talk to you.
        </li>
        <li>
          <strong>Drafting the first email.</strong> From the gap the agent saw on the business&rsquo;s own pages, not a
          template.
        </li>
        <li>
          <strong>Reading the market.</strong> What competitors charge, what they offer, written down with the sources.
        </li>
        <li>
          <strong>Watching for free tools.</strong> New free tiers and services, checked on their own pricing pages.
        </li>
      </ul>
      <h2>What to keep for people</h2>
      <p>
        Anything sent in your name, anything that costs money, and the final word on a client. In our own week of{" "}
        {WEEK.from} to {WEEK.to}, the agents wrote {WEEK.drafts} first-email drafts and none went out unread: our team
        reads and fixes every one before it is sent. Agents save the research hours; they do not replace the
        judgement.
      </p>
      <h2>A fence, not a prompt</h2>
      <p>
        An agent that works for you on the open web needs limits it cannot talk its way past. In ramen-agents they are in
        the code: no agent can create an account, spend money or collect personal data, and a Validator checks every write
        before it reaches your board. That is what makes it safe to leave running.
      </p>
      <h2>What it costs to start</h2>
      <p>
        $0. Free API keys from a few model providers (no card), a laptop that stays on, and an afternoon. The{" "}
        <a href={REPO} rel="noopener" className="text-accent hover:underline">
          repository
        </a>{" "}
        has a ten-minute demo that needs no key at all, so you can see the agents work before you set anything up. The
        free providers we use, with their limits, are on the{" "}
        <a href="/free-ai-apis" className="text-accent hover:underline">
          free AI APIs page
        </a>
        .
      </p>
    </QuestionPage>
  );
}

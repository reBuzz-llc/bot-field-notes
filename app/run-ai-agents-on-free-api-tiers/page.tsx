import QuestionPage from "../question-page";
import { canonical } from "@/lib/site";
import { REPO, WEEK, n } from "@/lib/ramen";

const PATH = "/run-ai-agents-on-free-api-tiers";
const QUESTION = "How do you run AI agents on free API tiers?";

export const metadata = {
  title: "How to run AI agents on free API tiers (what works every day)",
  description:
    "Chain several free LLM tiers behind one OpenAI-compatible call, spread the load by what each has left, refuse repeated calls, and search without a key. How our seven agents make thousands of calls a day for $0.",
  alternates: { canonical: canonical(PATH) },
};

const FAQS = [
  { q: "Is one free tier enough?", a: "Not for agents that run all day. A single free tier runs out within hours; a chain of several does not." },
  { q: "Which free tiers work?", a: "Ours run on Groq, Gemini, Z.ai, Ollama Cloud and a few more; the full list, with limits and the ones that only look free, is on our free AI APIs page." },
  { q: "What about search?", a: "Keyless engines first; one keyed search with a free monthly allowance is kept for rare, special searches." },
  { q: "Do I need a card for any of it?", a: "No. Every provider in the chain was checked to give its free tier without a card." },
];

export default function Page() {
  return (
    <QuestionPage
      path={PATH}
      question={QUESTION}
      faqs={FAQS}
      answer={
        <p>
          Put several free tiers behind one call, so when one runs out the next answers; spread the calls by what each
          provider has left; stop the agents from repeating themselves; and search with keyless engines. Our seven agents
          made {n(WEEK.callsOneDay)} model calls on one day this week, about {WEEK.tokensOneDay} tokens, and the bill was $0.
        </p>
      }
    >
      <h2>1. One chain, many providers</h2>
      <p>
        Most free LLM APIs speak the OpenAI format, so one client can call any of them by changing the base URL and key.
        ramen-agents keeps one shared chain for the whole team: an agent asks for &ldquo;a model&rdquo;, and the chain picks
        a provider that still has allowance. A rate-limit answer (429) or an empty quota moves the call to the next
        provider instead of failing the agent.
      </p>
      <h2>2. Spend by what is left, not by habit</h2>
      <p>
        Free tiers limit different things: some count requests a minute, some tokens a day, some a month. Groq&rsquo;s
        free gpt-oss-120b, for example, allows about 8,000 tokens a minute and 200,000 a day, and on long agent prompts the
        tokens run out long before the requests. An hourly job reads what each provider has used, and the chain sends calls
        where the most allowance is left, so every free tier is used up before it renews and none is hit all at once.
      </p>
      <h2>3. Make every call count</h2>
      <ul>
        <li>The Validator refuses a repeated search or a page already read today, so an agent cannot loop on one call.</li>
        <li>Short agent instructions with the detail in handbooks keep each prompt small.</li>
        <li>Agents rest when they have nothing new to do, instead of spending calls to say so.</li>
      </ul>
      <h2>4. Search without a key</h2>
      <p>
        Web search is the other cost. The agents use keyless search engines first, then free-allowance search APIs as
        automatic backups. One keyed search with a monthly free allowance is kept for rare searches, and only one agent may
        use it.
      </p>
      <h2>5. Expect providers to change</h2>
      <p>
        Free tiers come and go: this month some providers in our chain stopped answering, and one ran out its monthly
        allowance early. Keep the list of providers in a file, not in the code, and re-check their pricing pages every week.
        Our current list, with each one&rsquo;s limits, is on the{" "}
        <a href="/free-ai-apis" className="text-accent-ink hover:underline">
          free AI APIs page
        </a>
        .
      </p>
      <p>
        The chain, the allowance job and the Validator are all in{" "}
        <a href={REPO} rel="noopener" className="text-accent-ink hover:underline">
          ramen-agents
        </a>
        , Apache-2.0.
      </p>
    </QuestionPage>
  );
}

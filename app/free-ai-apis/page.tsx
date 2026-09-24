import { SITE, canonical } from "@/lib/site";

export const metadata = {
  title: "Free LLM APIs with no credit card",
  description:
    "Nine AI model APIs with a genuinely free tier and no credit card, checked on their own pricing pages: what each one gives you, the limits, and which ones our agents run on every day. Plus the ones that turned out not to be free.",
  alternates: { canonical: "/free-ai-apis" },
  openGraph: {
    type: "article",
    title: "Free LLM APIs with no credit card",
    description: "Nine AI model APIs with a real free tier and no card, and the ones that only look free.",
  },
};

const CHECKED = "2026-09-22";

type Provider = { name: string; url: string; free: string; note?: string; status: "in use" | "verified" | "caveat" };

// The fleet's own list: every entry was read on the provider's own pages by our agents or the owner, and the ones
// marked "in use" answer our bots' calls every day. Terms change; a weekly job re-reads these pages.
const FREE: Provider[] = [
  { name: "Groq", url: "https://console.groq.com/", free: "Free tier, no card. Fast open models (gpt-oss-120b, Llama, Qwen); a daily token ceiling per model.", status: "in use" },
  { name: "Google Gemini (AI Studio)", url: "https://aistudio.google.com/apikey", free: "Free tier, no card. Gemini Flash models with per-minute and per-day limits.", status: "in use" },
  { name: "Speka", url: "https://speka.me/", free: "$1 of usage included every month, no card. One OpenAI-compatible key for gpt-oss-20b, GLM, Nemotron, Llama and more.", status: "in use" },
  { name: "Z.ai", url: "https://docs.z.ai/guides/overview/pricing", free: "glm-4.5-flash is list-priced at $0; no card. OpenAI-compatible endpoint.", status: "in use" },
  { name: "Ollama Cloud", url: "https://ollama.com/cloud", free: "Free plan, no card. Hosted open models (gpt-oss:120b and others) behind an OpenAI-compatible endpoint.", status: "in use" },
  { name: "Mistral (La Plateforme)", url: "https://console.mistral.ai/", free: "Free plan, no card, but you must activate it in the console: a fresh key has zero request quota until you do.", status: "in use" },
  { name: "OpenRouter", url: "https://openrouter.ai/models?q=free", free: "Models tagged :free cost nothing; about 50 requests a day without credit on the account.", note: "Best effort: the free pool is shared, and a test call on 24 September came back rate-limited upstream (429).", status: "in use" },
  { name: "SambaNova Cloud", url: "https://cloud.sambanova.ai/", free: "Free tier, no card, for Llama and DeepSeek models.", note: "Verified on its pages; not in our chain yet.", status: "verified" },
  { name: "Cloudflare Workers AI", url: "https://developers.cloudflare.com/workers-ai/platform/pricing/", free: "A free daily allowance of neurons, no card; needs a (free) Cloudflare account and API token.", note: "Recorded by our Scout; not in use.", status: "verified" },
];

const NOT_FREE = [
  "Together AI: trial credit, then paid.",
  "Cerebras: advertises a free tier, but our account was asked for a payment method.",
  "DeepSeek, OpenAI, Moonshot, Replicate: pay-as-you-go from the first call.",
  "Cohere: asked for a card. Aion Labs: roleplay-only models. BazaarLink, SkillBoss, Plugsky: tiny quotas or one-off credit.",
  "GitHub Models: issues no API key of its own — access runs through a GitHub account token, so there is nothing a fleet of agents can be handed.",
];

const STATUS: Record<Provider["status"], string> = {
  "in use": "bg-accent/15 text-accent",
  verified: "bg-ink/10 text-ink/80",
  caveat: "bg-ink/10 text-ink/80",
};

export default function FreeApis() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-balance">Free LLM APIs with no credit card</h1>
      <p className="mt-2 text-sm text-muted">
        Checked on each provider&rsquo;s own pricing pages on{" "}
        <time dateTime={CHECKED}>
          {new Date(CHECKED).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </time>
        . {FREE.length} providers listed, {FREE.filter((p) => p.status === "in use").length} of them running our own agents today.
      </p>
      <p className="mt-4 max-w-3xl text-lg text-ink/85">
        Every provider below has a <strong>durable free tier and asks for no card</strong>: a monthly allowance or an
        always-free model that keeps working without a payment method on file. Trial credit that runs out, and
        &ldquo;free&rdquo; tiers that want a card on file, are listed separately at the bottom &mdash; they are the ones that
        waste your afternoon.
      </p>

      {/* The whole list at a glance: what a reader scanning for a limit is here for. */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">Free AI API providers, what is free, and whether a card is needed</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th scope="col" className="py-2 pr-3 font-semibold">Provider</th>
              <th scope="col" className="py-2 pr-3 font-semibold">What is free</th>
              <th scope="col" className="py-2 font-semibold whitespace-nowrap">Card needed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {FREE.map((p) => (
              <tr key={p.name}>
                <th scope="row" className="py-2 pr-3 text-left align-top font-medium text-ink">
                  <a href={p.url} rel="noopener noreferrer" target="_blank" className="hover:text-accent hover:underline">
                    {p.name}
                  </a>
                </th>
                <td className="py-2 pr-3 align-top text-ink/85">{p.free.replace(/^Free tier, no card\. ?/, "")}</td>
                <td className="py-2 align-top whitespace-nowrap text-ink/85">No</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">Each one in detail</h2>

      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {FREE.map((p, i) => (
          <li key={p.name} className="h-full">
            {/* One card, one destination: the provider's own page. The whole card is the link, so there is
                nothing to hunt for. */}
            <article className="group relative flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/60 focus-within:border-accent">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-ink/50">{i + 1}.</span>
                <h2 className="text-lg font-semibold tracking-tight">
                  <a
                    href={p.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent focus-visible:outline-none"
                  >
                    {p.name}
                  </a>
                </h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[p.status]}`}>{p.status}</span>
              </div>
              <p className="mt-1.5 text-ink/85">{p.free}</p>
              {p.note ? <p className="mt-0.5 text-sm text-ink/60">{p.note}</p> : null}
              <p className="mt-auto pt-3 text-sm font-medium text-accent">
                Open {new URL(p.url).host.replace(/^www\./, "")} <span aria-hidden>↗</span>
              </p>
            </article>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">Not free, whatever the page says</h2>
      <ul className="mt-3 max-w-3xl list-disc space-y-1.5 pl-5 text-ink/85">
        {NOT_FREE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="mt-10 max-w-3xl text-sm text-ink/60">
        How this list is made: the agents at {SITE.name} read each provider&rsquo;s own pricing and limits pages, and the fleet runs on
        the &ldquo;in use&rdquo; ones every day, so a broken free tier shows up as a failed call within hours. A weekly job re-reads the
        pages and flags changes. Nothing here is sponsored; we hold no paid plan with any of them.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Free AI API providers",
            url: canonical("/free-ai-apis"),
            dateModified: CHECKED,
            itemListElement: FREE.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: p.url, description: p.free })),
          }),
        }}
      />
    </main>
  );
}

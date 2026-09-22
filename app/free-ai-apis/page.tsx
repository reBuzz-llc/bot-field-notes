import { SITE, canonical } from "@/lib/site";

export const metadata = {
  title: "Free AI API providers",
  description:
    "AI model APIs with a genuinely free, card-free tier, as checked by reBuzz's agents: what is free, what it costs, and which ones our fleet runs on.",
  alternates: { canonical: "/free-ai-apis" },
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
  { name: "OpenRouter", url: "https://openrouter.ai/models?q=free", free: "Models tagged :free cost nothing; about 50 requests a day without credit on the account.", status: "in use" },
  { name: "SambaNova Cloud", url: "https://cloud.sambanova.ai/", free: "Free tier, no card, for Llama and DeepSeek models.", note: "Verified on its pages; not in our chain yet.", status: "verified" },
  { name: "Cloudflare Workers AI", url: "https://developers.cloudflare.com/workers-ai/platform/pricing/", free: "A free daily allowance of neurons, no card; needs a (free) Cloudflare account and API token.", note: "Recorded by our Scout; not in use.", status: "verified" },
  { name: "GitHub Models", url: "https://github.com/marketplace/models", free: "Free to prototype with a GitHub fine-grained token (models:read); rate-limited per model.", note: "Official route to GitHub's models; Copilot itself is IDE-only.", status: "verified" },
];

const NOT_FREE = [
  "Together AI: trial credit, then paid.",
  "Cerebras: advertises a free tier, but our account was asked for a payment method.",
  "DeepSeek, OpenAI, Moonshot, Replicate: pay-as-you-go from the first call.",
  "Cohere: asked for a card. Aion Labs: roleplay-only models. BazaarLink, SkillBoss, Plugsky: tiny quotas or one-off credit.",
];

const STATUS: Record<Provider["status"], string> = {
  "in use": "bg-accent/15 text-accent",
  verified: "bg-ink/10 text-ink/80",
  caveat: "bg-ink/10 text-ink/80",
};

export default function FreeApis() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Free AI API providers</h1>
      <p className="mt-4 text-lg text-ink/85">
        The short list our agents actually run on. Every provider here has a <strong>durable, card-free</strong> free tier: a
        monthly allowance or an always-free model that keeps working without a payment method on file. Trial credit and
        &ldquo;free with a card&rdquo; offers are not on it. Checked {CHECKED}; terms change, so follow the link before you rely on one.
      </p>

      <ol className="mt-8 space-y-5">
        {FREE.map((p, i) => (
          <li key={p.name} className="flex gap-4">
            <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-sm text-ink/50">{i + 1}.</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <a href={p.url} rel="noopener noreferrer" target="_blank" className="text-lg font-semibold tracking-tight text-accent hover:underline">
                  {p.name}
                </a>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[p.status]}`}>{p.status}</span>
              </div>
              <p className="mt-1 text-ink/85">{p.free}</p>
              {p.note ? <p className="mt-0.5 text-sm text-ink/60">{p.note}</p> : null}
              <p className="mt-0.5 break-all font-mono text-xs text-ink/50">{p.url}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">Not free, for the record</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/85">
        {NOT_FREE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-ink/60">
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

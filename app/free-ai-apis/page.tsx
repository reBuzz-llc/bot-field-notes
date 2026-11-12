import { SITE, canonical } from "@/lib/site";
import apisData from "@/content/free-apis.json";
import arenaData from "@/content/arena.json";
import type { ArenaSnapshot } from "@/lib/arena";
import FreeApiTabs, { type Api } from "./tabs";

export const metadata = {
  title: "Free LLM APIs with no credit card",
  description:
    "AI model APIs with a genuinely free tier and no credit card, checked on their own pricing pages and tested with our own keys: what each one gives you, the limits, which ones our agents run on every day, and how their models rank on LMArena. Plus free email-verification and search APIs, and the ones that turned out not to be free.",
  alternates: { canonical: "/free-ai-apis" },
  openGraph: {
    type: "article",
    title: "Free LLM APIs with no credit card",
    description: "Ten AI model APIs with a real free tier and no card, free email and search APIs, and the ones that only look free.",
  },
};

// The list is the owner's (Settings > Key providers > Finds on the team's dashboard, 2026-11-12): each provider marked
// usable or unusable with a note after testing a key, plus the specs our Scout recorded; scripts/build-blog.py writes
// content/free-apis.json from them and scripts/arena.mjs content/arena.json from LMArena's open leaderboard data.
const APIS = apisData.providers as Api[];
const ARENA = (arenaData as ArenaSnapshot | null) ?? null;
const CHECKED = apisData.checked || "2026-11-06";
const FREE = APIS.filter((p) => p.verdict === "usable" && p.kind === "model");

export default function FreeApis() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-balance">Free LLM APIs with no credit card</h1>
      <p className="mt-2 text-sm text-muted">
        Last checked{" "}
        <time dateTime={CHECKED}>
          {new Date(CHECKED).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </time>
        . {FREE.length} model providers listed, {FREE.filter((p) => p.status === "in use").length} of them running our own agents today.
      </p>
      <p className="mt-4 max-w-3xl text-lg text-ink/85">
        Every provider in the first list has a <strong>durable free tier and asks for no card</strong>: a monthly allowance or an
        always-free model that keeps working without a payment method on file. Trial credit that runs out, and
        &ldquo;free&rdquo; tiers that want a card on file, are listed separately at the bottom &mdash; they are the ones that
        waste your afternoon. <strong>Arena</strong> shows how the models we run rank; <strong>Table</strong> puts every spec side by side.
      </p>
      <p className="mt-3 max-w-3xl text-ink/85">
        Our own agents run on this list, and they are open source:{" "}
        <a href="/ramen-agents" className="text-accent-ink hover:underline">
          ramen-agents
        </a>
        , a free AI agent team for a small business, with the whole provider chain configured (
        <a href="https://github.com/reBuzz-llc/ramen-agents" rel="noopener" className="text-accent-ink hover:underline">
          code on GitHub
        </a>
        ).
      </p>

      <FreeApiTabs apis={APIS} arena={ARENA} />

      <p className="mt-10 max-w-3xl text-sm text-ink/60">
        How this list is made: the agents at {SITE.name} find providers and read each one&rsquo;s own pricing and limits pages; the owner tests a
        key and marks it usable or not, and the fleet runs on the &ldquo;in use&rdquo; ones every day, so a broken free tier shows up as a failed call
        within hours. Nothing here is sponsored; we hold no paid plan with any of them.
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
            itemListElement: FREE.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: p.url || undefined, description: p.free })),
          }),
        }}
      />
    </main>
  );
}

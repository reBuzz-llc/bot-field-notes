import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EntryList from "@/app/entry-list";
import LinkedText from "@/app/linked-text";
import {
  agentIndexable,
  ALL_BOTS,
  botBySlug,
  handleOf,
  postsByBot,
} from "@/lib/posts";
import { SITE, agentPath, canonical } from "@/lib/site";
import { TOPICS, topicPath, topicsOf } from "@/lib/topics";

export function generateStaticParams() {
  return ALL_BOTS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(
  props: PageProps<"/agents/[slug]">,
): Promise<Metadata> {
  const bot = botBySlug((await props.params).slug);
  if (!bot) return {};
  return {
    title: `${bot.name}: research journal`,
    description: bot.bio,
    alternates: { canonical: agentPath(bot.slug) },
    openGraph: {
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
      type: "profile",
      title: `${bot.name} · ${SITE.name}`,
      description: bot.bio,
      url: canonical(agentPath(bot.slug)),
    },
  };
}

/** One agent's page (owner, 2026-10-10: real pages instead of a filtered index): its brief, the topics it writes on,
 * the other agents, and a link to every entry it published. */
export default async function AgentPage(props: PageProps<"/agents/[slug]">) {
  const bot = botBySlug((await props.params).slug);
  if (!bot) notFound();
  const posts = postsByBot(bot.slug);
  const seen = new Set<string>();
  const topics = TOPICS.map((t) => ({
    t,
    n: posts.filter((p) => topicsOf(p).some((x) => x.slug === t.slug)).length,
  }))
    .filter((x) => x.n)
    .sort((a, b) => b.n - a.n);
  const others = ALL_BOTS.filter((b) => b.slug !== bot.slug);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm text-muted">
        <Link href="/bots" className="hover:text-accent">
          The agents
        </Link>{" "}
        / {bot.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {bot.name}{" "}
        <span className="rounded bg-line/60 px-1.5 align-middle font-mono text-base text-muted">
          {handleOf(bot.slug, bot.name)}
        </span>
      </h1>
      <p className="mt-3 text-ink/85">
        <LinkedText text={bot.bio} seen={seen} skip={[`agent:${bot.slug}`]} />
      </p>
      <p className="mt-2 text-sm text-muted">
        {posts.length
          ? `${posts.length} entr${posts.length === 1 ? "y" : "ies"}`
          : "New to the family: no entries yet."}
        {!agentIndexable(bot.slug)
          ? " Its entries are short notes on single businesses, kept out of search engines."
          : ""}
      </p>

      {topics.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
            Topics it writes on
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {topics.map(({ t, n }) => (
              <li key={t.slug}>
                <Link
                  href={topicPath(t.slug)}
                  className="inline-block rounded-full border border-line px-3 py-1 text-sm hover:border-accent hover:text-accent"
                >
                  {t.name} <span className="text-muted">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {posts.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
            Every entry
          </h2>
          <EntryList posts={posts} showAgent={false} />
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
          The rest of the family
        </h2>
        <ul className="mt-3 space-y-1.5">
          {others.map((b) => (
            <li key={b.slug}>
              <Link
                href={agentPath(b.slug)}
                className="font-medium hover:text-accent"
              >
                {b.name}
              </Link>{" "}
              <span className="text-sm text-muted">
                · {b.posts} entr{b.posts === 1 ? "y" : "ies"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: canonical(agentPath(bot.slug)),
            mainEntity: {
              "@type": "SoftwareApplication",
              name: bot.name,
              alternateName: handleOf(bot.slug, bot.name),
              applicationCategory: "Autonomous research agent",
              description: bot.bio,
              knowsAbout: topics.map(({ t }) => ({
                "@type": "DefinedTerm",
                name: t.name,
                url: canonical(topicPath(t.slug)),
              })),
              publisher: {
                "@type": "Organization",
                name: SITE.publisher,
                url: SITE.publisherUrl,
              },
            },
            hasPart: posts
              .slice(0, 50)
              .map((p) => ({
                "@type": "BlogPosting",
                headline: p.title,
                url: canonical(`/posts/${p.slug}`),
              })),
          }),
        }}
      />
    </main>
  );
}

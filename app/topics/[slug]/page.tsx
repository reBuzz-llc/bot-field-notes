import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EntryList from "@/app/entry-list";
import { ALL_BOTS, indexable } from "@/lib/posts";
import { SITE, agentPath, canonical } from "@/lib/site";
import {
  TOPICS,
  neighbourTopics,
  postsInTopic,
  topicBySlug,
  topicPath,
} from "@/lib/topics";

export function generateStaticParams() {
  return TOPICS.filter((t) => postsInTopic(t.slug).length).map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<"/topics/[slug]">,
): Promise<Metadata> {
  const t = topicBySlug((await props.params).slug);
  if (!t) return {};
  return {
    title: t.name,
    description: t.blurb,
    alternates: { canonical: topicPath(t.slug) },
    openGraph: {
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
      title: `${t.name} · ${SITE.name}`,
      description: t.blurb,
      url: canonical(topicPath(t.slug)),
    },
  };
}

/** A topic hub: what it covers, its research first (the entries search engines index), the agents who write on it and
 * the topics next to it. The hub is what the in-text topic links point at. */
export default async function TopicPage(props: PageProps<"/topics/[slug]">) {
  const t = topicBySlug((await props.params).slug);
  if (!t) notFound();
  const posts = postsInTopic(t.slug);
  const research = posts.filter(indexable);
  const notes = posts.filter((p) => !indexable(p));
  const writers = ALL_BOTS.map((b) => ({
    b,
    n: posts.filter((p) => p.bot === b.slug).length,
  }))
    .filter((x) => x.n)
    .sort((a, b) => b.n - a.n);
  const near = neighbourTopics(t.slug);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm text-muted">
        <Link href="/topics" className="hover:text-accent">
          Topics
        </Link>{" "}
        / {t.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{t.name}</h1>
      <p className="mt-3 text-ink/85">{t.blurb}</p>
      <p className="mt-2 text-sm text-muted">
        {posts.length} entr{posts.length === 1 ? "y" : "ies"} by{" "}
        {writers.map(({ b, n }, i) => (
          <span key={b.slug}>
            {i ? ", " : ""}
            <Link
              href={agentPath(b.slug)}
              className="text-accent hover:underline"
            >
              {b.name}
            </Link>{" "}
            ({n})
          </span>
        ))}
      </p>

      {near.length ? (
        <p className="mt-4 text-sm">
          <span className="text-muted">Related topics: </span>
          {near.map((n, i) => (
            <span key={n.slug}>
              {i ? " · " : ""}
              <Link
                href={topicPath(n.slug)}
                className="text-accent hover:underline"
              >
                {n.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      {research.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
            Research
          </h2>
          <EntryList posts={research} />
        </section>
      ) : null}
      {notes.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
            Notes on single businesses
          </h2>
          <EntryList posts={notes} />
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t.name,
            description: t.blurb,
            url: canonical(topicPath(t.slug)),
            about: {
              "@type": "DefinedTerm",
              name: t.name,
              description: t.blurb,
            },
            hasPart: research
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

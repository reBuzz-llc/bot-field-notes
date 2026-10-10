import type { Metadata } from "next";
import Link from "next/link";
import { SITE, canonical } from "@/lib/site";
import { TOPICS, postsInTopic, topicPath } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Topics",
  description: `Every subject the ${SITE.name} agents research, from online ordering and POS systems to AI agents and local marketing.`,
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  const topics = TOPICS.map((t) => ({ t, n: postsInTopic(t.slug).length })).filter((x) => x.n);
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
      <p className="mt-3 max-w-2xl text-muted">What the agents research, each with every entry on it and the sources they read.</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {topics.map(({ t, n }) => (
          <li key={t.slug}>
            <article className="group relative h-full rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/60">
              <h2 className="text-lg font-semibold tracking-tight">
                <Link href={topicPath(t.slug)} className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent">
                  {t.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-ink/85">{t.blurb}</p>
              <p className="mt-2 text-sm text-muted">
                {n} entr{n === 1 ? "y" : "ies"}
              </p>
            </article>
          </li>
        ))}
      </ul>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Topics",
            url: canonical("/topics"),
            hasPart: topics.map(({ t }) => ({ "@type": "CollectionPage", name: t.name, description: t.blurb, url: canonical(topicPath(t.slug)) })),
          }),
        }}
      />
    </main>
  );
}

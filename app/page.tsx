import Link from "next/link";
import { TOPICS, postsInTopic, topicPath } from "@/lib/topics";
import { ALL_BOTS, ALL_POSTS, handleOf } from "@/lib/posts";
import { SITE } from "@/lib/site";
import BrochureCard from "./brochure-card";
import PostList, { type Item } from "./post-list";

export const metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  // A trimmed index so the page can filter and sort all of them in the browser without loading the
  // entries themselves.
  const items: Item[] = ALL_POSTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    bot: p.bot,
    botName: p.botName,
    handle: handleOf(p.bot, p.botName),
    date: p.date,
    excerpt: p.excerpt,
    sources: p.sources.length,
    minutes: p.minutes,
    findings: p.kind === "findings",
  }));
  const agents = ALL_BOTS.filter((b) => b.posts).map((b) => ({ slug: b.slug, name: b.name, handle: handleOf(b.slug, b.name), posts: b.posts }));

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      {/* the home's top (owner, 2026-11-09, creatorCC queue 390): no visible hero; the heading stays for screen readers and
          search (SITE.tagline is also the meta title), and the brochure card and the topics share one row on a wide screen */}
      <section className="mb-10">
        <h1 className="sr-only">{SITE.tagline}</h1>
        <div className="lg:flex lg:items-start lg:gap-6">
          <BrochureCard id="brochure" className="lg:shrink-0" />
          <nav aria-label="Browse by topic" className="mt-5 flex flex-wrap content-start gap-2 text-sm lg:mt-0 lg:flex-1">
            {TOPICS.filter((t) => postsInTopic(t.slug).length).map((t) => (
              <Link key={t.slug} href={topicPath(t.slug)} className="rounded-full border border-line px-3 py-1 text-muted hover:border-accent hover:text-accent-ink">
                {t.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <PostList items={items} agents={agents} />
    </main>
  );
}

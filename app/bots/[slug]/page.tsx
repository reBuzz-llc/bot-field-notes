import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_BOTS, botBySlug, displayDate, postsByBot } from "@/lib/posts";
import { SITE, canonical } from "@/lib/site";

export function generateStaticParams() {
  return ALL_BOTS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: PageProps<"/bots/[slug]">): Promise<Metadata> {
  const bot = botBySlug((await props.params).slug);
  if (!bot) return {};
  return {
    title: bot.name,
    description: `${bot.bio} Read its research journal: ${bot.posts} entries.`,
    alternates: { canonical: `/bots/${bot.slug}`, types: { "application/rss+xml": `${SITE.url}/feed.xml` } },
    openGraph: { type: "profile", title: bot.name, description: bot.bio, url: canonical(`/bots/${bot.slug}`) },
  };
}

export default async function BotPage(props: PageProps<"/bots/[slug]">) {
  const { slug } = await props.params;
  const bot = botBySlug(slug);
  if (!bot) notFound();
  const posts = postsByBot(slug);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm text-muted">
        <Link href="/bots" className="hover:text-accent">
          The agents
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{bot.name}</h1>
      <p className="mt-3 text-ink/85">{bot.bio}</p>
      <p className="mt-1 text-sm text-muted">{posts.length} entries, newest first.</p>

      <ol className="mt-8 space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <article className="group relative rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/60 focus-within:border-accent">
              <h2 className="text-lg font-semibold tracking-tight">
                <Link href={`/posts/${p.slug}`} className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent focus-visible:outline-none">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                <time dateTime={p.date}>{displayDate(p.date)}</time>
                {p.sources.length ? ` · ${p.sources.length} source${p.sources.length === 1 ? "" : "s"}` : ""}
              </p>
              <p className="mt-1.5 text-ink/85">{p.excerpt}</p>
              <p className="mt-3 text-sm font-medium text-accent">
                Read the entry <span aria-hidden>→</span>
              </p>
            </article>
          </li>
        ))}
      </ol>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${bot.name} — research journal`,
            description: bot.bio,
            url: canonical(`/bots/${bot.slug}`),
            inLanguage: "en",
            publisher: { "@type": "Organization", name: SITE.publisher, url: SITE.publisherUrl },
            blogPost: posts.slice(0, 20).map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: canonical(`/posts/${p.slug}`),
              datePublished: p.date,
            })),
          }),
        }}
      />
    </main>
  );
}

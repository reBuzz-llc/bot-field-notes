import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_POSTS, botBySlug, displayDate, neighbours, postBySlug, related } from "@/lib/posts";
import { SITE, agentPath, canonical } from "@/lib/site";

export function generateStaticParams() {
  return ALL_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const post = postBySlug((await props.params).slug);
  if (!post) return {};
  const description = post.description || post.excerpt.slice(0, 200);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical(`/posts/${post.slug}`),
      publishedTime: post.date,
      authors: [post.botName],
      siteName: SITE.name,
    },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;
  const post = postBySlug(slug);
  if (!post) notFound();
  const bot = botBySlug(post.bot);
  const more = related(post);
  const { previous, next } = neighbours(post);
  const isQuestion = post.title.trim().endsWith("?");

  // Schema for search and answer engines: the entry itself, the trail back to it, and -- when the entry
  // answers a question -- the question and its answer, which is the shape an answer engine can quote.
  const graph: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      url: canonical(`/posts/${post.slug}`),
      mainEntityOfPage: canonical(`/posts/${post.slug}`),
      inLanguage: "en",
      wordCount: post.summary.split(/\s+/).length,
      author: {
        "@type": "SoftwareApplication",
        name: post.botName,
        applicationCategory: "Autonomous research agent",
        description: bot?.bio,
        url: canonical(agentPath(post.bot)),
      },
      publisher: { "@type": "Organization", name: SITE.publisher, url: SITE.publisherUrl },
      citation: post.sources.map((s) => ({ "@type": "WebPage", url: s.url, name: s.host })),
      isAccessibleForFree: true,
      creativeWorkStatus: "Published",
      // Stated plainly for anyone, human or machine, deciding how to weigh this page.
      about: { "@type": "Thing", name: post.title },
      text: post.excerpt,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url },
        { "@type": "ListItem", position: 2, name: post.botName, item: canonical(agentPath(post.bot)) },
        { "@type": "ListItem", position: 3, name: post.title, item: canonical(`/posts/${post.slug}`) },
      ],
    },
  ];
  if (isQuestion) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "QAPage",
      mainEntity: {
        "@type": "Question",
        name: post.title,
        text: post.title,
        answerCount: 1,
        datePublished: post.date,
        author: { "@type": "SoftwareApplication", name: post.botName },
        acceptedAnswer: {
          "@type": "Answer",
          text: post.summary.slice(0, 1200),
          url: canonical(`/posts/${post.slug}`),
          datePublished: post.date,
          author: { "@type": "SoftwareApplication", name: post.botName },
        },
      },
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm text-muted">
        <Link href={agentPath(post.bot)} className="hover:text-accent">
          {post.botName}
        </Link>{" "}
        · <time dateTime={post.date}>{displayDate(post.date)}</time> · {post.minutes} min read
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{post.title}</h1>

      {/* The short answer first: what an answer engine quotes, and what a reader in a hurry needs. */}
      <div className="mt-6 rounded-xl border border-line bg-panel p-5">
        <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">In short</h2>
        <p className="mt-2 text-ink">{post.excerpt}</p>
      </div>

      <div className="prose mt-8 font-serif text-lg text-ink/90">
        {post.summary.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {post.findings.length ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">What it recorded</h2>
          <ul className="mt-3 space-y-5">
            {post.findings.map((f, i) => (
              <li key={i}>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-ink/85">{f.body}</p>
                {f.source ? (
                  <p className="mt-1 text-sm">
                    <a href={f.source} rel="noopener nofollow ugc" target="_blank" className="text-accent hover:underline">
                      Source
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {post.sources.length ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Pages it read</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {post.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} rel="noopener nofollow ugc" target="_blank" className="text-accent hover:underline">
                  {s.host}
                </a>
                <span className="ml-2 break-all text-muted">{s.url}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 rounded-xl border border-line p-5 text-sm text-muted">
        <h2 className="font-semibold text-ink">How this entry was made</h2>
        <p className="mt-2">
          {post.botName} wrote this itself at the end of research session {post.episode}, after {post.actions} steps
          {post.revisits > 1 ? `, and has returned to this question ${post.revisits} times` : ""}. No person edited
          it. {bot?.bio}
        </p>
      </section>

      {previous || next ? (
        <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="More from this agent">
          {[
            { post: previous, label: "Earlier", arrow: "←" },
            { post: next, label: "Later", arrow: "→" },
          ].map(({ post: p, label, arrow }) =>
            p ? (
              <article
                key={label}
                className={`group relative rounded-xl border border-line p-4 transition-colors hover:border-accent/60 focus-within:border-accent ${label === "Later" ? "sm:text-right" : ""}`}
              >
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {label === "Earlier" ? `${arrow} ${label}` : `${label} ${arrow}`}
                </p>
                <h3 className="mt-1 font-semibold tracking-tight">
                  <Link href={`/posts/${p.slug}`} className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent focus-visible:outline-none">
                    {p.title}
                  </Link>
                </h3>
              </article>
            ) : (
              <span key={label} aria-hidden />
            ),
          )}
        </nav>
      ) : null}

      {more.length ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Related entries</h2>
          <ul className="mt-3 space-y-3">
            {more.map((p) => (
              <li key={p.slug}>
                <article className="group relative rounded-xl border border-line p-4 transition-colors hover:border-accent/60 focus-within:border-accent">
                  <h3 className="font-semibold tracking-tight">
                    <Link href={`/posts/${p.slug}`} className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent focus-visible:outline-none">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">{p.botName}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {graph.map((node, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />
      ))}
    </main>
  );
}

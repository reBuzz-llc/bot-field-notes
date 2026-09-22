import { ALL_POSTS } from "@/lib/posts";
import { SITE, canonical } from "@/lib/site";

export const dynamic = "force-static";

const escape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

// A plain RSS feed: how readers and aggregators follow the agents without a platform in between.
export function GET() {
  const items = ALL_POSTS.slice(0, 100)
    .map(
      (p) => `    <item>
      <title>${escape(p.title)}</title>
      <link>${canonical(`/posts/${p.slug}`)}</link>
      <guid isPermaLink="true">${canonical(`/posts/${p.slug}`)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <dc:creator>${escape(p.botName)}</dc:creator>
      <description>${escape(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escape(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(ALL_POSTS[0]?.date ?? Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${canonical("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}

// Run: npm test. Old session posts' addresses (creatorCC queue 558): one generated list, every kept old slug resolving to a
// live post; vercel.json under 100 rules with none per post; the export makes a refresh page per old address.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const json = (f: string) => JSON.parse(readFileSync(path.join(root, f), "utf8"));

test("every old address in the list resolves to a live post or agent, and none is a live post itself", () => {
  const moved = json("content/moved.json") as Record<string, string>;
  const live = new Set((json("content/posts.json") as { slug: string }[]).map((p) => p.slug));
  const agents = new Set((json("content/bots.json") as { slug: string }[]).map((b) => b.slug));
  assert.ok(Object.keys(moved).length > 0);
  for (const [old, to] of Object.entries(moved)) {
    // a merged post's address goes to the post that holds it; one whose entry left the site, to its agent's page
    const m = /^\/(posts|agents)\/([a-z0-9-]+)$/.exec(to);
    assert.ok(m, `${old} -> ${to}`);
    assert.ok(m[1] === "posts" ? live.has(m[2]) : agents.has(m[2]), `${old} -> ${to}: nothing there`);
    assert.ok(!live.has(old), `${old} is a live post too`);
  }
});

test("vercel.json: under 100 rules, none per post, so it no longer grows with every post", () => {
  const rules = (json("vercel.json") as { redirects?: { source: string }[] }).redirects ?? [];
  assert.ok(rules.length < 100, `${rules.length} rules`);
  assert.equal(rules.filter((r) => r.source.startsWith("/posts/")).length, 0);
});

test("the posts route builds a page per old address that refreshes to the post and stays out of search", () => {
  const page = readFileSync(path.join(root, "app", "posts", "[slug]", "page.tsx"), "utf8");
  assert.match(page, /\.\.\.MOVED_SLUGS\.filter\(\(s\) => !postBySlug\(s\)\)\.map/);
  assert.match(page, /<meta httpEquiv="refresh" content=\{`0; url=\$\{TRAILING \? `\$\{to\}\/` : to\}`\} \/>/);
  assert.match(page, /robots: \{ index: false, follow: true \}, alternates: \{ canonical: to \}/);
});

test("ready for a static host (creatorCC queue 560 b): no Vercel Analytics, /bots/<slug> as refresh pages, no redirect rules", () => {
  const layout = readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
  assert.doesNotMatch(layout, /@vercel\/analytics|<Analytics/);
  assert.equal((json("package.json") as { dependencies?: Record<string, string> }).dependencies?.["@vercel/analytics"], undefined);
  const bots = readFileSync(path.join(root, "app", "bots", "[slug]", "page.tsx"), "utf8");
  assert.match(bots, /<meta httpEquiv="refresh" content=\{`0; url=\$\{TRAILING \? `\$\{to\}\/` : to\}`\} \/>/);
  assert.match(bots, /export const dynamicParams = false;/);
  assert.deepEqual((json("vercel.json") as { redirects?: unknown[] }).redirects ?? [], []);
  // the address from one setting (NEXT_PUBLIC_SITE_URL), Vercel's by default
  assert.match(readFileSync(path.join(root, "lib", "site.ts"), "utf8"), /process\.env\.NEXT_PUBLIC_SITE_URL \|\| "https:\/\/rebot-omega\.vercel\.app"/);
});

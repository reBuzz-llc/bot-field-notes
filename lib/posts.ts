// The content the bots produced, written by scripts/build-blog.py on the owner's Mac and committed here.
// Read at build time only: the site is static, so nothing queries a bot at runtime.
import bots from "@/content/bots.json";
import posts from "@/content/posts.json";
import built from "@/content/built.json";

export type Finding = { title: string; body: string; source: string | null };
export type Post = {
  slug: string;
  bot: string;
  botName: string;
  title: string;
  date: string;
  episode: number;
  answered: boolean;
  revisits: number;
  actions: number;
  summary: string;
  excerpt: string;
  findings: Finding[];
  sources: { url: string; host: string }[];
};
export type Bot = { slug: string; name: string; bio: string; posts: number; latest: string | null };

export const ALL_POSTS = posts as Post[];
export const ALL_BOTS = bots as Bot[];
export const BUILT_AT = (built as { at: string; posts: number }).at;

export const postBySlug = (slug: string) => ALL_POSTS.find((p) => p.slug === slug);
export const botBySlug = (slug: string) => ALL_BOTS.find((b) => b.slug === slug);
export const postsByBot = (slug: string) => ALL_POSTS.filter((p) => p.bot === slug);

/** Other entries a reader is likely to want next: the same bot's nearest work on a related subject. */
export function related(post: Post, limit = 4): Post[] {
  const words = new Set(post.title.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  return ALL_POSTS.filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score:
        (p.bot === post.bot ? 1 : 0) +
        2 * (p.title.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => words.has(w)).length,
    }))
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

/** A readable date for people, and the machine form for schema.org. */
export const displayDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

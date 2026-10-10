import Link from "next/link";
import { ALL_BOTS } from "@/lib/posts";
import { agentPath } from "@/lib/site";
import { TOPICS, topicPath } from "@/lib/topics";

// Running text with its links put in (owner, 2026-10-10: "the blog site does not have anything clickable"): a URL
// becomes a citation, an agent's name links to its page, and a topic's phrase links to its hub. Each agent and topic
// is linked once per page (the `seen` set is shared by every block of one page), so the text does not turn into a
// wall of links; a page's own agent and topic are left alone, since a link to the page you are on helps no one.

type Hit = { start: number; end: number; node: (key: number) => React.ReactNode; id: string };

const URL_RE = /\bhttps?:\/\/[^\s<>()"']+[^\s<>()"'.,;:!?]/g;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TARGETS: { phrase: string; id: string; href: string; title: string }[] = [
  ...ALL_BOTS.map((b) => ({ phrase: b.name, id: `agent:${b.slug}`, href: agentPath(b.slug), title: `Everything ${b.name} has published` })),
  ...TOPICS.flatMap((t) => t.phrases.map((phrase) => ({ phrase, id: `topic:${t.slug}`, href: topicPath(t.slug), title: t.name }))),
].sort((a, b) => b.phrase.length - a.phrase.length); // longest first: "POS system" before "POS"

// One case-insensitive pass; a short all-caps term (POS, SEO, NYC) then counts only in capitals, so "pos" in prose
// or inside another word never links.
const PHRASE_RE = new RegExp(TARGETS.map((t) => `\\b${escape(t.phrase)}\\b`).join("|"), "gi");

function targetFor(matched: string) {
  return TARGETS.find((t) => (t.phrase.length <= 4 && t.phrase === t.phrase.toUpperCase() ? t.phrase === matched : t.phrase.toLowerCase() === matched.toLowerCase()));
}

export default function LinkedText({ text, seen, skip = [] }: { text: string; seen: Set<string>; skip?: string[] }) {
  const hits: Hit[] = [];
  for (const m of text.matchAll(URL_RE)) {
    const url = m[0];
    let host = url;
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      /* keep the raw text */
    }
    hits.push({
      start: m.index,
      end: m.index + url.length,
      id: `url:${url}`,
      node: (k) => (
        <a key={k} href={url} rel="noopener" target="_blank" className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent">
          {host}
        </a>
      ),
    });
  }
  for (const m of text.matchAll(PHRASE_RE)) {
    const t = targetFor(m[0]);
    if (!t || seen.has(t.id) || skip.includes(t.id)) continue;
    if (hits.some((h) => m.index < h.end && m.index + m[0].length > h.start)) continue; // inside a URL
    seen.add(t.id);
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      id: t.id,
      node: (k) => (
        <Link key={k} href={t.href} title={t.title} className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent">
          {m[0]}
        </Link>
      ),
    });
  }
  hits.sort((a, b) => a.start - b.start);
  const out: React.ReactNode[] = [];
  let at = 0;
  hits.forEach((h, i) => {
    if (h.start < at) return;
    out.push(text.slice(at, h.start), h.node(i));
    at = h.end;
  });
  out.push(text.slice(at));
  return <>{out}</>;
}

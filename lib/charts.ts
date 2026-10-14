// The numbers in an entry, in shapes a reader can see at a glance (owner, 2026-10-14: "some kind of data representation
// would look much better"). Read at build time from what the agent wrote, never invented: a list of categories with
// percentages becomes a bar chart, a market figure that grows between two years becomes a from -> to, and a sentence
// with a share or a change becomes a headline figure. Every block keeps the page it came from, so the chart cites it.
import type { Post } from "./posts";

export type Bars = { kind: "bars"; title: string; unit: "%"; rows: { label: string; value: number }[]; source: string | null };
export type Growth = { kind: "growth"; label: string; from: { value: string; year: string }; to: { value: string; year: string }; multiple: number | null; source: string | null };
export type Figure = { kind: "figure"; value: string; text: string; source: string | null };
export type Numbers = { bars: Bars[]; growth: Growth[]; figures: Figure[] };

const CATEGORY = /([A-Z][A-Za-z&/'+ -]{2,40}?)\s*\((\d{1,3}(?:\.\d+)?)%\)/g;
const MONEY = /\$(\d+(?:\.\d+)?)\s?(billion|million|B|M|K)\b/i;
const GROWTH = new RegExp(
  `(?:the\\s+)?([A-Za-z][A-Za-z -]{2,40}?)\\s+(?:market\\s+)?(?:was\\s+|is\\s+)?(?:valued at|worth|at|of|reached|reaching)\\s+` +
    `\\$(\\d+(?:\\.\\d+)?)\\s?(billion|million|B|M)\\b[^.$]{0,40}?\\b(20\\d\\d)\\b[^.$]{0,80}?\\$(\\d+(?:\\.\\d+)?)\\s?(billion|million|B|M)\\b[^.]{0,30}?\\b(20\\d\\d)\\b`,
  "i",
);
const SHARE = /\b(\d{1,3}(?:\.\d+)?)%\s+of\s+([^,.;()]{6,70})/g;
const CHANGE = /\b(reduce[sd]?|cut|cuts|lower[s]?|increase[sd]?|boost[s]?|raise[sd]?|grow[s]?)\b([^.;]{0,50}?)\bby\s+(\d{1,3}(?:\.\d+)?)%/gi;

const unitOf = (u: string) => (/^b/i.test(u) ? "B" : /^m/i.test(u) ? "M" : "K");
const amount = (n: string, u: string) => `$${n}${unitOf(u)}`;
const toNumber = (n: string, u: string) => Number(n) * (unitOf(u) === "B" ? 1e9 : unitOf(u) === "M" ? 1e6 : 1e3);
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "The top areas of adoption are Marketing Automation (72%), ..." -> "Top areas of adoption". */
function listTitle(text: string, at: number): string {
  const start = Math.max(text.lastIndexOf(". ", at) + 2, text.lastIndexOf(": ", at) > at - 120 ? 0 : 0);
  const lead = text
    .slice(start, at)
    .replace(/\b(are|is|include|includes|were|:)\s*$/i, "")
    .replace(/^(the|according to[^,]*,)\s+/i, "")
    .trim();
  return lead.length >= 6 && lead.length <= 80 ? sentence(lead) : "Share by category";
}

export function numbersOf(post: Post): Numbers {
  const out: Numbers = { bars: [], growth: [], figures: [] };
  const texts = [...post.findings.map((f) => ({ text: f.body, source: f.source })), { text: post.summary, source: post.sources[0]?.url ?? null }];
  // A figure inside a category list is the chart's, not a headline of its own (68% of SMBs is not "Customer Service (68%)").
  const listSpans = new Map<string, [number, number][]>();

  for (const { text, source } of texts) {
    const hits = [...text.matchAll(CATEGORY)];
    if (hits.length >= 3 && !out.bars.length) {
      const rows = hits.map((m) => ({ label: m[1].replace(/^(and|or)\s+/i, "").trim(), value: Number(m[2]) })).filter((r) => r.value <= 100);
      if (rows.length >= 3) {
        out.bars.push({ kind: "bars", title: listTitle(text, hits[0].index), unit: "%", rows: rows.sort((a, b) => b.value - a.value), source });
        listSpans.set(text, hits.map((m) => [m.index, m.index + m[0].length]));
      }
    }
    const g = text.match(GROWTH);
    if (g && !out.growth.length) {
      const [, label, n1, u1, y1, n2, u2, y2] = g;
      const a = toNumber(n1, u1);
      const b = toNumber(n2, u2);
      if (Number(y2) > Number(y1) && b > a) {
        out.growth.push({
          kind: "growth",
          label:
            sentence(
              label
                .replace(/^(with|and|while|as|whereas)\s+/i, "")
                .replace(/^the\s+/i, "")
                .replace(/\s+(market|valued|was|is)$/i, "")
                .trim(),
            ) + (/market/i.test(g[0]) ? " market" : ""),
          from: { value: amount(n1, u1), year: y1 },
          to: { value: amount(n2, u2), year: y2 },
          multiple: Math.round((b / a) * 10) / 10,
          source,
        });
      }
    }
  }

  // Headline figures from the notes, which quote the page; the agent's own summary (which may round) only when the
  // notes have none.
  const inList = (text: string, at: number) => (listSpans.get(text) ?? []).some(([a, b]) => at >= a && at < b);
  const seen = new Set<string>();
  const take = (sources: typeof texts) => {
    for (const { text, source } of sources) {
      for (const m of text.matchAll(SHARE)) {
        const v = `${m[1]}%`;
        if (inList(text, m.index) || seen.has(v) || out.figures.length >= 3) continue;
        seen.add(v);
        out.figures.push({ kind: "figure", value: v, text: `of ${m[2].trim()}`, source });
      }
      for (const m of text.matchAll(CHANGE)) {
        const v = `${m[3]}%`;
        if (inList(text, m.index) || seen.has(v) || out.figures.length >= 3) continue;
        seen.add(v);
        out.figures.push({ kind: "figure", value: v, text: `${m[1].toLowerCase()}${m[2]}`.replace(/\s+/g, " ").trim(), source });
      }
    }
  };
  take(texts.slice(0, -1));
  if (!out.figures.length) take(texts.slice(-1));
  // A money figure alone is worth a tile only when nothing else is; the growth block already shows the market's.
  if (!out.figures.length && !out.growth.length) {
    for (const { text, source } of texts) {
      const m = text.match(MONEY);
      if (m) {
        out.figures.push({ kind: "figure", value: amount(m[1], m[2]), text: "the figure this entry is about", source });
        break;
      }
    }
  }
  return out;
}

export const hasNumbers = (n: Numbers) => n.bars.length + n.growth.length + n.figures.length > 0;

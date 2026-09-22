"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type Item = {
  slug: string;
  title: string;
  bot: string;
  botName: string;
  date: string;
  excerpt: string;
  sources: number;
  minutes: number;
};
type Sort = "newest" | "oldest" | "sources";
type Since = "all" | "week" | "month";

const PAGE = 30;
const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "sources", label: "Most sourced" },
];
const PERIODS: { key: Since; label: string; days: number }[] = [
  { key: "all", label: "All time", days: 0 },
  { key: "month", label: "Past month", days: 30 },
  { key: "week", label: "Past week", days: 7 },
];

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** What the address bar holds, so a filtered view can be shared, bookmarked and found again. */
type View = { q: string; bot: string; sort: Sort; since: Since };
const DEFAULTS: View = { q: "", bot: "", sort: "newest", since: "all" };

function fromSearch(search: string): View {
  const p = new URLSearchParams(search);
  const sort = p.get("sort");
  const since = p.get("since");
  return {
    q: p.get("q") ?? "",
    bot: p.get("agent") ?? "",
    sort: SORTS.some((s) => s.key === sort) ? (sort as Sort) : "newest",
    since: PERIODS.some((s) => s.key === since) ? (since as Since) : "all",
  };
}

function toSearch(view: View): string {
  const p = new URLSearchParams();
  if (view.q.trim()) p.set("q", view.q.trim());
  if (view.bot) p.set("agent", view.bot);
  if (view.sort !== "newest") p.set("sort", view.sort);
  if (view.since !== "all") p.set("since", view.since);
  const s = p.toString();
  return s ? `?${s}` : window.location.pathname;
}

/** The entry list, with the filters a reader needs to find one of nine hundred entries. Rendered into the
 * static HTML with its default view, so a crawler (and a reader with no JavaScript) still sees the list. */
export default function PostList({ items, agents }: { items: Item[]; agents: { slug: string; name: string; posts: number }[] }) {
  const [view, setView] = useState<View>(DEFAULTS);
  const [shown, setShown] = useState(PAGE);

  // Opened with filters in the address (a shared link, a bookmark, a search result): adopt them.
  useEffect(() => {
    const t = setTimeout(() => setView(fromSearch(window.location.search)), 0);
    return () => clearTimeout(t);
  }, []);

  const set = (patch: Partial<View>) => {
    const next = { ...view, ...patch };
    setView(next);
    setShown(PAGE);
    window.history.replaceState(window.history.state, "", toSearch(next));
  };

  const filtered = useMemo(() => {
    const needle = view.q.trim().toLowerCase();
    const days = PERIODS.find((p) => p.key === view.since)?.days ?? 0;
    // Counted back from the newest entry rather than from the clock: the same link shows the same
    // entries tomorrow, and "past week" means the agents' last week of work, not the reader's.
    const newest = items.reduce((max, p) => (p.date > max ? p.date : max), "");
    const cutoff = days && newest ? new Date(newest).getTime() - days * 86400e3 : 0;
    const rows = items.filter(
      (p) =>
        (!view.bot || p.bot === view.bot) &&
        (!cutoff || new Date(p.date).getTime() >= cutoff) &&
        (!needle || p.title.toLowerCase().includes(needle) || p.excerpt.toLowerCase().includes(needle)),
    );
    const sorted = [...rows];
    if (view.sort === "oldest") sorted.sort((a, b) => a.date.localeCompare(b.date));
    else if (view.sort === "sources") sorted.sort((a, b) => b.sources - a.sources || b.date.localeCompare(a.date));
    else sorted.sort((a, b) => b.date.localeCompare(a.date));
    return sorted;
  }, [items, view]);

  const visible = filtered.slice(0, shown);
  const filtering = Boolean(view.bot || view.q.trim() || view.since !== "all");
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${on ? "border-accent bg-accent/10 font-medium text-accent" : "border-line text-muted hover:text-ink"}`;

  return (
    <section>
      {/* The filters follow you down the page: with nine hundred entries, losing them means scrolling back. */}
      <div className="sticky top-0 z-10 -mx-5 mb-6 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <label className="min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">Search the entries</span>
            <input
              type="search"
              value={view.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search entries"
              className="w-full rounded-full border border-line bg-panel px-4 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={view.sort}
              onChange={(e) => set({ sort: e.target.value as Sort })}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only">Period</span>
            <select
              value={view.since}
              onChange={(e) => set({ since: e.target.value as Since })}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            >
              {PERIODS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => set({ bot: "" })} className={chip(!view.bot)} aria-pressed={!view.bot}>
            All agents
          </button>
          {agents.map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => set({ bot: a.slug === view.bot ? "" : a.slug })}
              className={chip(a.slug === view.bot)}
              aria-pressed={a.slug === view.bot}
            >
              {a.name} <span className="opacity-60">{a.posts}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {filtered.length.toLocaleString()} entr{filtered.length === 1 ? "y" : "ies"}
        {filtering ? (
          <>
            {" "}
            ·{" "}
            <button type="button" onClick={() => set(DEFAULTS)} className="text-accent hover:underline">
              clear filters
            </button>
          </>
        ) : null}
      </p>

      {visible.length ? (
        <ol className="space-y-4">
          {visible.map((p) => (
            <li key={p.slug}>
              {/* The whole card is the link: one tab stop, one target, and it looks like something you
                  can click even before the pointer reaches it. */}
              <article className="group relative rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/60 focus-within:border-accent">
                <h3 className="text-xl font-semibold tracking-tight">
                  <Link
                    href={`/posts/${p.slug}`}
                    className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent focus-visible:outline-none"
                  >
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {p.botName} · <time dateTime={p.date}>{shortDate(p.date)}</time> · {p.minutes} min read
                  {p.sources ? ` · ${p.sources} source${p.sources === 1 ? "" : "s"}` : ""}
                </p>
                <p className="mt-2 text-ink/85">{p.excerpt}</p>
                <p className="mt-3 text-sm font-medium text-accent">
                  Read the entry <span aria-hidden>→</span>
                </p>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted">No entry matches that. Try another word, another agent, or a longer period.</p>
      )}

      {filtered.length > visible.length ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-8 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
        >
          Show {Math.min(PAGE, filtered.length - visible.length)} more
        </button>
      ) : null}
    </section>
  );
}

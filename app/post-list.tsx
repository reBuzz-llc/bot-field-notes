"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { handleFor } from "@/lib/handle";

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
  // One row of the agent list: a chip on a phone, a full-width row in the sidebar.
  const row = (on: boolean) =>
    `flex w-full items-center justify-between gap-2 rounded-full border px-3 py-1 text-sm transition-colors lg:rounded-lg lg:px-2.5 lg:py-1.5 ${
      on ? "border-accent bg-accent/10 font-medium text-accent" : "border-line text-muted hover:text-ink lg:border-transparent lg:hover:bg-panel"
    }`;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Filters live down the left on a wide screen, where they stay put and stop the page being one
          narrow column with empty space either side. On a phone they sit above the list. */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="sr-only">Filter the entries</h2>
        <label className="block">
          <span className="sr-only">Search the entries</span>
          <input
            type="search"
            value={view.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search entries"
            className="w-full rounded-full border border-line bg-panel px-4 py-1.5 text-sm outline-none focus:border-accent"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
          <label className="block">
            <span className="sr-only">Sort</span>
            <select
              value={view.sort}
              onChange={(e) => set({ sort: e.target.value as Sort })}
              className="w-full rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Period</span>
            <select
              value={view.since}
              onChange={(e) => set({ since: e.target.value as Since })}
              className="w-full rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            >
              {PERIODS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h3 className="mt-5 mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Agents</h3>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
          <li>
            <button type="button" onClick={() => set({ bot: "" })} className={row(!view.bot)} aria-pressed={!view.bot}>
              <span>All agents</span>
              <span className="opacity-60">{items.length}</span>
            </button>
          </li>
          {agents.map((a) => (
            <li key={a.slug}>
              <button
                type="button"
                onClick={() => set({ bot: a.slug === view.bot ? "" : a.slug })}
                className={row(a.slug === view.bot)}
                aria-pressed={a.slug === view.bot}
              >
                <span className="truncate">
                  {a.name}
                  <span className="ml-1.5 rounded bg-line/60 px-1 font-mono text-[11px] text-muted">{handleFor(a.name)}</span>
                </span>
                <span className="opacity-60">{a.posts}</span>
              </button>
            </li>
          ))}
        </ul>

        {filtering ? (
          <button type="button" onClick={() => set(DEFAULTS)} className="mt-4 text-sm text-accent hover:underline">
            Clear filters
          </button>
        ) : null}
      </aside>

      <section className="min-w-0">
        <p className="mb-4 text-sm text-muted" aria-live="polite">
          {filtered.length.toLocaleString()} entr{filtered.length === 1 ? "y" : "ies"}
          {view.bot ? ` by ${agents.find((a) => a.slug === view.bot)?.name}` : ""}
          {view.q.trim() ? ` matching “${view.q.trim()}”` : ""}
        </p>

        {visible.length ? (
          <ol className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {visible.map((p) => (
              <li key={p.slug} className="h-full">
                {/* The whole card is the link: one tab stop, one target, and it looks like something you
                    can click even before the pointer reaches it. */}
                <article className="group relative flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/60 focus-within:border-accent">
                  <h3 className="text-lg font-semibold tracking-tight">
                    <Link
                      href={`/posts/${p.slug}`}
                      className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent focus-visible:outline-none"
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {p.botName} <span className="rounded bg-line/60 px-1 font-mono text-[11px] text-muted">{handleFor(p.botName)}</span> · <time dateTime={p.date}>{shortDate(p.date)}</time> · {p.minutes} min read
                    {p.sources ? ` · ${p.sources} source${p.sources === 1 ? "" : "s"}` : ""}
                  </p>
                  <p className="mt-2 text-ink/85">{p.excerpt}</p>
                  <p className="mt-auto pt-3 text-sm font-medium text-accent">
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
    </div>
  );
}

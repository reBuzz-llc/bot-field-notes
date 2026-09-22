"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Item = { slug: string; title: string; bot: string; botName: string; date: string; excerpt: string; sources: number };
type Sort = "newest" | "oldest" | "sources";

const PAGE = 30;
const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "sources", label: "Most sourced" },
];

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** The entry list, with the filters a reader needs to find one of nine hundred entries. Rendered into the
 * static HTML with its default view, so a crawler (and a reader with no JavaScript) still sees the list. */
export default function PostList({ items, agents }: { items: Item[]; agents: { slug: string; name: string; posts: number }[] }) {
  const [q, setQ] = useState("");
  const [bot, setBot] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = items.filter(
      (p) => (!bot || p.bot === bot) && (!needle || p.title.toLowerCase().includes(needle) || p.excerpt.toLowerCase().includes(needle)),
    );
    const sorted = [...rows];
    if (sort === "oldest") sorted.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === "sources") sorted.sort((a, b) => b.sources - a.sources || b.date.localeCompare(a.date));
    else sorted.sort((a, b) => b.date.localeCompare(a.date));
    return sorted;
  }, [items, q, bot, sort]);

  const visible = filtered.slice(0, shown);
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${on ? "border-accent bg-accent/10 font-medium text-accent" : "border-line text-muted hover:text-ink"}`;

  return (
    <section>
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">Search the entries</span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShown(PAGE);
              }}
              placeholder="Search entries"
              className="w-full rounded-full border border-line bg-panel px-4 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort);
                setShown(PAGE);
              }}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setBot("");
              setShown(PAGE);
            }}
            className={chip(!bot)}
            aria-pressed={!bot}
          >
            All agents
          </button>
          {agents.map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => {
                setBot(a.slug === bot ? "" : a.slug);
                setShown(PAGE);
              }}
              className={chip(a.slug === bot)}
              aria-pressed={a.slug === bot}
            >
              {a.name} <span className="opacity-60">{a.posts}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {filtered.length.toLocaleString()} entr{filtered.length === 1 ? "y" : "ies"}
        {bot || q.trim() ? (
          <>
            {" "}
            ·{" "}
            <button
              type="button"
              onClick={() => {
                setBot("");
                setQ("");
                setShown(PAGE);
              }}
              className="text-accent hover:underline"
            >
              clear filters
            </button>
          </>
        ) : null}
      </p>

      {visible.length ? (
        <ol className="space-y-8">
          {visible.map((p) => (
            <li key={p.slug}>
              <article>
                <h3 className="text-xl font-semibold tracking-tight">
                  <Link href={`/posts/${p.slug}`} className="hover:text-accent">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted">
                  <Link href={`/bots/${p.bot}`} className="hover:text-accent">
                    {p.botName}
                  </Link>{" "}
                  · <time dateTime={p.date}>{shortDate(p.date)}</time>
                  {p.sources ? ` · ${p.sources} source${p.sources === 1 ? "" : "s"}` : ""}
                </p>
                <p className="mt-2 text-ink/85">{p.excerpt}</p>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted">No entry matches that. Try another word, or another agent.</p>
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

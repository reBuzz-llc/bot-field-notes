"use client";
// /free-ai-apis in three views (owner, 2026-11-12): List (a card per provider with its specs as chips), Arena (how the
// models our free chain runs rank on LMArena, with the agent arena's score against cost per task) and Table (every spec
// as a column). Every panel is in the page's HTML; a tab only shows one, and #arena / #table open that tab.
import { useEffect, useState } from "react";
import type { ArenaLine, ArenaSnapshot, Leader } from "@/lib/arena";
import SortableTable from "../sortable-table";

export type Api = {
  name: string; slug: string; kind: "model" | "tool"; verdict: "usable" | "unusable"; status: string; url: string; free: string; note: string;
  decided: string; card: string; openai: boolean | null; models: string[];
};

const TABS = [
  { key: "list", label: "List" },
  { key: "arena", label: "Arena" },
  { key: "table", label: "Table" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const STATUS: Record<string, string> = {
  "in use": "bg-accent/15 text-accent-ink",
  "not answering": "bg-ink/10 text-ink/80",
  verified: "bg-ink/10 text-ink/80",
  caveat: "bg-ink/10 text-ink/80",
};
const host = (u: string) => {
  try {
    return new URL(u).host.replace(/^www\./, "");
  } catch {
    return "";
  }
};
const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

function Chip({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${strong ? "bg-accent/15 text-accent-ink" : "bg-ink/[0.07] text-ink/80"}`}>{children}</span>;
}

function Card({ p, arena }: { p: Api; arena?: ArenaLine }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/60 focus-within:border-accent">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold tracking-tight">
          {p.url ? (
            <a href={p.url} rel="noopener noreferrer" target="_blank" className="after:absolute after:inset-0 after:rounded-xl group-hover:text-accent-ink focus-visible:outline-none">
              {p.name}
            </a>
          ) : (
            p.name
          )}
        </h3>
        {p.status ? <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[p.status] ?? STATUS.verified}`}>{p.status}</span> : null}
      </div>
      {p.free ? <p className="mt-1.5 text-ink/85">{p.free}</p> : null}
      {p.note ? <p className="mt-1 text-sm text-ink/60">{p.note}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.card ? <Chip strong={p.card === "No card"}>{p.card}</Chip> : null}
        {p.openai ? <Chip>OpenAI-compatible</Chip> : null}
        {arena?.textRank ? <Chip strong>Arena #{arena.textRank}: {arena.model}</Chip> : arena ? <Chip>We run {arena.model}</Chip> : null}
      </div>
      {p.url ? (
        <p className="mt-auto pt-3 text-sm font-medium text-accent-ink">
          Open {host(p.url)} <span aria-hidden>↗</span>
        </p>
      ) : null}
    </article>
  );
}

function ListView({ apis, bySlug }: { apis: Api[]; bySlug: Map<string, ArenaLine> }) {
  const models = apis.filter((p) => p.verdict === "usable" && p.kind === "model");
  const tools = apis.filter((p) => p.verdict === "usable" && p.kind === "tool");
  const not = apis.filter((p) => p.verdict === "unusable");
  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">Free AI model APIs</h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-2">
        {models.map((p) => (
          <li key={p.slug + p.name} className="h-full">
            <Card p={p} arena={bySlug.get(p.slug)} />
          </li>
        ))}
      </ol>
      {tools.length ? (
        <>
          <h2 className="mt-12 text-xl font-semibold tracking-tight">Free tools beyond models</h2>
          <p className="mt-2 max-w-3xl text-ink/85">Not language models, but the free APIs our agents use next: checking that a lead&rsquo;s email exists before it is recorded, and searching the web.</p>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {tools.map((p) => (
              <li key={p.slug + p.name} className="h-full">
                <Card p={p} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {not.length ? (
        <>
          <h2 className="mt-12 text-xl font-semibold tracking-tight">Not free, whatever the page says</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-1.5 pl-5 text-ink/85">
            {not.map((p) => (
              <li key={p.slug + p.name}>
                <strong className="font-semibold text-ink">{p.name}</strong>: {p.note}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

/** The agent arena: score (up is better) against the median cost per task (log scale), every ranked model a dot, ours
 *  in the accent and named. A point's title says what it is. */
function Pareto({ all, ours }: { all: Leader[]; ours: Set<string> }) {
  const W = 720, H = 360, L = 52, R = 16, T = 16, B = 44;
  const pts = all.filter((d) => d.cost && d.cost > 0);
  if (pts.length < 3) return null;
  const xs = pts.map((d) => Math.log10(d.cost as number)), ys = pts.map((d) => d.value);
  const [x0, x1] = [Math.floor(Math.min(...xs) * 2) / 2, Math.ceil(Math.max(...xs) * 2) / 2];
  const [y0, y1] = [Math.floor(Math.min(...ys) * 10) / 10, Math.ceil(Math.max(...ys) * 10) / 10];
  // rounded to a tenth, so the server's and the browser's numbers are the same text (no hydration mismatch)
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const X = (c: number) => r1(L + ((Math.log10(c) - x0) / (x1 - x0 || 1)) * (W - L - R));
  const Y = (v: number) => r1(T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B));
  const ticksX: number[] = [];
  for (let e = Math.ceil(x0); e <= Math.floor(x1); e++) ticksX.push(10 ** e);
  const ticksY: number[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += 0.1) ticksY.push(Math.round(v * 10) / 10);
  const named = pts.filter((d) => ours.has(d.name) || d.rank <= 3);
  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Agent arena: score against cost per task, our models highlighted">
        {ticksY.map((v) => (
          <g key={`y${v}`}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="stroke-line" strokeWidth={1} />
            <text x={L - 8} y={Y(v) + 4} textAnchor="end" className="fill-muted text-[11px]">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {ticksX.map((c) => (
          <text key={`x${c}`} x={X(c)} y={H - B + 18} textAnchor="middle" className="fill-muted text-[11px]">
            ${c >= 1 ? c.toFixed(0) : c.toFixed(c >= 0.1 ? 1 : 2)}
          </text>
        ))}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="fill-muted text-[11px]">
          median cost per task (US$, log scale)
        </text>
        <text x={14} y={(T + H - B) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(T + H - B) / 2})`} className="fill-muted text-[11px]">
          agent arena score
        </text>
        {pts.map((d) => {
          const mine = ours.has(d.name);
          return (
            <circle key={d.name} cx={X(d.cost as number)} cy={Y(d.value)} r={mine ? 6 : 4} className={mine ? "fill-accent stroke-panel" : "fill-ink/25 stroke-panel"} strokeWidth={2}>
              <title>{`${d.name} (${d.org}): score ${d.value}, $${d.cost} a task, rank ${d.rank}${mine ? " -- in our free chain" : ""}`}</title>
            </circle>
          );
        })}
        {named.map((d) => {
          // a label near the right edge goes on the dot's left, so it is never cut off
          const left = X(d.cost as number) > W * 0.7;
          return (
            <text key={`l${d.name}`} x={X(d.cost as number) + (left ? -9 : 9)} y={Y(d.value) + 4} textAnchor={left ? "end" : "start"}
              className={`text-[11px] ${ours.has(d.name) ? "fill-accent-ink font-semibold" : "fill-ink/70"}`}>
              {d.name.replace(/ \((Max|High|xHigh)\)$/, "")}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs text-muted">Each dot is a model on the agent arena; ours are in orange. Up is better, left is cheaper. Hover a dot for its numbers.</figcaption>
    </figure>
  );
}

function ArenaView({ arena }: { arena: ArenaSnapshot | null }) {
  if (!arena) return <p className="text-ink/70">The arena comparison appears after the next build.</p>;
  const ours = new Set(arena.ours.map((l) => l.agentName).filter(Boolean) as string[]);
  return (
    <>
      <p className="max-w-3xl text-ink/85">
        How the models our free chain runs rank on{" "}
        <a href="https://arena.ai/leaderboard" rel="noopener" className="text-accent-ink hover:underline">
          LMArena
        </a>
        , where people vote blind between two answers. The text arena ranks {arena.textTotal} models (published {fmtDate(arena.textDate)}); the agent
        arena ranks {arena.agentTotal} on real agent tasks, with what a task costs (published {fmtDate(arena.agentDate)}).
      </p>
      <div className="mt-6 overflow-x-auto">
        <SortableTable className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">Our free chain&rsquo;s models on the text and agent arenas</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th scope="col" className="py-2 pr-3 font-semibold">Provider</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Model we run</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold whitespace-nowrap">Text arena</th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold whitespace-nowrap">Agent arena</th>
              <th scope="col" className="py-2 text-right font-semibold whitespace-nowrap">Cost a task</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {arena.ours.map((l) => (
              <tr key={l.slug}>
                <th scope="row" className="py-2 pr-3 text-left align-top font-medium text-ink">{l.provider}</th>
                <td className="py-2 pr-3 align-top text-ink/85">
                  {l.model}
                  {l.open ? <span className="ml-1.5 text-xs text-muted">open weights</span> : null}
                </td>
                <td className="py-2 pr-3 text-right align-top tabular-nums text-ink/85">
                  {l.textRank ? (
                    <>
                      #{l.textRank} <span className="text-xs text-muted">of {arena.textTotal} · {l.textRating}</span>
                    </>
                  ) : (
                    <span className="text-muted">not ranked</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right align-top tabular-nums text-ink/85">
                  {l.agentRank ? (
                    <>
                      #{l.agentRank} <span className="text-xs text-muted">of {arena.agentTotal} · {l.agentScore}</span>
                    </>
                  ) : (
                    <span className="text-muted">–</span>
                  )}
                </td>
                <td className="py-2 text-right align-top tabular-nums text-ink/85">{l.agentCost != null ? `$${l.agentCost}` : <span className="text-muted">–</span>}</td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Score against cost: the agent arena</h2>
      <p className="mt-2 max-w-3xl text-ink/85">
        The free models are far from the top, and far cheaper: on our free tiers they cost nothing at all. This is the trade a small business makes
        with free AI agents.
      </p>
      <Pareto all={arena.agentAll} ours={ours} />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {([["Top of the text arena", arena.textTop, "rating"], ["Top of the agent arena", arena.agentTop, "score"]] as const).map(([title, rows, unit]) => (
          <section key={title}>
            <h3 className="text-base font-semibold">{title}</h3>
            <ol className="mt-2 space-y-1 text-sm text-ink/85">
              {rows.map((r) => (
                <li key={r.name} className="flex flex-wrap justify-between gap-x-3">
                  <span>
                    #{r.rank} {r.name} <span className="text-xs text-muted">{r.org}</span>
                  </span>
                  <span className="tabular-nums text-muted">
                    {unit} {r.value}
                    {r.cost != null ? ` · $${r.cost} a task` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted">
        Data: the{" "}
        <a href="https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset" rel="noopener" className="underline">
          LMArena leaderboard dataset
        </a>{" "}
        (CC BY 4.0), read at each build of this site ({fmtDate(arena.at)}). A model we run under another provider&rsquo;s name is matched by hand; &ldquo;not ranked&rdquo;
        means the arena has no entry for that exact model.
      </p>
    </>
  );
}

function TableView({ apis, bySlug, textTotal }: { apis: Api[]; bySlug: Map<string, ArenaLine>; textTotal: number }) {
  const rows = [...apis].sort((a, b) => (a.verdict === b.verdict ? 0 : a.verdict === "usable" ? -1 : 1) || (a.kind === b.kind ? 0 : a.kind === "model" ? -1 : 1));
  const cols = ["Provider", "Verdict", "Status", "Kind", "What is free", "Card", "OpenAI-compatible", "Model we run", "Text arena", "Models the Scout noted", "Our note", "Checked"];
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <SortableTable className="w-full min-w-[78rem] border-collapse text-sm">
        <caption className="sr-only">Every free API we checked, with all its specs</caption>
        <thead className="bg-panel">
          <tr className="border-b border-line text-left text-muted">
            {cols.map((c, i) => (
              <th key={c} scope="col" className={`px-3 py-2 font-semibold whitespace-nowrap ${i === 0 ? "sticky left-0 z-10 bg-panel" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((p) => {
            const a = bySlug.get(p.slug);
            return (
              <tr key={p.slug + p.name} className="align-top">
                <th scope="row" className="sticky left-0 z-10 bg-panel px-3 py-2 text-left font-medium text-ink">
                  {p.url ? (
                    <a href={p.url} rel="noopener noreferrer" target="_blank" className="hover:text-accent-ink hover:underline">
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </th>
                <td className="px-3 py-2 whitespace-nowrap">{p.verdict === "usable" ? "Free" : "Not free"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-ink/85">{p.status || "–"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-ink/85">{p.kind === "tool" ? "Tool" : "AI model"}</td>
                <td className="min-w-[16rem] px-3 py-2 text-ink/85">{p.free || "–"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-ink/85">{p.card || "–"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-ink/85">{p.openai ? "Yes" : "–"}</td>
                <td className="px-3 py-2 text-ink/85">{a?.model ?? "–"}</td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums text-ink/85">{a?.textRank ? `#${a.textRank} of ${textTotal}` : "–"}</td>
                <td className="min-w-[12rem] px-3 py-2 text-ink/85">{p.models.length ? p.models.join(", ") : "–"}</td>
                <td className="min-w-[14rem] px-3 py-2 text-ink/70">{p.note || "–"}</td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums text-muted">{p.decided}</td>
              </tr>
            );
          })}
        </tbody>
      </SortableTable>
    </div>
  );
}

export default function FreeApiTabs({ apis, arena }: { apis: Api[]; arena: ArenaSnapshot | null }) {
  const [tab, setTab] = useState<Tab>("list");
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (TABS.some((t) => t.key === h)) setTab(h as Tab);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  const bySlug = new Map((arena?.ours ?? []).map((l) => [l.slug, l]));
  const pick = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", t === "list" ? window.location.pathname : `#${t}`);
  };
  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Views" className="inline-flex rounded-full border border-line bg-panel p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => pick(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? "bg-accent text-ink" : "text-ink/70 hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="panel-list" aria-labelledby="tab-list" hidden={tab !== "list"} className="mt-6">
        <ListView apis={apis} bySlug={bySlug} />
      </div>
      <div role="tabpanel" id="panel-arena" aria-labelledby="tab-arena" hidden={tab !== "arena"} className="mt-6">
        <ArenaView arena={arena} />
      </div>
      <div role="tabpanel" id="panel-table" aria-labelledby="tab-table" hidden={tab !== "table"} className="mt-6">
        <TableView apis={apis} bySlug={bySlug} textTotal={arena?.textTotal ?? 0} />
      </div>
    </div>
  );
}

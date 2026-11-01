import { priceTicks, shortPrice, type Bars, type Figure, type Growth, type Numbers, type Ranges } from "@/lib/charts";

// "In numbers": an entry's figures drawn, under its short answer (owner, 2026-10-14). Plain HTML and CSS, rendered at
// build time: it reads without JavaScript, in both colour schemes, and search engines and answer engines see the
// numbers as text. Every block names the page its figures came from.

const host = (url: string | null) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function Cite({ source }: { source: string | null }) {
  if (!source) return null;
  return (
    <p className="mt-2 text-xs text-muted">
      Source:{" "}
      <a href={source} rel="noopener" target="_blank" className="text-accent hover:underline">
        {host(source)}
      </a>
    </p>
  );
}

function FigureTile({ f }: { f: Figure }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-3xl font-semibold tracking-tight text-ink tabular-nums">{f.value}</p>
      <p className="mt-1 text-sm text-muted">{f.text}</p>
    </div>
  );
}

function GrowthTile({ g }: { g: Growth }) {
  const years = Number(g.to.year) - Number(g.from.year);
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-sm text-muted">{g.label}</p>
      <div className="mt-1 flex items-end gap-3 text-ink tabular-nums">
        <span className="flex flex-col">
          <span className="text-xl font-semibold">{g.from.value}</span>
          <span className="text-xs text-muted">{g.from.year}</span>
        </span>
        <span aria-hidden className="pb-4 text-muted">→</span>
        <span className="sr-only">to</span>
        <span className="flex flex-col">
          <span className="text-3xl font-semibold tracking-tight">{g.to.value}</span>
          <span className="text-xs text-muted">{g.to.year}</span>
        </span>
      </div>
      {g.multiple ? (
        <p className="mt-1 text-sm text-muted">
          {g.multiple}× in {years} year{years === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}

const TICKS = [0, 25, 50, 75, 100];

/** A ranked bar list on an honest 0-100 % scale: one series, so one colour and no legend (the title names it). Bars are
 * at most 18 px thick with a rounded data end and a square baseline; each value sits at its bar's end in ink, and a
 * hover or focus lifts the row and shows the exact figure. The same data is one click away as a table. */
function BarChart({ b }: { b: Bars }) {
  return (
    <figure className="mt-6">
      <figcaption className="text-sm font-semibold text-ink">{b.title}</figcaption>
      <div className="mt-3" role="list" aria-label={b.title}>
        {b.rows.map((r) => (
          <div
            key={r.label}
            role="listitem"
            tabIndex={0}
            title={`${r.label}: ${r.value}${b.unit}`}
            className="group grid grid-cols-1 items-center gap-x-3 gap-y-0.5 rounded-md px-1 py-1 outline-none hover:bg-line/40 focus-visible:bg-line/40 sm:grid-cols-[minmax(7rem,11rem)_1fr]"
          >
            <span className="truncate text-sm text-ink/85">{r.label}</span>
            <span className="relative flex h-[18px] items-center">
              {/* Hairline gridlines, recessive, behind the bars. */}
              {TICKS.slice(1).map((t) => (
                <span key={t} aria-hidden className="absolute inset-y-[-4px] w-px bg-line" style={{ left: `${t}%` }} />
              ))}
              <span
                className="relative h-[18px] rounded-r-[4px] bg-chart transition-opacity group-hover:opacity-85"
                style={{ width: `${Math.max(0.5, Math.min(100, r.value))}%` }}
              />
              <span className="relative ml-2 text-xs font-medium text-ink tabular-nums">
                {r.value}
                {b.unit}
              </span>
            </span>
          </div>
        ))}
        {/* The scale, under the bars. */}
        <div aria-hidden className="grid grid-cols-1 gap-3 px-1 sm:grid-cols-[minmax(7rem,11rem)_1fr]">
          <span className="hidden sm:block" />
          <span className="relative h-4 border-t border-line text-[10px] text-muted tabular-nums">
            {TICKS.map((t) => (
              <span key={t} className={`absolute top-0.5 ${t === 0 ? "" : t === 100 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${t}%` }}>
                {t}%
              </span>
            ))}
          </span>
        </div>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">Show as a table</summary>
        <table className="mt-2 w-full max-w-md text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-1 font-normal">{b.title}</th>
              <th className="py-1 text-right font-normal">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {b.rows.map((r) => (
              <tr key={r.label}>
                <td className="py-1">{r.label}</td>
                <td className="py-1 text-right">
                  {r.value}
                  {b.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <Cite source={b.source} />
    </figure>
  );
}

const UNIT: Record<string, string> = { "one-off": "one-off price", "per project": "per project" };

/** Price ranges as floating bars on one scale from $0 (creatorCC queue 61): each option's bar runs from its low price to
 *  its high, so a reader sees both the spread and where the options overlap. One series, so one colour and no legend;
 *  the bar's ends are both data, so both are rounded. An open top ("$150,000+") fades out past its last figure. The
 *  prices sit under each label in ink; a hover or focus shows the row, and the same table is one click away. */
function RangeChart({ r }: { r: Ranges }) {
  // An open top ("$150,000+") needs room past its last figure for its fade.
  const ticks = priceTicks(Math.max(...r.rows.map((x) => x.highValue * (x.open ? 1.1 : 1))));
  const top = ticks[ticks.length - 1];
  const pct = (v: number) => `${(v / top) * 100}%`;
  const unit = UNIT[r.unit] ?? r.unit;
  return (
    <figure className="mt-6">
      <figcaption className="text-sm font-semibold text-ink">
        {r.title}
        <span className="ml-2 font-normal text-muted">US$, {unit}</span>
      </figcaption>
      <div className="mt-3" role="list" aria-label={`${r.title}, ${unit}`}>
        {r.rows.map((x) => (
          <div
            key={x.label}
            role="listitem"
            tabIndex={0}
            title={`${x.label}: ${x.low}–${x.high} ${unit}`}
            className="group grid grid-cols-1 items-center gap-x-3 gap-y-1 rounded-md px-1 py-1.5 outline-none hover:bg-line/40 focus-visible:bg-line/40 sm:grid-cols-[minmax(7rem,11rem)_1fr]"
          >
            <span className="min-w-0 text-sm leading-tight">
              <span className="block truncate text-ink/85">{x.label}</span>
              <span className="block text-xs font-medium text-ink tabular-nums">
                {x.low}–{x.high}
              </span>
            </span>
            <span className="relative flex h-[18px] items-center">
              {ticks.slice(1).map((t) => (
                <span key={t} aria-hidden className="absolute inset-y-[-6px] w-px bg-line" style={{ left: pct(t) }} />
              ))}
              <span
                className={`absolute h-[14px] rounded-[4px] bg-chart transition-opacity group-hover:opacity-85 ${x.open ? "rounded-r-none" : ""}`}
                style={{ left: pct(x.lowValue), width: `max(4px, ${pct(x.highValue - x.lowValue)})` }}
              />
              {x.open ? (
                <span
                  aria-hidden
                  className="absolute h-[14px] w-6 rounded-r-[4px] bg-linear-to-r from-chart to-transparent"
                  style={{ left: pct(x.highValue) }}
                />
              ) : null}
            </span>
          </div>
        ))}
        <div aria-hidden className="grid grid-cols-1 gap-3 px-1 sm:grid-cols-[minmax(7rem,11rem)_1fr]">
          <span className="hidden sm:block" />
          <span className="relative h-4 border-t border-line text-[10px] text-muted tabular-nums">
            {ticks.map((t, i) => (
              <span key={t} className={`absolute top-0.5 ${i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: pct(t) }}>
                {shortPrice(t)}
              </span>
            ))}
          </span>
        </div>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">Show as a table</summary>
        <table className="mt-2 w-full max-w-md text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-1 font-normal">{r.title}</th>
              <th className="py-1 text-right font-normal">From</th>
              <th className="py-1 text-right font-normal">To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {r.rows.map((x) => (
              <tr key={x.label}>
                <td className="py-1">{x.label}</td>
                <td className="py-1 text-right">{x.low}</td>
                <td className="py-1 text-right">{x.high}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <Cite source={r.source} />
    </figure>
  );
}

export default function InNumbers({ n }: { n: Numbers }) {
  const tiles = [...n.growth.map((g) => ({ g })), ...n.figures.map((f) => ({ f }))];
  const tileSource = n.growth[0]?.source ?? n.figures[0]?.source ?? null;
  return (
    <section className="mt-8" aria-labelledby="in-numbers">
      <h2 id="in-numbers" className="text-xs font-semibold tracking-wide text-muted uppercase">
        In numbers
      </h2>
      {tiles.length ? (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {tiles.map((t, i) => ("g" in t ? <GrowthTile key={i} g={t.g} /> : <FigureTile key={i} f={t.f} />))}
          </div>
          {!n.bars.length || n.bars[0].source !== tileSource ? <Cite source={tileSource} /> : null}
        </>
      ) : null}
      {n.bars.map((b, i) => (
        <BarChart key={i} b={b} />
      ))}
      {n.ranges.map((r, i) => (
        <RangeChart key={i} r={r} />
      ))}
    </section>
  );
}

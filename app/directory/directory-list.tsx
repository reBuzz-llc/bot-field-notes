"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { areaOf, filterSamples, tradeLabel, TRADE_LABEL, type Sample } from "@/lib/directory";

/** The directory's cards with a trade filter, an area filter and a search box (all in the browser: the list is small). */
export default function DirectoryList({ samples }: { samples: Sample[] }) {
  const [trade, setTrade] = useState("");
  const [area, setArea] = useState("");
  const [q, setQ] = useState("");
  const areas = useMemo(() => [...new Set(samples.map(areaOf).filter(Boolean))].sort(), [samples]);
  const trades = useMemo(() => Object.keys(TRADE_LABEL).filter((t) => samples.some((s) => s.trade === t)), [samples]);
  const shown = filterSamples(samples, { trade, area, q });
  const control = "rounded-lg border border-line bg-panel px-3 py-2 text-sm";
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Trade
          <select value={trade} onChange={(e) => setTrade(e.target.value)} className={control}>
            <option value="">All trades</option>
            {trades.map((t) => (
              <option key={t} value={t}>
                {tradeLabel(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Area
          <select value={area} onChange={(e) => setArea(e.target.value)} className={control}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted">
          Search
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A name, a trade or an area" className={control} />
        </label>
      </div>
      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {shown.length} of {samples.length}
      </p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <li key={s.id} data-sample className="flex flex-col rounded-xl border border-line bg-panel p-4">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{tradeLabel(s.trade)}</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{s.business}</h2>
            {areaOf(s) ? <p className="text-sm text-muted">{areaOf(s)}</p> : null}
            {s.rating !== null ? (
              <p className="mt-1 text-sm">
                <span aria-hidden>★</span> {s.rating.toFixed(1)}
                {s.reviews ? <span className="text-muted"> · {s.reviews} Google review{s.reviews === 1 ? "" : "s"}</span> : null}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={s.url} target="_blank" rel="noopener nofollow" className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold hover:opacity-90" style={{ color: "#1a0d00" }}>
                See the sample site
              </a>
              {s.whatsapp ? (
                <a href={s.whatsapp} target="_blank" rel="noopener nofollow" className="rounded-full border border-[#25D366] px-4 py-1.5 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/10">
                  WhatsApp
                </a>
              ) : null}
            </div>
            <p className="mt-auto pt-3 text-xs text-muted">
              A free sample we made; not the official site.{" "}
              <Link href="/contact" className="text-accent-ink hover:underline">
                Ask us to take it down
              </Link>
              .
            </p>
          </li>
        ))}
      </ul>
      {shown.length === 0 ? <p className="mt-4 text-muted">No sample matches these filters.</p> : null}
    </>
  );
}

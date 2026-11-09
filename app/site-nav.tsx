"use client";

// The site's menus (owner, 2026-11-09, creatorCC queue 383): four items, dropdowns on a wide screen, one stacked list on a
// phone. A click outside or Escape closes them; every item is a plain link, so nothing needs JavaScript to be reached.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavGroup, NavLink } from "@/lib/nav";

function Item({ l, onPick }: { l: NavLink; onPick: () => void }) {
  const cls = "block rounded-md px-3 py-2 text-ink hover:bg-line/40 hover:text-accent-ink";
  return l.external ? (
    <a href={l.href} target="_blank" rel="noopener" className={cls} onClick={onPick} title="Opens in a new tab">
      {l.label}
    </a>
  ) : (
    <Link href={l.href} className={cls} onClick={onPick}>
      {l.label}
    </Link>
  );
}

// the brand orange with near-black text (#ff6600 text on the light page would read at under 3:1)
const HIGHLIGHT = { background: "#ff6600", color: "#1a0d00" } as const;

export default function SiteNav({ nav }: { nav: NavGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && (setOpen(null), setMenu(false));
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setMenu(false));
    document.addEventListener("click", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", away);
      document.removeEventListener("keydown", esc);
    };
  }, []);
  const close = () => {
    setOpen(null);
    setMenu(false);
  };
  return (
    <div ref={ref} className={menu ? "w-full text-sm sm:w-auto" : "text-sm"}>
      {/* wide screens: four items, three with a dropdown */}
      <nav aria-label="Site" className="hidden items-center gap-1 sm:flex">
        {nav.map((g) =>
          g.href ? (
            <Link
              key={g.label}
              href={g.href}
              className={g.highlight ? "rounded-full px-3 py-1 font-semibold hover:opacity-90" : "rounded-md px-3 py-1.5 text-muted hover:text-accent-ink"}
              style={g.highlight ? HIGHLIGHT : undefined}
              onClick={close}
            >
              {g.label}
            </Link>
          ) : (
            <div key={g.label} className="relative">
              <button
                type="button"
                aria-expanded={open === g.label}
                aria-haspopup="true"
                onClick={() => setOpen(open === g.label ? null : g.label)}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 hover:text-accent-ink ${open === g.label ? "text-accent-ink" : "text-muted"}`}
              >
                {g.label}
                <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open === g.label ? "rotate-180" : ""}`} aria-hidden>
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {open === g.label ? (
                <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-line bg-bg p-1 shadow-lg">
                  {(g.links ?? []).map((l) => (
                    <Item key={l.href} l={l} onPick={close} />
                  ))}
                </div>
              ) : null}
            </div>
          ),
        )}
      </nav>
      {/* phones: one button, the four as a stacked list */}
      <div className="sm:hidden">
        <button type="button" aria-expanded={menu} onClick={() => setMenu(!menu)} className="rounded-md border border-line px-3 py-1.5 text-ink">
          {menu ? "Close" : "Menu"}
        </button>
      </div>
      {menu ? (
        <nav aria-label="Site" className="mt-3 w-full border-t border-line pt-3 sm:hidden">
          {nav.map((g) => (
            <div key={g.label} className="mb-3">
              {g.href && g.highlight ? (
                <Link href={g.href} onClick={close} className="mx-3 inline-block rounded-full px-3 py-1.5 font-semibold" style={HIGHLIGHT}>
                  {g.label}
                </Link>
              ) : g.href ? (
                <Item l={{ href: g.href, label: g.label }} onPick={close} />
              ) : (
                <>
                  <p className="px-3 text-xs font-semibold tracking-wide text-muted uppercase">{g.label}</p>
                  {(g.links ?? []).map((l) => (
                    <Item key={l.href} l={l} onPick={close} />
                  ))}
                </>
              )}
            </div>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

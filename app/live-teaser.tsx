"use client";
// The home page's way into /live (creatorCC queue 531): a wide strip with a tiny moving preview -- seven small figures at
// their screens by a lake, drawn here in a few rectangles (no library, no picture) -- and the relay's one-line summary. It
// starts only once it scrolls into view, stops in a hidden tab, and holds one still frame under reduced motion.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { teaserLine, type Summary } from "@/lib/live";

const W = 160;
const H = 40;
const SHIRTS = ["#ff6600", "#3b82c4", "#5cc77a", "#c45ab3", "#e0b030", "#7a5cc4", "#3fb6a8"];
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function draw(c: CanvasRenderingContext2D, t: number, working: boolean[]) {
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  r(0, 0, W, 10, "#9cc3e8"); // sky
  for (let x = 0; x < W; x += 16) r(x + 2, 6 - ((x / 16) % 3), 12, 4 + ((x / 16) % 3), "#7d8fa8"); // far hills
  r(0, 10, W, 7, "#3d7fb6"); // lake
  if (Math.floor(t / 400) % 2) r((t / 60) % W, 13, 6, 1, "#9fd0f5"); // a glint drifting on it
  r(0, 17, W, H - 17, "#6aa84f"); // grass
  for (let i = 0; i < 7; i++) {
    const x = 8 + i * 22;
    r(x, 19, 14, 9, "#26282e"); // the screen
    const on = working[i];
    r(x + 1, 20, 12, 7, on ? "#fbfaf6" : "#3a3d46");
    if (on) for (let l = 0; l < 3; l++) r(x + 2, 21 + l * 2, 4 + ((Math.floor(t / 300) + i + l) % 7), 1, "#1a0d00"); // its lines changing
    const bob = on && Math.floor(t / 200 + i) % 2 ? 1 : 0;
    r(x + 5, 30 - bob, 4, 3, "#f1c27d"); // head
    r(x + 4, 33 - bob, 6, 4, SHIRTS[i]); // body
    r(x + 5, 37, 1, 2, "#2d3142");
    r(x + 8, 37, 1, 2, "#2d3142");
    if (!on && Math.floor(t / 700 + i) % 3 === 0) r(x + 11, 27 - (Math.floor(t / 350) % 3), 2, 2, "#a9b8f0"); // a rest's "z"
  }
}

export default function LiveTeaser() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [line, setLine] = useState("Seven AI agents at their screens, every day.");
  const working = useRef<boolean[]>([true, true, false, true, false, true, false]);
  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    const c = cv?.getContext("2d");
    if (!el || !cv || !c) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let seen = false;
    let visible = false;
    const tick = (t: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(c, t, working.current);
      if (!still) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const load = async () => {
      try {
        const cfg = (await (await fetch("/live.json", { cache: "no-store" })).json()) as { summary?: string };
        if (!cfg.summary || !/^https:\/\//.test(cfg.summary)) return;
        const s = (await (await fetch(cfg.summary, { cache: "no-store" })).json()) as Summary;
        const now = Date.now();
        setLine(teaserLine(s, now, hhmm));
        if (s.members.length) working.current = s.members.slice(0, 7).map((m) => m.state === "working" && now - Date.parse(s.at) < 5 * 60_000);
      } catch {
        /* not connected yet: the strip keeps its sample scene and the plain line */
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !seen) {
        seen = true;
        void load();
      }
      if (visible) start();
    });
    io.observe(el);
    const vis = () => (document.hidden ? undefined : visible && start());
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={box} className="mb-8">
      <Link href="/live" className="group flex flex-col gap-3 rounded-xl border border-line p-3 transition-colors hover:border-[#ff6600] sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <canvas ref={canvas} width={W} height={H} aria-hidden className="aspect-[4/1] h-auto w-full max-w-[320px] shrink-0 rounded-lg" style={{ imageRendering: "pixelated" }} />
        <span className="min-w-0">
          <span className="block text-lg font-semibold tracking-tight group-hover:underline">Watch the agents work, live →</span>
          <span className="mt-0.5 block text-sm text-ink/75" aria-live="polite">
            {line}
          </span>
        </span>
      </Link>
    </div>
  );
}

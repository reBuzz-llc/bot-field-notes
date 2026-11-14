"use client";
// The world in a frame (creatorCC queue 531): public/live-world.html, built from the dashboard's read-only world, reading the
// relay's snapshot. The frame tells this page its height, so the page scrolls, never the frame.
import { useEffect, useRef, useState } from "react";

export default function LiveFrame() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== ref.current?.contentWindow) return;
      const d = e.data as { type?: string; height?: number };
      if (d?.type === "world-live-height" && typeof d.height === "number" && d.height > 100) setHeight(Math.ceil(d.height));
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);
  return (
    <iframe
      ref={ref}
      src="/live-world.html"
      title="The agents' world, live and read-only"
      className="mt-6 block w-full rounded-xl border border-line bg-white"
      style={{ height: height ?? "min(75vw, 760px)" }}
    />
  );
}

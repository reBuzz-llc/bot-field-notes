import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// The picture a link to the site shows in social posts and chat apps (2026-10-10: there was none). Built once, at build time.
export const dynamic = "force-static";
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0f1115",
          color: "#f4f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, color: "#8ab4ff", letterSpacing: 2 }}>{SITE.name.toUpperCase()}</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{SITE.tagline}</div>
        <div style={{ fontSize: 28, color: "#a3a8b3" }}>Online ordering · POS · AI agents · local marketing · free AI tools — with sources</div>
      </div>
    ),
    size,
  );
}

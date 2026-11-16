import type { NextConfig } from "next";

// A fully static site: every page is built ahead of time from content/posts.json, so Vercel serves plain
// files and there is no server to reach the bots (they stay on the owner's Mac).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages (creatorCC queue 560 b) builds with NEXT_PUBLIC_TRAILING_SLASH=1: each page is its folder's index.html,
  // so /posts/x resolves one way on any static host (with x.html beside an x/ folder of page data, a host may pick either)
  trailingSlash: process.env.NEXT_PUBLIC_TRAILING_SLASH === "1",
  // a dev check on its own folder (NEXT_DIST_DIR), so it never meets the publish job's build
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

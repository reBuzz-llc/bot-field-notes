import type { NextConfig } from "next";

// A fully static site: every page is built ahead of time from content/posts.json, so Vercel serves plain
// files and there is no server to reach the bots (they stay on the owner's Mac).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  // a dev check on its own folder (NEXT_DIST_DIR), so it never meets the publish job's build
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

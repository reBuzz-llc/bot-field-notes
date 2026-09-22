import type { MetadataRoute } from "next";
import { canonical } from "@/lib/site";

export const dynamic = "force-static";

// Everything here is meant to be read, by people and by machines alike, including the AI crawlers: the
// site exists to be quoted, so they are allowed rather than blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: canonical("/sitemap.xml"),
    host: canonical("/"),
  };
}

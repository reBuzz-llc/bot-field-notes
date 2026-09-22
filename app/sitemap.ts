import type { MetadataRoute } from "next";
import { ALL_POSTS } from "@/lib/posts";
import { canonical } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const newest = ALL_POSTS[0]?.date ?? new Date().toISOString();
  return [
    { url: canonical("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: canonical("/bots"), lastModified: newest, changeFrequency: "daily", priority: 0.8 },
    { url: canonical("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: canonical("/free-ai-apis"), changeFrequency: "weekly", priority: 0.7 },
    { url: canonical("/contact"), changeFrequency: "monthly", priority: 0.5 },
    ...ALL_POSTS.map((p) => ({
      url: canonical(`/posts/${p.slug}`),
      lastModified: p.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

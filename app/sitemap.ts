import type { MetadataRoute } from "next";
import { ALL_BOTS, ALL_POSTS, indexable } from "@/lib/posts";
import { TOPICS, postsInTopic, topicPath } from "@/lib/topics";
import { agentPath, canonical } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const newest = ALL_POSTS[0]?.date ?? new Date().toISOString();
  return [
    { url: canonical("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    { url: canonical("/bots"), lastModified: newest, changeFrequency: "daily", priority: 0.8 },
    { url: canonical("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: canonical("/free-ai-apis"), changeFrequency: "weekly", priority: 0.7 },
    { url: canonical("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: canonical("/topics"), lastModified: newest, changeFrequency: "daily", priority: 0.8 },
    ...TOPICS.filter((t) => postsInTopic(t.slug).length).map((t) => ({
      url: canonical(topicPath(t.slug)),
      lastModified: postsInTopic(t.slug)[0]?.date ?? newest,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...ALL_BOTS.map((b) => ({ url: canonical(agentPath(b.slug)), lastModified: b.latest ?? newest, changeFrequency: "daily" as const, priority: 0.7 })),
    // Lead Gen's notes are kept out of search (owner, 2026-10-10), so out of the sitemap too.
    ...ALL_POSTS.filter(indexable).map((p) => ({
      url: canonical(`/posts/${p.slug}`),
      lastModified: p.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

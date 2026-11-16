// Old session posts' addresses and where each went (creatorCC queue 558): one generated list, content/moved.json (written by
// scripts/build-blog.py). The static export makes a small page per old address -- a canonical link and an instant
// refresh to the post -- so the same output serves on a plain static host, with no server redirects. Pure.
import moved from "@/content/moved.json";

const MOVED = moved as Record<string, string>;

/** Where an old post's address went ("/posts/<new>"), or null when it is no old address. */
export const movedTo = (slug: string): string | null => (Object.prototype.hasOwnProperty.call(MOVED, slug) ? MOVED[slug] : null);
/** Every old address's slug. */
export const MOVED_SLUGS = Object.keys(MOVED);

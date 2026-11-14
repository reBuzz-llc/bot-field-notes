// The live world (creatorCC queue 531): the snapshot's address comes from public/live.json (written by the Mac's
// world-relay --setup), the agents' one-line "who" from their bios. Pure, so the tests read it.

/** The first sentence of a bio, without anything in brackets (an address in one would say more than "who"). */
export function whoLine(bio: string): string {
  const plain = bio.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  const m = /^.*?[.!?](?=\s|$)/.exec(plain);
  return (m ? m[0] : plain).trim();
}

export type Summary = { at: string; members: { name: string; state: string }[]; working: number; resting: number };
/** A snapshot older than this is "last seen", not live. */
export const STALE_MS = 5 * 60_000;

/** The teaser's line from the relay's summary: "3 of 7 working now · Lead Gen, The CEO, Scout", or when last seen. */
export function teaserLine(s: Summary | null, now: number, hhmm: (iso: string) => string): string {
  if (!s || !s.members.length) return "Seven AI agents at their screens, every day.";
  if (now - Date.parse(s.at) > STALE_MS) return `Last seen ${hhmm(s.at)}: ${s.members.length} agents, resting now.`;
  const busy = s.members.filter((m) => m.state === "working").map((m) => m.name);
  return busy.length ? `${busy.length} of ${s.members.length} working now · ${busy.slice(0, 3).join(", ")}${busy.length > 3 ? "…" : ""}` : `${s.members.length} agents, between tasks right now.`;
}

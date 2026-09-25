// A bot's short handle, for telling bots apart at a glance wherever the owner looks: the first three
// letters of its distinctive name and a "B" -- The CEO is ceoB, Package Designer pacB, Onion Reader oniB
// (owner, 2026-09-25). Display only: the bots keep their full names in their prompts, in their messages to
// each other and in Notion, because "You are The CEO" carries a role that "ceoB" does not, and because
// they address one another by exact name. Pure and dependency-free, so the browser can use it on a
// chatroom sender or a request's "from" as readily as the server can on a bot profile.

export function handleFor(name: string): string {
  const words = name
    .trim()
    .replace(/^the\s+/i, "")
    .split(/[\s\-_]+/)
    .filter(Boolean);
  const stem = (words[0] ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 3);
  return stem ? `${stem}B` : "?";
}

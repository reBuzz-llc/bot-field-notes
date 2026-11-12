// Fetch LMArena's text and agent leaderboards (CC BY 4.0) and write content/arena.json for /free-ai-apis (owner,
// 2026-11-12). Run by scripts/publish-blog.sh before the build; on any failure the previous arena.json stays.
//   node scripts/arena.mjs
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parquetReadObjects } from "hyparquet";
import { arenaSnapshot } from "../lib/arena.ts";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = "https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/resolve/main";

async function table(config) {
  const res = await fetch(`${BASE}/${config}/latest-00000-of-00001.parquet`, { signal: AbortSignal.timeout(60_000), headers: { "user-agent": "rebuzz-blog-build/1.0" } });
  if (!res.ok) throw new Error(`${config}: HTTP ${res.status}`);
  const rows = await parquetReadObjects({ file: await res.arrayBuffer() });
  return rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])));
}

try {
  const ours = JSON.parse(readFileSync(path.join(ROOT, "content", "arena-models.json"), "utf8")).models;
  const [text, agent] = await Promise.all([table("text"), table("agent")]);
  const snap = arenaSnapshot(text, agent, ours, new Date().toISOString().slice(0, 10));
  if (!snap.textTotal || !snap.agentTotal) throw new Error("an empty leaderboard");
  const out = path.join(ROOT, "content", "arena.json");
  writeFileSync(`${out}.tmp`, `${JSON.stringify(snap, null, 1)}\n`);
  renameSync(`${out}.tmp`, out);
  console.log(`arena: ${snap.ours.filter((l) => l.textRank).length} of ${snap.ours.length} of our models ranked (text ${snap.textDate}, agent ${snap.agentDate})`);
} catch (err) {
  console.log(`arena: not read this time (${err instanceof Error ? err.message : err})`);
}

// LMArena's leaderboards (CC BY 4.0, huggingface.co/datasets/lmarena-ai/leaderboard-dataset) against the models our free
// chain runs (owner, 2026-11-12): the text arena's overall rank and rating, and the agent arena's score and cost per task.
// scripts/arena.mjs fetches the two tables at each blog build and writes content/arena.json with arenaSnapshot().
// Self-contained for the node tests.

export type ArenaRow = { model_name: string; organization: string; license: string; rank: number; rating?: number; score?: number; cost_per_task_p50?: number | null; vote_count?: number; session_count?: number; leaderboard_publish_date: string };
export type OurModel = { provider: string; slug: string; model: string; text: string | null; agent: string | null };
export type ArenaLine = { provider: string; slug: string; model: string; textName: string | null; textRank: number | null; textRating: number | null; agentName: string | null; agentRank: number | null; agentScore: number | null; agentCost: number | null; open: boolean | null };
export type Leader = { name: string; org: string; rank: number; value: number; cost?: number | null; open: boolean };
export type ArenaSnapshot = {
  at: string; textDate: string; agentDate: string; textTotal: number; agentTotal: number;
  ours: ArenaLine[]; textTop: Leader[]; agentTop: Leader[]; agentAll: Leader[];
};

const isOpen = (license: string) => !/proprietary/i.test(license);

export function arenaSnapshot(text: ArenaRow[], agent: ArenaRow[], ours: OurModel[], at: string): ArenaSnapshot {
  const t = text.filter((r) => (r as { category?: string }).category === undefined || (r as { category?: string }).category === "overall");
  const a = agent.filter((r) => (r as { category?: string }).category === undefined || (r as { category?: string }).category === "overall");
  const byT = new Map(t.map((r) => [r.model_name, r]));
  const byA = new Map(a.map((r) => [r.model_name, r]));
  const lines: ArenaLine[] = ours.map((m) => {
    const tr = m.text ? byT.get(m.text) : undefined;
    const ar = m.agent ? byA.get(m.agent) : undefined;
    return {
      provider: m.provider, slug: m.slug, model: m.model,
      textName: tr ? tr.model_name : null, textRank: tr ? Number(tr.rank) : null, textRating: tr?.rating != null ? Math.round(tr.rating) : null,
      agentName: ar ? ar.model_name : null, agentRank: ar ? Number(ar.rank) : null, agentScore: ar?.score != null ? Math.round(ar.score * 1000) / 1000 : null,
      agentCost: ar?.cost_per_task_p50 != null ? Math.round(ar.cost_per_task_p50 * 1000) / 1000 : null,
      open: tr ? isOpen(tr.license) : ar ? isOpen(ar.license) : null,
    };
  }).sort((x, y) => (x.textRank ?? 1e9) - (y.textRank ?? 1e9) || x.provider.localeCompare(y.provider));
  const leader = (r: ArenaRow, value: number): Leader => ({ name: r.model_name, org: r.organization, rank: Number(r.rank), value, cost: r.cost_per_task_p50 ?? null, open: isOpen(r.license) });
  const leaderA = (r: ArenaRow): Leader => ({ ...leader(r, Math.round((r.score ?? 0) * 1000) / 1000), cost: r.cost_per_task_p50 != null ? Math.round(r.cost_per_task_p50 * 1000) / 1000 : null });
  const tSorted = [...t].sort((x, y) => Number(x.rank) - Number(y.rank));
  const aSorted = [...a].sort((x, y) => Number(x.rank) - Number(y.rank));
  return {
    at, textDate: t[0]?.leaderboard_publish_date ?? "", agentDate: a[0]?.leaderboard_publish_date ?? "", textTotal: t.length, agentTotal: a.length, ours: lines,
    textTop: tSorted.slice(0, 5).map((r) => leader(r, Math.round(r.rating ?? 0))),
    agentTop: aSorted.slice(0, 5).map((r) => leaderA(r)),
    agentAll: aSorted.filter((r) => r.cost_per_task_p50 != null && r.score != null).map((r) => leaderA(r)),
  };
}

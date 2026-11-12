import { test } from "node:test";
import assert from "node:assert/strict";
import { arenaSnapshot } from "../lib/arena.ts";

const text = [
  { model_name: "Frontier X (High)", organization: "lab", license: "Proprietary", rank: 1, rating: 1538.4, category: "overall", leaderboard_publish_date: "2026-11-09" },
  { model_name: "gpt-oss-120b", organization: "openai", license: "Apache 2.0", rank: 197, rating: 1365.47, category: "overall", leaderboard_publish_date: "2026-11-09" },
  { model_name: "gpt-oss-120b", organization: "openai", license: "Apache 2.0", rank: 3, rating: 1500, category: "coding", leaderboard_publish_date: "2026-11-09" },
];
const agent = [
  { model_name: "Frontier X (Max)", organization: "lab", license: "Proprietary", rank: 1, score: 0.30353, cost_per_task_p50: 7.4317629, leaderboard_publish_date: "2026-11-11" },
  { model_name: "Mistral Large 4", organization: "mistral", license: "Apache 2.0", rank: 44, score: -0.0541, cost_per_task_p50: 0.320368762, leaderboard_publish_date: "2026-11-11" },
];
const ours = [
  { provider: "Groq", slug: "groq", model: "gpt-oss-120b", text: "gpt-oss-120b", agent: null },
  { provider: "Speka", slug: "speka", model: "mistral-large-4", text: "Mistral Large 4", agent: "Mistral Large 4" },
  { provider: "Z.ai", slug: "zai", model: "glm-4.5-flash", text: null, agent: null },
];

test("our models on the overall text board and the agent board; unranked ones last; leaders and the scatter's points", () => {
  const s = arenaSnapshot(text, agent, ours, "2026-11-12");
  assert.deepEqual([s.textTotal, s.agentTotal, s.textDate, s.agentDate], [2, 2, "2026-11-09", "2026-11-11"]);
  assert.deepEqual(s.ours.map((l: { slug: string; textRank: number | null }) => [l.slug, l.textRank]), [["groq", 197], ["speka", null], ["zai", null]]);
  const groq = s.ours[0];
  assert.deepEqual([groq.textRating, groq.open, groq.agentRank], [1365, true, null]);
  const speka = s.ours.find((l: { slug: string }) => l.slug === "speka")!;
  assert.deepEqual([speka.agentRank, speka.agentScore, speka.agentCost], [44, -0.054, 0.32]);
  assert.deepEqual(s.agentTop[0], { name: "Frontier X (Max)", org: "lab", rank: 1, value: 0.304, cost: 7.432, open: false });
  assert.equal(s.agentAll.length, 2);
  assert.equal(s.textTop[0].value, 1538);
});

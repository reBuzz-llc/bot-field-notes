// The "In numbers" tiles read from a post's text (creatorCC queue 61): node --experimental-strip-types --test tests/*.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { numbersOf } from "../lib/charts.ts";
import type { Post } from "../lib/posts.ts";

const post = (body: string, summary = "A summary with no figures.") =>
  ({ summary, sources: [], findings: [{ title: "Note", body, source: "https://pemlix.com/blog/cost" }] }) as unknown as Post;

test("a range is its own figure, never skipped for the next sentence's (package-designer-week-2026-10-12)", () => {
  const n = numbersOf(
    post(
      "Typical SMB benefits include order processing time reduced by 25-35%, support ticket resolution time cut by 20%, and revenue leakage from billing errors lowered by 15%.",
    ),
  );
  assert.deepEqual(
    n.figures.map((f) => [f.value, f.text]),
    [
      ["25–35%", "order processing time reduced"],
      ["20%", "support ticket resolution time cut"],
      ["15%", "revenue leakage from billing errors lowered"],
    ],
  );
});

test("the words before 'by' name what changed and hold no other figure", () => {
  const n = numbersOf(post("Lead enrichment can improve conversion rates by 25%, and shorten sales cycles by 25%. Costs were reduced in 2025 by 20%."));
  assert.deepEqual(n.figures, []);
  const m = numbersOf(post("Automation reduced support costs by 30%."));
  assert.deepEqual(
    m.figures.map((f) => [f.value, f.text]),
    [["30%", "Automation reduced support costs"]],
  );
});

test("the top of a range is not a share: '25-35% of' is no '35% of'", () => {
  assert.deepEqual(numbersOf(post("Between 25-35% of small businesses use a chatbot.")).figures, []);
  assert.deepEqual(
    numbersOf(post("About 62% of small businesses use a chatbot.")).figures.map((f) => [f.value, f.text]),
    [["62%", "of small businesses use a chatbot"]],
  );
});

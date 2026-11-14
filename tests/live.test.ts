// Run: npm test. The live world's page and the home page's strip (creatorCC queue 531).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { teaserLine, whoLine } from "../lib/live.ts";

test("who each agent is: the bio's first sentence, nothing in brackets", () => {
  assert.equal(whoLine("The CEO of Example Co (example.co.xx), a remote agency, run by its owner. It sets goals."), "The CEO of Example Co, a remote agency, run by its owner.");
  assert.equal(whoLine("No full stop here"), "No full stop here");
  for (const b of JSON.parse(readFileSync(path.join(import.meta.dirname, "..", "content", "bots.json"), "utf8")) as { bio: string }[]) assert.doesNotMatch(whoLine(b.bio), /\.(np|com|org|net)\b|\(/);
});

test("the teaser's line: who works now, or when the agents were last seen", () => {
  const hhmm = (iso: string) => iso.slice(11, 16);
  const s = { at: "2026-11-14T10:00:00Z", members: [{ name: "Lead Gen", state: "working" }, { name: "Scout", state: "resting until 11:00" }, { name: "The CEO", state: "working" }], working: 2, resting: 1 };
  assert.equal(teaserLine(s, Date.parse("2026-11-14T10:01:00Z"), hhmm), "2 of 3 working now · Lead Gen, The CEO");
  assert.equal(teaserLine(s, Date.parse("2026-11-14T10:09:00Z"), hhmm), "Last seen 10:00: 3 agents, resting now.");
  assert.equal(teaserLine(null, 0, hhmm), "Seven AI agents at their screens, every day.");
  assert.equal(teaserLine({ ...s, members: s.members.map((m) => ({ ...m, state: "idle" })) }, Date.parse("2026-11-14T10:01:00Z"), hhmm), "3 agents, between tasks right now.");
});

test("the world's frame is built and reads the relay; /live credits pixelfx", () => {
  const html = path.join(import.meta.dirname, "..", "public", "live-world.html");
  assert.ok(existsSync(html), "run: node ~/bots/webapp/scripts/world-public-build.mjs --live");
  const text = readFileSync(html, "utf8");
  assert.match(text, /\/live\.json/);
  const page = readFileSync(path.join(import.meta.dirname, "..", "app", "live", "page.tsx"), "utf8");
  assert.match(page, /pixelfx/);
  assert.match(page, /\(MIT\)/);
});

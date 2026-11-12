// Re-recorded media get a new file name each time (owner, 2026-11-12: a browser kept the old demo GIF from its cache).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const ramen = readFileSync(new URL("../lib/ramen.ts", import.meta.url), "utf8");

test("the demo GIF has a dated name, its file is there, and no undated copy is left", () => {
  const gif = ramen.match(/DEMO_GIF = "\/([^"]+)"/)?.[1] ?? "";
  assert.match(gif, /^ramen-agents-world-\d{4}-\d{2}-\d{2}\.gif$/);
  assert.ok(existsSync(new URL(`../public/${gif}`, import.meta.url)), `public/${gif} is missing`);
  const worlds = readdirSync(new URL("../public/", import.meta.url)).filter((f) => f.startsWith("ramen-agents-world"));
  assert.deepEqual(worlds, [gif], "one world GIF in public/: the current one");
});

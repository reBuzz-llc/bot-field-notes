import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { sortOrder, sortValue } from "../lib/sort-value.ts";

test("cells sort by value, empties last", () => {
  const xs = ["#93", "#22", "not ranked", "#136"];
  assert.deepEqual(sortOrder(xs.map(sortValue), "asc").map((i: number) => xs[i]), ["#22", "#93", "#136", "not ranked"]);
  const c = ["$0.32", "–", "$0.122"];
  assert.deepEqual(sortOrder(c.map(sortValue), "desc").map((i: number) => c[i]), ["$0.32", "$0.122", "–"]);
});

async function files(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

test("every table on the blog is a SortableTable (owner, 2026-11-12: now and in the future)", async () => {
  const root = path.join(import.meta.dirname, "..", "app");
  const bare: string[] = [];
  for (const f of await files(root)) {
    if (f.endsWith("sortable-table.tsx")) continue;
    (await readFile(f, "utf8")).split("\n").forEach((line, i) => {
      if (/<table[\s>]/.test(line) && !/data-nosort/.test(line)) bare.push(`${path.relative(root, f)}:${i + 1}`);
    });
  }
  assert.deepEqual(bare, [], "use <SortableTable> from app/sortable-table.tsx");
});

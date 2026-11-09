// The four menus and the sample-site directory (creatorCC queue 383).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNav, navHrefs } from "../lib/nav.ts";
import { areaOf, filterSamples, itemList, safe, type Sample } from "../lib/directory.ts";

test("the menus, and no page the old row of links reached is lost", () => {
  const nav = buildNav("/family-week/2026-11-08");
  assert.deepEqual(nav.map((g) => g.label), ["Journal", "Projects", "Directory", "About", "Free AI APIs"]);
  assert.equal(nav.find((g) => g.label === "Free AI APIs")?.highlight, true);
  const hrefs = navHrefs(nav);
  for (const old of ["/bots", "/topics", "/free-ai-apis", "/about", "/contact", "/requests", "/feed.xml"]) assert.ok(hrefs.includes(old), old);
  for (const added of ["/ramen-agents", "/family-week/2026-11-08", "/directory", "/privacy", "/brochure"]) assert.ok(hrefs.includes(added), added);
  assert.ok(!navHrefs(buildNav(null)).some((h) => h.startsWith("/family-week")));
});

const A: Sample = { id: "a", business: "Cobot Bakery", trade: "restaurant", city: "Queens", state: "NY", rating: 4.6, reviews: 212, url: "https://cobot.pages.dev", whatsapp: "https://wa.me/17185551000", updated_at: "" };
const B: Sample = { id: "b", business: "Alpha Salon", trade: "salon", city: "Brooklyn", state: "NY", rating: null, reviews: null, url: "https://alpha.pages.dev", whatsapp: null, updated_at: "" };

test("a card's area is the city and state, never more; unsafe rows are dropped", () => {
  assert.equal(areaOf(A), "Queens, NY");
  assert.equal(areaOf({ city: null, state: "NY" }), "NY");
  assert.equal(safe({ ...A, url: "http://cobot.example" }), false);
  assert.equal(safe({ ...A, business: 3 }), false);
  assert.equal(safe(A), true);
});

test("filters by trade, area and search", () => {
  assert.deepEqual(filterSamples([A, B], { trade: "salon" }).map((s) => s.id), ["b"]);
  assert.deepEqual(filterSamples([A, B], { area: "Queens, NY" }).map((s) => s.id), ["a"]);
  assert.deepEqual(filterSamples([A, B], { q: "bake" }).map((s) => s.id), ["a"]);
  assert.deepEqual(filterSamples([A, B], { q: "brooklyn" }).map((s) => s.id), ["b"]);
  assert.equal(filterSamples([A, B], {}).length, 2);
});

test("ItemList structured data: each a LocalBusiness with its area and the sample's address, no street", () => {
  const ld = itemList([A, B], "https://blog.example/directory");
  assert.equal(ld.numberOfItems, 2);
  const first = ld.itemListElement[0].item as Record<string, unknown>;
  assert.deepEqual(first.address, { "@type": "PostalAddress", addressLocality: "Queens", addressRegion: "NY" });
  assert.deepEqual(first.aggregateRating, { "@type": "AggregateRating", ratingValue: 4.6, reviewCount: 212 });
  assert.equal("aggregateRating" in (ld.itemListElement[1].item as object), false);
  assert.ok(!JSON.stringify(ld).includes("streetAddress"));
});

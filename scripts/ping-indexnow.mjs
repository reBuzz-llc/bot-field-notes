// Tell IndexNow which pages are new or changed, so Bing (and Yandex, Seznam, Naver) crawl them within
// hours instead of whenever they next look. No account and no sign-in: the key in the request is proved
// by the matching file at the site root. Google does not take part — it learns from the sitemap.
//
//   node scripts/ping-indexnow.mjs          # the index, the agents page, the API list, newest 20 entries
//   node scripts/ping-indexnow.mjs --all    # every entry, worth doing once
import { readFileSync } from "node:fs";

const HOST = "rebot-omega.vercel.app";
const KEY = readFileSync(new URL("../lib/indexnow.ts", import.meta.url), "utf8").match(/"([0-9a-f]{32})"/)?.[1];
if (!KEY) throw new Error("no IndexNow key in lib/indexnow.ts");

const posts = JSON.parse(readFileSync(new URL("../content/posts.json", import.meta.url), "utf8"));
const all = process.argv.includes("--all");
const urlList = [
  `https://${HOST}/`,
  `https://${HOST}/bots`,
  `https://${HOST}/free-ai-apis`,
  `https://${HOST}/about`,
  `https://${HOST}/contact`,
  ...(all ? posts : posts.slice(0, 20)).map((p) => `https://${HOST}/posts/${p.slug}`),
];

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
// 200 or 202 means accepted; 403 means the key file is not reachable at the root.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);

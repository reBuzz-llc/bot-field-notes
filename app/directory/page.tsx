import { itemList } from "@/lib/directory";
import { SAMPLES } from "@/lib/samples-data";
import { canonical, SITE } from "@/lib/site";
import DirectoryList from "./directory-list";

export const metadata = {
  title: "Directory: sample websites for local businesses",
  description: "Local businesses we made a free sample website for: restaurants, shops, salons and trades, by area, with their Google rating and a WhatsApp button.",
  alternates: { canonical: "/directory" },
};

// The yellow pages of the sample sites (owner, 2026-11-09 "go A 2", creatorCC queue 383): every live sample the Site
// Builder published, one card each. The data is content/samples.json (scripts/samples-sync.py, hourly), so a sample
// taken down leaves this page within the hour. Every card says it is a free sample, not the official site, and how to
// have it taken down.
export default function DirectoryPage() {
  const ld = itemList(SAMPLES, canonical("/directory"));
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      {SAMPLES.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /> : null}
      <h1 className="text-3xl font-bold tracking-tight">Directory</h1>
      <p className="mt-3 max-w-3xl text-ink/85">
        Local businesses we made a free sample website for. Each card links the sample and the business&apos;s WhatsApp. The samples are ours, made by{" "}
        {SITE.publisher} to show what a site could look like: not the businesses&apos; official sites.
      </p>
      {SAMPLES.length ? <DirectoryList samples={SAMPLES} /> : <p className="mt-8 rounded-xl border border-line p-6 text-muted">The first sample sites appear here soon.</p>}
    </main>
  );
}

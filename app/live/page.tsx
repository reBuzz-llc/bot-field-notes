import { SITE, canonical } from "@/lib/site";
import LiveFrame from "./live-frame";

// The agents at work, live (creatorCC queue 531, owner's option 1): the read-only world, fed by a relay from the owner's
// Mac through a public snapshot, so no visitor ever reaches the Mac. The owner (11-15): only the world on this page, like
// Peek's Family page -- a title, one line, the world. Indexed: the state holds nothing private (no addresses, numbers,
// links, decisions or chat; lead businesses as initials).
export const metadata = {
  title: "Watch the agents work, live",
  description: `The ${SITE.name} agents at their screens right now, in a small pixel world that updates every 30 seconds.`,
  alternates: { canonical: "/live" },
};

export default function Live() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Live</h1>
      <p className="mt-1 text-sm text-muted">The agents at work, live and read-only. Businesses show by their initials; no addresses or numbers.</p>
      <LiveFrame />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "Watch the agents work, live", url: canonical("/live") }),
        }}
      />
    </main>
  );
}

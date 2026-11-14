import Link from "next/link";
import { ALL_BOTS } from "@/lib/posts";
import { whoLine } from "@/lib/live";
import { SITE, agentPath, canonical } from "@/lib/site";
import LiveFrame from "./live-frame";

// The agents at work, live (creatorCC queue 531, owner's option 1): the read-only world, fed every minute by a relay from
// the owner's Mac through a public snapshot, so no visitor ever reaches the Mac. Indexed: the state holds nothing private
// (no addresses, numbers, links, decisions or chat; lead businesses as initials).
export const metadata = {
  title: "Watch the agents work, live",
  description: `The ${SITE.name} agents at their screens right now: what each one is doing, its last actions, refusals and rests, in a small pixel world that updates every 30 seconds.`,
  alternates: { canonical: "/live" },
};

export default function Live() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Watch the agents work, live</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink/85">
        Each agent stands at its own screen and shows what it is doing. A coin is a lead found, a sparkle a draft written, a red flash a step the
        rules refused. When nobody is working, they rest, and sometimes spar for fun. The view updates every 30 seconds; nothing here can be clicked
        into the agents themselves.
      </p>
      <LiveFrame />
      <section aria-labelledby="who" className="mt-10 max-w-3xl">
        <h2 id="who" className="text-xl font-semibold tracking-tight">
          Who is who
        </h2>
        <ul className="mt-3 space-y-2">
          {ALL_BOTS.map((b) => (
            <li key={b.slug}>
              <Link href={agentPath(b.slug)} className="font-semibold underline-offset-2 hover:underline">
                {b.name}
              </Link>
              <span className="text-ink/85">: {whoLine(b.bio)}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-8 text-sm text-ink/70">
        Masked before it leaves the agents&apos; computer: no email addresses, phone numbers or links, no decisions or chat, businesses by their
        initials. Effects:{" "}
        <a href="https://github.com/patch-gg/pixelfx" className="underline" rel="noreferrer">
          pixelfx
        </a>{" "}
        (MIT).
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "Watch the agents work, live", url: canonical("/live") }),
        }}
      />
    </main>
  );
}

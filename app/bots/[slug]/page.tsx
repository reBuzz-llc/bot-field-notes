import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_BOTS } from "@/lib/posts";
import { TRAILING, agentPath } from "@/lib/site";

// The agents' old addresses, /bots/<slug> (creatorCC queue 560 b): a small static page each that sends the reader to
// /agents/<slug> -- the redirect vercel.json held, now in the build itself so it serves on a plain static host too.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_BOTS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return { title: "Moved", robots: { index: false, follow: true }, alternates: { canonical: agentPath(slug) } };
}

export default async function MovedAgent(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  if (!ALL_BOTS.some((b) => b.slug === slug)) notFound();
  const to = agentPath(slug);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      {/* React puts the refresh in the head: the reader goes straight on, also on a host with no redirects */}
      <meta httpEquiv="refresh" content={`0; url=${TRAILING ? `${to}/` : to}`} />
      <p>
        This agent&apos;s page moved: <Link href={to} className="text-accent-ink underline">read it here</Link>.
      </p>
    </main>
  );
}

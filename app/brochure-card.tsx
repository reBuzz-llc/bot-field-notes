// The ramen-agents brochure (owner, 2026-11-05): its preview and a download button, on the home page and on About.
// The PDF and the preview live in public/; the source is ~/bots/docs/brochure/. The preview opens /brochure (queue 384).
import { BROCHURE, BROCHURE_PDF } from "@/lib/ramen";

export default function BrochureCard({ id, className = "" }: { id?: string; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id ?? "brochure"}-title`} className={`max-w-3xl rounded-xl border border-line p-4 sm:flex sm:items-center sm:gap-5 ${className}`}>
      <a href={BROCHURE} className="block shrink-0 sm:w-64" aria-label="Open the brochure">
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed preview of the PDF beside it */}
        <img
          src="/ramen-agents-brochure.jpg"
          alt="The ramen-agents tri-fold brochure, outside: the fence, $0 a month, and the cover 'Your first team. Free.'"
          width={1056}
          height={816}
          
          className="h-auto w-full rounded-lg"
        />
      </a>
      <div className="mt-3 sm:mt-0">
        <h2 id={`${id ?? "brochure"}-title`} className="text-lg font-semibold tracking-tight">
          The ramen-agents brochure
        </h2>
        <p className="mt-1.5 text-ink/85">
          The agents behind this journal are open source as ramen-agents: a small family of web agents that runs on free
          model tiers and keyless search. A tri-fold to print or share, US Letter, two pages.
        </p>
        <a
          href={BROCHURE_PDF}
          download
          className="mt-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold hover:opacity-90"
          style={{ color: "var(--color-bg)" }} // globals.css's unlayered `a { color: inherit }` outranks a text-* class
        >
          Download the brochure (PDF, 640 KB)
        </a>
        <a href="https://github.com/reBuzz-llc/ramen-agents" rel="noopener" className="mt-3 ml-4 inline-block text-sm font-semibold text-accent hover:underline">
          Get the code on GitHub
        </a>
      </div>
    </section>
  );
}

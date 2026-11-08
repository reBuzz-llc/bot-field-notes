import type { ReactNode } from "react";
import { SITE, canonical } from "@/lib/site";
import { BROCHURE, DEMO_GIF, QUESTIONS, REPO } from "@/lib/ramen";

// A page that answers one searched question (creatorCC queue 310): the answer first, then the detail, then a short
// FAQ (also as FAQPage schema), the code and the other questions. Facts only from our own running agents.
export type Faq = { q: string; a: string };

export default function QuestionPage({ path, question, answer, children, faqs }: { path: string; question: string; answer: ReactNode; children: ReactNode; faqs: Faq[] }) {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: question,
      author: { "@type": "Organization", name: SITE.publisher },
      publisher: { "@type": "Organization", name: SITE.publisher },
      mainEntityOfPage: canonical(path),
      datePublished: "2026-11-06",
    },
  ];
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-3xl font-bold tracking-tight text-balance">{question}</h1>
      <div className="mt-4 rounded-xl border-l-4 border-accent bg-accent/5 p-4 text-lg text-ink/90">{answer}</div>
      <article className="mt-6 space-y-4 text-ink/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </article>
      <section aria-labelledby="faq" className="mt-10">
        <h2 id="faq" className="text-xl font-semibold">
          Short answers
        </h2>
        <dl className="mt-3 space-y-3">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="text-ink/85">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-10 rounded-xl border border-line p-4">
        <a href="/ramen-agents">
          {/* eslint-disable-next-line @next/next/no-img-element -- an animated GIF, served as is */}
          <img src={DEMO_GIF} alt="The ramen-agents dashboard with example data: a pixel office where each agent works at its own desk, its screen showing what it is doing right now, a close-up of whoever acts and a ticker of the day's numbers along the bottom." width={1280} height={1406} loading="lazy" className="h-auto w-full rounded-lg" />
        </a>
        <p className="mt-3 text-ink/85">
          <strong>ramen-agents</strong> is the open-source agent team behind this site: Apache-2.0, free tiers only, with a
          ten-minute demo that needs no key.{" "}
          <a href={REPO} rel="noopener" className="text-accent hover:underline">
            The code on GitHub
          </a>{" "}
          ·{" "}
          <a href={BROCHURE} download className="text-accent hover:underline">
            the brochure (PDF)
          </a>{" "}
          ·{" "}
          <a href="/ramen-agents-launch" className="text-accent hover:underline">
            why we opened it
          </a>
        </p>
      </section>
      <nav aria-label="Related questions" className="mt-8 text-sm">
        <span className="text-muted">Related: </span>
        {QUESTIONS.filter((q) => q.path !== path).map((q, i) => (
          <span key={q.path}>
            {i > 0 && " · "}
            <a href={q.path} className="text-accent hover:underline">
              {q.title}
            </a>
          </span>
        ))}
      </nav>
    </main>
  );
}

import { BROCHURE_PDF, REPO } from "@/lib/ramen";
import BackLink from "./back-link";

export const metadata = {
  title: "The ramen-agents brochure",
  description: "The ramen-agents tri-fold brochure: read it here, download the PDF to print (US Letter, two pages).",
  alternates: { canonical: "/brochure" },
};

// The brochure in the site (owner, 2026-11-09, creatorCC queue 384): the raw PDF link opened the browser's viewer with no
// way back. Here it is embedded under the site's header, with Download and Back; a browser that cannot show a PDF inline
// (most phones) gets the outside panel's picture and the download.
export default function BrochurePage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 *:max-w-5xl">
      <BackLink />
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">The ramen-agents brochure</h1>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={BROCHURE_PDF}
            download
            className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold hover:opacity-90"
            style={{ color: "#1a0d00" }}
          >
            Download PDF (640 KB)
          </a>
          <a href={REPO} rel="noopener" className="text-sm font-semibold text-accent-ink hover:underline">
            Get the code on GitHub
          </a>
        </div>
      </div>
      <p className="mt-2 text-ink/85">A tri-fold to print or share: US Letter, two pages, outside then inside.</p>
      <object data={`${BROCHURE_PDF}#view=FitH`} type="application/pdf" aria-label="The ramen-agents brochure (PDF)" className="mt-5 block aspect-[11/8.5] w-full rounded-lg border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element -- the fallback where a PDF cannot show inline */}
        <img src="/ramen-agents-brochure.jpg" alt="The ramen-agents tri-fold brochure, outside: the fence, $0 a month, and the cover 'Your first team. Free.'" width={1056} height={817} className="h-auto w-full rounded-lg" />
        <p className="mt-3 text-sm text-muted">
          Your browser does not show PDFs here.{" "}
          <a href={BROCHURE_PDF} download className="font-semibold text-accent-ink hover:underline">
            Download the PDF
          </a>{" "}
          to read both sides.
        </p>
      </object>
    </main>
  );
}

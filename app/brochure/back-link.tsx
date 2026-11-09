"use client";

import Link from "next/link";

/** Back to where the reader came from on this site, else the journal's home. */
export default function BackLink() {
  return (
    <Link
      href="/"
      onClick={(e) => {
        try {
          if (document.referrer && new URL(document.referrer).origin === window.location.origin && window.history.length > 1) {
            e.preventDefault();
            window.history.back();
          }
        } catch {
          /* a referrer that is not a URL: the plain link goes home */
        }
      }}
      className="text-sm font-semibold text-accent-ink hover:underline"
    >
      ← Back
    </Link>
  );
}

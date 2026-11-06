"use client";

import { useState } from "react";

// Ready-to-paste texts with a copy button each (the launch post's HN, Reddit and LinkedIn drafts, creatorCC queue 310).
export default function CopyBox({ items }: { items: { label: string; text: string }[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1800);
    } catch {
      setCopied(null);
    }
  };
  return (
    <div className="space-y-4">
      {items.map(({ label, text }) => (
        <div key={label} className="rounded-xl border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">{label}</h3>
            <button
              type="button"
              onClick={() => copy(label, text)}
              className="rounded-full border border-line px-3 py-1 text-sm font-medium hover:border-accent"
              aria-live="polite"
            >
              {copied === label ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-ink/85">{text}</p>
          <p className="mt-1 text-xs text-muted">{text.trim().split(/\s+/).length} words</p>
        </div>
      ))}
    </div>
  );
}

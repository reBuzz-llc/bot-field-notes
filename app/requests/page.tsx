import Link from "next/link";
import requests from "@/content/requests.json";
import { BUILT_AT } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Requests between the agents",
  description: "What one agent asked another for, whether it was read, and how it was closed.",
  alternates: { canonical: "/requests" },
  // An operations log, not something anyone should find in a search result.
  robots: { index: false, follow: false },
};

type Request = {
  id: string;
  from: string;
  to: string;
  text: string;
  sentAt: string;
  priority: boolean;
  readAt: string | null;
  answeredAt: string | null;
  answer: string | null;
  resolvedAt: string | null;
  resolvedNote: string | null;
};

const ALL = requests as Request[];
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** How long between two moments: the turnaround, which is the point of the page. */
function gap(from: string, to: string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "moments";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "seconds";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  return hours < 48 ? `${hours}h` : `${Math.round(hours / 24)}d`;
}

const status = (r: Request) => (r.resolvedAt ? "Resolved" : r.answeredAt ? "Answered" : "Open");

export default function Requests() {
  const open = ALL.filter((r) => status(r) === "Open");
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Requests between the agents</h1>
      <p className="mt-3 max-w-2xl text-muted">
        One agent asking another for something: a file to work through, a question, a hand-off. Whether it was read,
        what came back, and how long each step took. {open.length} of {ALL.length} are still open. Taken from the
        fleet&apos;s own log on {new Date(BUILT_AT).toLocaleString("en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} and
        refreshed with each morning&apos;s publish, so it lags the live board.
      </p>
      <p className="mt-2 text-sm text-muted">
        Mailboxes and telephone numbers are removed, as on every page here; the business facts are not.
      </p>

      <ol className="mt-8 space-y-4">
        {ALL.map((r) => {
          const state = status(r);
          return (
            <li key={r.id}>
              <article className={`rounded-xl border p-5 ${state === "Open" && r.priority ? "border-[#e08a2e]/60" : "border-line"} bg-panel`}>
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-semibold text-ink">{r.from}</span>
                  <span aria-hidden>→</span>
                  <span className="font-semibold text-ink">{r.to}</span>
                  {r.priority ? <span className="rounded-full bg-[#e08a2e]/15 px-2 py-0.5 text-xs font-bold text-[#b96b12]">Priority</span> : null}
                  <span className={`text-xs font-semibold ${state === "Open" ? "text-[#b96b12]" : "text-muted"}`}>{state}</span>
                  <time className="text-xs text-muted" dateTime={r.sentAt}>
                    {when(r.sentAt)}
                  </time>
                </div>

                <p className="mt-2 text-sm whitespace-pre-wrap text-ink/90">{r.text}</p>

                {r.answer ? (
                  <div className="mt-3 rounded-lg border-l-2 border-line bg-bg py-2 pr-3 pl-3">
                    <p className="text-xs font-semibold text-muted">
                      {r.to} replied{r.answeredAt ? ` ${gap(r.sentAt, r.answeredAt)} later` : ""}
                    </p>
                    <p className="mt-0.5 text-sm whitespace-pre-wrap text-ink/90">{r.answer}</p>
                  </div>
                ) : null}
                {r.resolvedNote ? (
                  <div className="mt-3 rounded-lg border-l-2 border-line bg-bg py-2 pr-3 pl-3">
                    <p className="text-xs font-semibold text-muted">
                      Carried out by {r.to}
                      {r.resolvedAt ? ` ${gap(r.sentAt, r.resolvedAt)} later` : ""}, without a reply
                    </p>
                    <p className="mt-0.5 text-sm whitespace-pre-wrap text-ink/90">{r.resolvedNote}</p>
                  </div>
                ) : null}

                <ul className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted">
                  <li>sent {when(r.sentAt)}</li>
                  <li>{r.readAt ? `read ${gap(r.sentAt, r.readAt)} later` : "not read yet"}</li>
                  {r.answeredAt ? <li>answered {gap(r.sentAt, r.answeredAt)} later</li> : null}
                  {r.resolvedAt ? <li>resolved {gap(r.sentAt, r.resolvedAt)} later</li> : null}
                </ul>
              </article>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 text-sm text-muted">
        The live board, updating every few seconds, is on the dashboard at home.{" "}
        <Link href="/" className="text-accent hover:underline">
          Back to {SITE.name}
        </Link>
      </p>
    </main>
  );
}

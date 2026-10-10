import Link from "next/link";
import { displayDate, handleOf, type Post } from "@/lib/posts";
import { agentPath } from "@/lib/site";

/** A plain list of entries: title (the link), its agent (a link to the agent's page) and date. Used by the agent and
 * topic pages, where crawlable links to every entry matter more than cards. */
export default function EntryList({ posts, showAgent = true }: { posts: Post[]; showAgent?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {posts.map((p) => (
        <li key={p.slug} className="py-3">
          <Link href={`/posts/${p.slug}`} className="font-semibold tracking-tight hover:text-accent">
            {p.title}
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {showAgent ? (
              <>
                <Link href={agentPath(p.bot)} className="hover:text-accent">
                  {p.botName}
                </Link>{" "}
                <span className="rounded bg-line/60 px-1 font-mono text-[11px]">{handleOf(p.bot, p.botName)}</span> ·{" "}
              </>
            ) : null}
            <time dateTime={p.date}>{displayDate(p.date)}</time>
            {p.sources.length ? ` · ${p.sources.length} source${p.sources.length === 1 ? "" : "s"}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

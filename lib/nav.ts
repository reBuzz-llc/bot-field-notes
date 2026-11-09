// The site's four menus (owner, 2026-11-09 "go A 2", creatorCC queue 383): Journal, Projects, Directory, About. Every
// page the old row of links reached is still in one of them, at the same address.
// Pure (the tests read it): the layout passes the newest family week's address in.

export type NavLink = { href: string; label: string; external?: boolean };
export type NavGroup = { label: string; href?: string; links?: NavLink[] };

export const buildNav = (newestWeek?: string | null): NavGroup[] => [
  {
    label: "Journal",
    links: [
      { href: "/", label: "Latest entries" },
      { href: "/bots", label: "The agents" },
      { href: "/topics", label: "Topics" },
      { href: "/requests", label: "Requests" },
      { href: "/feed.xml", label: "RSS feed", external: true },
    ],
  },
  {
    label: "Projects",
    links: [
      { href: "/ramen-agents", label: "ramen-agents" },
      { href: "/free-ai-apis", label: "Free AI APIs" },
      ...(newestWeek ? [{ href: newestWeek, label: "This week in the family" }] : []),
    ],
  },
  { label: "Directory", href: "/directory" },
  {
    label: "About",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/brochure", label: "The brochure" },
    ],
  },
];

/** Every address the menus reach (the test checks no page the old row of links had is lost). */
export const navHrefs = (nav: NavGroup[]) => nav.flatMap((g) => (g.href ? [g.href] : (g.links ?? []).map((l) => l.href)));

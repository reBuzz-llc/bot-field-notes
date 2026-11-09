// The sample-site directory (owner, 2026-11-09 "go A 2", creatorCC queue 383): every live sample site the Site Builder
// published, as content/samples.json holds it (written by the fleet's scripts/samples-sync.py, which keeps only these
// fields). The sample pages themselves stay noindex; this listing is the indexable part.
// Pure (the tests read it); the data is lib/samples-data.ts.

export type Sample = {
  id: string;
  business: string;
  trade: string;
  city: string | null;
  state: string | null;
  rating: number | null;
  reviews: number | null;
  url: string;
  whatsapp: string | null;
  updated_at: string;
};

export const TRADE_LABEL: Record<string, string> = { restaurant: "Restaurant & café", shop: "Shop & clothing", salon: "Salon & beauty", trades: "Trades & repairs", general: "Local business" };
export const tradeLabel = (t: string) => TRADE_LABEL[t] ?? TRADE_LABEL.general;

export const safe = (s: unknown): s is Sample =>
  !!s && typeof s === "object" && typeof (s as Sample).business === "string" && /^https:\/\//.test(String((s as Sample).url ?? "")) && typeof (s as Sample).id === "string";


/** "Queens, NY": the city and state, never more. */
export const areaOf = (s: Pick<Sample, "city" | "state">) => [s.city, s.state].filter(Boolean).join(", ");

export type Filter = { trade?: string; area?: string; q?: string };
export function filterSamples(list: Sample[], f: Filter): Sample[] {
  const q = (f.q ?? "").trim().toLowerCase();
  return list.filter(
    (s) =>
      (!f.trade || s.trade === f.trade) &&
      (!f.area || areaOf(s) === f.area) &&
      (!q || `${s.business} ${areaOf(s)} ${tradeLabel(s.trade)}`.toLowerCase().includes(q)),
  );
}

/** schema.org ItemList of the listings: each a LocalBusiness with its area and the sample's address. */
export function itemList(list: Sample[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sample websites made for local businesses",
    url: pageUrl,
    numberOfItems: list.length,
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: s.business,
        ...(areaOf(s) ? { address: { "@type": "PostalAddress", addressLocality: s.city ?? undefined, addressRegion: s.state ?? undefined } } : {}),
        ...(s.rating !== null && s.reviews ? { aggregateRating: { "@type": "AggregateRating", ratingValue: s.rating, reviewCount: s.reviews } } : {}),
        url: s.url,
      },
    })),
  };
}

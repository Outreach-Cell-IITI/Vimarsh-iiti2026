// Shared client-side helpers for talking to the Vimarsh site's own API
// routes (Events + Institute Colloquium, both admin-managed via MySQL).
// Everything is same-origin now - no separate backend port.

export type ItemType = "event" | "colloquium";

export type VimarshItem = {
  id: number;
  type: ItemType;
  speaker: string;
  title: string;
  series: string;
  date: string; // ISO date string, e.g. 2026-03-23
  image: string; // path from the API (see resolveMediaUrl)
  pdf: string;
  video: string;
};

/**
 * A stored image/pdf path can be one of:
 *   1. A full URL ("https://...")            -> used as-is
 *   2. An uploaded path ("/uploads/...")      -> served by this same app
 *   3. A legacy static path ("/ForWebpage/...") -> also served by this app
 * All three are same-origin now, so this just passes the value through -
 * kept as a named helper so components don't need to know that detail.
 */
export function resolveMediaUrl(rawPath: string): string {
  return rawPath || "";
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function fetchItems(type: ItemType): Promise<VimarshItem[]> {
  const res = await fetch(`/api/items?type=${type}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${type}s (status ${res.status})`);
  }
  const data = await res.json();
  return data.items as VimarshItem[];
}
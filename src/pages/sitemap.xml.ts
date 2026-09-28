/**
 * /sitemap.xml, generated at build time.
 *
 * WHY: a sitemap tells Google, Bing and AI search crawlers exactly which public pages
 * exist. It is tiny and hand-listed on purpose: only real, indexable pages belong here.
 * The private tools (intake, contract, audit-results) and the noindex thank-you pages
 * are deliberately left out; scripts/check-seo.mjs fails the build if one sneaks in.
 *
 * HOW: a static Astro endpoint. URLs are the clean forms Netlify serves (and that each
 * page's canonical tag uses), so the sitemap and canonicals always agree.
 */
import type { APIRoute } from "astro";

/** Public, indexable pages. Add a line here when a new public page ships. */
export const PAGES = ["/", "/privacy"];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://justaweb.agency");
  const urls = PAGES.map((p) => `  <url><loc>${new URL(p, base).href}</loc></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

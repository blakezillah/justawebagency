// @ts-check
/**
 * Astro config for justaweb.agency.
 *
 * WHY Astro: the page is static marketing content, so Astro renders it to plain HTML at
 * build time and ships zero client JavaScript unless a component opts in. The image
 * pipeline (astro:assets + sharp) turns the portfolio screenshots into AVIF/WebP at
 * several widths, which is most of the weight savings over the old hand-written page.
 *
 * HOW: `npm run build` writes dist/. Everything in public/ (the private intake and
 * contract tools, thank-you pages, logos, robots.txt) is copied through untouched, so
 * their Netlify forms keep working. netlify.toml points Netlify at dist/.
 */
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://justaweb.agency",
  // Keep URLs as /thank-you style files the redirects in netlify.toml already expect.
  build: { format: "file", inlineStylesheets: "always" },
  // Prefetch internal links on hover for snappy navigation to the thank-you pages.
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
});

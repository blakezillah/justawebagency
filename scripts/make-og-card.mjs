#!/usr/bin/env node
/**
 * Render scripts/og-card.html to public/og/justaweb-card.png (1200x630), the share image
 * every page points at in its og:image and twitter:image tags.
 *
 * WHY a script: the card is regenerated rarely (only if the brand changes), so Playwright
 * is not a project dependency. Run it on demand with:
 *   npx -y -p playwright node scripts/make-og-card.mjs
 * (Playwright's Chromium must be installed: npx playwright install chromium.)
 *
 * HOW: loads the HTML at exactly 1200x630, deviceScaleFactor 1, and screenshots it as
 * PNG. The flat background and text keep the file far under the 300 KB budget that
 * scripts/check-seo.mjs enforces.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const src = new URL("./og-card.html", import.meta.url);
const out = fileURLToPath(new URL("../public/og/justaweb-card.png", import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(src.href);
await page.screenshot({ path: out, type: "png" });
await browser.close();
console.log(`wrote ${out}`);

/**
 * /llms.txt, generated at build time from src/data/site.js.
 *
 * WHY: llms.txt (llmstxt.org) is a proposed plain-Markdown summary of a site for AI
 * tools. It is optional: Google says its AI features need no special files, and no AI
 * company has promised to read it. It costs nothing, though, and gives any assistant
 * that does fetch it the agency's facts in one clean read: what JustAWeb is, where it
 * works, what it costs and the real FAQ. We ship the same file in every client build.
 *
 * HOW: built from the same data the homepage renders (PRICING, INCLUDED, FAQ, CONTACT),
 * so it can never drift from the visible page. Private tools are never mentioned.
 */
import type { APIRoute } from "astro";
import { CONTACT, PRICING, INCLUDED, FAQ } from "../data/site.js";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export const GET: APIRoute = () => {
  const lines = [
    "# JustAWeb",
    "",
    `> JustAWeb (justaweb.agency) builds fast, custom websites for small businesses, based in Vancouver, WA 98683 and serving Vancouver, Portland, OR and beyond. A site is ${usd(PRICING.site)} flat and the owner keeps every file. Hosting with edits is an optional ${usd(PRICING.hosting)} a year. Every site is built to be found on Google and in AI search. Founder and builder: Blake Goble.`,
    "",
    "## Key facts",
    "",
    `- Website: ${usd(PRICING.site)} one time. Half to start, half before launch. Venmo or Zelle.`,
    `- Optional hosting and edits: ${usd(PRICING.hosting)} per year, billed once a year, cancel anytime.`,
    "- Timeline: most sites are live in 4 to 6 weeks; rush delivery in 2 to 3 weeks is available.",
    "- Ownership: the client owns all code, content and the domain. No lock-in and no required monthly fees.",
    "- Service area: Vancouver, WA, Portland, OR and beyond.",
    `- Contact: ${CONTACT.email} (reply ${CONTACT.responseTime}).`,
    "",
    "## What every site includes",
    "",
    ...INCLUDED.map((f) => `- ${f.title}: ${f.body}`),
    "",
    "## FAQ",
    "",
    ...FAQ.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Pages",
    "",
    "- [Home](https://justaweb.agency/): the offer, recent work, pricing, FAQ and contact form",
    "- [Pricing](https://justaweb.agency/#pricing): the two prices and what each includes",
    "- [FAQ](https://justaweb.agency/#faq): common questions, including AI search",
    "- [Privacy policy](https://justaweb.agency/privacy)",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

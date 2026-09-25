/**
 * Content for the justaweb.agency homepage, kept apart from markup so copy edits never
 * touch layout code.
 *
 * HONESTY RULE (read before editing): every claim here must be true today and checkable.
 * Prices, terms and timelines come from the live site and contract.html (50% deposit,
 * 50% before launch). Portfolio entries are real, live sites. No invented metrics, no
 * invented clients, no testimonials unless the named person agreed to be quoted.
 * No em dashes anywhere in copy (house style).
 */

/** Contact details shown on the page. One canonical address (the one on the old live page). */
export const CONTACT = {
  email: "blake@justaweb.agency",
  responseTime: "within one business day",
};

/** Pricing. Changing a number here changes the public price, so only with Blake's yes. */
export const PRICING = {
  site: 1000,
  hosting: 250,
};

/**
 * Portfolio. `image` keys match files in src/assets/work/ ({key}-desk.jpg, {key}-phone.jpg),
 * captured from the live sites. `kind` is shown honestly: Makarios is Blake's own product,
 * so it is labelled as in-house work, never as a client.
 */
export const WORK = [
  {
    key: "tidland",
    name: "Tidland Audio",
    url: "https://tidlandaudio.com",
    kind: "Client site",
    tags: ["Repair shop", "Vancouver, WA"],
    blurb: "Vintage gear repair and modification shop serving the Portland metro and mail-in customers. Repairs, gear for sale, and an easy way to get in touch.",
  },
  {
    key: "precision",
    name: "Precision Safety Inc.",
    url: "https://precisionsafetyinc.com",
    kind: "Client site",
    tags: ["Consulting", "Training"],
    blurb: "Security consulting and personal safety training led by an active law-enforcement professional. A clear, fast site that states the mission and the services.",
  },
  {
    key: "itts",
    name: "International Tactical",
    url: "https://internationaltactical.com",
    kind: "Client site",
    tags: ["Training school", "WordPress"],
    blurb: "Firearms and tactical training school established in 1990. Class schedules, private lessons and group training the staff can update themselves.",
  },
  {
    key: "makarios",
    name: "Makarios",
    url: "https://makarios.digital",
    kind: "Our own product",
    tags: ["Software", "E-commerce"],
    blurb: "Our in-house desktop app for freelancers. A multi-page marketing site with docs, pricing and a checkout flow.",
  },
];

/** The owner problems the page speaks to, in the owner's own words. `icon` is a Lucide export name (see components/Icon.astro). */
export const PAINS = [
  { icon: "SearchX", title: "Just a Facebook page", body: "Customers search Google, find nothing official, and call the shop down the street." },
  { icon: "History", title: "A site from years ago", body: "It is slow, it breaks on phones, and the hours on it are wrong." },
  { icon: "CreditCard", title: "Paying for a builder", body: "You pay every month for a template you have not had time to finish." },
  { icon: "ReceiptText", title: "Agency sticker shock", body: "Thousands of dollars, long timelines, and a monthly retainer on top." },
];

/** What every site includes. Each line must stay true for the $1,000 build. `icon` is a Lucide export name. */
export const INCLUDED = [
  { icon: "Palette", title: "Custom design", body: "Made for your business, not a template with your logo dropped in." },
  { icon: "Smartphone", title: "Built for phones first", body: "Most of your visitors are on a phone. It looks right there first." },
  { icon: "Zap", title: "Loads fast", body: "Hand-written code with no plugin pile, so pages open quickly." },
  { icon: "Search", title: "Found on Google", body: "Titles, descriptions, sitemap and local business markup set up from day one." },
  { icon: "PhoneCall", title: "Easy to contact", body: "Tap-to-call, a contact form, your hours and a map, right where people look." },
  { icon: "Accessibility", title: "Accessible", body: "Built to WCAG 2.1 AA guidelines so everyone can use it." },
  { icon: "KeyRound", title: "You own it", body: "Your code, your content, your domain. No contract, no lock-in." },
  { icon: "Handshake", title: "A real person", body: "You work with the person who builds it, start to finish." },
];

/** Qualitative comparison. No competitor prices: they vary and we cannot keep them true. */
export const COMPARE = {
  columns: ["DIY builder", "Typical agency", "JustAWeb"],
  rows: [
    { label: "Who builds it", values: ["You do", "A team you rarely meet", "Blake, directly"] },
    { label: "Up-front cost", values: ["Low", "Often several thousand", "$1,000 flat"] },
    { label: "Ongoing fees", values: ["Monthly, forever", "Often a retainer", "Optional $250 a year"] },
    { label: "You own the code", values: ["No", "It depends", "Yes"] },
    { label: "Time you spend", values: ["Evenings and weekends", "Meetings", "One call and a review"] },
  ],
};

/** Process steps. Timelines are the ones already published on the old site. */
export const STEPS = [
  { title: "Send a quick note", body: "Tell me about your business with the short form or by email. I reply within one business day, and a quick call is free." },
  { title: "I design and build it", body: "You get a private link to the real site as it comes together, and you ask for changes before anything goes live." },
  { title: "Launch, and it's yours", body: "I connect your domain, set up Google basics and hand you every file. Most sites are live in 4 to 6 weeks." },
];

/** FAQ. Answers restate facts already on the old site or in the contract. */
export const FAQ = [
  { q: "What does $1,000 cover?", a: "A custom website for your business: design, build, mobile layout, contact form, basic Google setup and launch. You own all of the code and files." },
  { q: "Do I have to pay every month?", a: "No. The site is a one-time $1,000. Hosting with ad-hoc content changes is an optional $250 a year, billed once a year. You can also host it anywhere you like." },
  { q: "How do payments work?", a: "Half to start, half before launch. Venmo or Zelle are fine." },
  { q: "How long does it take?", a: "Most sites are ready in 4 to 6 weeks. Need it sooner? Rush delivery in 2 to 3 weeks is available." },
  { q: "What do I need to provide?", a: "Your business details, logo if you have one, and any photos you like. If you are short on photos or words, I will help you fill the gaps." },
  { q: "I don't have a domain yet. Can you help?", a: "Yes. I will help you pick and register one as part of setup, and it is registered in your name." },
  { q: "Can I make changes myself later?", a: "Yes. I will show you how to update text and images. Or send changes my way; they are included with the $250 a year hosting." },
  { q: "Do you do WordPress or online stores?", a: "Yes, when a project needs them. Tell me what you have in mind and I will send a custom quote." },
  { q: "Do you offer ongoing SEO?", a: "Every site ships with solid SEO foundations. I do not sell monthly SEO packages myself, but I work with trusted partners who do, and I am happy to connect you with one so you are never left in the dark." },
];

/**
 * Client testimonials, quoted verbatim from the original site. Blake confirmed on
 * 2026-09-25 that they are real and approved. Never edit a quote's wording; if a
 * client wants a change, get new text from them.
 * The Makarios quote ("Luke G") is deliberately NOT here: Makarios is Blake's own
 * company, so an endorsement from it needs a material-connection disclosure (FTC
 * Endorsement Guides) before it can appear.
 */
export const TESTIMONIALS = [
  {
    quote: "We needed a fast, professional website for our security consulting and training business. The fast, reliable website loads instantly and clearly communicates our mission of reducing victimization through real-world training. The site perfectly represents our expertise and makes it easy for clients to understand our services.",
    name: "Jordan Lee",
    business: "Precision Safety Inc.",
    url: "https://precisionsafetyinc.com",
  },
  {
    quote: "Our firearms and tactical training school needed a website that showcases our 30+ years of experience and real operational expertise. The WordPress site makes it easy to update class schedules and training information, while maintaining fast performance. It effectively communicates our safety record and the quality of our instruction.",
    name: "Jordan Weiss",
    business: "International Tactical",
    url: "https://internationaltactical.com",
  },
];

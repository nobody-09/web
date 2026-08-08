# Workflow Tools Benchmark Archive

Independent functional test records for workflow software.

All visible page content (navigation, headings, body copy, table
labels, and the content collection data itself) is written in Chinese.
The site name/tagline stay in English as originally specified; code
identifiers, frontmatter keys, and slugs also stay in English since
they aren't rendered as page content. Keep new product/benchmark
Markdown files consistent with this — write `summary`, `typicalUse`,
`notes`, and the Markdown body in Chinese; keep `id`/`slug` in
lowercase-hyphen form.

A static site built with [Astro](https://astro.build) and Astro Content
Collections, deployed to GitHub Pages via GitHub Actions.

## Why it's built this way

The whole point of this codebase is that **adding the next product or
benchmark should never require touching a template**. Every page —
product page, benchmark page, the two index pages, the two JSON
endpoints — is generated from data files under `src/content/`. There is
exactly one place each fact lives:

- A product's own metrics (startup time, task completion, plugin
  support, typical use, and anything added later) live only in that
  product's Markdown file under `src/content/products/`.
- A benchmark's comparison table never stores its own copy of a number.
  It stores a list of `measuredAttributes` (which metric, what label,
  what unit) and the site resolves the actual value from each compared
  product's record at build time (`src/utils/attributes.ts`).
- `/data/products.json` and `/data/benchmarks.json` are generated from
  the same content collections the HTML pages read from — not a second,
  hand-maintained copy.

This means correcting a number means editing one product file, and it
is immediately correct everywhere that number is shown.

## Project structure

```
src/
  content/
    config.ts                 # Zod schemas for `products` and `benchmarks`
    products/*.md              # one file per product
    benchmarks/*.md            # one file per benchmark comparison
  layouts/BaseLayout.astro     # SEO meta / OG / canonical, shared shell
  components/                  # AttributeTable, ComparisonTable, etc.
  utils/
    attributes.ts              # single lookup function that resolves a
                                # benchmark's `key` against a product's
                                # own fields or its attributes[] list
    site.ts                    # site name/tagline/URL constants
  pages/
    index.astro                 # home
    products/index.astro        # product index
    products/[slug].astro       # product detail (one route, all products)
    benchmarks/index.astro      # benchmark index
    benchmarks/[slug].astro     # benchmark detail (one route, all benchmarks)
    methodology/index.astro
    about/index.astro
    data/index.astro
    data/products.json.ts       # machine-readable product data
    data/benchmarks.json.ts     # machine-readable benchmark data (incl.
                                 # resolved comparison values)
    sitemap.xml.ts               # hand-rolled sitemap (see below)
public/
  robots.txt                    # Allow: / plus Sitemap: line
```

`src/pages/sitemap.xml.ts` generates `/sitemap.xml` at request/build
time from the same content collections as everything else, so new
products/benchmarks are included automatically. (`@astrojs/sitemap` was
tried first but currently crashes during Astro's `astro:build:done`
hook on this project — `Cannot read properties of undefined (reading
'reduce')` — so it was replaced with this small custom route instead.
If a future version of that package fixes the crash, it could replace
this file, but there's no need to switch back.)

## Adding a new product

1. Add a new file `src/content/products/<slug>.md` with frontmatter
   matching the `products` schema in `src/content/config.ts`. Only
   `id`, `slug`, `productName`, `benchmarkVersion`, `recordedVersion`,
   `testedAt`, `lastReviewed`, `summary`, and `attributes` (can be `[]`)
   are required — every comparison metric is optional, and anything
   that doesn't fit the built-in fields (API support, offline mode,
   audit status, export capability, max project size, automation
   success rate, template count, ranking, score, sample size, software
   version, task completion rate, ...) goes in `attributes: [{ name,
   value, unit, description }]`.
2. That's it. The product automatically appears on `/products/`, gets
   its own page at `/products/<slug>/`, and shows up in
   `/data/products.json`.

No page template needs to change.

## Adding a new benchmark

1. Add a new file `src/content/benchmarks/<slug>.md` with frontmatter
   matching the `benchmarks` schema. `comparedProducts` is a list of
   product slugs (references into the `products` collection).
   `measuredAttributes` is a list of `{ key, label, unit?, description? }`
   rows to compare — `key` should match either a first-class product
   field (`startupTimeSeconds`, `taskCompletion`, `thirdPartyPluginSupport`,
   `typicalUse`) or the `name` of an entry in the compared products'
   `attributes[]` lists.
2. Write the narrative (overview, interpretation, notes) as the
   Markdown body of the file.
3. That's it. The benchmark automatically appears on `/benchmarks/`,
   gets its own page at `/benchmarks/<slug>/`, shows up in
   `/data/benchmarks.json`, is included in `/sitemap.xml`, and appears
   in the "Related benchmarks" list on every product page it
   references — none of that is hand-wired per benchmark.

If a benchmark needs a metric that doesn't exist as a first-class field
yet, add it to the relevant products' `attributes[]` lists rather than
extending `src/content/config.ts` — the schema is intentionally generic
so it doesn't need to grow with every new benchmark category.

## Local development

```
npm install
npm run dev       # local dev server
npm run build     # static build into dist/
npm run preview   # preview the production build
```

## Deployment

`.github/workflows/deploy.yml` builds the site and deploys `dist/` to
GitHub Pages on every push to `main`, using GitHub's official
`actions/upload-pages-artifact` + `actions/deploy-pages` flow. Enable
Pages for this repository under **Settings → Pages → Source: GitHub
Actions** once the workflow file is pushed.

This repository is set up as a GitHub user/organization page
(`nobody-09.github.io`), so it's served from the domain root and
`astro.config.mjs` sets `site` accordingly with no `base` path. If this
project is ever moved into a normal project repository instead
(`<user>.github.io/<repo>`), update `site` and add
`base: '/<repo>'` in `astro.config.mjs`.

## Version control policy

Each new product or benchmark addition should be its own Git commit
(e.g. `Add product: <name>` / `Add benchmark: <slug>`), rather than
being bundled with unrelated changes. Git history is not surfaced on
the public site, but keeping additions atomic means the commit history
itself is a reliable record of when each record was created or edited.

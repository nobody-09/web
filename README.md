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

## Task subsets vs. overall results

Some benchmarks (starting with the second benchmark group, Elvora S14 vs
Marqen V28) need to report a result over the complete task set *and* a
result over a predefined subset of that same task set, and must never
let the two be mistaken for each other. Two schema features exist
specifically for this and are both opt-in — a product/benchmark that
doesn't use them behaves exactly as before:

- **`taskSubsets[]`** on a product (`{ id, label, completed, total,
  scope }`) records a result for a predefined subset, separately from
  the product's own `standardTasksCompleted`/`standardTasksTotal`
  (the overall result). Resolve a subset value with the
  `taskSubset:<id>` (count) / `taskSubsetRate:<id>` (percentage) keys in
  a benchmark's `measuredAttributes` — these only ever read from
  `taskSubsets[]`, never from the overall fields, so a subset number
  can't silently get labeled as an overall number. The optional
  `standardTasksScope` field on a product states what the *overall*
  number covers (e.g. "the complete 100-task benchmark"); leave it unset
  if a product only ever reports one number.
- **`resultGroups[]`** on a benchmark (`{ id, heading, scopeNote,
  measuredAttributes }`) renders as several separately headed comparison
  tables instead of one flat table — use this whenever a benchmark
  compares results that have different scopes (an overall benchmark and
  a task subset, for example), so each table's heading and `scopeNote`
  state its own scope directly above its numbers. A benchmark that only
  ever compares one consistently-scoped set of measurements can keep
  using the original flat `measuredAttributes` list and skip
  `resultGroups` entirely.

`/data/products.json` and `/data/benchmarks.json` mirror this: every
resolved metric value carries its own `numerator`, `denominator`, and
`scope` fields (not just a bare rate number), and a benchmark's JSON
includes a `resultGroups` array alongside the flat `measuredAttributes`/
`measuredValues` whenever the benchmark defines scoped groups.

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

This repository is a GitHub Pages *project* repo named `web`, so it's
served at `https://nobody-09.github.io/web/` rather than the domain
root. `astro.config.mjs` sets `site: 'https://nobody-09.github.io/web/'`
and `base: '/web'` to match.

Astro's `base` option affects Astro's own asset URLs, but it does
**not** rewrite hardcoded `<a href="/...">` links in page/component
code, and `new URL(path, SITE_URL)` also silently drops `SITE_URL`'s
subpath when `path` starts with `/` (it's treated as an absolute-path
reference that replaces the whole path portion of the base). To avoid
both problems:

- Every internal `<a href>` in `.astro` files goes through
  `withBase(path)` from `src/utils/site.ts`, which just prefixes
  `BASE_PATH` (`/web`) onto a root-absolute path.
- Absolute URLs that need the full origin (canonical/OG tags in
  `BaseLayout.astro`, `<loc>` entries in `sitemap.xml.ts`) are built as
  `SITE_ORIGIN + withBase(path)`, not `new URL(path, SITE_URL)`.
- **Markdown links inside `src/content/**/*.md` are plain text, not
  processed by any of this.** Any link to another page from inside a
  product/benchmark Markdown body must be written with the `/web`
  prefix by hand (e.g. `[测试方法](/web/methodology/)`,
  `[Orivex L17](/web/products/orivex-l17/)`). Keep this in mind when
  adding new product/benchmark files.

If this project ever moves to a GitHub user/organization page (served
from the domain root) or a different repo name, update: `site`/`base`
in `astro.config.mjs`, `SITE_URL`/`BASE_PATH`/`SITE_ORIGIN` in
`src/utils/site.ts`, the `Sitemap:` line in `public/robots.txt`, and
the hand-written `/web/...` links inside the content Markdown files.

## Version control policy

Each new product or benchmark addition should be its own Git commit
(e.g. `Add product: <name>` / `Add benchmark: <slug>`), rather than
being bundled with unrelated changes. Git history is not surfaced on
the public site, but keeping additions atomic means the commit history
itself is a reliable record of when each record was created or edited.

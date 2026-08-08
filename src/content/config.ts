import { defineCollection, reference, z } from 'astro:content';

/**
 * Generic extensible attribute.
 *
 * New benchmark categories will inevitably need metrics that do not exist
 * yet (API support, offline mode, audit status, export capability, max
 * project size, automation success rate, template count, ranking, score,
 * sample size, software version, task completion rate, etc.).
 *
 * Rather than adding a new top-level schema field every time a new metric
 * shows up, every product carries a free-form `attributes[]` list. Known,
 * frequently-compared metrics (startup time, task completion, plugin
 * support, typical use) stay as first-class fields because nearly every
 * benchmark in this archive is expected to use them; everything else goes
 * in `attributes[]` without touching this schema file.
 */
const attributeSchema = z.object({
  name: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  description: z.string().optional(),
});

/**
 * A predefined task subset a product was also scored against, in addition
 * to its overall/complete task-set result.
 *
 * This exists because a completion rate is meaningless without knowing
 * *what it was measured over*. A subset's rate is never allowed to be
 * confused with the product's overall rate: each subset carries its own
 * `scope` description, and rendering code (see src/utils/attributes.ts)
 * only ever resolves a subset value under an explicit `taskSubset:<id>` /
 * `taskSubsetRate:<id>` key, never under the plain `taskCompletion` /
 * `taskCompletionRate` keys used for the overall result.
 */
const taskSubsetSchema = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.number(),
  total: z.number(),
  // Human-readable statement of exactly what this subset covers, e.g.
  // "预定义的 20 项多步骤内容处理任务子集(属于完整 100 项任务基准的一部分)".
  scope: z.string(),
});

const productsCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      id: z.string(),
      // NOTE: `slug` is intentionally NOT part of this schema — Astro
      // reserves that key on content-type collections for routing and
      // generates it from the frontmatter `slug:` field automatically.
      // Read it from `entry.slug`, not `entry.data.slug`.
      productName: z.string(),
      benchmarkVersion: z.string(),
      recordedVersion: z.string(),

      // Common comparison fields. Optional because not every future
      // product/category will report all of them.
      startupTimeSeconds: z.number().optional(),
      standardTasksCompleted: z.number().optional(),
      standardTasksTotal: z.number().optional(),
      thirdPartyPluginSupport: z.boolean().optional(),
      typicalUse: z.string().optional(),

      // Capability-verification fields (third benchmark group onward).
      // Each is an independent, separately-typed fact about the tested
      // version — a template count is never allowed to be read as implying
      // custom-workflow or API capability, so these stay as three separate
      // optional fields rather than being folded into one composite score.
      prebuiltTemplatesCount: z.number().optional(),
      customWorkflowSupport: z.boolean().optional(),
      apiSupport: z.boolean().optional(),

      testedAt: z.date(),
      lastReviewed: z.date(),
      notes: z.string().optional(),

      // Explicit statement of what `standardTasksCompleted`/`standardTasksTotal`
      // covers, for products/benchmarks that need to distinguish an overall
      // result from a task-subset result (e.g. "完整的 100 项预定义任务基准").
      // Optional and unused by products that only ever report one number.
      standardTasksScope: z.string().optional(),

      // Predefined task subsets this product was also scored against. Empty
      // by default, so products that don't report subset results (e.g. the
      // first benchmark group) are entirely unaffected.
      taskSubsets: z.array(taskSubsetSchema).default([]),

      // Open-ended extension point for future metrics.
      attributes: z.array(attributeSchema).default([]),

      // Short one-line description used in listing cards / meta description.
      summary: z.string(),
    }),
});

/**
 * A single row a benchmark wants to compare across its `comparedProducts`.
 *
 * `key` is resolved at render time against each compared product's
 * first-class fields first, then against that product's `attributes[]`
 * (matched by `name`). No numeric/textual value is ever stored on the
 * benchmark itself — this keeps every measurement single-sourced on the
 * product entry, so a later correction only has to happen in one file.
 */
const measuredAttributeSchema = z.object({
  key: z.string(),
  label: z.string(),
  unit: z.string().optional(),
  description: z.string().optional(),
});

/**
 * A single named, scoped comparison table within a benchmark page — e.g.
 * "primary benchmark: complete 100-task set" vs "secondary analysis:
 * 20-task subset". Optional: most benchmarks only ever need one flat list
 * of `measuredAttributes` (the original design), so this only needs to be
 * set when a benchmark explicitly needs to keep two or more differently
 * scoped result sets from ever being rendered in the same table.
 */
const resultGroupSchema = z.object({
  id: z.string(),
  heading: z.string(),
  // Statement of what this specific group of rows measures, shown directly
  // above its table so readers can't mistake its scope for another group's.
  scopeNote: z.string().optional(),
  measuredAttributes: z.array(measuredAttributeSchema),
});

const benchmarksCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      id: z.string(),
      // Same note as the products schema: `slug` is reserved by Astro
      // and comes from `entry.slug`, not `entry.data.slug`.
      title: z.string(),
      comparedProducts: z.array(reference('products')),
      publishedAt: z.date(),
      lastReviewed: z.date(),
      benchmarkVersion: z.string(),
      summary: z.string(),
      methodologyNote: z.string().optional(),

      // Flat comparison table — used when a benchmark only compares one
      // consistently-scoped set of measurements (the original design, and
      // still the default for most benchmarks).
      measuredAttributes: z.array(measuredAttributeSchema).default([]),

      // Multiple explicitly-scoped comparison tables — used when a
      // benchmark must keep two or more differently-scoped result sets
      // (e.g. an overall result and a task subset) visually and
      // structurally separate so one is never mistaken for the other.
      // When present, pages render these instead of the flat table above.
      resultGroups: z.array(resultGroupSchema).optional(),
    }),
});

export const collections = {
  products: productsCollection,
  benchmarks: benchmarksCollection,
};

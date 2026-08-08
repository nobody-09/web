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

const productsCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      id: z.string(),
      slug: z.string(),
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

      testedAt: z.date(),
      lastReviewed: z.date(),
      notes: z.string().optional(),

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

const benchmarksCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      comparedProducts: z.array(reference('products')),
      publishedAt: z.date(),
      lastReviewed: z.date(),
      benchmarkVersion: z.string(),
      summary: z.string(),
      methodologyNote: z.string().optional(),
      measuredAttributes: z.array(measuredAttributeSchema).default([]),
    }),
});

export const collections = {
  products: productsCollection,
  benchmarks: benchmarksCollection,
};

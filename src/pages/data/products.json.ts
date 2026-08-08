import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { withBase } from '../../utils/site';

// Served at /data/products.json. This is generated from the exact same
// `products` content collection the HTML pages render from — there is no
// separate copy of this data to keep in sync.
export const GET: APIRoute = async () => {
  const products = await getCollection('products');

  const payload = products.map((p) => ({
    id: p.data.id,
    slug: p.slug,
    productName: p.data.productName,
    benchmarkVersion: p.data.benchmarkVersion,
    recordedVersion: p.data.recordedVersion,
    startupTimeSeconds: p.data.startupTimeSeconds ?? null,
    standardTasksCompleted: p.data.standardTasksCompleted ?? null,
    standardTasksTotal: p.data.standardTasksTotal ?? null,
    thirdPartyPluginSupport: p.data.thirdPartyPluginSupport ?? null,
    typicalUse: p.data.typicalUse ?? null,
    // Independent capability facts (third benchmark group onward) — kept
    // as three separate fields, never collapsed into one composite score,
    // so template count can never be read as implying custom-workflow or
    // API capability.
    prebuiltTemplatesCount: p.data.prebuiltTemplatesCount ?? null,
    customWorkflowSupport: p.data.customWorkflowSupport ?? null,
    apiSupport: p.data.apiSupport ?? null,
    testedAt: p.data.testedAt.toISOString().slice(0, 10),
    lastReviewed: p.data.lastReviewed.toISOString().slice(0, 10),
    notes: p.data.notes ?? null,
    // What `standardTasksCompleted`/`standardTasksTotal` above was
    // measured over — null for records that only ever report one number
    // and have no need to state a scope (e.g. the first benchmark group).
    standardTasksScope: p.data.standardTasksScope ?? null,
    // Predefined task subsets this product was also scored against, each
    // carrying its own scope — never to be confused with the overall
    // standardTasksCompleted/standardTasksTotal above.
    taskSubsets: p.data.taskSubsets,
    attributes: p.data.attributes,
    summary: p.data.summary,
    url: withBase(`/products/${p.slug}/`),
  }));

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

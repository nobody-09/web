import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Served at /data/products.json. This is generated from the exact same
// `products` content collection the HTML pages render from — there is no
// separate copy of this data to keep in sync.
export const GET: APIRoute = async () => {
  const products = await getCollection('products');

  const payload = products.map((p) => ({
    id: p.data.id,
    slug: p.data.slug,
    productName: p.data.productName,
    benchmarkVersion: p.data.benchmarkVersion,
    recordedVersion: p.data.recordedVersion,
    startupTimeSeconds: p.data.startupTimeSeconds ?? null,
    standardTasksCompleted: p.data.standardTasksCompleted ?? null,
    standardTasksTotal: p.data.standardTasksTotal ?? null,
    thirdPartyPluginSupport: p.data.thirdPartyPluginSupport ?? null,
    typicalUse: p.data.typicalUse ?? null,
    testedAt: p.data.testedAt.toISOString().slice(0, 10),
    lastReviewed: p.data.lastReviewed.toISOString().slice(0, 10),
    notes: p.data.notes ?? null,
    attributes: p.data.attributes,
    summary: p.data.summary,
    url: `/products/${p.data.slug}/`,
  }));

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

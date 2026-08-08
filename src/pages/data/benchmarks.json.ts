import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { resolveAttributeValue } from '../../utils/attributes';
import { withBase } from '../../utils/site';

// Served at /data/benchmarks.json, generated from the same `benchmarks`
// collection the HTML pages use. `measuredValues` below is the resolved
// snapshot (looked up from each product's own record at build time) so
// this file can be diffed over time to confirm the underlying product
// data did not change between two builds of a given benchmark version.
export const GET: APIRoute = async () => {
  const benchmarks = await getCollection('benchmarks');

  const payload = await Promise.all(
    benchmarks.map(async (b) => {
      const products = await Promise.all(
        b.data.comparedProducts.map((ref) => getEntry(ref))
      );

      const measuredValues = b.data.measuredAttributes.map((m) => ({
        key: m.key,
        label: m.label,
        values: products.map((p) => {
          const resolved = resolveAttributeValue(p, m.key);
          return {
            productSlug: p.slug,
            value: resolved?.value ?? null,
            unit: resolved?.unit ?? m.unit ?? null,
          };
        }),
      }));

      return {
        id: b.data.id,
        slug: b.slug,
        title: b.data.title,
        comparedProducts: products.map((p) => p.slug),
        publishedAt: b.data.publishedAt.toISOString().slice(0, 10),
        lastReviewed: b.data.lastReviewed.toISOString().slice(0, 10),
        benchmarkVersion: b.data.benchmarkVersion,
        summary: b.data.summary,
        measuredAttributes: b.data.measuredAttributes,
        measuredValues,
        url: withBase(`/benchmarks/${b.slug}/`),
      };
    })
  );

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

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

      // Resolves one measuredAttributes[] list into its machine-readable
      // form. `numerator`/`denominator`/`scope` come straight from
      // resolveAttributeValue, so a subset value (e.g. 18/20, scoped to a
      // "20-task subset") is never emitted without the scope that
      // distinguishes it from an overall value (e.g. 68/100) — no
      // consumer of this JSON can mix the two up by only reading a bare
      // "value" or "successRate" number.
      const resolveGroup = (measuredAttributes: typeof b.data.measuredAttributes) =>
        measuredAttributes.map((m) => ({
          key: m.key,
          label: m.label,
          values: products.map((p) => {
            const resolved = resolveAttributeValue(p, m.key);
            return {
              productSlug: p.slug,
              metric: m.label,
              value: resolved?.value ?? null,
              unit: resolved?.unit ?? m.unit ?? null,
              numerator: resolved?.numerator ?? null,
              denominator: resolved?.denominator ?? null,
              scope: resolved?.scope ?? m.description ?? null,
              benchmarkId: b.data.id,
            };
          }),
        }));

      const measuredValues = resolveGroup(b.data.measuredAttributes);

      const resultGroups = b.data.resultGroups
        ? b.data.resultGroups.map((group) => ({
            id: group.id,
            heading: group.heading,
            scopeNote: group.scopeNote ?? null,
            measuredAttributes: group.measuredAttributes,
            measuredValues: resolveGroup(group.measuredAttributes),
          }))
        : null;

      return {
        id: b.data.id,
        slug: b.slug,
        title: b.data.title,
        comparedProducts: products.map((p) => p.slug),
        publishedAt: b.data.publishedAt.toISOString().slice(0, 10),
        lastReviewed: b.data.lastReviewed.toISOString().slice(0, 10),
        benchmarkVersion: b.data.benchmarkVersion,
        summary: b.data.summary,
        // Flat table — populated for benchmarks that only compare one
        // consistently-scoped set of measurements (null/empty otherwise).
        measuredAttributes: b.data.measuredAttributes,
        measuredValues,
        // Multiple explicitly-scoped result sets (e.g. an overall result
        // and a task subset) — null for benchmarks that don't need this.
        resultGroups,
        url: withBase(`/benchmarks/${b.slug}/`),
      };
    })
  );

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

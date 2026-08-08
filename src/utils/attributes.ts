import type { CollectionEntry } from 'astro:content';

export type ProductEntry = CollectionEntry<'products'>;
export type BenchmarkEntry = CollectionEntry<'benchmarks'>;

/**
 * Resolves the display value for a given attribute `key` on a product.
 *
 * This is the single place where "which field does this key mean" is
 * decided. Benchmark pages never store their own copy of a measurement —
 * they only store a `key`, and this function looks the current value up
 * on the product's own record every time the site is built. That's what
 * keeps every product/benchmark pairing consistent: correcting a number
 * means editing one product file, not every benchmark that references it.
 *
 * Resolution order for a given key:
 *   1. A handful of computed/composite keys (e.g. "taskCompletion",
 *      which combines standardTasksCompleted/standardTasksTotal).
 *   2. A first-class field on the product schema (e.g. "startupTimeSeconds").
 *   3. An entry in the product's open-ended `attributes[]` list, matched
 *      by name (case-insensitive). This is what lets future benchmarks
 *      compare metrics that don't exist yet without touching this file.
 *
 * Returns `null` if the product has no data for that key, so callers can
 * render an explicit "Not recorded" instead of a misleading blank cell.
 */
export function resolveAttributeValue(
  product: ProductEntry,
  key: string
): { value: string; unit?: string } | null {
  const data = product.data;

  switch (key) {
    case 'taskCompletion': {
      if (
        data.standardTasksCompleted === undefined ||
        data.standardTasksTotal === undefined
      ) {
        return null;
      }
      return {
        value: `${data.standardTasksCompleted} / ${data.standardTasksTotal}`,
      };
    }
    case 'thirdPartyPluginSupport': {
      if (data.thirdPartyPluginSupport === undefined) return null;
      return { value: data.thirdPartyPluginSupport ? '支持' : '不支持' };
    }
    case 'startupTimeSeconds': {
      if (data.startupTimeSeconds === undefined) return null;
      return { value: String(data.startupTimeSeconds), unit: '秒' };
    }
    case 'typicalUse': {
      if (!data.typicalUse) return null;
      return { value: data.typicalUse };
    }
    default: {
      // Fall through to the extensible attributes list.
      const match = data.attributes.find(
        (attr) => attr.name.toLowerCase() === key.toLowerCase()
      );
      if (!match) return null;
      return { value: match.value, unit: match.unit };
    }
  }
}

/** Human-friendly fallback shown when a product has no data for a key. */
export const NOT_RECORDED = '暂无记录';

/** Fixed set of core comparison keys every product record may report,
 * paired with their Chinese display labels. Used by AttributeTable so
 * the product page and the benchmark comparison table describe the
 * same metrics with the same wording. */
export const CORE_ATTRIBUTE_ROWS: { key: string; label: string }[] = [
  { key: 'startupTimeSeconds', label: '平均启动时间' },
  { key: 'taskCompletion', label: '标准任务完成情况' },
  { key: 'thirdPartyPluginSupport', label: '第三方插件支持' },
  { key: 'typicalUse', label: '典型使用场景' },
];

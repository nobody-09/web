import type { CollectionEntry } from 'astro:content';

export type ProductEntry = CollectionEntry<'products'>;
export type BenchmarkEntry = CollectionEntry<'benchmarks'>;

export interface ResolvedAttribute {
  value: string;
  unit?: string;
  /** Present for fraction-based metrics (task counts), for machine-readable output. */
  numerator?: number;
  denominator?: number;
  /** What exactly this value was measured over — required reading before
   * comparing two numbers that use the same label but different scope
   * (e.g. an overall result vs. a task-subset result). */
  scope?: string;
}

/** Formats a completed/total pair as a percentage string with no decimal
 * places unless the result isn't a whole number (e.g. "68" not "68.0",
 * but "66.7" for a non-exact ratio). */
function formatRate(completed: number, total: number): string {
  const rate = Math.round((completed / total) * 1000) / 10;
  return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

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
 *   2. Scoped task-subset keys, using the `taskSubset:<id>` /
 *      `taskSubsetRate:<id>` convention — these only ever read from a
 *      product's `taskSubsets[]` list, never from its overall
 *      standardTasksCompleted/Total fields, so a subset result can never
 *      be silently rendered as if it were the overall result.
 *   3. A first-class field on the product schema (e.g. "startupTimeSeconds").
 *   4. An entry in the product's open-ended `attributes[]` list, matched
 *      by name (case-insensitive). This is what lets future benchmarks
 *      compare metrics that don't exist yet without touching this file.
 *
 * Returns `null` if the product has no data for that key, so callers can
 * render an explicit "Not recorded" instead of a misleading blank cell.
 */
export function resolveAttributeValue(
  product: ProductEntry,
  key: string
): ResolvedAttribute | null {
  const data = product.data;

  if (key.startsWith('taskSubsetRate:')) {
    const id = key.slice('taskSubsetRate:'.length);
    const subset = data.taskSubsets.find((s) => s.id === id);
    if (!subset) return null;
    return {
      value: formatRate(subset.completed, subset.total),
      numerator: subset.completed,
      denominator: subset.total,
      scope: subset.scope,
    };
  }

  if (key.startsWith('taskSubset:')) {
    const id = key.slice('taskSubset:'.length);
    const subset = data.taskSubsets.find((s) => s.id === id);
    if (!subset) return null;
    return {
      value: `${subset.completed} / ${subset.total}`,
      numerator: subset.completed,
      denominator: subset.total,
      scope: subset.scope,
    };
  }

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
        numerator: data.standardTasksCompleted,
        denominator: data.standardTasksTotal,
        // Only set when the product explicitly declares it — left
        // undefined for records (like the first benchmark group) that
        // only ever report one number and have no need to state a scope.
        scope: data.standardTasksScope,
      };
    }
    case 'taskCompletionRate': {
      if (
        data.standardTasksCompleted === undefined ||
        data.standardTasksTotal === undefined
      ) {
        return null;
      }
      return {
        value: formatRate(data.standardTasksCompleted, data.standardTasksTotal),
        numerator: data.standardTasksCompleted,
        denominator: data.standardTasksTotal,
        scope: data.standardTasksScope,
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
    case 'prebuiltTemplatesCount': {
      if (data.prebuiltTemplatesCount === undefined) return null;
      return { value: String(data.prebuiltTemplatesCount) };
    }
    case 'customWorkflowSupport': {
      if (data.customWorkflowSupport === undefined) return null;
      return { value: data.customWorkflowSupport ? '支持' : '不支持' };
    }
    case 'apiSupport': {
      if (data.apiSupport === undefined) return null;
      return { value: data.apiSupport ? '支持' : '不支持' };
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
  // Capability-verification rows (third benchmark group onward). Each is
  // resolved independently — a product that doesn't declare these fields
  // (every product in the first two benchmark groups) simply gets no row
  // for them, so existing product pages render exactly as before.
  { key: 'prebuiltTemplatesCount', label: '预置模板数量' },
  { key: 'customWorkflowSupport', label: '自定义工作流支持' },
  { key: 'apiSupport', label: 'API 支持' },
];

export const SITE_NAME = 'Workflow Tools Benchmark Archive';
export const SITE_TAGLINE = 'Independent functional test records for workflow software';

// This site is deployed as a GitHub Pages *project* repo (the repo is
// named "web"), so it's served from a subpath rather than the domain
// root. SITE_URL is the full origin + subpath; BASE_PATH is just the
// subpath, used to prefix every internal link so hrefs resolve correctly
// wherever the site is mounted.
//
// If this ever moves to a user/organization page repo (served from the
// domain root) or a different repo name, update both of these — nothing
// else in the codebase needs to change, since every internal link goes
// through `withBase()` below.
export const SITE_URL = 'https://nobody-09.github.io/web/';
export const BASE_PATH = '/web';

// Origin only (no subpath) — used together with `withBase()` to build
// absolute URLs (e.g. in the sitemap) without relying on `new URL(path,
// SITE_URL)`, which silently drops SITE_URL's own subpath when `path`
// starts with "/". Prefer `SITE_ORIGIN + withBase(path)` over `new
// URL(path, SITE_URL)` anywhere a subpath-preserving absolute URL is
// needed.
export const SITE_ORIGIN = 'https://nobody-09.github.io';

export const SITE_DESCRIPTION =
  '一个收录工作流软件标准化功能测试记录的档案网站,所有记录均遵循统一的测试方法发布。';

/**
 * Prefixes a site-internal, root-absolute path (e.g. "/products/") with
 * BASE_PATH so it resolves correctly when the site is mounted under a
 * subpath. Use this for every `href` that points within this site.
 */
export function withBase(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_PATH}${path}`;
}

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../utils/site';

// Hand-rolled sitemap instead of @astrojs/sitemap (see astro.config.mjs
// for why). Static section routes are listed once here; every product
// and benchmark route is pulled live from the same content collections
// the rest of the site renders from, so a new product/benchmark file
// appears here automatically with no other change needed.
export const GET: APIRoute = async () => {
  const products = await getCollection('products');
  const benchmarks = await getCollection('benchmarks');

  const staticPaths = [
    '/',
    '/products/',
    '/benchmarks/',
    '/methodology/',
    '/about/',
    '/data/',
  ];

  const urls: { loc: string; lastmod?: string }[] = [
    ...staticPaths.map((path) => ({ loc: path })),
    ...products.map((p) => ({
      loc: `/products/${p.slug}/`,
      lastmod: p.data.lastReviewed.toISOString().slice(0, 10),
    })),
    ...benchmarks.map((b) => ({
      loc: `/benchmarks/${b.slug}/`,
      lastmod: b.data.lastReviewed.toISOString().slice(0, 10),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${new URL(u.loc, SITE_URL).toString()}</loc>${
      u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};

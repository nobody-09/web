import { defineConfig } from 'astro/config';

// This repository is a GitHub Pages *project* repo named "web", so the
// site is served at https://nobody-09.github.io/web/ rather than the
// domain root. `base` must match the repo name so Astro/asset URLs
// resolve correctly; internal <a href> links in the site are prefixed
// via the `withBase()` helper in src/utils/site.ts, which mirrors this
// value — if this ever moves to a different repo name or a user/org
// page (domain root), update both `site`/`base` here and BASE_PATH in
// src/utils/site.ts.
//
// NOTE: sitemap generation is hand-rolled in src/pages/sitemap.xml.ts
// instead of using @astrojs/sitemap — that package currently crashes
// during the astro:build:done hook ("Cannot read properties of
// undefined (reading 'reduce')") on this project. The custom route
// gives the same "new content automatically appears in the sitemap"
// guarantee without depending on that integration.
export default defineConfig({
  site: 'https://nobody-09.github.io/web/',
  base: '/web',
});

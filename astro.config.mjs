import { defineConfig } from 'astro/config';

// This repository is a GitHub "user/organization page" repo
// (<username>.github.io), so it is served from the domain root.
// If this project is ever moved to a normal project repo instead
// (username.github.io/repo-name), update `site` and set `base: '/repo-name'`.
//
// NOTE: sitemap generation is hand-rolled in src/pages/sitemap.xml.ts
// instead of using @astrojs/sitemap — that package currently crashes
// during the astro:build:done hook ("Cannot read properties of
// undefined (reading 'reduce')") on this project. The custom route
// gives the same "new content automatically appears in the sitemap"
// guarantee without depending on that integration.
export default defineConfig({
  site: 'https://nobody-09.github.io/',
});

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// This repository is a GitHub "user/organization page" repo
// (<username>.github.io), so it is served from the domain root.
// If this project is ever moved to a normal project repo instead
// (username.github.io/repo-name), update `site` and set `base: '/repo-name'`.
export default defineConfig({
  site: 'https://nobody-09.github.io/',
  integrations: [sitemap()],
});

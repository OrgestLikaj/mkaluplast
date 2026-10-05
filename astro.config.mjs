// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeSpecCards from './src/lib/rehype-spec-cards.mjs';

// Static build — the contents of dist/ are uploaded to Namecheap's public_html.
export default defineConfig({
  site: 'https://mkaluplast.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    locales: ['en', 'it', 'sq'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    rehypePlugins: [rehypeSpecCards],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', it: 'it', sq: 'sq' } },
    }),
  ],
});

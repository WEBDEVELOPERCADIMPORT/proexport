// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { LANGUAGES } from './src/i18n/config.i18n';

import { getAllSitemapUrls } from './src/utils/seo/sitemapUrls.ts';
import { routingConfig } from './src/i18n/routing.config.ts';

const uniqueUrls = getAllSitemapUrls();

// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()]
  },

  site: 'https://www.proexportgt.com',

  adapter: cloudflare(),
  i18n: {
    defaultLocale: routingConfig.defaultLocale,
    locales: Object.keys(LANGUAGES),
    routing: routingConfig.useSource ? 'manual' : {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'es',
      locales: {
        en: 'en',
        es: 'es',
      },
    },
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date(),
    customPages: uniqueUrls
  })]
});
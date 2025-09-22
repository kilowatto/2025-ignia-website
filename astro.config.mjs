// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import ogCanvas from 'astro-og-canvas';

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap(), ogCanvas()],

  vite: {
    plugins: [tailwindcss()]
  }
});
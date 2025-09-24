// astro.config.ts
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@tailwindcss/vite'
import i18next from "astro-i18next";
import node from '@astrojs/node';

export default defineConfig({
  // Configurar para Server-Side Rendering para permitir detección de idioma
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  
  integrations: [sitemap(), i18next()],
  vite: {
    plugins: [tailwind()],
  },

  i18n: {
    // Tu idioma por defecto. Las visitas a "/" irán a inglés.
    defaultLocale: 'en',

    // La lista de todos los idiomas que soportas.
    locales: ['en', 'es', 'fr'],

    routing: {
      // No añade el prefijo 'en' a las URLs en inglés.
      // Tendrás: tudominio.com/, tudominio.com/es/, tudominio.com/fr/
      prefixDefaultLocale: false, 
    }
  }
})
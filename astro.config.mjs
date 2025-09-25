// astro.config.ts
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@tailwindcss/vite'
import i18next from "astro-i18next";
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://ignia.cloud', // ⭐ REQUERIDO para sitemap
  
  // Configurar para Server-Side Rendering para permitir detección de idioma
  output: 'static', // Cambiado a 'static' de 'server'
  adapter: node({
    mode: 'standalone'
  }),
  
  integrations: [
    sitemap({
      // Configuración para sitemap multiidioma
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en', // inglés en la raíz
          es: 'es', // español en /es/
          fr: 'fr', // francés en /fr/
        },
      },
      // Filtrar páginas que no queremos en el sitemap
      filter: (page) => !page.includes('/admin/') && !page.includes('/private/'),
      
      // Personalizar cambio de frecuencia y prioridad
      changefreq: 'weekly',
      priority: 0.7,
    }), 
    i18next()
  ],
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
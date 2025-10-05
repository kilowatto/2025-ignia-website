// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

// ============================================================================
// SITE URL - Configuración Dinámica
// ============================================================================
// Permite usar diferentes dominios según el ambiente:
// - Development: http://localhost:4321
// - Staging: https://ignia.kilowatto.com
// - Production: https://ignia.cloud
//
// Configuración:
// 1. Variable de entorno: PUBLIC_SITE_URL (prioritaria)
// 2. Fallback: https://ignia.cloud (producción por defecto)
//
// Uso en Cloudflare Pages Dashboard → Settings → Environment Variables:
// - Production: PUBLIC_SITE_URL = https://ignia.cloud
// - Preview: PUBLIC_SITE_URL = https://ignia.kilowatto.com
//
// Uso local:
// - PUBLIC_SITE_URL=http://localhost:4321 pnpm run dev
// ============================================================================
const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://ignia.cloud';

// ============================================================================
// ADAPTER: @astrojs/cloudflare
// ============================================================================onfig.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

// ============================================================================
// ADAPTER: @astrojs/cloudflare
// ============================================================================
// Configuración para deploy en Cloudflare Pages/Workers
// - mode: 'directory' genera una estructura compatible con Pages Functions
// - Permite SSR (Server-Side Rendering) en edge computing de Cloudflare
// - Compatible con Cloudflare Workers runtime (NO Node.js runtime)
// 
// IMPORTANTE: Este adapter NO es compatible con Node.js APIs nativas como 
// 'fs', 'path', 'child_process'. Usa Cloudflare Workers APIs en su lugar.
//
// Docs: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
// ============================================================================

export default defineConfig({
  // URL base del sitio - dinámica según ambiente
  site: SITE_URL,
  
  // SSR habilitado - páginas se renderizan en Cloudflare Workers al solicitar
  output: 'server',
  
  // Adapter de Cloudflare Pages con modo directorio
  // - 'directory': Estructura de archivos para Cloudflare Pages
  // - 'advanced': Control total sobre Workers (avanzado)
  adapter: cloudflare({ 
    mode: 'directory',
    // imageService: 'cloudflare', // Opcional: Cloudflare Image Resizing
  }),
  
  // Configuración nativa de i18n de Astro (para routing)
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    routing: {
      prefixDefaultLocale: false, // /en no lleva prefijo, solo / 
    }
  },

  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
          fr: 'fr',
        },
      },
    }),
    compress(),
  ],
});

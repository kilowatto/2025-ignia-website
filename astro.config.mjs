// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';

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
    
    // ============================================================================
    // REACT: Islands Architecture
    // ============================================================================
    // Permite usar componentes React interactivos (Islands)
    // - Solo hidrata componentes con client:* directive
    // - Resto del sitio queda como HTML estático (mejor performance)
    // - Perfecto para componentes interactivos como BookingCalendar
    // 
    // Uso: <BookingCalendar client:load />
    // Docs: https://docs.astro.build/en/guides/integrations-guide/react/
    // ============================================================================
    react(),
    
    // ============================================================================
    // PARTYTOWN: Scripts de Terceros en Web Worker
    // ============================================================================
    // Mueve scripts pesados (GTM, GA4, chatbots) al Web Worker
    // Beneficios:
    // - No bloquea el main thread (mejor performance)
    // - Mantiene LCP < 2.5s incluso con scripts de terceros
    // - Reduce TBT (Total Blocking Time) hasta -40%
    // 
    // Uso: <script type="text/partytown" src="..."></script>
    // Docs: https://docs.astro.build/en/guides/integrations-guide/partytown/
    // ============================================================================
    partytown({
      config: {
        // Forward: Eventos que deben pasar del Worker al main thread
        // - dataLayer.push: Para Google Tag Manager
        // - gtag: Para Google Analytics 4
        forward: ['dataLayer.push', 'gtag'],
        
        // Debug: Solo en desarrollo para troubleshooting
        debug: import.meta.env.DEV,
      },
    }),
  ],
});

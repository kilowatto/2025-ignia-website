/**
 * sitemap-index.xml.ts
 * Genera el sitemap index principal que referencia los sitemaps individuales
 * 
 * Cumple con arquitecture.md: Sitemaps multiidioma (EN, ES, FR) actualizados en cada build
 * Se genera estáticamente en build time para óptimo rendimiento
 * 
 * Estructura:
 * - sitemap-index.xml (este archivo) → Índice principal
 *   ├── sitemap-0.xml → URLs en inglés (default)
 *   ├── es/sitemap-0.xml → URLs en español
 *   └── fr/sitemap-0.xml → URLs en francés
 * 
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 */
import type { APIRoute } from 'astro';

// Prerender este archivo en build time (no requiere servidor en producción)
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  // Obtener URL base del sitio desde astro.config.mjs
  const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://ignia.cloud';

  // Fecha de última modificación (se actualiza en cada build)
  const lastMod = new Date().toISOString();

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-en.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-es.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-fr.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
    },
  });
};

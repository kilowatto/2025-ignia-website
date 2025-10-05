/**
 * robots.txt.ts
 * Genera el archivo robots.txt dinámicamente según mejores prácticas SEO 2025
 * 
 * Cumple con arquitecture.md: "robot.txt debe existir y actualizado para que
 * siempre sea legible por los principales motores de búsqueda usando las mejores técnicas"
 * 
 * Características:
 * - User-agents específicos para los principales motores de búsqueda
 * - Sitemaps multiidioma (en, es, fr) según arquitecture.md
 * - URL dinámica desde astro.config.mjs (no hardcoded)
 * - Cache optimizado (24 horas)
 * - Permite indexación completa del sitio
 * - Se genera dinámicamente en cada request (modo server)
 * 
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/intro
 * @see https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec
 */
import type { APIRoute } from 'astro';

// No prerender - genera dinámicamente en cada request (modo server)
export const prerender = false;

export const GET: APIRoute = ({ site }) => {
    // Obtener la URL base del sitio desde astro.config.mjs
    // Eliminar trailing slash para consistencia
    // En desarrollo, site puede ser undefined, usar fallback
    const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://ignia.cloud';

    // Generar fecha actual para trazabilidad
    const lastUpdate = new Date().toISOString().split('T')[0]; const robotsTxt = `# robots.txt para Ignia Cloud
# Generado automáticamente - Cumple arquitecture.md v1.3
# Última actualización: ${lastUpdate}
# Sitio: ${siteUrl}

# ========================================
# MOTORES DE BÚSQUEDA PRINCIPALES
# ========================================

# Googlebot (Google Search)
User-agent: Googlebot
Allow: /

# Googlebot-Image (Google Images)
User-agent: Googlebot-Image
Allow: /

# Bingbot (Microsoft Bing)
User-agent: Bingbot
Allow: /

# Slurp (Yahoo)
User-agent: Slurp
Allow: /

# DuckDuckBot (DuckDuckGo)
User-agent: DuckDuckBot
Allow: /

# Baiduspider (Baidu - China)
User-agent: Baiduspider
Allow: /

# YandexBot (Yandex - Rusia)
User-agent: YandexBot
Allow: /

# Resto de crawlers legítimos
User-agent: *
Allow: /

# ========================================
# SITEMAPS MULTIIDIOMA
# Según arquitecture.md: EN (default), ES, FR
# Los sitemaps se generan automáticamente en cada build
# ========================================

Sitemap: ${siteUrl}/sitemap-index.xml
Sitemap: ${siteUrl}/sitemap-en.xml
Sitemap: ${siteUrl}/sitemap-es.xml
Sitemap: ${siteUrl}/sitemap-fr.xml

# ========================================
# RUTAS BLOQUEADAS (opcional)
# Descomenta según sea necesario
# ========================================

# Bloquear panel de administración (si existe)
Disallow: /admin/

# Bloquear APIs privadas (si existen)
# Disallow: /api/private/

# Bloquear archivos JSON directos (opcional)
Disallow: /*.json$

# Bloquear páginas de prueba/desarrollo (opcional)
# Disallow: /test/
# Disallow: /dev/

# ========================================
# INFORMACIÓN DE CONTACTO / CONTACT INFORMATION / INFORMATIONS DE CONTACT
# ========================================
# ES: Información de contacto del sitio web para webmasters y motores de búsqueda
# EN: Website contact information for webmasters and search engines
# FR: Informations de contact du site web pour les webmasters et moteurs de recherche

Host: ${siteUrl}
Contact: info@ignia.cloud
`;

    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
        },
    });
};
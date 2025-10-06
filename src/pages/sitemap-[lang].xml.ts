/**
 * sitemap-[lang].xml.ts
 * Genera sitemaps individuales por idioma con todas las URLs del sitio
 * 
 * Cumple con arquitecture.md: Sitemaps multiidioma actualizados en cada build
 * Incluye hreflang alternates para SEO internacional
 * 
 * Rutas generadas:
 * - /sitemap-en.xml → Todas las páginas en inglés
 * - /sitemap-es.xml → Todas las páginas en español
 * - /sitemap-fr.xml → Todas las páginas en francés
 * 
 * @see https://developers.google.com/search/docs/specialty/international/localized-versions
 */
import type { APIRoute, GetStaticPaths } from 'astro';

// Prerender con parámetros estáticos en build time
export const prerender = false;

// Definir todas las páginas del sitio
// TODO: Actualizar esta lista cada vez que se agreguen nuevas páginas (arquitecture.md)
// 
// ⚠️ PIPELINE OBLIGATORIO: Al crear una nueva página:
// 1. Agregar la ruta aquí con changefreq y priority apropiados
// 2. Verificar que aparece en /sitemap-[lang].xml para los 3 idiomas
// 3. Testear con: curl http://localhost:4321/sitemap-en.xml | grep "nueva-pagina"
// 4. Commit con mensaje: "feat(sitemap): add /nueva-pagina to XML sitemaps"
// 
// Páginas actuales:
const pages = [
    { path: '', changefreq: 'daily', priority: 1.0 },           // Home
    { path: '/search', changefreq: 'monthly', priority: 0.5 },  // Búsqueda
    { path: '/status', changefreq: 'hourly', priority: 0.8 },   // Status Page (añadido: 2025-10-06)
    // Agregar aquí nuevas páginas según se creen
];

const locales = ['en', 'es', 'fr'];

/**
 * Genera las rutas estáticas para cada idioma
 */
export const getStaticPaths: GetStaticPaths = () => {
    return locales.map(lang => ({
        params: { lang },
    }));
};

export const GET: APIRoute = ({ params, site }) => {
    const { lang } = params;
    const siteUrl = site ? site.toString().replace(/\/$/, '') : 'https://ignia.cloud';
    const lastMod = new Date().toISOString().split('T')[0];

    // Generar URLs para el idioma específico
    const urlElements = pages.map(page => {
        const isDefault = lang === 'en';
        const pagePath = page.path;

        // URL principal para este idioma
        const url = isDefault
            ? `${siteUrl}${pagePath}`
            : `${siteUrl}/${lang}${pagePath}`;

        // Generar hreflang alternates para todos los idiomas
        const alternates = locales.map(altLang => {
            const altIsDefault = altLang === 'en';
            const altUrl = altIsDefault
                ? `${siteUrl}${pagePath}`
                : `${siteUrl}/${altLang}${pagePath}`;

            return `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`;
        }).join('\n');

        // x-default siempre apunta a la versión en inglés
        const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${pagePath}" />`;

        return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${alternates}
${xDefault}
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        },
    });
};

import type { APIRoute } from 'astro';

// Define todas las páginas de tu sitio
const pages = [
    // Páginas principales
    { path: '', changefreq: 'daily', priority: 1.0 },
    { path: '/soluciones/', changefreq: 'weekly', priority: 0.8 },
    { path: '/productos/', changefreq: 'weekly', priority: 0.8 },
    { path: '/servicios/', changefreq: 'weekly', priority: 0.8 },
    { path: '/IA/', changefreq: 'weekly', priority: 0.8 },
    { path: '/Managed-IT/', changefreq: 'weekly', priority: 0.8 },
    { path: '/soporte/', changefreq: 'weekly', priority: 0.7 },
    { path: '/search/', changefreq: 'monthly', priority: 0.5 },
];

const locales = ['en', 'es', 'fr'];
const baseUrl = 'https://ignia.cloud';

function generateSitemap(): string {
    const urlElements: string[] = [];

    // Para cada página, generar URLs para todos los idiomas
    pages.forEach(page => {
        locales.forEach(locale => {
            const isDefault = locale === 'en';
            const url = isDefault
                ? `${baseUrl}${page.path}`
                : `${baseUrl}/${locale}${page.path}`;

            // Generar alternates para hreflang
            const alternates = locales.map(altLocale => {
                const altIsDefault = altLocale === 'en';
                const altUrl = altIsDefault
                    ? `${baseUrl}${page.path}`
                    : `${baseUrl}/${altLocale}${page.path}`;

                return `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}" />`;
            }).join('\n');

            urlElements.push(`  <url>
    <loc>${url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
${alternates}
  </url>`);
        });
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements.join('\n')}
</urlset>`;
}

export const GET: APIRoute = () => {
    const sitemap = generateSitemap();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        },
    });
};
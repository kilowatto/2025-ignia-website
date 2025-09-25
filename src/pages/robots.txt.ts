import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://ignia.cloud/sitemap.xml

# Páginas que no queremos indexar (si las hay)
# Disallow: /admin/
# Disallow: /private/

# Crawl-delay para ser amigables con los bots
Crawl-delay: 1`;

    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
        },
    });
};
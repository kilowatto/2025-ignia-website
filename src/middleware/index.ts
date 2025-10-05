// src/middleware/index.ts
// Middleware para astro-i18n según arquitecture.md
import { sequence, defineMiddleware } from 'astro/middleware';
import { useAstroI18n } from 'astro-i18n';
import config from '../../astro-i18n.config.mjs';

/**
 * Inicialización de astro-i18n middleware
 * IMPORTANTE: Se inicializa UNA SOLA VEZ al cargar el módulo
 * para evitar el error "Cannot initialize astro-i18n, it already has been initialized"
 * 
 * Esta instancia se reutiliza en cada request para procesar las rutas con i18n
 */
const astroI18nMiddleware = useAstroI18n(config);

/**
 * Middleware para excluir rutas específicas del procesamiento i18n
 * Rutas excluidas:
 * - /robots.txt (endpoint dinámico SEO)
 * - /sitemap*.xml (sitemaps multiidioma)
 * - /_* (rutas internas de Astro)
 * 
 * Estas rutas deben procesarse sin i18n para funcionar correctamente
 * según las mejores prácticas de arquitecture.md
 */
const excludeFromI18n = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Excluir robots.txt, sitemaps y rutas internas del procesamiento i18n
    if (
        pathname === '/robots.txt' ||
        pathname.startsWith('/sitemap') ||
        pathname.endsWith('.xml') ||
        pathname.startsWith('/_')
    ) {
        return next();
    }

    // Usar la instancia de astro-i18n ya inicializada
    // NO reinicializar en cada request
    return astroI18nMiddleware(context, next);
});

export const onRequest = sequence(excludeFromI18n);

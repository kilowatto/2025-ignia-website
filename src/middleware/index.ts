// src/middleware/index.ts
// Middleware para astro-i18n según arquitecture.md
import { sequence, defineMiddleware } from 'astro/middleware';
import { useAstroI18n } from 'astro-i18n';
import config from '../../astro-i18n.config.mjs';

/**
 * Inicialización de astro-i18n middleware con caché global
 * 
 * PROBLEMA: En modo desarrollo (HMR), Vite puede recargar este módulo múltiples veces,
 * causando el error "Cannot initialize astro-i18n, it already has been initialized"
 * 
 * SOLUCIÓN: Usar caché global (globalThis) para almacenar la instancia inicializada
 * y reutilizarla en recargas del módulo en dev mode.
 * 
 * Esta técnica es segura porque:
 * - En producción: el módulo se carga una sola vez
 * - En desarrollo: globalThis persiste entre hot reloads de Vite
 * 
 * @see https://github.com/alexandre-fernandez/astro-i18n/issues
 */

// Declarar tipo global para TypeScript
declare global {
    // eslint-disable-next-line no-var
    var __astroI18nMiddleware: ReturnType<typeof useAstroI18n> | undefined;
}

// Crear o reutilizar la instancia de astro-i18n
const astroI18nMiddleware = globalThis.__astroI18nMiddleware ?? useAstroI18n(config);

// Guardar en caché global para reutilizar en hot reloads
if (!globalThis.__astroI18nMiddleware) {
    globalThis.__astroI18nMiddleware = astroI18nMiddleware;
}

/**
 * Middleware para excluir rutas específicas del procesamiento i18n
 * Rutas excluidas:
 * - /robots.txt (endpoint dinámico SEO)
 * - /sitemap*.xml (sitemaps multiidioma)
 * - /status (página de monitoreo, sin i18n)
 * - /_* (rutas internas de Astro)
 * 
 * Estas rutas deben procesarse sin i18n para funcionar correctamente
 * según las mejores prácticas de arquitecture.md
 */
const excludeFromI18n = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Excluir robots.txt, sitemaps, status page y rutas internas del procesamiento i18n
    if (
        pathname === '/robots.txt' ||
        pathname === '/status' ||
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

/**
 * siteConfig.ts
 * 
 * Utilidades para obtener la URL base del sitio de forma dinámica.
 * 
 * PROBLEMA RESUELTO:
 * URLs hardcodeadas a https://ignia.cloud causaban problemas en:
 * - Desarrollo local (localhost:4321)
 * - Staging (ignia.kilowatto.com)
 * - Production (ignia.cloud)
 * 
 * SOLUCIÓN:
 * Detección automática del dominio con prioridades:
 * 1. Astro.site (de astro.config.mjs + variable de entorno PUBLIC_SITE_URL)
 * 2. Astro.url.origin (request actual - dominio del browser)
 * 3. Fallback hardcoded (solo como última opción)
 * 
 * USO:
 * ```astro
 * import { getSiteUrl } from '../utils/siteConfig';
 * 
 * const baseUrl = getSiteUrl(Astro);
 * // → http://localhost:4321 (dev)
 * // → https://ignia.kilowatto.com (staging)
 * // → https://ignia.cloud (production)
 * ```
 * 
 * @see astro.config.mjs - Configuración de SITE_URL con variable de entorno
 */

import type { AstroGlobal } from 'astro';

/**
 * Obtiene la URL base del sitio de forma dinámica según el ambiente.
 * 
 * Prioridad de detección:
 * 1. **Astro.url.origin** - Dominio de la request actual (protocol + host) - PRIORITARIO
 * 2. **Astro.site** - Valor de `site` en astro.config.mjs (lee PUBLIC_SITE_URL)
 * 3. **Fallback** - https://ignia.cloud (solo si fallan 1 y 2)
 * 
 * NOTA: Se invirtió la prioridad para detectar automáticamente el dominio
 * sin necesidad de configurar PUBLIC_SITE_URL en Cloudflare Pages.
 * Esto asegura que OG images siempre usen el dominio correcto (staging/prod).
 * 
 * @param Astro - Objeto global de Astro con contexto de la request
 * @returns URL base sin trailing slash (ej: "https://ignia.cloud")
 * 
 * @example
 * ```astro
 * const baseUrl = getSiteUrl(Astro);
 * const canonicalUrl = `${baseUrl}${Astro.url.pathname}`;
 * // → https://ignia.cloud/es/about
 * ```
 */
export function getSiteUrl(Astro: AstroGlobal): string {
    // Prioridad 1: Detectar del request actual (SSR) - AUTOMÁTICO
    // Funciona sin configuración en cualquier dominio
    if (Astro.url && Astro.url.origin) {
        return Astro.url.origin;
    }

    // Prioridad 2: Usar Astro.site de config (incluye PUBLIC_SITE_URL)
    if (Astro.site) {
        return Astro.site.toString().replace(/\/$/, '');
    }

    // Prioridad 3: Fallback a production (solo si fallan las anteriores)
    return 'https://ignia.cloud';
}

/**
 * Obtiene solo el hostname (sin protocol) para usar en resource hints.
 * 
 * @param Astro - Objeto global de Astro
 * @returns Hostname sin protocol (ej: "ignia.cloud")
 * 
 * @example
 * ```astro
 * const host = getSiteHost(Astro);
 * // → "ignia.cloud"
 * 
 * <link rel="preconnect" href={`https://${host}`} crossorigin />
 * ```
 */
export function getSiteHost(Astro: AstroGlobal): string {
    const siteUrl = getSiteUrl(Astro);

    try {
        const url = new URL(siteUrl);
        return url.host;
    } catch (e) {
        // Fallback si la URL es inválida
        return 'ignia.cloud';
    }
}

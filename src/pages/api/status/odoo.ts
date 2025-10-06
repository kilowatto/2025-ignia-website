/**
 * API Endpoint: /api/status/odoo
 * 
 * PROPÓSITO:
 * Endpoint para verificar el estado de Odoo API de forma asíncrona.
 * Permite progressive rendering client-side sin bloquear SSR inicial.
 * 
 * ESTRATEGIA:
 * - SSR: Website check (instantáneo, <5ms)
 * - Client-side: fetch('/api/status/odoo') → update DOM cuando complete
 * 
 * JUSTIFICACIÓN JS (~50 líneas):
 * Mejora perceived performance de 5s → <500ms (mejora 10×)
 * arquitectura.md §2: JS mínimo justificado por UX significativa
 * 
 * @see src/components/StatusPage.astro - Consume este endpoint con fetch()
 */

import type { APIRoute } from 'astro';
import { getOdooConfig, validateOdooConfig } from '../../../lib/odoo/config';
import { OdooClient } from '../../../lib/odoo/OdooClient';

export const GET: APIRoute = async ({ url }) => {
    const start = Date.now();

    // Verificar si tiene token válido para logs detallados
    const providedToken = url.searchParams.get('token');
    const expectedToken = import.meta.env.STATUS_PAGE_TOKEN;
    const showLogs = expectedToken ? providedToken === expectedToken : true;

    try {
        // Paso 1: Validar configuración
        const validation = validateOdooConfig();

        if (!validation.valid) {
            return new Response(
                JSON.stringify({
                    name: 'Odoo API',
                    status: 'down',
                    responseTime: Date.now() - start,
                    message: 'Configuration missing',
                    lastChecked: new Date().toISOString(),
                    error: {
                        message: `Missing environment variables: ${validation.missingVars.join(', ')}`,
                        code: 'CONFIG_MISSING',
                    },
                    details: showLogs ? {
                        missingVars: validation.missingVars,
                        hint: 'Add variables to .env.local or Cloudflare Pages settings',
                    } : undefined,
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    },
                }
            );
        }

        // Paso 2: Obtener config y crear cliente
        const config = getOdooConfig();
        const client = new OdooClient(config, 5000); // 5s timeout

        // Paso 3: Intentar autenticación
        const authStart = Date.now();
        const auth = await client.authenticate();
        const authTime = Date.now() - authStart;

        // Paso 4: Success
        const totalTime = Date.now() - start;

        return new Response(
            JSON.stringify({
                name: 'Odoo API',
                status: totalTime < 2000 ? 'operational' : 'degraded',
                responseTime: totalTime,
                message:
                    totalTime < 2000
                        ? 'Connected and authenticated'
                        : 'Connected but slow response',
                lastChecked: new Date().toISOString(),
                details: showLogs
                    ? {
                        url: config.url,
                        database: config.db,
                        username: config.username,
                        uid: auth.uid,
                        authTime: `${authTime}ms`,
                    }
                    : {
                        url: config.url.replace(/https?:\/\//, '').split('/')[0],
                        database: config.db,
                    },
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            }
        );
    } catch (error) {
        const totalTime = Date.now() - start;
        const errorObj = error as any;

        // Obtener config para details (puede fallar si no está configurado)
        let attemptedUrl: string | undefined;
        try {
            attemptedUrl = getOdooConfig()?.url;
        } catch {
            attemptedUrl = undefined;
        }

        return new Response(
            JSON.stringify({
                name: 'Odoo API',
                status: 'down',
                responseTime: totalTime,
                message: error instanceof Error ? error.message : 'Connection failed',
                lastChecked: new Date().toISOString(),
                error: showLogs
                    ? {
                        message: error instanceof Error ? error.message : 'Unknown error',
                        code: errorObj.code || 'CONNECTION_ERROR',
                        stack: error instanceof Error ? error.stack : undefined,
                        raw: errorObj,
                    }
                    : {
                        message: 'Authentication or connection error',
                        code: 'ODOO_ERROR',
                    },
                details: showLogs
                    ? {
                        attemptedUrl,
                        timeout: '5000ms',
                    }
                    : undefined,
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            }
        );
    }
};

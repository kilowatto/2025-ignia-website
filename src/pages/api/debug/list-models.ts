// ============================================================================
// DEBUG ENDPOINT - Listar todos los modelos disponibles en Odoo
// ============================================================================
//
// PROPÓSITO: Encontrar el modelo correcto para appointments
//
// USO: GET /api/debug/list-models?search=appointment
//
// NOTA: Solo para desarrollo
// ============================================================================
import type { APIRoute } from 'astro';
import { OdooClient } from '../../../lib/odoo/OdooClient';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || 'appointment';

    try {
        const client = new OdooClient({
            url: import.meta.env.ODOO_URL,
            db: import.meta.env.ODOO_DB,
            username: import.meta.env.ODOO_API_USER,
            password: import.meta.env.ODOO_API_PASSWORD,
        });

        await client.authenticate();

        console.log(`[DEBUG] Searching for models containing: "${searchTerm}"`);

        // Buscar modelos que contengan el término de búsqueda
        const models = await client.execute<any[]>(
            'ir.model',
            'search_read',
            [[['model', 'ilike', searchTerm]]],
            { fields: ['model', 'name', 'state'] }
        );

        console.log(`[DEBUG] Found ${models?.length || 0} models`);
        console.log('[DEBUG] Models:', models);

        return new Response(
            JSON.stringify(
                {
                    success: true,
                    searchTerm,
                    count: models?.length || 0,
                    models: models || [],
                },
                null,
                2
            ),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('[DEBUG] Error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

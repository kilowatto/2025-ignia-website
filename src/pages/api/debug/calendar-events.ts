// ============================================================================
// DEBUG ENDPOINT - Ver todos los calendar.event en Odoo
// ============================================================================
//
// PROPÓSITO: Verificar qué eventos existen realmente en calendar.event
//
// USO: GET /api/debug/calendar-events?date=2025-10-15
//
// NOTA: Solo para desarrollo, remover en producción
// ============================================================================
import type { APIRoute } from 'astro';
import { OdooClient } from '../../../lib/odoo/OdooClient';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '2025-10-15';

    try {
        // Crear cliente Odoo
        const client = new OdooClient({
            url: import.meta.env.ODOO_URL,
            db: import.meta.env.ODOO_DB,
            username: import.meta.env.ODOO_API_USER,
            password: import.meta.env.ODOO_API_PASSWORD,
        });

        await client.authenticate();

        // Buscar TODOS los eventos de ese día (sin filtro active)
        const startDatetime = `${date} 00:00:00`;
        const endDatetime = `${date} 23:59:59`;

        // Primero: Buscar con filtro original (active = true)
        const domainActive = [
            ['start', '<=', endDatetime],
            ['stop', '>=', startDatetime],
            ['active', '=', true],
        ];

        const eventsActive = await client.execute<any[]>(
            'calendar.event',
            'search_read',
            [domainActive],
            {
                fields: [
                    'id',
                    'name',
                    'start',
                    'stop',
                    'duration',
                    'allday',
                    'partner_ids',
                    'user_id',
                    'active',
                    'state',
                    'appointment_type_id',
                ],
            }
        );

        // Segundo: Buscar SIN filtro active
        const domainAll = [
            ['start', '<=', endDatetime],
            ['stop', '>=', startDatetime],
        ];

        const eventsAll = await client.execute<any[]>(
            'calendar.event',
            'search_read',
            [domainAll],
            {
                fields: [
                    'id',
                    'name',
                    'start',
                    'stop',
                    'duration',
                    'allday',
                    'partner_ids',
                    'user_id',
                    'active',
                    'state',
                    'appointment_type_id',
                ],
            }
        );

        return new Response(
            JSON.stringify(
                {
                    success: true,
                    date,
                    debug: {
                        dateRange: { startDatetime, endDatetime },
                        withActiveFilter: {
                            count: eventsActive?.length || 0,
                            events: eventsActive || [],
                        },
                        withoutActiveFilter: {
                            count: eventsAll?.length || 0,
                            events: eventsAll || [],
                        },
                    },
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
        console.error('[DEBUG] Error fetching calendar events:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

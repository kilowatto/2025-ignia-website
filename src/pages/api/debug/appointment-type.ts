// ============================================================================
// DEBUG ENDPOINT - Explorar calendar.appointment.type en Odoo
// ============================================================================
//
// PROPÓSITO: Verificar qué datos tiene el appointment type #4
//
// USO: GET /api/debug/appointment-type?id=4
//
// NOTA: Solo para desarrollo, remover en producción
// ============================================================================
import type { APIRoute } from 'astro';
import { OdooClient } from '../../../lib/odoo/OdooClient';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const appointmentTypeId = parseInt(url.searchParams.get('id') || '4');

    try {
        // Crear cliente Odoo
        const client = new OdooClient({
            url: import.meta.env.ODOO_URL,
            db: import.meta.env.ODOO_DB,
            username: import.meta.env.ODOO_API_USER,
            password: import.meta.env.ODOO_API_PASSWORD,
        });

        await client.authenticate();

        // INTENTO 1: Leer datos del appointment type (MODELO CORRECTO: appointment.type)
        console.log(`[DEBUG] Reading appointment type ${appointmentTypeId}...`);

        let appointmentType;
        try {
            // Especificar TODOS los campos explícitamente
            appointmentType = await client.execute<any[]>(
                'appointment.type',
                'search_read',
                [[['id', '=', appointmentTypeId]]],
                {
                    fields: [
                        'id',
                        'name',
                        'appointment_duration',
                        'min_schedule_hours',
                        'max_schedule_days',
                        'slot_ids',
                        'staff_user_ids',
                        'work_hours_activated',
                        'appointment_tz',
                        'schedule_based_on',
                        'assign_method',
                    ]
                }
            );
            console.log('[DEBUG] appointment type data:', appointmentType);

            if (appointmentType && appointmentType[0]) {
                const apt = appointmentType[0];
                console.log('[DEBUG] Appointment type raw object:', apt);
                console.log('[DEBUG] Object keys:', Object.keys(apt));
                console.log('[DEBUG] Appointment details:', {
                    id: apt.id || apt[0],
                    name: apt.name || apt[1],
                    duration: apt.appointment_duration || apt[2],
                    min_hours: apt.min_schedule_hours || apt[3],
                    max_days: apt.max_schedule_days || apt[4],
                    timezone: apt.appointment_tz,
                    slot_ids: apt.slot_ids || apt.slice(5),
                    staff_users: apt.staff_user_ids,
                });
            }
        } catch (readError) {
            console.error('[DEBUG] Failed to read appointment type:', readError);
        }        // INTENTO 2: Search all appointment types
        let allAppointments;
        try {
            allAppointments = await client.execute<any[]>(
                'appointment.type',
                'search_read',
                [[]],
                { fields: ['id', 'name', 'appointment_duration', 'slot_ids', 'staff_user_ids', 'min_schedule_hours', 'max_schedule_days'] }
            );
            console.log('[DEBUG] All appointment types:', allAppointments);
        } catch (searchError) {
            console.error('[DEBUG] Failed to search appointment types:', searchError);
        }

        // INTENTO 3: Leer slots desde appointment.slot
        let appointmentSlots;
        try {
            console.log('[DEBUG] Trying to read appointment.slot records...');
            appointmentSlots = await client.execute<any[]>(
                'appointment.slot',
                'search_read',
                [[['appointment_type_id', '=', appointmentTypeId]]],
                {
                    fields: [
                        'id',
                        'start_datetime',
                        'end_datetime',
                        'duration',
                        'slot_type',
                        'weekday',
                        'start_hour',
                        'end_hour',
                    ],
                    limit: 20
                }
            );
            console.log('[DEBUG] Found', appointmentSlots?.length || 0, 'appointment slots');

            if (appointmentSlots && appointmentSlots.length > 0) {
                const firstSlot = appointmentSlots[0];
                console.log('[DEBUG] First slot raw object:', firstSlot);
                console.log('[DEBUG] First slot keys:', Object.keys(firstSlot));
                console.log('[DEBUG] First 3 slots:', appointmentSlots.slice(0, 3).map(slot => ({
                    id: slot.id || slot[0],
                    type: slot.slot_type || slot[4],
                    weekday: slot.weekday || slot[5],
                    start: slot.start_hour || slot[6],
                    end: slot.end_hour || slot[7],
                    start_dt: slot.start_datetime || slot[1],
                    end_dt: slot.end_datetime || slot[2],
                })));
            }
        } catch (slotError) {
            console.error('[DEBUG] Failed to read appointment.slot:', slotError);
        }

        return new Response(
            JSON.stringify(
                {
                    success: true,
                    appointmentTypeId,
                    debug: {
                        appointmentType: appointmentType || null,
                        allAppointments: allAppointments || [],
                        appointmentSlots: appointmentSlots || [],
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
        console.error('[DEBUG] Error:', error);

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

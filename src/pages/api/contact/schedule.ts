/**
 * /api/contact/schedule.ts - API endpoint para agendar citas con Odoo Calendar
 * 
 * PROPÓSITO:
 * Endpoint SSR de Astro que recibe solicitudes de agendamiento de citas desde el
 * formulario web y crea eventos en Odoo Calendar (calendar.event model) asignados
 * al equipo comercial.
 * 
 * FLUJO:
 * 1. Cliente envía POST con JSON: { name, company, email, phone, date, time, topic }
 * 2. Servidor valida datos (server-side)
 * 3. Servidor busca/crea partner en Odoo (res.partner)
 * 4. Servidor crea evento de calendario (calendar.event) con attendees
 * 5. Servidor responde con JSON: { success, message, eventId }
 * 
 * ODOO CALENDAR MODEL:
 * - Model: calendar.event
 * - Campos clave:
 *   - name: Título del evento (ej: "Meeting with Juan Pérez - Acme Corp")
 *   - start: Fecha/hora inicio (formato UTC datetime)
 *   - stop: Fecha/hora fin (start + duration)
 *   - partner_ids: Array de partner IDs (contacto que agenda)
 *   - user_id: ID del usuario responsable (sales team)
 *   - description: Detalles del tema a tratar
 *   - allday: false (eventos con hora específica)
 *   - duration: Duración en horas (default: 1.0)
 * 
 * CUMPLIMIENTO:
 * §3 Stack Técnico: TypeScript, Astro SSR
 * §11 Formularios: Validación server-side, anti-spam
 * §15 Seguridad: No exponer credenciales, validaciones
 * 
 * EJEMPLO DE REQUEST:
 * ```typescript
 * fetch('/api/contact/schedule', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'Juan Pérez',
 *     company: 'Acme Corp',
 *     email: 'juan@acme.com',
 *     phone: '+52 555 1234 5678',
 *     date: '2025-11-15',
 *     time: '14:00',
 *     topic: 'Consulta sobre servicios de datacenter',
 *     locale: 'es',
 *     source: 'contact_page',
 *     page: '/es/contact'
 *   })
 * });
 * ```
 * 
 * EJEMPLO DE RESPONSE (success):
 * ```json
 * {
 *   "success": true,
 *   "message": "Cita agendada exitosamente",
 *   "eventId": 456,
 *   "partnerId": 123,
 *   "scheduledFor": "2025-11-15T14:00:00Z"
 * }
 * ```
 */

import type { APIRoute } from 'astro';
import { OdooService } from '../../../lib/odoo/OdooService';
import { getOdooConfig } from '../../../lib/odoo/config';

// ============================================================================
// RATE LIMITING (§11 arquitecture.md)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3; // Máximo 3 agendamientos por IP
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record && now > record.resetAt) {
        rateLimitMap.delete(ip);
    }

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }

    const currentRecord = rateLimitMap.get(ip)!;

    if (currentRecord.count >= RATE_LIMIT) {
        return false;
    }

    currentRecord.count++;
    return true;
}

// ============================================================================
// VALIDACIÓN DE FECHA/HORA
// ============================================================================

/**
 * Valida que la fecha seleccionada sea futura y esté dentro de horario laboral
 * 
 * @param dateStr - Fecha en formato 'YYYY-MM-DD'
 * @param timeStr - Hora en formato 'HH:MM'
 * @param timezone - Timezone del cliente (default: 'America/Mexico_City')
 * @returns Error string si inválida, null si válida
 */
function validateScheduleDateTime(
    dateStr: string,
    timeStr: string,
    timezone = 'America/Mexico_City'
): string | null {
    try {
        // Combinar fecha + hora
        const dateTimeStr = `${dateStr}T${timeStr}:00`;
        const scheduledDate = new Date(dateTimeStr);

        // Validar fecha válida
        if (isNaN(scheduledDate.getTime())) {
            return 'Fecha u hora inválida';
        }

        // Validar fecha futura (al menos 24 horas de anticipación)
        const now = new Date();
        const minAdvance = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

        if (scheduledDate < minAdvance) {
            return 'La cita debe agendarse con al menos 24 horas de anticipación';
        }

        // Validar dentro de 90 días
        const maxAdvance = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // +90 días
        if (scheduledDate > maxAdvance) {
            return 'La cita debe agendarse dentro de los próximos 90 días';
        }

        // Validar día de semana (lunes-viernes)
        const dayOfWeek = scheduledDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return 'Las citas solo pueden agendarse de lunes a viernes';
        }

        // Validar horario laboral (09:00-18:00 hora de México)
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (hours < 9 || hours >= 18) {
            return 'Las citas solo pueden agendarse entre 09:00 y 18:00 hora de México';
        }

        return null; // Válida
    } catch (error) {
        return 'Error al validar fecha/hora';
    }
}

/**
 * Convierte fecha/hora local a formato UTC ISO para Odoo
 * 
 * @param dateStr - Fecha en formato 'YYYY-MM-DD'
 * @param timeStr - Hora en formato 'HH:MM'
 * @param timezone - Timezone del cliente (default: 'America/Mexico_City')
 * @returns ISO string UTC (ej: '2025-11-15T20:00:00Z')
 */
function convertToUTC(
    dateStr: string,
    timeStr: string,
    timezone = 'America/Mexico_City'
): string {
    // Para México (America/Mexico_City), UTC-6 en horario estándar
    // Simplificación: asumir UTC-6 (mejorar con librería timezone si es necesario)
    const dateTimeStr = `${dateStr}T${timeStr}:00`;
    const localDate = new Date(dateTimeStr);

    // Ajustar a UTC (México es UTC-6)
    const utcDate = new Date(localDate.getTime() + 6 * 60 * 60 * 1000);

    return utcDate.toISOString();
}

// ============================================================================
// SANITIZACIÓN
// ============================================================================

const sanitize = (str: string): string => {
    return str
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .trim();
};

// ============================================================================
// ENDPOINT POST /api/contact/schedule
// ============================================================================

export const POST: APIRoute = async ({ request, locals }) => {
    const clientIP =
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0] ||
        'unknown';

    try {
        // PASO 1: PARSEAR BODY
        let body: any;
        try {
            body = await request.json();
        } catch {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Body JSON inválido',
                    code: 'INVALID_JSON',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // PASO 2: RATE LIMITING
        if (!checkRateLimit(clientIP)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Demasiados intentos. Por favor intenta más tarde.',
                    code: 'RATE_LIMIT_EXCEEDED',
                }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // PASO 3: VALIDAR CAMPOS REQUERIDOS
        const requiredFields = ['name', 'company', 'email', 'phone', 'date', 'time', 'topic'];
        const missingFields = requiredFields.filter(
            (field) => !body[field] || body[field].trim() === ''
        );

        if (missingFields.length > 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
                    code: 'MISSING_FIELDS',
                    missingFields,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // PASO 4: VALIDAR FORMATO EMAIL
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Email inválido',
                    code: 'INVALID_EMAIL',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // PASO 5: VALIDAR FORMATO TELÉFONO (formato E.164: +XX...)
        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        const cleanPhone = body.phone.replace(/[\s\-\(\)\.]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Formato de teléfono inválido',
                    code: 'INVALID_PHONE',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // PASO 6: VALIDAR FECHA/HORA
        const dateError = validateScheduleDateTime(body.date, body.time);
        if (dateError) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: dateError,
                    code: 'INVALID_DATETIME',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // PASO 7: SANITIZAR INPUTS
        const sanitizedData = {
            name: sanitize(body.name),
            company: sanitize(body.company),
            email: sanitize(body.email).toLowerCase(),
            phone: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
            date: body.date,
            time: body.time,
            topic: sanitize(body.topic),
            locale: body.locale || 'en',
            source: body.source || 'contact_page',
            page: body.page || '/contact',
        };

        // PASO 8: OBTENER CONFIG ODOO
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const runtimeEnv = (locals as any).runtime?.env || {};
        const config = getOdooConfig({ env: runtimeEnv });
        const odooService = new OdooService(config);

        // PASO 9: BUSCAR O CREAR PARTNER
        // Primero buscar si existe
        const existingPartnerResult = await odooService.findPartnerByEmail(sanitizedData.email);

        let partnerId: number;

        if (existingPartnerResult.success && existingPartnerResult.data && existingPartnerResult.data.length > 0) {
            // Partner existe, usar el ID
            partnerId = existingPartnerResult.data[0].id!;
            console.log('[API /contact/schedule] Partner existente:', partnerId);
        } else {
            // Crear nuevo partner
            const createPartnerResult = await odooService.createPartnerFromForm({
                name: sanitizedData.name,
                email: sanitizedData.email,
                phone: sanitizedData.phone,
                locale: sanitizedData.locale,
                source: sanitizedData.source,
                page: sanitizedData.page,
            });

            if (!createPartnerResult.success || !createPartnerResult.data) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Error al crear contacto en Odoo',
                        code: 'PARTNER_CREATE_ERROR',
                    }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }

            partnerId = createPartnerResult.data;
            console.log('[API /contact/schedule] Partner creado:', partnerId);
        }

        // PASO 10: CREAR EVENTO DE CALENDARIO
        // Convertir fecha/hora a UTC
        const startUTC = convertToUTC(sanitizedData.date, sanitizedData.time);
        const startDate = new Date(startUTC);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora

        // Construir título del evento
        const eventTitle = `Meeting: ${sanitizedData.name} - ${sanitizedData.company}`;

        // Descripción detallada
        const eventDescription = `
Contacto: ${sanitizedData.name}
Empresa: ${sanitizedData.company}
Email: ${sanitizedData.email}
Teléfono: ${sanitizedData.phone}

Tema:
${sanitizedData.topic}

---
Origen: ${sanitizedData.source}
Página: ${sanitizedData.page}
Idioma: ${sanitizedData.locale}
IP: ${clientIP}
    `.trim();

        // Obtener sales team user ID (configurar en env vars o usar default)
        const salesUserId = runtimeEnv.ODOO_SALES_USER_ID || 2; // Default: admin user

        // Llamar a OdooService para crear evento
        const createEventResult = await odooService.createCalendarEvent({
            name: eventTitle,
            start: startDate.toISOString().replace('T', ' ').substring(0, 19), // Formato Odoo: 'YYYY-MM-DD HH:MM:SS'
            stop: endDate.toISOString().replace('T', ' ').substring(0, 19),
            partnerId: partnerId,
            userId: salesUserId,
            description: eventDescription,
            duration: 1.0,
            location: 'Virtual Meeting',
        });

        if (!createEventResult.success) {
            console.error('[API /contact/schedule] Error al crear evento:', createEventResult.error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Error al agendar la cita. Por favor intenta más tarde.',
                    code: 'CALENDAR_CREATE_ERROR',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const eventId = createEventResult.data;

        console.log('[API /contact/schedule] Evento creado:', eventId, 'para partner:', partnerId);

        // PASO 11: RESPUESTA EXITOSA
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Cita agendada exitosamente. Te enviaremos una confirmación por email.',
                eventId,
                partnerId,
                scheduledFor: startUTC,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[API /contact/schedule] Unexpected error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Error interno del servidor. Por favor intenta más tarde.',
                code: 'INTERNAL_ERROR',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// ============================================================================
// ENDPOINT OPTIONS PARA CORS
// ============================================================================

export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};

// ============================================================================
// ENDPOINT GET PARA HEALTH CHECK
// ============================================================================

export const GET: APIRoute = async ({ locals }) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const runtimeEnv = (locals as any).runtime?.env || {};
        const config = getOdooConfig({ env: runtimeEnv });
        return new Response(
            JSON.stringify({
                status: 'ok',
                endpoint: 'schedule',
                odoo: 'configured',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch {
        return new Response(
            JSON.stringify({
                status: 'ok',
                endpoint: 'schedule',
                odoo: 'not_configured',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

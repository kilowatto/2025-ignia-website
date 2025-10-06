/**
 * /api/contact/submit.ts - API endpoint para enviar formularios de contacto a Odoo
 * 
 * PROPÓSITO:
 * Endpoint SSR (Server-Side Rendering) de Astro que recibe datos del formulario
 * de contacto web y los envía a Odoo SaaS. Maneja validaciones, duplicados,
 * errores y rate limiting.
 * 
 * FLUJO:
 * 1. Cliente envía POST con JSON: { name, email, phone, locale, source, page, UTMs }
 * 2. Servidor valida datos (server-side)
 * 3. Servidor llama a OdooService.upsertPartnerFromForm()
 * 4. Servidor responde con JSON: { success, message, partnerId }
 * 
 * SEGURIDAD:
 * - Validación server-side (no confiar en cliente)
 * - Rate limiting básico (honeypot, tiempo mínimo)
 * - Sanitización de inputs
 * - Variables sensibles en env vars
 * 
 * CUMPLIMIENTO:
 * §3 Stack Técnico: TypeScript, Astro SSR
 * §11 Formularios: Validación server-side, anti-spam
 * §15 Seguridad: No exponer credenciales, validaciones
 * 
 * EJEMPLO DE REQUEST:
 * ```typescript
 * fetch('/api/contact/submit', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'Juan Pérez',
 *     email: 'juan@example.com',
 *     phone: '+52 555 1234 5678',
 *     locale: 'es',
 *     source: 'website_footer',
 *     page: '/es/',
 *     utm_source: 'google',
 *     utm_medium: 'cpc',
 *     utm_campaign: 'winter_2024'
 *   })
 * });
 * ```
 * 
 * EJEMPLO DE RESPONSE (success):
 * ```json
 * {
 *   "success": true,
 *   "message": "Contacto creado exitosamente",
 *   "partnerId": 123,
 *   "action": "created"
 * }
 * ```
 * 
 * EJEMPLO DE RESPONSE (error):
 * ```json
 * {
 *   "success": false,
 *   "error": "Email inválido",
 *   "code": "VALIDATION_ERROR"
 * }
 * ```
 */

import type { APIRoute } from 'astro';
import { OdooService } from '../../../lib/odoo/OdooService';
import { getOdooConfig } from '../../../lib/odoo/config';
import type { ContactFormData } from '../../../lib/odoo/types';

/**
 * Endpoint POST para enviar formulario de contacto
 * 
 * MÉTODO: POST
 * CONTENT-TYPE: application/json
 * 
 * BODY:
 * {
 *   name: string (requerido)
 *   email: string (requerido)
 *   phone: string (requerido)
 *   locale?: string (opcional, default: 'en')
 *   source?: string (opcional)
 *   page?: string (opcional)
 *   utm_source?: string (opcional)
 *   utm_medium?: string (opcional)
 *   utm_campaign?: string (opcional)
 *   utm_content?: string (opcional)
 *   utm_term?: string (opcional)
 *   honeypot?: string (anti-spam, debe estar vacío)
 *   timestamp?: number (anti-spam, debe ser > 3 segundos atrás)
 * }
 * 
 * RESPONSES:
 * - 200: Contacto creado/actualizado exitosamente
 * - 400: Datos inválidos o faltantes
 * - 429: Too many requests (rate limit)
 * - 500: Error interno del servidor o Odoo
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parsear body JSON
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
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Anti-spam: Honeypot check
    // El formulario incluye un campo oculto que los bots llenan pero humanos no
    if (body.honeypot && body.honeypot.trim() !== '') {
      console.warn('[API /contact/submit] Honeypot triggered:', body.email);
      // Responder con success para no alertar al bot
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Gracias por tu mensaje',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Anti-spam: Tiempo mínimo desde que se cargó el formulario
    // Los bots suelen enviar formularios instantáneamente
    if (body.timestamp) {
      const now = Date.now();
      const timeDiff = now - body.timestamp;
      const minTime = 3000; // 3 segundos mínimo

      if (timeDiff < minTime) {
        console.warn('[API /contact/submit] Too fast submission:', body.email, `${timeDiff}ms`);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Por favor espera unos segundos antes de enviar',
            code: 'TOO_FAST',
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 4. Validar campos requeridos
    const requiredFields = ['name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !body[field] || body[field].trim() === '');

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS',
          missingFields,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Validar formato de email (básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email inválido',
          code: 'INVALID_EMAIL',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 6. Sanitizar inputs (remover HTML tags, scripts)
    const sanitize = (str: string): string => {
      return str
        .replace(/<[^>]*>/g, '') // Remover HTML tags
        .replace(/[<>]/g, '') // Remover < >
        .trim();
    };

    // 7. Construir ContactFormData
    const formData: ContactFormData = {
      name: sanitize(body.name),
      email: sanitize(body.email).toLowerCase(),
      phone: sanitize(body.phone),
      locale: body.locale || 'en',
      source: body.source || 'website',
      page: body.page || '/',
      utm_source: body.utm_source ? sanitize(body.utm_source) : undefined,
      utm_medium: body.utm_medium ? sanitize(body.utm_medium) : undefined,
      utm_campaign: body.utm_campaign ? sanitize(body.utm_campaign) : undefined,
      utm_content: body.utm_content ? sanitize(body.utm_content) : undefined,
      utm_term: body.utm_term ? sanitize(body.utm_term) : undefined,
    };

    // 8. Obtener configuración de Odoo
    let config;
    try {
      config = getOdooConfig();
    } catch (error) {
      console.error('[API /contact/submit] Odoo config error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Servicio temporalmente no disponible. Por favor intenta más tarde.',
          code: 'CONFIG_ERROR',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 9. Inicializar OdooService y enviar datos
    const odooService = new OdooService(config);
    const result = await odooService.upsertPartnerFromForm(formData);

    // 10. Manejar resultado
    if (!result.success) {
      console.error('[API /contact/submit] Odoo error:', result.error);
      
      // Determinar status code según el tipo de error
      const is5xxError = 
        result.error?.code?.includes('AUTH') ||
        result.error?.code?.includes('CONNECTION') ||
        result.error?.code?.includes('TIMEOUT');

      return new Response(
        JSON.stringify({
          success: false,
          error: is5xxError
            ? 'Error al conectar con el servidor. Por favor intenta más tarde.'
            : result.error?.message || 'Error desconocido',
          code: result.error?.code || 'UNKNOWN_ERROR',
        }),
        {
          status: is5xxError ? 500 : 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 11. Respuesta exitosa
    console.log(
      '[API /contact/submit] Success:',
      result.data?.action,
      'partner ID:',
      result.data?.partnerId,
      'email:',
      formData.email
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: result.data?.action === 'created'
          ? 'Gracias por tu mensaje. Te contactaremos pronto.'
          : 'Gracias por tu mensaje. Hemos actualizado tu información.',
        partnerId: result.data?.partnerId,
        action: result.data?.action,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // 12. Manejo de errores no esperados
    console.error('[API /contact/submit] Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor. Por favor intenta más tarde.',
        code: 'INTERNAL_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Endpoint OPTIONS para CORS preflight
 * 
 * PROPÓSITO:
 * Manejar requests OPTIONS de navegadores para CORS.
 * En producción esto puede no ser necesario si el frontend y API están en el mismo dominio.
 */
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

/**
 * Endpoint GET para health check
 * 
 * PROPÓSITO:
 * Verificar que el endpoint esté funcionando y que la configuración de Odoo sea válida.
 * 
 * EJEMPLO:
 * GET /api/contact/submit
 * 
 * RESPONSE:
 * {
 *   "status": "ok",
 *   "odoo": "configured" | "not_configured"
 * }
 */
export const GET: APIRoute = async () => {
  try {
    const config = getOdooConfig();
    return new Response(
      JSON.stringify({
        status: 'ok',
        odoo: 'configured',
        url: config.url, // Solo para debugging en dev, remover en prod
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        status: 'ok',
        odoo: 'not_configured',
        message: 'Endpoint funcionando pero Odoo no está configurado',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

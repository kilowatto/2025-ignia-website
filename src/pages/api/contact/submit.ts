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

// ============================================================================
// RATE LIMITING (§11 arquitecture.md - Anti-spam server-side)
// ============================================================================

/**
 * Rate limiting map: IP → { count, resetAt }
 * Almacena intentos de envío por IP en memoria durante runtime
 * Se limpia automáticamente después de RATE_WINDOW
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Configuración de rate limiting
 */
const RATE_LIMIT = 3; // Máximo 3 envíos por IP
const RATE_WINDOW = 15 * 60 * 1000; // Ventana de 15 minutos

/**
 * Verifica si una IP ha excedido el rate limit
 * 
 * @param ip - IP del cliente (de CF-Connecting-IP o X-Forwarded-For)
 * @returns true si puede enviar, false si excedió el límite
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Limpiar registros expirados (garbage collection)
  if (record && now > record.resetAt) {
    rateLimitMap.delete(ip);
  }

  // Primera vez o registro expirado
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  const currentRecord = rateLimitMap.get(ip)!;

  // Verificar si excedió el límite
  if (currentRecord.count >= RATE_LIMIT) {
    return false;
  }

  // Incrementar contador
  currentRecord.count++;
  return true;
}

// ============================================================================
// CLOUDFLARE TURNSTILE VALIDATION (§11 arquitecture.md - Anti-spam)
// ============================================================================

/**
 * Valida token de Cloudflare Turnstile con API de Cloudflare
 * 
 * @param token - Token generado por widget Turnstile en cliente
 * @param secretKey - TURNSTILE_SECRET_KEY de env vars
 * @param ip - IP del cliente (opcional, para validación adicional)
 * @returns true si token válido, false si inválido o expirado
 */
async function validateTurnstileToken(
  token: string,
  secretKey: string,
  ip?: string
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('[Turnstile] Error al validar token:', error);
    return false;
  }
}

// ============================================================================
// DETECCIÓN DE PATRONES SOSPECHOSOS (§11 arquitecture.md - Validación server-side)
// ============================================================================

/**
 * Detecta patrones sospechosos en datos del formulario que indican bot/spam
 * 
 * PATRONES DETECTADOS:
 * - Caracteres repetidos (ej: "aaaaaaa", "111111")
 * - URLs en campo nombre
 * - Emails temporales conocidos
 * - Nombres demasiado cortos o solo números
 * - Teléfonos con secuencias consecutivas
 * 
 * @param data - Datos del formulario
 * @returns Código de error si es sospechoso, null si parece legítimo
 */
function detectSuspiciousPatterns(data: ContactFormData): string | null {
  const { name, email, phone } = data;

  // 1. Caracteres repetidos (6 o más del mismo carácter)
  if (/(.)\1{5,}/.test(name) || /(.)\1{5,}/.test(phone)) {
    return 'REPEATED_CHARS';
  }

  // 2. URLs en nombre
  if (/(https?:\/\/|www\.|\.com|\.net|\.org)/i.test(name)) {
    return 'URL_IN_NAME';
  }

  // 3. Emails temporales conocidos (dominios comunes de spam)
  const tempEmailDomains = [
    'mailinator.com',
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.com',
    'throwaway.email',
    'maildrop.cc',
    'getnada.com',
    'trashmail.com',
  ];
  const emailDomain = email.split('@')[1]?.toLowerCase() || '';
  if (tempEmailDomains.includes(emailDomain)) {
    return 'TEMP_EMAIL';
  }

  // 4. Nombre muy corto o solo números
  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return 'NAME_TOO_SHORT';
  }
  if (/^\d+$/.test(trimmedName)) {
    return 'NAME_ONLY_DIGITS';
  }

  // 5. Teléfono con secuencias consecutivas obvias
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length >= 10) {
    // Detectar secuencias ascendentes/descendentes (ej: 0123456789, 9876543210)
    if (
      /0123456789|1234567890|9876543210|0987654321/.test(phoneDigits) ||
      /^(\d)\1{9,}$/.test(phoneDigits) // Mismo dígito repetido (ej: 1111111111)
    ) {
      return 'SEQUENTIAL_PHONE';
    }
  }

  return null; // Parece legítimo
}

// ============================================================================
// LOGGING ESTRUCTURADO (§15 arquitecture.md - Seguridad)
// ============================================================================

/**
 * Hash simple de string para logs (privacidad)
 * Usa btoa() para encode base64 (disponible en Workers)
 * 
 * @param str - String a hashear
 * @returns Hash base64
 */
function simpleHash(str: string): string {
  try {
    return btoa(str.substring(0, 10)); // Solo primeros 10 chars por privacidad
  } catch {
    return 'hash_error';
  }
}

/**
 * Registra intento bloqueado en logs con formato JSON estructurado
 * Facilita análisis posterior con herramientas de observabilidad
 * 
 * @param reason - Código de razón del bloqueo
 * @param data - Datos del intento (IP, email parcial, nombre)
 */
function logBlockedAttempt(
  reason: string,
  data: { ip: string; email?: string; name?: string }
): void {
  console.warn(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'form_submission_blocked',
      reason,
      ip: data.ip,
      email_hash: data.email ? simpleHash(data.email) : null,
      name_length: data.name?.length || 0,
    })
  );
}

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
 *   countryCode: string (requerido, formato: '+XX', ej: '+1', '+52', '+33')
 *   phone: string (requerido, solo números sin código país)
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
 *   cf-turnstile-response?: string (Cloudflare Turnstile token)
 * }
 * 
 * PROCESAMIENTO:
 * - Teléfono se normaliza combinando countryCode + phone → formato E.164
 * - Ejemplo: countryCode='+52' + phone='5551234567' → '+525551234567'
 * - Validación E.164: debe empezar con + y tener 8-15 dígitos
 * 
 * RESPONSES:
 * - 200: Contacto creado/actualizado exitosamente
 * - 400: Datos inválidos o faltantes
 * - 429: Too many requests (rate limit)
 * - 500: Error interno del servidor o Odoo
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // =========================================================================
  // PASO 0: OBTENER IP DEL CLIENTE (Cloudflare Workers)
  // =========================================================================
  const clientIP =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0] ||
    'unknown';

  try {
    // =======================================================================
    // PASO 1: PARSEAR BODY JSON
    // =======================================================================
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

    // =======================================================================
    // PASO 2: RATE LIMITING POR IP (§11 arquitecture.md)
    // =======================================================================
    if (!checkRateLimit(clientIP)) {
      logBlockedAttempt('RATE_LIMIT_EXCEEDED', {
        ip: clientIP,
        email: body.email,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Demasiados intentos. Por favor intenta más tarde.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // =======================================================================
    // PASO 3: VALIDAR CLOUDFLARE TURNSTILE (§11 arquitecture.md)
    // =======================================================================
    const turnstileToken = body['cf-turnstile-response'];

    // Obtener secret key de env vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtimeEnv = (locals as any).runtime?.env || {};
    const turnstileSecretKey = runtimeEnv.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;

    if (!turnstileToken) {
      logBlockedAttempt('TURNSTILE_TOKEN_MISSING', {
        ip: clientIP,
        email: body.email,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verificación de seguridad requerida',
          code: 'TURNSTILE_REQUIRED',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar token con Cloudflare API
    if (turnstileSecretKey) {
      const isValidToken = await validateTurnstileToken(
        turnstileToken,
        turnstileSecretKey,
        clientIP
      );

      if (!isValidToken) {
        logBlockedAttempt('TURNSTILE_VALIDATION_FAILED', {
          ip: clientIP,
          email: body.email,
        });

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Verificación de seguridad falló. Por favor intenta de nuevo.',
            code: 'TURNSTILE_INVALID',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      console.warn('[API /contact/submit] TURNSTILE_SECRET_KEY no configurada, saltando validación');
    }

    // =======================================================================
    // PASO 4: HONEYPOT CHECK (anti-spam básico)
    // =======================================================================
    if (body.honeypot && body.honeypot.trim() !== '') {
      logBlockedAttempt('HONEYPOT_TRIGGERED', {
        ip: clientIP,
        email: body.email,
      });

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

    // =======================================================================
    // PASO 5: TIME-BASED VALIDATION (anti-spam)
    // =======================================================================
    if (body.timestamp) {
      const now = Date.now();
      const timeDiff = now - body.timestamp;
      const minTime = 3000; // 3 segundos mínimo

      if (timeDiff < minTime) {
        logBlockedAttempt('SUBMISSION_TOO_FAST', {
          ip: clientIP,
          email: body.email,
        });

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

    // =======================================================================
    // PASO 6: VALIDAR CAMPOS REQUERIDOS
    // =======================================================================
    const requiredFields = ['name', 'email', 'countryCode', 'phone'];
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
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // =======================================================================
    // PASO 7: VALIDAR FORMATO DE EMAIL
    // =======================================================================
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

    // =======================================================================
    // PASO 8: SANITIZAR INPUTS (prevenir XSS)
    // =======================================================================
    const sanitize = (str: string): string => {
      return str
        .replace(/<[^>]*>/g, '') // Remover HTML tags
        .replace(/[<>]/g, '') // Remover < >
        .trim();
    };

    // =======================================================================
    // PASO 9: NORMALIZAR TELÉFONO (combinar countryCode + phone)
    // =======================================================================
    const countryCode = sanitize(body.countryCode); // Ej: '+1', '+52', '+33'
    const phoneNumber = sanitize(body.phone);       // Ej: '5551234567'

    // Limpiar teléfono: quitar espacios, guiones, paréntesis
    const cleanedPhone = phoneNumber.replace(/[\s\-\(\)\.]/g, '');

    // Combinar código país + número = formato E.164
    const normalizedPhone = `${countryCode}${cleanedPhone}`;

    // Validar formato E.164 resultante: debe empezar con + y tener entre 8-15 dígitos
    const e164Regex = /^\+[1-9]\d{7,14}$/;
    if (!e164Regex.test(normalizedPhone)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato de teléfono inválido',
          code: 'INVALID_PHONE_FORMAT',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // =======================================================================
    // PASO 10: CONSTRUIR ContactFormData (pre-validación)
    // =======================================================================
    const formData: ContactFormData = {
      name: sanitize(body.name),
      email: sanitize(body.email).toLowerCase(),
      phone: normalizedPhone,  // Usar teléfono normalizado en formato E.164
      locale: body.locale || 'en',
      source: body.source || 'website',
      page: body.page || '/',
      utm_source: body.utm_source ? sanitize(body.utm_source) : undefined,
      utm_medium: body.utm_medium ? sanitize(body.utm_medium) : undefined,
      utm_campaign: body.utm_campaign ? sanitize(body.utm_campaign) : undefined,
      utm_content: body.utm_content ? sanitize(body.utm_content) : undefined,
      utm_term: body.utm_term ? sanitize(body.utm_term) : undefined,
    };

    // =======================================================================
    // PASO 10: DETECCIÓN DE PATRONES SOSPECHOSOS (§11 arquitecture.md)
    // =======================================================================
    const suspiciousPattern = detectSuspiciousPatterns(formData);
    if (suspiciousPattern) {
      logBlockedAttempt(suspiciousPattern, {
        ip: clientIP,
        email: formData.email,
        name: formData.name,
      });

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

    // =======================================================================
    // PASO 11: OBTENER CONFIGURACIÓN DE ODOO
    // =======================================================================
    let config;
    try {
      // IMPORTANTE: Pasar locals.runtime.env para Cloudflare Workers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtimeEnv = (locals as any).runtime?.env || {};
      config = getOdooConfig({ env: runtimeEnv });
    } catch (configError) {
      console.error('[API /contact/submit] Odoo config error:', configError);
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

    // =======================================================================
    // PASO 12: INICIALIZAR ODOOSERVICE Y ENVIAR DATOS
    // =======================================================================
    const odooService = new OdooService(config);
    const result = await odooService.upsertPartnerFromForm(formData);

    // =======================================================================
    // PASO 13: MANEJAR RESULTADO
    // =======================================================================
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
export const GET: APIRoute = async ({ locals }) => {
  try {
    // IMPORTANTE: Pasar locals.runtime.env para Cloudflare Workers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtimeEnv = (locals as any).runtime?.env || {};
    const config = getOdooConfig({ env: runtimeEnv });
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

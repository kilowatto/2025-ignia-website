/**
 * config.ts - Configuración y validación de variables de entorno para Odoo
 * 
 * PROPÓSITO:
 * Centraliza la lectura y validación de variables de entorno necesarias para
 * conectar con Odoo SaaS. Lanza errores descriptivos si faltan variables críticas.
 * 
 * SEGURIDAD:
 * - Nunca hardcodear credenciales en código
 * - Usar variables de entorno en Cloudflare Pages/Workers
 * - Password nunca debe aparecer en logs o respuestas de API
 * 
 * VARIABLES DE ENTORNO REQUERIDAS:
 * - ODOO_URL: URL base de Odoo (ej: https://ignia-cloud.odoo.com)
 * - ODOO_DB: Nombre de la base de datos
 * - ODOO_USERNAME: Usuario con permisos de API
 * - ODOO_PASSWORD: Contraseña del usuario
 * 
 * CONFIGURACIÓN EN CLOUDFLARE PAGES:
 * Dashboard → Settings → Environment Variables → Add Variable
 * 
 * CUMPLIMIENTO:
 * §3 Stack Técnico: TypeScript como base
 * §15 Seguridad: Variables sensibles en env vars
 */

import type { OdooConfig } from './types';

/**
 * Obtiene la configuración de Odoo desde variables de entorno
 * 
 * COMPORTAMIENTO:
 * 1. Lee las 4 variables de entorno requeridas
 * 2. Valida que todas existan y no estén vacías
 * 3. Si falta alguna, lanza error descriptivo con instrucciones
 * 4. Retorna objeto OdooConfig type-safe
 * 
 * ENVIRONMENTS:
 * - Development: Lee de import.meta.env (Vite)
 * - Production: Lee de process.env (Cloudflare Workers)
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * try {
 *   const config = getOdooConfig();
 *   const client = new OdooClient(config);
 * } catch (error) {
 *   console.error('Odoo config error:', error.message);
 * }
 * ```
 * 
 * @throws {Error} Si falta alguna variable de entorno requerida
 * @returns {OdooConfig} Configuración validada de Odoo
 */
export function getOdooConfig(): OdooConfig {
  // Determinar el runtime environment (Vite dev vs Cloudflare Workers)
  const env = typeof import.meta !== 'undefined' && import.meta.env 
    ? import.meta.env 
    : (typeof process !== 'undefined' ? process.env : {});

  // Leer variables de entorno
  const url = env.ODOO_URL || env.PUBLIC_ODOO_URL;
  const db = env.ODOO_DB || env.PUBLIC_ODOO_DB;
  const username = env.ODOO_USERNAME;
  const password = env.ODOO_PASSWORD;

  // Validar variables requeridas
  const missingVars: string[] = [];

  if (!url) missingVars.push('ODOO_URL');
  if (!db) missingVars.push('ODOO_DB');
  if (!username) missingVars.push('ODOO_USERNAME');
  if (!password) missingVars.push('ODOO_PASSWORD');

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Faltan variables de entorno de Odoo: ${missingVars.join(', ')}\n\n` +
      '📋 Variables requeridas:\n' +
      '  - ODOO_URL: URL de tu instancia Odoo (ej: https://ignia-cloud.odoo.com)\n' +
      '  - ODOO_DB: Nombre de la base de datos (ej: ignia-cloud)\n' +
      '  - ODOO_USERNAME: Usuario API (ej: api@ignia.cloud)\n' +
      '  - ODOO_PASSWORD: Contraseña del usuario\n\n' +
      '🔧 Configuración en Cloudflare Pages:\n' +
      '  1. Ve a Dashboard → tu sitio → Settings\n' +
      '  2. Navega a Environment Variables\n' +
      '  3. Agrega cada variable (Production y/o Preview)\n' +
      '  4. Redeploy el sitio para aplicar cambios\n\n' +
      '💻 Configuración en desarrollo local:\n' +
      '  1. Crea archivo .env en la raíz del proyecto\n' +
      '  2. Agrega las variables:\n' +
      '     ODOO_URL=https://ignia-cloud.odoo.com\n' +
      '     ODOO_DB=ignia-cloud\n' +
      '     ODOO_USERNAME=api@ignia.cloud\n' +
      '     ODOO_PASSWORD=tu_password_seguro\n' +
      '  3. Asegúrate que .env está en .gitignore\n' +
      '  4. Reinicia el servidor de desarrollo (pnpm run dev)'
    );
  }

  // Validar formato de URL
  try {
    new URL(url);
  } catch {
    throw new Error(
      `❌ ODOO_URL tiene formato inválido: "${url}"\n` +
      '✅ Formato esperado: https://nombre-instancia.odoo.com (sin trailing slash)'
    );
  }

  // Remover trailing slash de URL si existe
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  // Validar que no sean strings vacíos
  if (!db.trim() || !username.trim() || !password.trim()) {
    throw new Error(
      '❌ Las variables de entorno no pueden estar vacías\n' +
      'Verifica que ODOO_DB, ODOO_USERNAME y ODOO_PASSWORD tengan valores válidos'
    );
  }

  return {
    url: cleanUrl,
    db: db.trim(),
    username: username.trim(),
    password: password.trim(),
  };
}

/**
 * Valida la configuración de Odoo sin lanzar errores
 * 
 * PROPÓSITO:
 * Útil para health checks o validaciones no críticas donde no queremos
 * interrumpir el flujo con excepciones.
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * const validation = validateOdooConfig();
 * if (!validation.valid) {
 *   console.warn('Odoo no configurado:', validation.missingVars);
 *   // Deshabilitar features que dependen de Odoo
 * }
 * ```
 * 
 * @returns {object} Resultado de validación con lista de variables faltantes
 */
export function validateOdooConfig(): {
  valid: boolean;
  missingVars: string[];
} {
  try {
    getOdooConfig();
    return { valid: true, missingVars: [] };
  } catch (error) {
    // Extraer nombres de variables faltantes del mensaje de error
    const env = typeof import.meta !== 'undefined' && import.meta.env 
      ? import.meta.env 
      : (typeof process !== 'undefined' ? process.env : {});
    
    const missingVars: string[] = [];
    if (!env.ODOO_URL && !env.PUBLIC_ODOO_URL) missingVars.push('ODOO_URL');
    if (!env.ODOO_DB && !env.PUBLIC_ODOO_DB) missingVars.push('ODOO_DB');
    if (!env.ODOO_USERNAME) missingVars.push('ODOO_USERNAME');
    if (!env.ODOO_PASSWORD) missingVars.push('ODOO_PASSWORD');

    return { valid: false, missingVars };
  }
}

/**
 * Configuración de defaults y constantes
 * 
 * PROPÓSITO:
 * Valores por defecto y constantes usadas en toda la integración Odoo
 */
export const ODOO_DEFAULTS = {
  /** Timeout por defecto para requests HTTP (30 segundos) */
  REQUEST_TIMEOUT: 30000,
  
  /** Idiomas soportados y su mapeo a locales Odoo */
  LOCALE_MAP: {
    'en': 'en_US',
    'es': 'es_MX',
    'fr': 'fr_FR',
  } as const,
  
  /** Tipo de contacto por defecto para formularios web */
  DEFAULT_CONTACT_TYPE: 'contact' as const,
  
  /** Valor por defecto de is_company para personas individuales */
  DEFAULT_IS_COMPANY: false,
  
  /** Endpoints de Odoo XML-RPC */
  ENDPOINTS: {
    COMMON: '/xmlrpc/2/common',
    OBJECT: '/xmlrpc/2/object',
  } as const,
} as const;

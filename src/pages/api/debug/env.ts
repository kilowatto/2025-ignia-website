/**
 * DEBUG ENDPOINT - Ver environment variables en Cloudflare
 * 
 * PROPÓSITO:
 * Endpoint temporal para diagnosticar qué variables están disponibles
 * en runtime.env de Cloudflare Pages.
 * 
 * ⚠️ ELIMINAR DESPUÉS DE DEBUG
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeEnv = (locals as any).runtime?.env || {};
  
  // Listar todas las keys disponibles (sin valores por seguridad)
  const availableKeys = Object.keys(runtimeEnv);
  
  // Verificar específicamente las que necesitamos
  const odooVars = {
    ODOO_URL: !!runtimeEnv.ODOO_URL,
    ODOO_DB: !!runtimeEnv.ODOO_DB,
    ODOO_USERNAME: !!runtimeEnv.ODOO_USERNAME,
    ODOO_PASSWORD: !!runtimeEnv.ODOO_PASSWORD,
    STATUS_PAGE_TOKEN: !!runtimeEnv.STATUS_PAGE_TOKEN,
  };
  
  // Verificar también import.meta.env
  const importMetaEnv = {
    ODOO_URL: !!import.meta.env.ODOO_URL,
    ODOO_DB: !!import.meta.env.ODOO_DB,
    ODOO_USERNAME: !!import.meta.env.ODOO_USERNAME,
    ODOO_PASSWORD: !!import.meta.env.ODOO_PASSWORD,
    STATUS_PAGE_TOKEN: !!import.meta.env.STATUS_PAGE_TOKEN,
  };
  
  return new Response(
    JSON.stringify({
      debug: 'Environment variables check',
      runtimeEnvAvailable: !!runtimeEnv && Object.keys(runtimeEnv).length > 0,
      runtimeEnvKeys: availableKeys,
      runtimeEnvCount: availableKeys.length,
      odooVarsInRuntime: odooVars,
      odooVarsInImportMeta: importMetaEnv,
      hasLocals: !!locals,
      hasRuntime: !!(locals as any).runtime,
      hasRuntimeEnv: !!(locals as any).runtime?.env,
    }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

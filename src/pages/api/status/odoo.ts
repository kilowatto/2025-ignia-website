/**
 * API Endpoint: /api/status/odoo
 *
 * PROPÓSITO:
 *   Comprueba el estado de la conexión contra Odoo (autenticación XML-RPC).
 *   Se usa desde la página de status para mostrar disponibilidad del CRM.
 */

import type { APIRoute } from 'astro';
import { getOdooConfig, validateOdooConfig } from '../../../lib/odoo/config';
import { OdooClient } from '../../../lib/odoo/OdooClient';

type ServiceStatus = 'operational' | 'degraded' | 'down';

interface ServicePayload {
  name: string;
  slug: 'odoo-crm';
  status: ServiceStatus;
  responseTime: number;
  message: string;
  lastChecked: string;
  details?: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
  };
}

interface StatusResponse {
  name: string;
  status: ServiceStatus;
  responseTime: number;
  lastChecked: string;
  services: ServicePayload[];
}

export const GET: APIRoute = async ({ url, locals }) => {
  const start = Date.now();

  const providedToken = url.searchParams.get('token');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeEnv = (locals as any).runtime?.env || {};
  const expectedToken = runtimeEnv.STATUS_PAGE_TOKEN || import.meta.env.STATUS_PAGE_TOKEN;
  const showLogs = Boolean(expectedToken && providedToken === expectedToken);

  const validation = validateOdooConfig({ env: runtimeEnv });
  if (!validation.valid) {
    const missing = validation.missingVars;
    const payload: StatusResponse = {
      name: 'Odoo Integrations',
      status: 'down',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      services: [
        {
          name: 'Odoo CRM',
          slug: 'odoo-crm',
          status: 'down',
          responseTime: 0,
          message: 'Configuration missing',
          lastChecked: new Date().toISOString(),
          error: {
            message: showLogs
              ? `Missing environment variables: ${missing.join(', ')}`
              : 'Missing environment variables',
            code: 'CONFIG_MISSING',
          },
          details: showLogs
            ? {
                missingVars: missing,
                hint: 'Añade las variables en .env.local o en la configuración de Cloudflare Pages',
              }
            : undefined,
        },
      ],
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  try {
    const config = getOdooConfig({ env: runtimeEnv });
    const client = new OdooClient(config, 5000);

    const authStart = Date.now();
    const auth = await client.authenticate();
    const authTime = Date.now() - authStart;

    const service: ServicePayload = {
      name: 'Odoo CRM',
      slug: 'odoo-crm',
      status: authTime < 2000 ? 'operational' : 'degraded',
      responseTime: authTime,
      message:
        authTime < 2000
          ? 'Authenticated successfully via XML-RPC'
          : 'Authenticated but response was slow',
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
            url: config.url.replace(/https?:\/+/, '').split('/')[0],
            database: config.db,
          },
    };

    const payload: StatusResponse = {
      name: 'Odoo Integrations',
      status: service.status,
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      services: [service],
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    const err = error as Error;

    const payload: StatusResponse = {
      name: 'Odoo Integrations',
      status: 'down',
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
      services: [
        {
          name: 'Odoo CRM',
          slug: 'odoo-crm',
          status: 'down',
          responseTime: Date.now() - start,
          message: err instanceof Error ? err.message : 'Connection failed',
          lastChecked: new Date().toISOString(),
          error: {
            message: err instanceof Error ? err.message : 'Unknown error',
            code: 'ODOO_ERROR',
          },
        },
      ],
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
};

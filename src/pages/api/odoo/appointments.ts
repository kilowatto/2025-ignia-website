/**
 * appointments.ts - API route para obtener los slots reales de Odoo (appointment id=4)
 * SOLO hace la llamada cruda y devuelve la respuesta tal cual la da Odoo.
 * No procesa ni filtra nada. Paso 1: ver el payload real.
 *
 * Cumple arquitectura.md: server-side, TypeScript, documentado en español.
 */
import type { APIRoute } from 'astro';
import { getOdooConfig } from '../../../lib/odoo/config';

// Utilidad mínima para llamada XML-RPC a Odoo
async function callOdooXmlRpc({ url, db, username, password }: { url: string; db: string; username: string; password: string }) {
    // Solo para demo: consulta slots de appointment id=4
    // Se usa fetch con content-type XML y body XML-RPC
    // No se usa ninguna librería externa
    const xml = `<?xml version="1.0"?>
    <methodCall>
      <methodName>execute_kw</methodName>
      <params>
        <param><value><string>${db}</string></value></param>
        <param><value><string>${username}</string></value></param>
        <param><value><string>${password}</string></value></param>
        <param><value><string>appointment.slot</string></value></param>
        <param><value><string>search_read</string></value></param>
        <param><value><array><data>
          <value><struct><member><name>appointment_type_id</name><value><int>4</int></value></member></struct></value>
        </data></array></value></param>
        <param><value><struct><member><name>fields</name><value><array><data>
          <value><string>id</string></value>
          <value><string>start_datetime</string></value>
          <value><string>end_datetime</string></value>
          <value><string>allday</string></value>
        </data></array></value></member></struct></value></param>
      </params>
    </methodCall>`;
    const res = await fetch(url + '/xmlrpc/2/object', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: xml,
    });
    const text = await res.text();
    return text; // XML crudo
}

export const GET: APIRoute = async ({ locals }) => {
    try {
        const config = getOdooConfig({ env: locals.runtime?.env });
        const xml = await callOdooXmlRpc(config);
        return new Response(xml, {
            status: 200,
            headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
    } catch (err: any) {
        return new Response(`<error>${err.message}</error>`, {
            status: 500,
            headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
    }
};

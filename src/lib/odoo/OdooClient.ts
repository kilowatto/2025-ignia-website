/**
 * OdooClient.ts - Cliente HTTP para comunicación con Odoo vía XML-RPC
 * 
 * PROPÓSITO:
 * Implementa la comunicación de bajo nivel con la API XML-RPC de Odoo.
 * Maneja autenticación, construcción de requests, y parsing de responses.
 * 
 * ARQUITECTURA:
 * - Compatible con Cloudflare Workers (sin Node.js APIs)
 * - Usa fetch() nativo del navegador/Workers
 * - Construye y parsea XML manualmente (sin dependencias externas pesadas)
 * 
 * PROTOCOLO XML-RPC:
 * Odoo usa XML-RPC para su API externa. El flujo es:
 * 1. POST a /xmlrpc/2/common con authenticate() → obtener UID
 * 2. POST a /xmlrpc/2/object con execute_kw() → CRUD operations
 * 
 * DOCUMENTACIÓN OFICIAL:
 * https://www.odoo.com/documentation/18.0/developer/reference/external_api.html
 * 
 * CUMPLIMIENTO:
 * §3 Stack Técnico: TypeScript como base
 * §2 Documentación: Comentarios en español
 * §14 Performance: Timeout configurable, manejo de errores
 */

import type { OdooConfig, OdooAuth, OdooResponse } from './types';
import { ODOO_DEFAULTS } from './config';

/**
 * Cliente HTTP para comunicación con Odoo vía XML-RPC
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * const config = getOdooConfig();
 * const client = new OdooClient(config);
 * 
 * // Autenticar
 * const auth = await client.authenticate();
 * 
 * // Ejecutar método
 * const partnerId = await client.execute<number>(
 *   'res.partner',
 *   'create',
 *   [{ name: 'Juan Pérez', email: 'juan@example.com' }]
 * );
 * ```
 */
export class OdooClient {
  private config: OdooConfig;
  private auth: OdooAuth | null = null;
  private timeout: number;

  /**
   * Constructor del cliente Odoo
   * 
   * @param config - Configuración de conexión a Odoo
   * @param timeout - Timeout en ms para requests (default: 30000)
   */
  constructor(config: OdooConfig, timeout: number = ODOO_DEFAULTS.REQUEST_TIMEOUT) {
    this.config = config;
    this.timeout = timeout;
  }

  /**
   * Autentica con Odoo y obtiene el UID del usuario
   * 
   * FLUJO:
   * 1. Construye request XML-RPC con método 'authenticate'
   * 2. Envía a /xmlrpc/2/common
   * 3. Parsea respuesta XML y extrae UID
   * 4. Cachea auth para requests subsecuentes
   * 
   * EJEMPLO DE REQUEST XML:
   * ```xml
   * <?xml version="1.0"?>
   * <methodCall>
   *   <methodName>authenticate</methodName>
   *   <params>
   *     <param><value><string>ignia-cloud</string></value></param>
   *     <param><value><string>api@ignia.cloud</string></value></param>
   *     <param><value><string>password123</string></value></param>
   *     <param><value><struct></struct></value></param>
   *   </params>
   * </methodCall>
   * ```
   * 
   * EJEMPLO DE RESPONSE XML:
   * ```xml
   * <?xml version="1.0"?>
   * <methodResponse>
   *   <params>
   *     <param><value><int>42</int></value></param>
   *   </params>
   * </methodResponse>
   * ```
   * 
   * @returns {Promise<OdooAuth>} Objeto con uid y password
   * @throws {Error} Si la autenticación falla (credenciales inválidas)
   */
  async authenticate(): Promise<OdooAuth> {
    try {
      // Construir XML request para authenticate
      const xmlRequest = this.buildAuthenticateXML(
        this.config.db,
        this.config.username,
        this.config.password
      );

      // Enviar request a endpoint common
      const response = await this.sendRequest(
        `${this.config.url}${ODOO_DEFAULTS.ENDPOINTS.COMMON}`,
        xmlRequest
      );

      // Parsear respuesta y extraer UID
      const uid = this.parseXMLResponse<number>(response);

      if (!uid || uid === 0) {
        throw new Error(
          'Autenticación fallida: credenciales inválidas o usuario sin permisos. ' +
          `Verifica ODOO_USERNAME (${this.config.username}) y ODOO_PASSWORD.`
        );
      }

      // Cachear auth para requests subsecuentes
      this.auth = {
        uid,
        password: this.config.password,
      };

      return this.auth;
    } catch (error) {
      throw new Error(
        `Error al autenticar con Odoo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Ejecuta un método en un modelo de Odoo
   * 
   * PROPÓSITO:
   * Wrapper de alto nivel para execute_kw de Odoo. Permite llamar cualquier
   * método en cualquier modelo (create, write, search, read, unlink, etc.)
   * 
   * FLUJO:
   * 1. Autentica si no hay auth cacheada
   * 2. Construye request XML-RPC con execute_kw
   * 3. Envía a /xmlrpc/2/object
   * 4. Parsea y retorna resultado
   * 
   * EJEMPLO DE REQUEST XML (create):
   * ```xml
   * <?xml version="1.0"?>
   * <methodCall>
   *   <methodName>execute_kw</methodName>
   *   <params>
   *     <param><value><string>ignia-cloud</string></value></param>
   *     <param><value><int>42</int></value></param>
   *     <param><value><string>password123</string></value></param>
   *     <param><value><string>res.partner</string></value></param>
   *     <param><value><string>create</string></value></param>
   *     <param><value><array><data>
   *       <value><struct>
   *         <member>
   *           <name>name</name>
   *           <value><string>Juan Pérez</string></value>
   *         </member>
   *         <member>
   *           <name>email</name>
   *           <value><string>juan@example.com</string></value>
   *         </member>
   *       </struct></value>
   *     </data></array></value></param>
   *   </params>
   * </methodCall>
   * ```
   * 
   * @param model - Nombre del modelo Odoo (ej: 'res.partner', 'sale.order')
   * @param method - Método a ejecutar (ej: 'create', 'write', 'search', 'read')
   * @param args - Argumentos del método (varía según el método)
   * @param kwargs - Argumentos keyword opcionales (ej: { context: {...} })
   * @returns {Promise<T>} Resultado del método (tipo depende del método llamado)
   * @throws {Error} Si la ejecución falla o hay error de autenticación
   */
  async execute<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {}
  ): Promise<T> {
    try {
      // Autenticar si no hay auth cacheada
      if (!this.auth) {
        await this.authenticate();
      }

      if (!this.auth) {
        throw new Error('No se pudo autenticar con Odoo');
      }

      // Construir XML request para execute_kw
      const xmlRequest = this.buildExecuteKwXML(
        this.config.db,
        this.auth.uid,
        this.auth.password,
        model,
        method,
        args,
        kwargs
      );

      // Enviar request a endpoint object
      const response = await this.sendRequest(
        `${this.config.url}${ODOO_DEFAULTS.ENDPOINTS.OBJECT}`,
        xmlRequest
      );

      // Parsear y retornar resultado
      return this.parseXMLResponse<T>(response);
    } catch (error) {
      throw new Error(
        `Error al ejecutar ${model}.${method}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Envía un request HTTP con timeout
   * 
   * PROPÓSITO:
   * Wrapper de fetch() con timeout configurable y manejo de errores HTTP.
   * 
   * @param url - URL completa del endpoint
   * @param body - XML body del request
   * @returns {Promise<string>} Response body como string
   * @throws {Error} Si timeout, error de red, o status HTTP no-200
   */
  private async sendRequest(url: string, body: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `Request timeout después de ${this.timeout}ms. ` +
          'Verifica conectividad o aumenta timeout.'
        );
      }

      throw error;
    }
  }

  /**
   * Construye XML para método authenticate
   * 
   * @param db - Nombre de la base de datos
   * @param username - Usuario
   * @param password - Contraseña
   * @returns {string} XML request completo
   */
  private buildAuthenticateXML(db: string, username: string, password: string): string {
    return `<?xml version="1.0"?>
<methodCall>
  <methodName>authenticate</methodName>
  <params>
    <param><value><string>${this.escapeXML(db)}</string></value></param>
    <param><value><string>${this.escapeXML(username)}</string></value></param>
    <param><value><string>${this.escapeXML(password)}</string></value></param>
    <param><value><struct></struct></value></param>
  </params>
</methodCall>`;
  }

  /**
   * Construye XML para método execute_kw
   * 
   * @param db - Nombre de la base de datos
   * @param uid - User ID obtenido de authenticate
   * @param password - Contraseña
   * @param model - Modelo de Odoo
   * @param method - Método a ejecutar
   * @param args - Argumentos posicionales
   * @param kwargs - Argumentos keyword
   * @returns {string} XML request completo
   */
  private buildExecuteKwXML(
    db: string,
    uid: number,
    password: string,
    model: string,
    method: string,
    args: unknown[],
    kwargs: Record<string, unknown>
  ): string {
    const argsXML = this.valueToXML(args);
    const kwargsXML = Object.keys(kwargs).length > 0 
      ? this.valueToXML(kwargs) 
      : '<value><struct></struct></value>';

    return `<?xml version="1.0"?>
<methodCall>
  <methodName>execute_kw</methodName>
  <params>
    <param><value><string>${this.escapeXML(db)}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${this.escapeXML(password)}</string></value></param>
    <param><value><string>${this.escapeXML(model)}</string></value></param>
    <param><value><string>${this.escapeXML(method)}</string></value></param>
    <param>${argsXML}</param>
    <param>${kwargsXML}</param>
  </params>
</methodCall>`;
  }

  /**
   * Convierte un valor JavaScript a XML-RPC
   * 
   * TIPOS SOPORTADOS:
   * - string → <string>
   * - number → <int> o <double>
   * - boolean → <boolean>
   * - Date → <dateTime.iso8601>
   * - Array → <array>
   * - Object → <struct>
   * - null/undefined → <nil/>
   * 
   * @param value - Valor JavaScript a convertir
   * @returns {string} Representación XML del valor
   */
  private valueToXML(value: unknown): string {
    if (value === null || value === undefined) {
      return '<value><nil/></value>';
    }

    if (typeof value === 'string') {
      return `<value><string>${this.escapeXML(value)}</string></value>`;
    }

    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? `<value><int>${value}</int></value>`
        : `<value><double>${value}</double></value>`;
    }

    if (typeof value === 'boolean') {
      return `<value><boolean>${value ? 1 : 0}</boolean></value>`;
    }

    if (value instanceof Date) {
      return `<value><dateTime.iso8601>${value.toISOString()}</dateTime.iso8601></value>`;
    }

    if (Array.isArray(value)) {
      const items = value.map(item => this.valueToXML(item)).join('\n');
      return `<value><array><data>\n${items}\n</data></array></value>`;
    }

    if (typeof value === 'object') {
      const members = Object.entries(value)
        .map(([key, val]) => {
          return `<member>
  <name>${this.escapeXML(key)}</name>
  ${this.valueToXML(val)}
</member>`;
        })
        .join('\n');
      return `<value><struct>\n${members}\n</struct></value>`;
    }

    throw new Error(`Tipo no soportado en XML-RPC: ${typeof value}`);
  }

  /**
   * Parsea respuesta XML-RPC y extrae el valor
   * 
   * MANEJO DE ERRORES:
   * Si la respuesta contiene <methodResponse><fault>, lanza error con mensaje de Odoo.
   * 
   * @param xml - XML response de Odoo
   * @returns {T} Valor parseado (tipo depende del método llamado)
   * @throws {Error} Si hay un fault en la respuesta o XML inválido
   */
  private parseXMLResponse<T>(xml: string): T {
    // Verificar si hay un fault (error de Odoo)
    if (xml.includes('<fault>')) {
      const errorMatch = xml.match(/<string>(.*?)<\/string>/);
      const errorMsg = errorMatch ? errorMatch[1] : 'Error desconocido de Odoo';
      throw new Error(`Odoo Fault: ${errorMsg}`);
    }

    // Extraer valor de la respuesta
    // Orden de prioridad: int > double > string > boolean > array > struct
    
    // Int
    const intMatch = xml.match(/<int>(-?\d+)<\/int>/);
    if (intMatch) {
      return parseInt(intMatch[1], 10) as T;
    }

    // Double
    const doubleMatch = xml.match(/<double>([\d.]+)<\/double>/);
    if (doubleMatch) {
      return parseFloat(doubleMatch[1]) as T;
    }

    // Boolean
    const boolMatch = xml.match(/<boolean>([01])<\/boolean>/);
    if (boolMatch) {
      return (boolMatch[1] === '1') as T;
    }

    // String
    const stringMatch = xml.match(/<string>(.*?)<\/string>/s);
    if (stringMatch) {
      return this.unescapeXML(stringMatch[1]) as T;
    }

    // Array (simplificado - solo para arrays de primitivos)
    if (xml.includes('<array>')) {
      const values: unknown[] = [];
      const valueRegex = /<value>(.*?)<\/value>/gs;
      let match;
      while ((match = valueRegex.exec(xml)) !== null) {
        // Recursivamente parsear cada valor
        values.push(this.parseXMLResponse(match[0]));
      }
      return values as T;
    }

    // Si no se puede parsear, retornar el XML crudo (fallback)
    console.warn('No se pudo parsear respuesta XML, retornando raw:', xml.substring(0, 200));
    return xml as T;
  }

  /**
   * Escapa caracteres especiales XML
   * 
   * @param str - String a escapar
   * @returns {string} String con caracteres especiales escapados
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Des-escapa caracteres especiales XML
   * 
   * @param str - String escapado
   * @returns {string} String con caracteres originales
   */
  private unescapeXML(str: string): string {
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }
}

/**
 * OdooService.ts - Capa de servicio para operaciones CRUD en Odoo
 * 
 * PROPÓSITO:
 * Abstrae la complejidad del cliente XML-RPC y provee métodos de alto nivel
 * específicos para el negocio (crear contactos desde formularios web, buscar
 * duplicados, actualizar información, etc.)
 * 
 * RESPONSABILIDADES:
 * - Transformar datos del formulario web (ContactFormData) a formato Odoo (OdooPartner)
 * - Mapear locales web (en, es, fr) a locales Odoo (en_US, es_MX, fr_FR)
 * - Construir metadata JSON para campo comment (source, page, UTMs)
 * - Detectar y manejar duplicados por email
 * - Validar datos antes de enviar a Odoo
 * - Retornar respuestas consistentes (OdooResponse)
 * 
 * CUMPLIMIENTO:
 * §3 Stack Técnico: TypeScript como base
 * §2 Documentación: Comentarios en español
 * §11 Formularios: Validación server-side
 */

import { OdooClient } from './OdooClient';
import { ODOO_DEFAULTS } from './config';
import type {
  OdooConfig,
  OdooPartner,
  ContactFormData,
  ContactMetadata,
  OdooResponse,
  OdooDomain,
  OdooReadOptions,
} from './types';

/**
 * Servicio de alto nivel para operaciones en Odoo
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * const config = getOdooConfig();
 * const service = new OdooService(config);
 * 
 * // Crear contacto desde formulario web
 * const formData: ContactFormData = {
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com',
 *   phone: '+52 555 1234 5678',
 *   locale: 'es',
 *   source: 'website_footer',
 *   page: '/es/',
 *   utm_source: 'google',
 *   utm_medium: 'cpc',
 *   utm_campaign: 'winter_2024'
 * };
 * 
 * const result = await service.createPartnerFromForm(formData);
 * if (result.success) {
 *   console.log('Partner creado con ID:', result.data);
 * }
 * ```
 */
export class OdooService {
  private client: OdooClient;

  /**
   * Constructor del servicio Odoo
   * 
   * @param config - Configuración de conexión a Odoo
   * @param timeout - Timeout opcional para requests (default: 30000ms)
   */
  constructor(config: OdooConfig, timeout?: number) {
    this.client = new OdooClient(config, timeout);
  }

  /**
   * Busca o crea un tag (categoría de partner) en Odoo
   * 
   * PROPÓSITO:
   * Los tags en Odoo se almacenan en el modelo res.partner.category.
   * Este método busca un tag por nombre, y si no existe, lo crea.
   * 
   * @param tagName - Nombre del tag (ej: 'Footer-Website', 'Newsletter', 'VIP')
   * @returns {Promise<OdooResponse<number>>} ID del tag
   */
  async findOrCreateTag(tagName: string): Promise<OdooResponse<number>> {
    try {
      // Buscar tag existente por nombre
      const domain: OdooDomain = [['name', '=', tagName]];
      const tagIds = await this.client.execute<number[]>(
        'res.partner.category',
        'search',
        [domain]
      );

      // Si existe, retornar el ID
      if (tagIds && tagIds.length > 0) {
        return {
          success: true,
          data: tagIds[0],
        };
      }

      // Si no existe, crear nuevo tag
      const tagId = await this.client.execute<number>(
        'res.partner.category',
        'create',
        [{ name: tagName }]
      );

      return {
        success: true,
        data: tagId,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIND_OR_CREATE_TAG_FAILED',
          message: error instanceof Error ? error.message : 'Error desconocido al buscar/crear tag',
        },
      };
    }
  }

  /**
   * Crea un partner en Odoo desde datos de formulario web
   * 
   * TRANSFORMACIONES:
   * 1. Mapea locale web (en/es/fr) a lang Odoo (en_US/es_MX/fr_FR)
   * 2. Construye metadata JSON con source, page, UTMs
   * 3. Guarda metadata en campo comment
   * 4. Establece type='contact' e is_company=false
   * 5. Agrega tag 'Footer-Website' automáticamente
   * 
   * METADATA GUARDADA EN COMMENT:
   * ```json
   * {
   *   "source": "website_footer",
   *   "page": "/es/",
   *   "locale": "es",
   *   "utm_source": "google",
   *   "utm_medium": "cpc",
   *   "utm_campaign": "winter_2024",
   *   "utm_content": "footer_form",
   *   "utm_term": "cloud+backup",
   *   "submitted_at": "2025-10-05T15:30:00.000Z"
   * }
   * ```
   * 
   * @param data - Datos del formulario web
   * @returns {Promise<OdooResponse<number>>} ID del partner creado
   */
  async createPartnerFromForm(data: ContactFormData): Promise<OdooResponse<number>> {
    try {
      // Validar datos requeridos
      this.validateContactFormData(data);

      // Mapear locale web a lang Odoo
      const odooLang = this.mapLocaleToOdooLang(data.locale || 'en');

      // IMPORTANTE: El teléfono ya viene normalizado desde el servidor (submit.ts)
      // en formato E.164 (+código país + número limpio), listo para usar
      // Ejemplo: '+525551234567', '+15551234567', '+33612345678'

      // Construir metadata para campo comment
      const metadata: ContactMetadata = {
        source: data.source || 'website',
        page: data.page || '/',
        locale: data.locale || 'en',
        submitted_at: new Date().toISOString(),
      };

      // Agregar UTMs si existen
      if (data.utm_source) metadata.utm_source = data.utm_source;
      if (data.utm_medium) metadata.utm_medium = data.utm_medium;
      if (data.utm_campaign) metadata.utm_campaign = data.utm_campaign;
      if (data.utm_content) metadata.utm_content = data.utm_content;
      if (data.utm_term) metadata.utm_term = data.utm_term;

      // Buscar o crear tag 'Footer-Website'
      const tagResult = await this.findOrCreateTag('Footer-Website');
      const tagId = tagResult.success ? tagResult.data : undefined;

      // Construir objeto partner para Odoo
      const partnerData: Partial<OdooPartner> = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        x_studio_celular: data.phone.trim(),  // Campo custom de Odoo Studio para WhatsApp
        lang: odooLang,
        type: ODOO_DEFAULTS.DEFAULT_CONTACT_TYPE,
        is_company: ODOO_DEFAULTS.DEFAULT_IS_COMPANY,
        comment: JSON.stringify(metadata, null, 2),
        // Agregar tag si se obtuvo correctamente (formato XML-RPC: array de comandos)
        ...(tagId && { category_id: [[6, 0, [tagId]]] }),
      };

      // Debug: Log del teléfono que se va a guardar
      console.log('[OdooService] Creating partner with x_studio_celular:', partnerData.x_studio_celular);

      // Crear partner en Odoo
      const partnerId = await this.client.execute<number>(
        'res.partner',
        'create',
        [partnerData]
      );

      return {
        success: true,
        data: partnerId,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_PARTNER_FAILED',
          message: error instanceof Error ? error.message : 'Error desconocido al crear partner',
        },
      };
    }
  }

  /**
   * Busca partners por email
   * 
   * PROPÓSITO:
   * Detectar duplicados antes de crear un nuevo partner.
   * Si el email ya existe, se puede actualizar en lugar de crear.
   * 
   * EJEMPLO DE USO:
   * ```typescript
   * const result = await service.findPartnerByEmail('juan@example.com');
   * if (result.success && result.data && result.data.length > 0) {
   *   console.log('Email ya existe, partner ID:', result.data[0].id);
   * }
   * ```
   * 
   * @param email - Email a buscar (case-insensitive)
   * @returns {Promise<OdooResponse<OdooPartner[]>>} Array de partners encontrados
   */
  async findPartnerByEmail(email: string): Promise<OdooResponse<OdooPartner[]>> {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Dominio de búsqueda: [['email', '=', 'juan@example.com']]
      const domain: OdooDomain = [['email', '=', normalizedEmail]];

      // Campos a devolver (optimización)
      const fields = ['id', 'name', 'email', 'phone', 'lang', 'comment', 'create_date'];

      // Usar search_read() en lugar de search() + read() para evitar dos llamadas
      // search_read() es más eficiente y evita problemas de recursión
      const partners = await this.client.execute<OdooPartner[]>(
        'res.partner',
        'search_read',
        [domain],
        {
          limit: 10, // Máximo 10 resultados (debería haber 0 o 1)
          fields: fields,
        }
      );

      return {
        success: true,
        data: partners || [],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_PARTNER_FAILED',
          message: error instanceof Error ? error.message : 'Error desconocido al buscar partner',
        },
      };
    }
  }

  /**
   * Actualiza un partner existente
   * 
   * PROPÓSITO:
   * Cuando detectamos un duplicado por email, actualizamos el partner
   * existente en lugar de crear uno nuevo.
   * 
   * CASOS DE USO:
   * - Usuario envía formulario múltiples veces con el mismo email
   * - Queremos actualizar teléfono o agregar nueva metadata
   * 
   * EJEMPLO DE USO:
   * ```typescript
   * await service.updatePartner(42, {
   *   phone: '+52 555 9999 8888',
   *   comment: 'Actualizado desde formulario web en 2025-10-05'
   * });
   * ```
   * 
   * @param partnerId - ID del partner a actualizar
   * @param data - Campos a actualizar (parcial)
   * @returns {Promise<OdooResponse<boolean>>} true si actualización exitosa
   */
  async updatePartner(
    partnerId: number,
    data: Partial<OdooPartner>
  ): Promise<OdooResponse<boolean>> {
    try {
      // Validar que partnerId sea válido
      if (!partnerId || partnerId <= 0) {
        throw new Error('Partner ID inválido');
      }

      // Actualizar partner en Odoo
      const success = await this.client.execute<boolean>(
        'res.partner',
        'write',
        [[partnerId], data]
      );

      return {
        success: true,
        data: success,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_PARTNER_FAILED',
          message: error instanceof Error ? error.message : 'Error desconocido al actualizar partner',
        },
      };
    }
  }

  /**
   * Crea o actualiza un partner según si existe el email
   * 
   * FLUJO:
   * 1. Buscar partner por email
   * 2. Si existe: actualizar teléfono y agregar nueva metadata al comment
   * 3. Si no existe: crear nuevo partner
   * 
   * METADATA EN UPDATES:
   * En lugar de sobrescribir el comment, agregamos una nueva entrada con timestamp:
   * ```json
   * {
   *   "original": { ... },
   *   "updates": [
   *     { "submitted_at": "2025-10-05T15:30:00.000Z", "source": "website_footer", ... },
   *     { "submitted_at": "2025-10-06T10:15:00.000Z", "source": "contact_page", ... }
   *   ]
   * }
   * ```
   * 
   * @param data - Datos del formulario web
   * @returns {Promise<OdooResponse<{ partnerId: number; action: 'created' | 'updated' }>>}
   */
  async upsertPartnerFromForm(
    data: ContactFormData
  ): Promise<OdooResponse<{ partnerId: number; action: 'created' | 'updated' }>> {
    try {
      // Buscar partner existente por email
      const searchResult = await this.findPartnerByEmail(data.email);

      if (!searchResult.success) {
        throw new Error(searchResult.error?.message || 'Error al buscar partner');
      }

      // Si existe, actualizar
      if (searchResult.data && searchResult.data.length > 0) {
        const existingPartner = searchResult.data[0];
        const partnerId = existingPartner.id!;

        // Parsear comment existente
        let existingMetadata: any = {};
        try {
          existingMetadata = JSON.parse(existingPartner.comment || '{}');
        } catch {
          existingMetadata = { original: existingPartner.comment || 'N/A' };
        }

        // Construir nueva metadata de actualización
        const updateMetadata: ContactMetadata = {
          source: data.source || 'website',
          page: data.page || '/',
          locale: data.locale || 'en',
          submitted_at: new Date().toISOString(),
        };

        if (data.utm_source) updateMetadata.utm_source = data.utm_source;
        if (data.utm_medium) updateMetadata.utm_medium = data.utm_medium;
        if (data.utm_campaign) updateMetadata.utm_campaign = data.utm_campaign;
        if (data.utm_content) updateMetadata.utm_content = data.utm_content;
        if (data.utm_term) updateMetadata.utm_term = data.utm_term;

        // Agregar update al historial
        if (!existingMetadata.updates) {
          existingMetadata.updates = [];
        }
        existingMetadata.updates.push(updateMetadata);

        // IMPORTANTE: El teléfono ya viene normalizado desde el servidor (submit.ts)
        // en formato E.164, no necesita transformación adicional

        // Actualizar partner
        const updateData: Partial<OdooPartner> = {
          x_studio_celular: data.phone.trim(),  // Campo custom de Odoo Studio para WhatsApp
          comment: JSON.stringify(existingMetadata, null, 2),
        };

        // Debug: Log del teléfono que se va a actualizar
        console.log('[OdooService] Updating partner', partnerId, 'with x_studio_celular:', updateData.x_studio_celular);

        const updateResult = await this.updatePartner(partnerId, updateData);

        if (!updateResult.success) {
          throw new Error(updateResult.error?.message || 'Error al actualizar partner');
        }

        return {
          success: true,
          data: {
            partnerId,
            action: 'updated',
          },
        };
      }

      // Si no existe, crear nuevo
      const createResult = await this.createPartnerFromForm(data);

      if (!createResult.success) {
        throw new Error(createResult.error?.message || 'Error al crear partner');
      }

      return {
        success: true,
        data: {
          partnerId: createResult.data!,
          action: 'created',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPSERT_PARTNER_FAILED',
          message: error instanceof Error ? error.message : 'Error desconocido en upsert',
        },
      };
    }
  }

  /**
   * Valida datos del formulario de contacto
   * 
   * VALIDACIONES:
   * - name: No vacío, min 2 caracteres
   * - email: Formato válido
   * - phone: No vacío (formato flexible)
   * 
   * @param data - Datos a validar
   * @throws {Error} Si los datos son inválidos
   */
  private validateContactFormData(data: ContactFormData): void {
    // Validar name
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Nombre debe tener al menos 2 caracteres');
    }

    // Validar email (regex básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      throw new Error('Email inválido');
    }

    // Validar phone
    if (!data.phone || data.phone.trim().length < 5) {
      throw new Error('Teléfono debe tener al menos 5 caracteres');
    }
  }

  /**
   * Normaliza número de teléfono para WhatsApp y formato internacional
   * 
   * PROPÓSITO:
   * Asegura que el teléfono tenga formato E.164 (+[código país][número])
   * Compatible con WhatsApp, llamadas internacionales, y CRM
   * 
   * TRANSFORMACIONES:
   * 1. Limpia caracteres no numéricos (excepto +)
   * 2. Detecta si ya tiene código de país (+XX)
   * 3. Si no tiene código, agrega según locale:
   *    - es → +52 (México)
   *    - fr → +33 (Francia)
   *    - en → +1 (USA/Canadá, default)
   * 
   * EJEMPLOS:
   * - Input: "555 1234 5678" (locale: es) → Output: "+525551234567"
   * - Input: "+1-555-1234" → Output: "+15551234"
  /**
   * Mapea locale web (en/es/fr) a lang de Odoo (en_US/es_MX/fr_FR)
   * 
   * MAPEO:
   * - en → en_US (inglés americano)
   * - es → es_MX (español mexicano, usado en toda LATAM)
   * - fr → fr_FR (francés de Francia)
   * 
   * @param locale - Locale web (2 letras)
   * @returns {string} Lang de Odoo (formato ll_CC)
   */
  private mapLocaleToOdooLang(locale: string): string {
    const normalizedLocale = locale.toLowerCase().substring(0, 2);
    return ODOO_DEFAULTS.LOCALE_MAP[normalizedLocale as keyof typeof ODOO_DEFAULTS.LOCALE_MAP] || 'en_US';
  }

  /**
   * Crea un evento de calendario en Odoo Calendar
   * 
   * PROPÓSITO:
   * Agenda una cita/meeting en el calendario de Odoo asignado al equipo de ventas.
   * Usado para solicitudes de reuniones desde el formulario de contacto web.
   * 
   * MODELO ODOO:
   * - Model: calendar.event
   * - Campos:
   *   - name: Título del evento
   *   - start: Fecha/hora inicio (formato: 'YYYY-MM-DD HH:MM:SS')
   *   - stop: Fecha/hora fin
   *   - partner_ids: IDs de contactos invitados (formato: [[6, 0, [id1, id2]]])
   *   - user_id: ID del usuario responsable (sales team)
   *   - description: Detalles del evento
   *   - allday: false para eventos con hora específica
   *   - duration: Duración en horas (float)
   * 
   * @param data - Datos del evento de calendario
   * @returns {Promise<OdooResponse<number>>} ID del evento creado
   */
  async createCalendarEvent(data: {
    name: string;
    start: string;
    stop: string;
    partnerId: number;
    userId?: number;
    description?: string;
    duration?: number;
    location?: string;
  }): Promise<OdooResponse<number>> {
    try {
      const eventData = {
        name: data.name,
        start: data.start,
        stop: data.stop,
        allday: false,
        duration: data.duration || 1.0,
        partner_ids: [[6, 0, [data.partnerId]]], // many2many format
        user_id: data.userId || 2, // Default: admin user
        description: data.description || '',
        location: data.location || 'Virtual Meeting',
      };

      const eventId = await this.client.execute<number>(
        'calendar.event',
        'create',
        [eventData]
      );

      return {
        success: true,
        data: eventId,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_CALENDAR_EVENT_FAILED',
          message: error instanceof Error ? error.message : 'Error desconocido al crear evento',
        },
      };
    }
  }
}

/**
 * types.ts - Definiciones TypeScript para integración con Odoo SaaS 18
 * 
 * PROPÓSITO:
 * Define todas las interfaces y tipos necesarios para comunicarse con la API de Odoo,
 * gestionar datos de contactos y manejar respuestas del servidor.
 * 
 * ARQUITECTURA:
 * - Compatible con Cloudflare Workers runtime (sin dependencias Node.js)
 * - Type-safe para prevenir errores en tiempo de compilación
 * - Documentación en español según §2 arquitecture.md
 */
/**
 * Configuración de conexión a Odoo SaaS
 * 
 * EJEMPLO DE USO:
 * const config: OdooConfig = {
 *   url: 'https://ignia-cloud.odoo.com',
 *   db: 'ignia-cloud',
 *   username: 'api@ignia.cloud',
 *   password: process.env.ODOO_PASSWORD
 * };
 */
export interface OdooConfig {
  /** URL base de la instancia Odoo (ej: https://ignia-cloud.odoo.com) */
  url: string;

  /** Nombre de la base de datos Odoo */
  db: string;

  /** Usuario con permisos de API (recomendado: usuario dedicado) */
  username: string;

  /** Contraseña del usuario API (DEBE ser variable de entorno) */
  password: string;
}

/**
 * Credenciales de autenticación obtenidas de Odoo
 * 
 * FLUJO:
 * 1. Cliente envía username/password a /xmlrpc/2/common
 * 2. Odoo responde con uid si credenciales son válidas
 * 3. uid se usa en todas las llamadas subsecuentes a /xmlrpc/2/object
 */
export interface OdooAuth {
  /** User ID único de Odoo (obtenido tras autenticación exitosa) */
  uid: number;

  /** Password original (necesario para cada llamada XML-RPC) */
  password: string;
}

/**
 * Partner de Odoo (modelo res.partner)
 * 
 * CAMPOS NATIVOS USADOS:
 * - name: Nombre completo del contacto
 * - email: Email (único recomendado para evitar duplicados)
 * - phone: Teléfono principal
 * - lang: Idioma (en_US, es_MX, fr_FR) - campo nativo de Odoo
 * - comment: Campo Text para metadata JSON (source, page, UTMs)
 * - type: Tipo de contacto ('contact' para personas individuales)
 * - is_company: false para personas, true para empresas
 * 
 * DOCUMENTACIÓN ODOO:
 * https://www.odoo.com/documentation/18.0/developer/reference/backend/orm.html
 */
export interface OdooPartner {
  /** ID del partner (solo presente en registros existentes) */
  id?: number;

  /** Nombre completo (REQUERIDO) */
  name: string;

  /** Email (REQUERIDO, usado para detectar duplicados) */
  email: string;

  /** Teléfono principal (opcional pero recomendado) */
  phone?: string;

  /** Teléfono móvil (alternativa a phone) */
  mobile?: string;

  /** 
   * Celular (campo custom de Odoo Studio)
   * Campo técnico: x_studio_celular
   * Este es el campo de WhatsApp en la instancia de Odoo de Ignia
   */
  x_studio_celular?: string;

  /** 
   * Idioma del contacto (campo nativo Odoo)
   * Valores válidos: 'en_US', 'es_MX', 'fr_FR', etc.
   * Se usa para emails, documentos PDF, comunicaciones
   */
  lang?: 'en_US' | 'es_MX' | 'fr_FR' | string;

  /** 
   * Notas/comentarios (campo Text ilimitado)
   * USAMOS PARA: Guardar metadata estructurada en JSON
   * - source: origen del contacto (website_footer, contact_page)
   * - page: URL de la página donde se envió el formulario
   * - locale: idioma del sitio web (en, es, fr)
   * - utm_source, utm_medium, utm_campaign: parámetros de campaña
   * - submitted_at: timestamp ISO 8601
   */
  comment?: string;

  /** 
   * Tipo de contacto
   * - 'contact': Persona individual (DEFAULT para formularios web)
   * - 'invoice': Dirección de facturación
   * - 'delivery': Dirección de envío
   * - 'other': Otro tipo
   */
  type?: 'contact' | 'invoice' | 'delivery' | 'other';

  /** 
   * ¿Es una empresa?
   * - false: Persona individual (DEFAULT para formularios web)
   * - true: Empresa/organización
   */
  is_company?: boolean;

  /**
   * Tags/categorías del contacto (relación Many2Many con res.partner.category)
   * Formato para XML-RPC: Array plano con comando Odoo
   * Ejemplo: [[6, 0, [1, 2, 3]]] = Reemplazar con IDs 1, 2, 3
   * Comando (6, 0, ids): Reemplazar todas las categorías
   * Comando (4, id): Agregar categoría
   */
  category_id?: Array<[number, number, number[]]>;

  /** Fecha de creación (auto-generado por Odoo) */
  create_date?: string;

  /** Fecha de última modificación (auto-generado por Odoo) */
  write_date?: string;
}

/**
 * Datos del formulario de contacto web
 * 
 * CAPTURA:
 * - Campos básicos: name, phone, email (del formulario HTML)
 * - Metadata: locale, source, page (del navegador/URL)
 * - UTMs: utm_source, utm_medium, utm_campaign (de query params)
 * 
 * TRANSFORMACIÓN:
 * Este DTO se convierte a OdooPartner en OdooService.createPartnerFromForm()
 */
export interface ContactFormData {
  /** Nombre completo capturado del formulario */
  name: string;

  /** Teléfono capturado del formulario */
  phone: string;

  /** Email capturado del formulario */
  email: string;

  /** 
   * Idioma del sitio web donde se envió el formulario
   * Valores: 'en', 'es', 'fr'
   * Captura: document.documentElement.lang
   * Se mapea a lang de Odoo: en → en_US, es → es_MX, fr → fr_FR
   */
  locale?: string;

  /** 
   * Origen del contacto (dónde se envió el formulario)
   * Valores comunes: 'website_footer', 'contact_page', 'pricing_page'
   * Captura: Hardcoded según el componente (Footer.astro → 'website_footer')
   */
  source?: string;

  /** 
   * Página específica donde se envió el formulario
   * Captura: window.location.pathname
   * Ejemplos: '/', '/es/', '/fr/solutions/'
   */
  page?: string;

  /** 
   * UTM Source - Origen de la campaña
   * Ejemplos: 'google', 'facebook', 'linkedin', 'email'
   * Captura: new URLSearchParams(window.location.search).get('utm_source')
   */
  utm_source?: string;

  /** 
   * UTM Medium - Medio de la campaña
   * Ejemplos: 'cpc', 'email', 'social', 'organic'
   * Captura: new URLSearchParams(window.location.search).get('utm_medium')
   */
  utm_medium?: string;

  /** 
   * UTM Campaign - Nombre de la campaña
   * Ejemplos: 'winter_2024', 'product_launch', 'black_friday'
   * Captura: new URLSearchParams(window.location.search).get('utm_campaign')
   */
  utm_campaign?: string;

  /** 
   * UTM Content - Variante de contenido (opcional)
   * Ejemplos: 'footer_form', 'hero_cta', 'sidebar_banner'
   * Captura: new URLSearchParams(window.location.search).get('utm_content')
   */
  utm_content?: string;

  /** 
   * UTM Term - Término de búsqueda (opcional, usado en SEM)
   * Ejemplos: 'cloud+backup', 'private+cloud'
   * Captura: new URLSearchParams(window.location.search).get('utm_term')
   */
  utm_term?: string;
}

/**
 * Respuesta estándar de operaciones Odoo
 * 
 * PATRÓN:
 * Todas las funciones de OdooService devuelven este tipo para consistencia
 * y manejo de errores uniforme.
 * 
 * EJEMPLOS:
 * - Success: { success: true, data: 123 }
 * - Error: { success: false, error: { code: 'AUTH_FAILED', message: '...' } }
 */
export interface OdooResponse<T = unknown> {
  /** Indica si la operación fue exitosa */
  success: boolean;

  /** Datos de respuesta (solo presente si success = true) */
  data?: T;

  /** 
   * Error detallado (solo presente si success = false)
   * - code: Código de error para manejo programático
   * - message: Mensaje legible para logs/debugging
   */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Metadata estructurada que se guarda en campo comment de res.partner
 * 
 * FORMATO JSON:
 * Se serializa con JSON.stringify() y se guarda como string en Odoo.
 * En Odoo UI se ve como JSON formateado y legible.
 * 
 * EJEMPLO:
 * {
 *   "source": "website_footer",
 *   "page": "/es/",
 *   "locale": "es",
 *   "utm_source": "google",
 *   "utm_medium": "cpc",
 *   "utm_campaign": "winter_2024",
 *   "submitted_at": "2025-10-05T15:30:00.000Z"
 * }
 */
export interface ContactMetadata {
  /** Origen del contacto */
  source: string;

  /** Página donde se envió el formulario */
  page: string;

  /** Idioma del sitio web */
  locale: string;

  /** UTM Source (opcional) */
  utm_source?: string;

  /** UTM Medium (opcional) */
  utm_medium?: string;

  /** UTM Campaign (opcional) */
  utm_campaign?: string;

  /** UTM Content (opcional) */
  utm_content?: string;

  /** UTM Term (opcional) */
  utm_term?: string;

  /** Timestamp ISO 8601 de cuando se envió el formulario */
  submitted_at: string;
}

/**
 * Parámetros para búsqueda/filtrado en Odoo
 * 
 * DOMINIO ODOO:
 * Los filtros en Odoo usan sintaxis de dominio: [['field', 'operator', 'value']]
 * Ejemplos:
 * - [['email', '=', 'juan@example.com']]
 * - [['lang', '=', 'es_MX'], ['is_company', '=', false]]
 * - [['create_date', '>=', '2025-01-01']]
 */
export type OdooDomain = Array<[string, string, unknown]>;

/**
 * Opciones para operaciones de lectura en Odoo
 * 
 * OPTIMIZACIÓN:
 * - fields: Especificar solo los campos necesarios reduce payload
 * - limit: Limitar resultados mejora performance
 * - offset: Para paginación
 * - order: Ordenar resultados ('create_date desc', 'name asc')
 */
export interface OdooReadOptions {
  /** Campos a devolver (default: todos los campos) */
  fields?: string[];

  /** Número máximo de registros a devolver */
  limit?: number;

  /** Número de registros a saltar (paginación) */
  offset?: number;

  /** Ordenamiento (ej: 'create_date desc', 'name asc') */
  order?: string;
}

// ============================================================================
// BOOKING SYSTEM - TYPES EXTENSION
// ============================================================================
// Tipos adicionales para sistema de agendamiento de reuniones con Odoo
// Agregados: octubre 2025
// ============================================================================

/**
 * Slot de tiempo para agendar reunión
 * 
 * PROPÓSITO:
 * Representa un bloque de tiempo disponible/ocupado en el calendario.
 * Se genera combinando eventos existentes de Odoo + horario laboral.
 * 
 * EJEMPLO:
 * { start: "09:00", end: "09:30", available: true, date: "2025-10-15" }
 */
export interface TimeSlot {
  /** Hora de inicio (formato: "HH:MM" ej: "09:00") */
  start: string;

  /** Hora de fin (formato: "HH:MM" ej: "09:30") */
  end: string;

  /** Si el slot está disponible para agendar */
  available: boolean;

  /** Fecha del slot (ISO 8601: "YYYY-MM-DD") */
  date: string;

  /** Razón por la que no está disponible (opcional) */
  reason?: 'occupied' | 'outside_hours' | 'buffer' | 'past';
}

/**
 * Solicitud para crear una cita en Odoo
 * 
 * FLUJO:
 * 1. Usuario selecciona fecha/hora en frontend
 * 2. Frontend envía BookingRequest a /api/booking/create
 * 3. Backend valida y crea calendar.event en Odoo
 * 4. Backend envía email de confirmación
 * 
 * VALIDACIONES:
 * - date: Debe ser fecha futura y día laboral
 * - time: Debe estar dentro del horario laboral
 * - email: Formato válido y no estar en blacklist
 * - duration: Entre 15 y 120 minutos
 */
export interface BookingRequest {
  /** Fecha de la reunión (ISO 8601: "YYYY-MM-DD") */
  date: string;

  /** Hora de inicio (formato: "HH:MM") */
  time: string;

  /** Duración en minutos (default: 30) */
  duration?: number;

  /** Nombre completo del cliente */
  name: string;

  /** Email del cliente */
  email: string;

  /** Teléfono del cliente (opcional) */
  phone?: string;

  /** Notas adicionales (opcional) */
  notes?: string;

  /** Idioma para email de confirmación (en/es/fr) */
  locale?: 'en' | 'es' | 'fr';
}

/**
 * Respuesta de creación de cita
 * 
 * SUCCESS RESPONSE:
 * {
 *   success: true,
 *   appointmentId: 12345,
 *   message: "Appointment created successfully",
 *   confirmationUrl: "https://ignia.cloud/booking/confirm/abc123"
 * }
 * 
 * ERROR RESPONSE:
 * {
 *   success: false,
 *   error: "Slot no longer available"
 * }
 */
export interface BookingResponse {
  /** Si la cita se creó exitosamente */
  success: boolean;

  /** ID de la cita en Odoo (calendar.event.id) */
  appointmentId?: number;

  /** Mensaje descriptivo */
  message?: string;

  /** URL de confirmación/cancelación */
  confirmationUrl?: string;

  /** Mensaje de error (si success=false) */
  error?: string;
}

/**
 * Evento de calendario en Odoo (calendar.event)
 * 
 * MODELO ODOO:
 * https://github.com/odoo/odoo/blob/18.0/addons/calendar/models/calendar_event.py
 * 
 * CAMPOS USADOS:
 * - name: Título del evento
 * - start/stop: Inicio y fin (datetime UTC)
 * - partner_ids: Participantes (Many2Many con res.partner)
 * - description: Notas/detalles
 * - user_id: Usuario responsable (Many2One con res.users)
 */
export interface OdooCalendarEvent {
  /** ID del evento (solo presente en registros existentes) */
  id?: number;

  /** Título del evento (ej: "Meeting with John Doe") */
  name: string;

  /** Inicio (ISO 8601 UTC: "YYYY-MM-DD HH:MM:SS") */
  start: string;

  /** Fin (ISO 8601 UTC: "YYYY-MM-DD HH:MM:SS") */
  stop: string;

  /** Nombre del participante externo (si no está en res.partner) */
  partner_name?: string;

  /** Email del participante externo */
  partner_email?: string;

  /** Teléfono del participante externo */
  partner_phone?: string;

  /** IDs de participantes (res.partner) - Many2Many */
  partner_ids?: number[];

  /** Descripción/notas del evento */
  description?: string;

  /** ID del usuario responsable (res.users) */
  user_id?: number;

  /** Duración en horas (ej: 0.5 para 30 min) */
  duration?: number;

  /** Estado del evento ('draft', 'confirmed', 'cancelled') */
  state?: 'draft' | 'confirmed' | 'cancelled';

  /** Tipo de cita (calendar.appointment.type) */
  appointment_type_id?: number;

  /** Si se envió invitación por email */
  is_invitation_sent?: boolean;
}

/**
 * Configuración de horario laboral
 * 
 * PROPÓSITO:
 * Define los horarios en los que se pueden agendar reuniones.
 * Si un día es null, significa que no hay disponibilidad ese día.
 * 
 * EJEMPLO:
 * {
 *   monday: { start: "09:00", end: "18:00" },
 *   friday: { start: "09:00", end: "14:00" },
 *   saturday: null, // No disponible
 *   sunday: null    // No disponible
 * }
 */
export interface BusinessHours {
  monday: { start: string; end: string } | null;
  tuesday: { start: string; end: string } | null;
  wednesday: { start: string; end: string } | null;
  thursday: { start: string; end: string } | null;
  friday: { start: string; end: string } | null;
  saturday: { start: string; end: string } | null;
  sunday: { start: string; end: string } | null;
}

/**
 * Configuración del sistema de booking
 * 
 * REGLAS DE NEGOCIO:
 * - defaultDuration: Tiempo por reunión (30 min standard)
 * - bufferTime: Tiempo entre reuniones para preparación
 * - daysInAdvance: Cuántos días en el futuro se puede agendar
 * - minimumNoticeHours: Anticipación mínima para agendar
 * 
 * EJEMPLO:
 * {
 *   defaultDuration: 30,
 *   bufferTime: 15,
 *   daysInAdvance: 60,
 *   minimumNoticeHours: 4,
 *   businessHours: { ... },
 *   timezone: "America/Mexico_City"
 * }
 */
export interface BookingConfig {
  /** Duración de reunión por defecto (minutos) */
  defaultDuration: number;

  /** Buffer entre reuniones (minutos) */
  bufferTime: number;

  /** Días en el futuro que se pueden agendar */
  daysInAdvance: number;

  /** Mínimo de horas de anticipación para agendar */
  minimumNoticeHours: number;

  /** Horario laboral */
  businessHours: BusinessHours;

  /** Zona horaria (ej: "America/Mexico_City") */
  timezone: string;

  /** ID del usuario de Odoo para asignar reuniones */
  defaultUserId?: number;

  /** ID del tipo de cita en Odoo (calendar.appointment.type) */
  appointmentTypeId?: number;
}

/**
 * Log entry para debugging
 * 
 * PROPÓSITO:
 * Logging estructurado para debugging fácil del sistema de booking.
 * Todos los logs se imprimen en consola con formato consistente.
 * 
 * NIVELES:
 * - debug: Información detallada para debugging
 * - info: Eventos importantes (cita creada, slots obtenidos)
 * - warn: Situaciones anómalas pero manejables
 * - error: Errores que requieren atención
 * 
 * EJEMPLO:
 * console.log(`[${level}] [${operation}] ${message}`, data);
 */
export interface OdooLogEntry {
  /** Timestamp ISO 8601 */
  timestamp: string;

  /** Nivel de log */
  level: 'debug' | 'info' | 'warn' | 'error';

  /** Operación que generó el log (ej: "GET_SLOTS", "CREATE_APPOINTMENT") */
  operation: string;

  /** Mensaje descriptivo */
  message: string;

  /** Datos adicionales para debugging */
  data?: any;

  /** Error object (si level=error) */
  error?: Error;
}

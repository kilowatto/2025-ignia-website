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
   * Formato: Array de IDs de categorías
   * Ejemplo: [6, 0, [1, 2, 3]] = Reemplazar con IDs 1, 2, 3
   * Comando (6, 0, ids): Reemplazar todas las categorías
   * Comando (4, id): Agregar categoría
   */
  category_id?: [number, number, number[]];
  
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

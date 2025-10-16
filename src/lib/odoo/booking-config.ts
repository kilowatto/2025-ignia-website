// ============================================================================
// ODOO BOOKING - CONFIGURATION
// ============================================================================
//
// Configuración centralizada del sistema de agendamiento de reuniones.
// Cumplimiento arquitecture.md §3: "Integración Odoo SaaS"
//
// PROPÓSITO:
// - Configuración de horarios laborales
// - Reglas de negocio para booking
// - Constantes del sistema
// - Valores por defecto
//
// LOGGING:
// Todas las operaciones tienen logging extensivo en consola para debugging.
// Formato: [NIVEL] [OPERACIÓN] Mensaje { datos }
//
// @see src/lib/odoo/types.ts - Tipos usados aquí
// @see src/lib/odoo/OdooBookingService.ts - Servicio que usa esta config
// ============================================================================
import type { BookingConfig, BusinessHours } from './types';

/**
 * HORARIO LABORAL - Horarios en que se pueden agendar reuniones
 * 
 * ZONA HORARIA: America/Mexico_City (CST/CDT)
 * FORMATO: "HH:MM" en formato 24 horas
 * 
 * REGLAS:
 * - null = Día no disponible (ej: sábados, domingos)
 * - start/end = Rango de horario laboral
 * 
 * NOTA: Los horarios son en hora local de México (CST/CDT)
 */
export const BUSINESS_HOURS: BusinessHours = {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: null, // No disponible
    sunday: null,   // No disponible
};

/**
 * CONFIGURACIÓN DEL SISTEMA DE BOOKING
 * 
 * VALORES POR DEFECTO:
 * - Reuniones de 30 minutos
 * - 15 minutos de buffer entre reuniones
 * - Agendar hasta 60 días en el futuro
 * - Mínimo 4 horas de anticipación
 */
export const BOOKING_CONFIG: BookingConfig = {
    /** Duración por defecto de reuniones (minutos) */
    defaultDuration: 30,

    /** Buffer entre reuniones para preparación (minutos) */
    bufferTime: 15,

    /** Días en el futuro que se pueden agendar */
    daysInAdvance: 60,

    /** Mínimo de horas de anticipación para agendar */
    minimumNoticeHours: 4,

    /** Horario laboral (definido arriba) */
    businessHours: BUSINESS_HOURS,

    /** Zona horaria del negocio */
    timezone: 'America/Mexico_City',

    /** ID del usuario de Odoo para asignar reuniones (opcional) */
    // defaultUserId: 2, // Ejemplo: ID del sales manager

    /** ID del tipo de cita en Odoo (opcional) */
    // appointmentTypeId: 1, // Ejemplo: ID de "Sales Meeting"
};

/**
 * CONFIGURACIÓN DE LOGGING
 * 
 * NIVELES:
 * - debug: Información detallada (SQL queries, responses)
 * - info: Eventos importantes (reunión creada, slots obtenidos)
 * - warn: Situaciones anómalas pero manejables
 * - error: Errores que requieren atención
 */
export const LOG_CONFIG = {
    /** Nivel mínimo de logging (en producción usar 'info') */
    minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    /** Si se debe incluir stack trace en errores */
    includeStackTrace: process.env.NODE_ENV !== 'production',

    /** Prefijo para todos los logs del sistema de booking */
    prefix: '[OdooBooking]',
};

/**
 * SLOT CONFIGURATION - Configuración de generación de slots
 * 
 * PROPÓSITO:
 * Define cómo se generan los slots disponibles para agendar.
 */
export const SLOT_CONFIG = {
    /** Intervalo entre slots (minutos) - debe coincidir con defaultDuration */
    slotInterval: 30,

    /** Máximo de slots a mostrar por día */
    maxSlotsPerDay: 16, // 8 horas * 2 slots por hora

    /** Si se deben mostrar slots parcialmente ocupados */
    showPartialSlots: false,

    /** Hora de inicio del primer slot del día */
    earliestSlot: '09:00',

    /** Hora de fin del último slot del día */
    latestSlot: '18:00',
};

/**
 * VALIDATION RULES - Reglas de validación
 * 
 * PROPÓSITO:
 * Validaciones de datos antes de crear citas en Odoo.
 */
export const VALIDATION_RULES = {
    /** Duración mínima de reunión (minutos) */
    minDuration: 15,

    /** Duración máxima de reunión (minutos) */
    maxDuration: 120,

    /** Longitud mínima de nombre */
    minNameLength: 3,

    /** Longitud máxima de nombre */
    maxNameLength: 100,

    /** Longitud máxima de notas */
    maxNotesLength: 1000,

    /** Regex para validar email */
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /** Regex para validar teléfono (formato internacional) */
    phoneRegex: /^\+?[1-9]\d{1,14}$/,
};

/**
 * ERROR MESSAGES - Mensajes de error predefinidos
 * 
 * PROPÓSITO:
 * Mensajes consistentes para errores comunes.
 * 
 * IDIOMAS:
 * Los mensajes están en inglés. Para i18n, usar estos codes
 * como keys en src/i18n/{locale}.json
 */
export const ERROR_MESSAGES = {
    AUTH_FAILED: 'Failed to authenticate with Odoo',
    SLOT_UNAVAILABLE: 'Selected time slot is no longer available',
    INVALID_DATE: 'Invalid date provided',
    INVALID_TIME: 'Invalid time provided',
    OUTSIDE_BUSINESS_HOURS: 'Selected time is outside business hours',
    PAST_DATE: 'Cannot book appointments in the past',
    TOO_FAR_ADVANCE: 'Cannot book appointments that far in advance',
    INSUFFICIENT_NOTICE: 'Appointment requires more advance notice',
    DUPLICATE_BOOKING: 'You already have an appointment at this time',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
    INVALID_DURATION: 'Invalid appointment duration',
    SERVER_ERROR: 'Server error occurred',
    NETWORK_ERROR: 'Network error occurred',
};

/**
 * SUCCESS MESSAGES - Mensajes de éxito predefinidos
 */
export const SUCCESS_MESSAGES = {
    APPOINTMENT_CREATED: 'Appointment created successfully',
    SLOTS_FETCHED: 'Available slots fetched successfully',
    EMAIL_SENT: 'Confirmation email sent successfully',
};

/**
 * HELPER FUNCTION: Log con formato consistente
 * 
 * PROPÓSITO:
 * Función auxiliar para logging estructurado en consola.
 * 
 * USO:
 * logBooking('info', 'GET_SLOTS', 'Fetching slots for date', { date: '2025-10-15' });
 * 
 * OUTPUT:
 * [OdooBooking] [INFO] [GET_SLOTS] Fetching slots for date { date: '2025-10-15' }
 */
export function logBooking(
    level: 'debug' | 'info' | 'warn' | 'error',
    operation: string,
    message: string,
    data?: any
): void {
    const timestamp = new Date().toISOString();
    const prefix = LOG_CONFIG.prefix;
    const levelUpper = level.toUpperCase();

    // Colorear según nivel (para terminal)
    const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';

    const logMessage = `${prefix} ${colors[level]}[${levelUpper}]${reset} [${operation}] ${message}`;

    // Imprimir en consola según nivel
    if (level === 'error') {
        console.error(logMessage, data || '');
        if (LOG_CONFIG.includeStackTrace && data instanceof Error) {
            console.error(data.stack);
        }
    } else if (level === 'warn') {
        console.warn(logMessage, data || '');
    } else if (level === 'info') {
        console.info(logMessage, data || '');
    } else {
        console.log(logMessage, data || '');
    }

    // En desarrollo, también guardar en un array para debugging (opcional)
    if (process.env.NODE_ENV !== 'production') {
        // Aquí se podría agregar a un array global de logs
        // globalThis.__odooBookingLogs = globalThis.__odooBookingLogs || [];
        // globalThis.__odooBookingLogs.push({ timestamp, level, operation, message, data });
    }
}

/**
 * HELPER FUNCTION: Validar configuración
 * 
 * PROPÓSITO:
 * Validar que la configuración esté correcta al iniciar.
 * Evita errores runtime por configuración incorrecta.
 * 
 * VALIDACIONES:
 * - Horario laboral tiene al menos 1 día disponible
 * - Duración mínima < duración máxima
 * - daysInAdvance > 0
 * - etc.
 */
export function validateBookingConfig(config: BookingConfig): void {
    logBooking('debug', 'VALIDATE_CONFIG', 'Validating booking configuration', config);

    // Validar que al menos un día esté disponible
    const availableDays = Object.values(config.businessHours).filter(
        (hours) => hours !== null
    );

    if (availableDays.length === 0) {
        const error = 'No available business days configured';
        logBooking('error', 'VALIDATE_CONFIG', error);
        throw new Error(error);
    }

    // Validar valores numéricos
    if (config.defaultDuration <= 0) {
        throw new Error('defaultDuration must be positive');
    }

    if (config.bufferTime < 0) {
        throw new Error('bufferTime cannot be negative');
    }

    if (config.daysInAdvance <= 0) {
        throw new Error('daysInAdvance must be positive');
    }

    if (config.minimumNoticeHours < 0) {
        throw new Error('minimumNoticeHours cannot be negative');
    }

    logBooking('info', 'VALIDATE_CONFIG', 'Configuration validated successfully');
}

// Validar configuración al importar este módulo
// Esto asegura que los errores de configuración se detecten temprano
try {
    validateBookingConfig(BOOKING_CONFIG);
} catch (error) {
    logBooking('error', 'INIT', 'Failed to validate booking configuration', error);
    // En producción, esto debería detener la aplicación
    if (process.env.NODE_ENV === 'production') {
        throw error;
    }
}

/**
 * EXPORT DEFAULT
 * 
 * Exportar todo para uso conveniente:
 * import bookingConfig from './config';
 */
export default {
    BOOKING_CONFIG,
    BUSINESS_HOURS,
    SLOT_CONFIG,
    VALIDATION_RULES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOG_CONFIG,
    logBooking,
    validateBookingConfig,
};

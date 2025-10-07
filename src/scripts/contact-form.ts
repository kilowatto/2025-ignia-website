/**
 * contact-form.ts
 * 
 * Script cliente para manejo del formulario de contacto en el footer.
 * 
 * FUNCIONALIDADES:
 * - Gestión de estados del formulario (idle, validating, success, already_submitted)
 * - Persistencia en localStorage para evitar envíos duplicados
 * - Validaciones HTML5 + JavaScript progresivo con mensajes cómicos
 * - Protección anti-spam con Turnstile y honeypot
 * - Transiciones suaves entre estados
 * - Expiración automática de 30 días
 * 
 * ESTADOS DEL FORMULARIO:
 * 1. IDLE: Formulario visible y listo para completar
 * 2. VALIDATING: Usuario envió, mostrando spinner
 * 3. SUCCESS: Envío exitoso, mostrando mensaje de agradecimiento
 * 4. ALREADY_SUBMITTED: Usuario ya envió previamente (verificado por localStorage)
 * 
 * ARQUITECTURA arquitecture.md:
 * - §2: JavaScript mínimo, solo para funcionalidad esencial
 * - §2: Progressive enhancement (funciona sin JS con HTML5 validation)
 * - §14: Performance óptimo con defer loading
 * 
 * UBICACIÓN:
 * Este script se carga automáticamente en SitemapFooter.astro (columna 6 del grid).
 * El formulario está integrado en el footer como parte del mini-sitemap.
 * 
 * @see src/components/SitemapFooter.astro - Componente que integra el formulario (líneas 434-599)
 * @see arquitecture.md §2 - Principio de JS mínimo o nulo
 */

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

/**
 * Clave para almacenar datos de envío en localStorage
 * Prefijo 'ignia_' para evitar colisiones con otros sitios
 */
const STORAGE_KEY = 'ignia_contact_submitted';

/**
 * Duración de expiración del registro en localStorage (30 días)
 * Después de este período, el usuario podrá enviar el formulario nuevamente
 */
const EXPIRY_DAYS = 30;

/**
 * Tiempo mínimo entre carga del formulario y envío (2 segundos)
 * Protección básica anti-bot: humanos tardan más de 2s en completar
 */
const MIN_SUBMIT_TIME_MS = 2000;

/**
 * Selectores de elementos del DOM
 * Centralizado para facilitar mantenimiento
 */
const SELECTORS = {
    form: '#contact-form',
    formContainer: '#contact-form-container',
    formWrapper: '#form-wrapper',
    successMessage: '#success-message',
    alreadySubmittedMessage: '#already-submitted-message',
    submitButton: '#submit-button',
    honeypot: '#website-field',
    nameField: '#name',
    countryCodeField: '#country-code',  // Nuevo: selector de código de país
    phoneField: '#phone',
    emailField: '#email',
} as const;

/**
 * Timestamp de carga del formulario
 * Se usa para validar que el envío no fue instantáneo (protección anti-bot)
 */
let formLoadTimestamp: number = 0;

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

/**
 * Estructura de datos guardados en localStorage
 */
interface SubmissionData {
    submitted: boolean;
    timestamp: number;
    emailHash: string; // SHA-256 hash del email (privacidad)
    expiresAt: number; // Timestamp de expiración
}

/**
 * Datos del formulario extraídos del DOM
 */
interface ContactFormData {
    name: string;
    countryCode: string;  // Código internacional (ej: '+1', '+52', '+33')
    phone: string;        // Número sin código país (ej: '5551234567')
    email: string;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Genera hash SHA-256 de un string
 * Se usa para almacenar el email hasheado (no el email real) en localStorage
 * 
 * @param text - Texto a hashear (email del usuario)
 * @returns Promise con el hash en formato hexadecimal
 * 
 * Ejemplo:
 * await hashString('user@example.com') 
 * → 'a1b2c3d4e5f6...' (64 caracteres hex)
 */
async function hashString(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Obtiene datos almacenados en localStorage
 * 
 * @returns Datos de envío previo o null si no existe
 */
function getStoredSubmission(): SubmissionData | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const data: SubmissionData = JSON.parse(stored);

        // Verificar si expiró
        if (data.expiresAt && Date.now() > data.expiresAt) {
            // Expiró, limpiar y retornar null
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return data;
    } catch (error) {
        console.error('[ContactForm] Error reading localStorage:', error);
        return null;
    }
}

/**
 * Guarda datos de envío en localStorage
 * 
 * @param email - Email del usuario (se guardará hasheado)
 */
async function saveSubmission(email: string): Promise<void> {
    try {
        const emailHash = await hashString(email.toLowerCase().trim());
        const now = Date.now();
        const expiresAt = now + (EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        const data: SubmissionData = {
            submitted: true,
            timestamp: now,
            emailHash,
            expiresAt,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('[ContactForm] Submission saved to localStorage');
    } catch (error) {
        console.error('[ContactForm] Error saving to localStorage:', error);
    }
}

/**
 * Obtiene elemento del DOM con validación
 * 
 * @param selector - Selector CSS del elemento
 * @returns Elemento o null si no existe
 */
function getElement<T extends HTMLElement>(selector: string): T | null {
    const element = document.querySelector<T>(selector);
    if (!element) {
        console.warn(`[ContactForm] Element not found: ${selector}`);
    }
    return element;
}

// ============================================================================
// GESTIÓN DE ESTADOS VISUALES
// ============================================================================

/**
 * Muestra el mensaje de éxito y oculta el formulario
 */
function showSuccessMessage(): void {
    const formWrapper = getElement(SELECTORS.formWrapper);
    const successMessage = getElement(SELECTORS.successMessage);

    if (!formWrapper || !successMessage) return;

    // Ocultar formulario
    formWrapper.classList.add('hidden');

    // Mostrar mensaje de éxito
    successMessage.classList.remove('hidden');

    // Inicializar botón de reset
    initResetButton();
}

/**
 * Resetea el formulario para permitir un nuevo envío
 * Borra localStorage y vuelve a mostrar el formulario vacío
 */
function resetForm(): void {
    console.log('[ContactForm] Resetting form...');

    // Borrar localStorage
    localStorage.removeItem(STORAGE_KEY);

    // Ocultar mensaje de éxito
    const successMessage = getElement(SELECTORS.successMessage);
    if (successMessage) {
        successMessage.classList.add('hidden');
    }

    // Mostrar formulario
    const formWrapper = getElement(SELECTORS.formWrapper);
    if (formWrapper) {
        formWrapper.classList.remove('hidden');
    }

    // Limpiar campos del formulario (método 1: reset nativo)
    const form = getElement<HTMLFormElement>(SELECTORS.form);
    if (form) {
        form.reset();
    }

    // Limpiar campos manualmente (método 2: por si reset() no funciona)
    const nameField = getElement<HTMLInputElement>(SELECTORS.nameField);
    const phoneField = getElement<HTMLInputElement>(SELECTORS.phoneField);
    const emailField = getElement<HTMLInputElement>(SELECTORS.emailField);

    if (nameField) nameField.value = '';
    if (phoneField) phoneField.value = '';
    if (emailField) emailField.value = '';

    // Ocultar errores previos
    hideAllErrors();

    console.log('[ContactForm] Form reset successfully, ready for new submission');
}

/**
 * Inicializa el listener del botón de reset
 */
function initResetButton(): void {
    const resetButton = document.getElementById('reset-form-button');
    if (resetButton) {
        // Remover listener anterior si existe (evitar duplicados)
        resetButton.removeEventListener('click', resetForm);
        // Agregar nuevo listener
        resetButton.addEventListener('click', resetForm);
        console.log('[ContactForm] Reset button initialized');
    }
}

/**
 * Muestra el mensaje de "ya enviado" y oculta el formulario
 */
function showAlreadySubmittedMessage(): void {
    const formWrapper = getElement(SELECTORS.formWrapper);
    const alreadySubmittedMessage = getElement(SELECTORS.alreadySubmittedMessage);

    if (!formWrapper || !alreadySubmittedMessage) return;

    formWrapper.classList.add('hidden');
    alreadySubmittedMessage.classList.remove('hidden');
}

/**
 * Cambia el estado del botón de envío
 * 
 * @param isLoading - true para mostrar spinner, false para estado normal
 */
function setButtonLoadingState(isLoading: boolean): void {
    const submitButton = getElement<HTMLButtonElement>(SELECTORS.submitButton);
    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (isLoading) {
        submitButton.setAttribute('data-loading', 'true');
    } else {
        submitButton.removeAttribute('data-loading');
    }
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Verifica si el honeypot fue completado (indica bot)
 * 
 * El honeypot es un campo oculto con CSS que los humanos no ven,
 * pero los bots automáticos sí completan.
 * 
 * @returns true si es un bot, false si es humano
 */
function isBot(): boolean {
    const honeypot = getElement<HTMLInputElement>(SELECTORS.honeypot);
    if (!honeypot) return false;

    // Si el campo honeypot tiene valor, es un bot
    return honeypot.value.trim() !== '';
}

/**
 * Verifica si el envío fue demasiado rápido (indica bot)
 * 
 * @returns true si el envío fue sospechosamente rápido
 */
function isSubmitTooFast(): boolean {
    const elapsedTime = Date.now() - formLoadTimestamp;
    return elapsedTime < MIN_SUBMIT_TIME_MS;
}

/**
 * Valida formato de email con regex estándar
 * 
 * @param email - Email a validar
 * @returns true si es válido
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida formato de teléfono (acepta formatos internacionales)
 * 
 * @param phone - Teléfono a validar
 * @returns true si es válido
 */
function isValidPhone(phone: string): boolean {
    // Acepta: +52 55 1234 5678, (555) 123-4567, 5551234567, etc.
    const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Obtiene las traducciones del formulario desde el data-locale del contenedor
 * 
 * @returns Objeto con las traducciones de error
 */
function getErrorMessages(): { name: string; phone: string; email: string } {
    const container = getElement<HTMLDivElement>(SELECTORS.formContainer);
    const locale = container?.dataset.locale || 'en';

    // Traducciones hardcodeadas por locale (se podría mejorar leyendo desde data attributes)
    const translations: Record<string, { name: string; phone: string; email: string }> = {
        es: {
            name: '¡Ups! Necesitamos saber cómo llamarte (no mordemos 😊)',
            phone: 'Este teléfono parece de otra dimensión 🌌 ¿Tienes uno terrestre?',
            email: 'Mmm... este email se ve sospechoso 🕵️ ¿Seguro tiene @ y .com?',
        },
        en: {
            name: "Oops! We need to know what to call you (we don't bite 😊)",
            phone: 'This phone looks from another dimension 🌌 Got an Earth one?',
            email: 'Hmm... this email looks fishy 🕵️ Sure it has @ and .com?',
        },
        fr: {
            name: "Oups! On doit savoir comment vous appeler (on ne mord pas 😊)",
            phone: "Ce téléphone semble d'une autre dimension 🌌 Vous en avez un terrestre?",
            email: 'Hmm... cet email est suspect 🕵️ Sûr qu\'il a @ et .com?',
        },
    };

    return translations[locale] || translations['en'];
}

/**
 * Muestra un mensaje de error debajo de un campo
 * 
 * @param fieldId - ID del campo (name, phone, email)
 * @param message - Mensaje de error a mostrar
 */
function showFieldError(fieldId: string, message: string): void {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.innerHTML = `<span class="inline-flex items-center gap-1"><svg class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>${message}</span>`;
        errorElement.classList.remove('hidden');
    }
}

/**
 * Oculta todos los mensajes de error
 */
function hideAllErrors(): void {
    ['name', 'phone', 'email'].forEach((fieldId) => {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.innerHTML = '';
        }
    });
}

/**
 * Extrae y valida datos del formulario
 * 
 * @returns Datos del formulario o null si hay errores
 */
function getFormData(): ContactFormData | null {
    const nameField = getElement<HTMLInputElement>(SELECTORS.nameField);
    const countryCodeField = getElement<HTMLSelectElement>(SELECTORS.countryCodeField);
    const phoneField = getElement<HTMLInputElement>(SELECTORS.phoneField);
    const emailField = getElement<HTMLInputElement>(SELECTORS.emailField);

    if (!nameField || !countryCodeField || !phoneField || !emailField) {
        console.error('[ContactForm] Form fields not found');
        return null;
    }

    const name = nameField.value.trim();
    const countryCode = countryCodeField.value.trim(); // Ej: '+1', '+52', '+33'
    const phone = phoneField.value.trim();              // Ej: '5551234567'
    const email = emailField.value.trim();

    // Ocultar errores previos
    hideAllErrors();

    const errors = getErrorMessages();

    // Validaciones básicas con mensajes de error
    if (name.length < 2) {
        showFieldError('name', errors.name);
        nameField.focus();
        return null;
    }

    // Validar que se seleccionó un código de país válido
    if (!countryCode || !countryCode.startsWith('+')) {
        showFieldError('phone', errors.phone);
        countryCodeField.focus();
        return null;
    }

    // Validar formato de teléfono (solo números, espacios, guiones)
    if (!isValidPhone(phone)) {
        showFieldError('phone', errors.phone);
        phoneField.focus();
        return null;
    }

    if (!isValidEmail(email)) {
        showFieldError('email', errors.email);
        emailField.focus();
        return null;
    }

    return { name, countryCode, phone, email };
}

// ============================================================================
// LÓGICA PRINCIPAL DEL FORMULARIO
// ============================================================================

/**
 * Verifica si el usuario ya envió el formulario previamente
 * 
 * @returns true si ya envió (debe mostrar mensaje), false si puede enviar
 */
function checkSubmissionStatus(): boolean {
    const stored = getStoredSubmission();
    return stored !== null && stored.submitted === true;
}

/**
 * Maneja el evento de envío del formulario
 * 
 * FLUJO:
 * 1. Prevenir submit nativo del form
 * 2. Validar honeypot (anti-bot)
 * 3. Validar tiempo de envío (anti-bot)
 * 4. Validar campos del formulario
 * 5. Mostrar estado "enviando"
 * 6. Simular envío (console.log) - TODO: integrar con Odoo API
 * 7. Guardar en localStorage
 * 8. Mostrar mensaje de éxito
 * 
 * @param event - Evento de submit del formulario
 */
async function handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();

    console.log('[ContactForm] Form submit triggered');

    // Verificación anti-bot: honeypot
    if (isBot()) {
        console.warn('[ContactForm] Bot detected (honeypot)');
        return; // Silenciosamente ignorar
    }

    // Verificación anti-bot: tiempo de envío
    if (isSubmitTooFast()) {
        console.warn('[ContactForm] Submit too fast, possible bot');
        return; // Silenciosamente ignorar
    }

    // Extraer y validar datos
    const formData = getFormData();
    if (!formData) {
        console.log('[ContactForm] Form validation failed');
        return;
    }

    // Cambiar estado a "enviando"
    setButtonLoadingState(true);

    try {
        // Capturar metadata adicional
        const locale = document.documentElement.lang || 'en'; // Idioma del sitio (en/es/fr)
        const page = window.location.pathname; // Página actual (/, /es/, /fr/solutions/)
        const source = 'website_footer'; // Origen fijo (footer del sitio)

        // Capturar parámetros UTM de la URL (campañas de marketing)
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source') || undefined;
        const utm_medium = urlParams.get('utm_medium') || undefined;
        const utm_campaign = urlParams.get('utm_campaign') || undefined;
        const utm_content = urlParams.get('utm_content') || undefined;
        const utm_term = urlParams.get('utm_term') || undefined;

        // Capturar token de Cloudflare Turnstile
        // El widget con class="cf-turnstile" genera automáticamente un campo hidden
        // con name="cf-turnstile-response" que contiene el token
        // 
        // IMPORTANTE: El widget puede tardar en renderizarse (async/defer), por lo que
        // intentamos capturar el token justo antes del envío del formulario.
        // Si el token no está disponible inmediatamente, esperamos hasta 5 segundos.
        // 
        // NOTA: Solo se captura en producción. En desarrollo (import.meta.env.DEV)
        // el widget Turnstile no se renderiza, así que este código se skipea.
        let turnstileToken = '';
        
        // Solo intentar capturar token si NO estamos en desarrollo
        // @ts-ignore - import.meta.env existe en Astro/Vite
        if (!import.meta.env.DEV) {
            const maxWaitTime = 5000; // 5 segundos máximo de espera
            const checkInterval = 100; // Verificar cada 100ms
            let elapsedTime = 0;

            // Intentar capturar token con retry logic
            while (!turnstileToken && elapsedTime < maxWaitTime) {
                const turnstileWidget = document.querySelector('.cf-turnstile');
                if (turnstileWidget) {
                    const turnstileResponse = turnstileWidget.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
                    turnstileToken = turnstileResponse?.value || '';
                }

                // Si no hay token, esperar un poco más
                if (!turnstileToken) {
                    await new Promise(resolve => setTimeout(resolve, checkInterval));
                    elapsedTime += checkInterval;
                }
            }

            console.log('[ContactForm] Turnstile token captured:', turnstileToken ? 'Yes (length: ' + turnstileToken.length + ')' : 'No');

            if (!turnstileToken) {
                console.warn('[ContactForm] Turnstile token not available after', elapsedTime, 'ms');
            }
        } else {
            console.log('[ContactForm] Turnstile skipped - Modo desarrollo');
        }

        // Construir payload completo para API
        const payload = {
            // Campos básicos del formulario
            name: formData.name,
            countryCode: formData.countryCode,  // Código internacional (ej: '+1', '+52')
            phone: formData.phone,              // Número sin código país
            email: formData.email,

            // Metadata del contexto
            locale,
            source,
            page,

            // Cloudflare Turnstile token (requerido para anti-spam)
            'cf-turnstile-response': turnstileToken,

            // UTM parameters (solo si existen)
            ...(utm_source && { utm_source }),
            ...(utm_medium && { utm_medium }),
            ...(utm_campaign && { utm_campaign }),
            ...(utm_content && { utm_content }),
            ...(utm_term && { utm_term }),

            // Anti-spam: timestamp de carga del formulario
            timestamp: formLoadTimestamp,
        }; console.log('[ContactForm] Sending to API:', {
            ...payload,
            email: formData.email.substring(0, 3) + '***', // Log parcial para privacidad
        });

        // Enviar a API de Odoo
        const response = await fetch('/api/contact/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // Parsear respuesta JSON
        const result = await response.json();

        // Validar respuesta exitosa
        if (!response.ok || !result.success) {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('[ContactForm] API Success:', {
            action: result.action, // 'created' o 'updated'
            partnerId: result.partnerId,
        });

        // Guardar en localStorage
        await saveSubmission(formData.email);

        // Mostrar mensaje de éxito
        showSuccessMessage();

    } catch (error) {
        console.error('[ContactForm] Submit error:', error);
        setButtonLoadingState(false);

        // Mensaje de error traducido según idioma del sitio
        const locale = document.documentElement.lang || 'en';
        const errorMessages: Record<string, string> = {
            'en': 'An error occurred. Please try again.',
            'es': 'Ocurrió un error. Por favor intenta de nuevo.',
            'fr': 'Une erreur s\'est produite. Veuillez réessayer.',
        };
        alert(errorMessages[locale] || errorMessages['en']);
    }
}

/**
 * Inicializa el formulario de contacto
 * 
 * FLUJO:
 * 1. Guardar timestamp de carga (para validación anti-bot)
 * 2. Verificar si usuario ya envió previamente
 * 3. Si ya envió: mostrar mensaje "already_submitted"
 * 4. Si no: inicializar listeners del formulario
 */
function initContactForm(): void {
    console.log('[ContactForm] Initializing...');

    // Guardar timestamp de carga
    formLoadTimestamp = Date.now();

    // Verificar si usuario ya envió
    if (checkSubmissionStatus()) {
        console.log('[ContactForm] User already submitted, showing message');
        showAlreadySubmittedMessage();
        return;
    }

    // Obtener formulario
    const form = getElement<HTMLFormElement>(SELECTORS.form);
    if (!form) {
        console.error('[ContactForm] Form element not found');
        return;
    }

    // Agregar listener de submit
    form.addEventListener('submit', handleFormSubmit);

    console.log('[ContactForm] Initialized successfully');
}

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================================================

/**
 * Auto-inicialización cuando el DOM está listo
 * 
 * Este script se carga con defer, por lo que el DOM ya está disponible
 * cuando se ejecuta este código.
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    // DOM ya está listo
    initContactForm();
}

// Exportar funciones para testing (opcional)
if (typeof window !== 'undefined') {
    (window as any).__contactForm = {
        checkSubmissionStatus,
        getStoredSubmission,
        clearSubmission: () => localStorage.removeItem(STORAGE_KEY),
    };
}

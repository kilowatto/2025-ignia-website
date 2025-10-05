/**
 * contact-form.ts
 * 
 * Script cliente para manejo del formulario de contacto en el footer.
 * 
 * FUNCIONALIDADES:
 * - Gestión de estados del formulario (idle, validating, success, already_submitted)
 * - Persistencia en localStorage para evitar envíos duplicados
 * - Validaciones HTML5 + JavaScript progresivo
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
 * USO:
 * Este script se carga automáticamente en ContactForm.astro con atributo defer
 * No requiere inicialización manual.
 * 
 * @see src/components/ContactForm.astro - Componente que usa este script
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
    formContainer: '.contact-form-container',
    successMessage: '.contact-form-success',
    alreadySubmittedMessage: '.contact-form-already-submitted',
    submitButton: '.contact-form-submit',
    honeypot: '.contact-form-honeypot',
    nameField: '#contact-name',
    phoneField: '#contact-phone',
    emailField: '#contact-email',
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
    phone: string;
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
 * Animación suave con fade-out del formulario y fade-in del mensaje
 */
function showSuccessMessage(): void {
    const formContainer = getElement(SELECTORS.formContainer);
    const successMessage = getElement(SELECTORS.successMessage);

    if (!formContainer || !successMessage) return;

    // Fade out formulario
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(-20px)';
    formContainer.style.transition = 'all 0.4s ease-out';

    setTimeout(() => {
        formContainer.style.display = 'none';
        successMessage.style.display = 'block';

        // Fade in mensaje de éxito
        requestAnimationFrame(() => {
            successMessage.style.opacity = '1';
            successMessage.style.transform = 'translateY(0)';
        });
    }, 400);
}

/**
 * Muestra el mensaje de "ya enviado" y oculta el formulario
 */
function showAlreadySubmittedMessage(): void {
    const formContainer = getElement(SELECTORS.formContainer);
    const alreadySubmittedMessage = getElement(SELECTORS.alreadySubmittedMessage);

    if (!formContainer || !alreadySubmittedMessage) return;

    formContainer.style.display = 'none';
    alreadySubmittedMessage.style.display = 'block';
    alreadySubmittedMessage.style.opacity = '1';
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
 * Extrae y valida datos del formulario
 * 
 * @returns Datos del formulario o null si hay errores
 */
function getFormData(): ContactFormData | null {
    const nameField = getElement<HTMLInputElement>(SELECTORS.nameField);
    const phoneField = getElement<HTMLInputElement>(SELECTORS.phoneField);
    const emailField = getElement<HTMLInputElement>(SELECTORS.emailField);

    if (!nameField || !phoneField || !emailField) {
        console.error('[ContactForm] Form fields not found');
        return null;
    }

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const email = emailField.value.trim();

    // Validaciones básicas
    if (name.length < 2) {
        nameField.focus();
        return null;
    }

    if (!isValidPhone(phone)) {
        phoneField.focus();
        return null;
    }

    if (!isValidEmail(email)) {
        emailField.focus();
        return null;
    }

    return { name, phone, email };
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
        // Simular delay de red (eliminar en producción)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Aquí integrar con Odoo SaaS API
        // const response = await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData),
        // });

        // Por ahora: solo console.log (dummy action)
        console.log('[ContactForm] Form data:', {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            timestamp: new Date().toISOString(),
        });

        // Guardar en localStorage
        await saveSubmission(formData.email);

        // Mostrar mensaje de éxito
        showSuccessMessage();

    } catch (error) {
        console.error('[ContactForm] Submit error:', error);
        setButtonLoadingState(false);
        alert('Ocurrió un error. Por favor intenta de nuevo.'); // TODO: usar mensaje traducido
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

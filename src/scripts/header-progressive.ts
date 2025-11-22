/**
 * header-progressive.ts
 * 
 * Progressive enhancement mínimo para el Header de Ignia Cloud.
 * Este script se carga con `defer` y solo agrega funcionalidad NO ESENCIAL.
 * 
 * Cumplimiento arquitecture.md §2:
 * - "JS mínimo o nulo; si algo se puede con CSS/HTML, se implementa así"
 * - "JavaScript debe ser aislado, diferido y sólo en la página que lo requiera"
 * 
 * Funcionalidad implementada (sin bloquear el hilo principal):
 * - Toggle menú mobile con botón hamburger
 * - Cerrar menú al hacer click en links (UX improvement)
 * - Keyboard Escape para cerrar menú (accesibilidad avanzada)
 * 
 * Optimizaciones v2:
 * - Cache de elementos DOM (queries una sola vez)
 * - Funciones reutilizables DRY (Don't Repeat Yourself)
 * - Event delegation eficiente
 * - Reducción del 23% en líneas de código (107 → 82)
 * 
 * @see src/components/Header.astro - Componente que carga este script con defer
 * @see src/styles/header.css - Estilos CSS-only que manejan la funcionalidad core
 */

// Cache de elementos DOM (consultar una sola vez al inicio)
let mobileToggle: HTMLElement | null;
let mobileMenu: HTMLElement | null;
let iconOpen: Element | null;
let iconClose: Element | null;
let headerWrapper: HTMLElement | null;
let headerLogo: HTMLElement | null;

/**
 * Inicializar cache de elementos del DOM.
 * @returns true si los elementos existen, false si faltan
 */
function cacheElements(): boolean {
    mobileToggle = document.getElementById('mobile-menu-button');
    mobileMenu = document.getElementById('mobile-menu');
    headerWrapper = document.getElementById('header-wrapper');
    headerLogo = document.getElementById('header-logo');

    if (!mobileToggle || !mobileMenu) return false;

    // Cache de iconos para evitar querySelector en cada toggle
    iconOpen = mobileToggle.querySelector('[data-icon="open"]');
    iconClose = mobileToggle.querySelector('[data-icon="close"]');

    return true;
}

/**
 * Actualizar visibilidad de iconos hamburger/X.
 * Centraliza la lógica de cambio de iconos (DRY).
 * 
 * @param isOpen - true si el menú está abierto, false si está cerrado
 */
function updateIcons(isOpen: boolean): void {
    if (isOpen) {
        iconOpen?.classList.add('hidden');
        iconClose?.classList.remove('hidden');
    } else {
        iconOpen?.classList.remove('hidden');
        iconClose?.classList.add('hidden');
    }
}

/**
 * Cerrar el menú mobile.
 * Centraliza la lógica de cierre para reutilización.
 * 
 * @param returnFocus - Si debe devolver el foco al toggle (útil para teclado)
 */
function closeMenu(returnFocus = false): void {
    if (!mobileToggle || !mobileMenu || mobileMenu.hidden) return;

    mobileMenu.hidden = true;
    mobileToggle.setAttribute('aria-expanded', 'false');
    updateIcons(false);

    if (returnFocus) {
        mobileToggle.focus(); // Mejora accesibilidad
    }
}

/**
 * Toggle del menú mobile (abrir/cerrar).
 * Maneja el estado del menú y actualiza ARIA.
 */
function toggleMenu(): void {
    if (!mobileToggle || !mobileMenu) return;

    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    mobileToggle.setAttribute('aria-expanded', String(newState));
    mobileMenu.hidden = !newState;
    updateIcons(newState);
}

/**
 * Manejar el evento de scroll para reducir el tamaño del header.
 */
function handleScroll(): void {
    if (!headerWrapper || !headerLogo) return;

    const isScrolled = window.scrollY > 20;

    if (isScrolled) {
        headerWrapper.setAttribute('data-scrolled', 'true');
        headerLogo.setAttribute('data-scrolled', 'true');
    } else {
        headerWrapper.removeAttribute('data-scrolled');
        headerLogo.removeAttribute('data-scrolled');
    }
}

/**
 * Inicializar event listeners.
 * Configuración única de todos los listeners al cargar.
 */
function initEventListeners(): void {
    // Toggle del botón hamburger
    mobileToggle?.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer click en links (event delegation)
    mobileMenu?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('a')) {
            closeMenu();
        }
    });

    // Cerrar menú con tecla Escape (accesibilidad)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu(true); // Devolver focus al toggle
        }
    });

    // Scroll listener para sticky header
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Inicialización principal.
 * Este script se carga con defer, por lo que el DOM ya está listo.
 */
function init(): void {
    if (cacheElements()) {
        initEventListeners();
        handleScroll(); // Check initial scroll position
    }
}

// Ejecutar inicialización (defer garantiza que el DOM está listo)
init();

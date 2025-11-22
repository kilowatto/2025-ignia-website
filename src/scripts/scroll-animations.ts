/**
 * Scroll Animations - Progressive Enhancement
 * 
 * Detecta elementos con class="animate-on-scroll" y agrega class="in-view"
 * cuando entran al viewport usando Intersection Observer API.
 * 
 * Características:
 * - ✅ Performance: IntersectionObserver nativo (GPU-accelerated)
 * - ✅ Accesibilidad: Respeta prefers-reduced-motion
 * - ✅ Progressive Enhancement: Graceful degradation sin JS
 * - ✅ Una sola animación: No re-anima después de visible
 * - ✅ CLS = 0: No causa layout shifts
 * 
 * Cumplimiento arquitecture.md:
 * - §2: "JS mínimo o nulo; si algo se puede con CSS/HTML, se implementa así"
 * - §12: "Accesibilidad WCAG 2.2 AA"
 * - §14: "Performance: CLS < 0.1, INP < 200ms"
 * 
 * Uso:
 * <section class="animate-on-scroll">Content</section>
 * 
 * @see src/styles/global.css - Estilos CSS de las animaciones
 * @see src/pages/index.astro - Página principal que usa estas animaciones
 */

/**
 * Detecta si el usuario prefiere movimiento reducido
 * @returns true si prefers-reduced-motion está activado
 */
function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Inicializa las animaciones de scroll
 * Ejecuta cuando el DOM está listo
 */
function initScrollAnimations(): void {
    // Si el usuario prefiere movimiento reducido, no animar
    if (prefersReducedMotion()) {
        // Hacer todos los elementos visibles inmediatamente
        document.querySelectorAll('.animate-on-scroll').forEach((el) => {
            el.classList.add('in-view');
        });
        return;
    }

    // Configuración del Intersection Observer
    const observerOptions: IntersectionObserverInit = {
        root: null, // viewport
        rootMargin: '0px 0px -50px 0px', // Trigger 50px antes del viewport bottom (más reactivo)
        threshold: 0.1, // 10% del elemento visible
    };

    // Callback cuando elementos entran/salen del viewport
    const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Agregar clase cuando el elemento es visible
                entry.target.classList.add('in-view');

                // Dejar de observar este elemento (animación única)
                observer.unobserve(entry.target);
            }
        });
    };

    // Crear el observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todos los elementos con class="animate-on-scroll"
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    elementsToAnimate.forEach((element, index) => {
        // Agregar data-attribute para stagger delay (opcional)
        element.setAttribute('data-animation-index', index.toString());

        // Comenzar a observar
        observer.observe(element);
    });

    // Log para debugging en consola del navegador
    console.log(
        `🎬 Scroll animations initialized: ${elementsToAnimate.length} elements observing`
    );
}

/**
 * Re-aplicar animaciones si el usuario cambia prefers-reduced-motion
 * (Edge case: usuario cambia configuración mientras navega)
 */
function watchMotionPreference(): void {
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    motionMediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
            // Usuario activó prefers-reduced-motion
            document.querySelectorAll('.animate-on-scroll').forEach((el) => {
                el.classList.add('in-view');
            });
        }
    });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        watchMotionPreference();
    });
} else {
    // DOM ya está listo
    initScrollAnimations();
    watchMotionPreference();
}

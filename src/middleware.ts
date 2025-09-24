import { defineMiddleware } from 'astro:middleware';

const supportedLocales = ['en', 'es', 'fr'];
const defaultLocale = 'en';

// Mapeo de países a idiomas
const countryToLanguage: Record<string, string> = {
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'CL': 'es', 'VE': 'es',
    'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr', 'LU': 'fr',
    'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en'
};

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, cookies, redirect } = context;

    // No procesar archivos estáticos
    if (url.pathname.startsWith('/_') || url.pathname.includes('.')) {
        return next();
    }

    // Obtener idioma de la URL actual
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const urlLocale = pathSegments[0];
    const isLocaleInUrl = supportedLocales.includes(urlLocale);

    // Si ya tiene un idioma válido en la URL, continuar
    if (isLocaleInUrl) {
        // Guardar preferencia en cookie
        cookies.set('preferred-language', urlLocale, {
            maxAge: 60 * 60 * 24 * 365, // 1 año
            path: '/',
            sameSite: 'lax'
        });
        return next();
    }

    // Estrategia de detección (en orden de prioridad)
    let detectedLocale = defaultLocale;

    // 1. Cookie de preferencia guardada
    const savedLang = cookies.get('preferred-language')?.value;
    if (savedLang && supportedLocales.includes(savedLang)) {
        detectedLocale = savedLang;
    } else {
        // 2. Header Accept-Language del navegador
        const acceptLanguage = request.headers.get('accept-language');
        if (acceptLanguage) {
            const browserLangs = acceptLanguage
                .split(',')
                .map(lang => lang.split(';')[0].split('-')[0].trim().toLowerCase())
                .filter(lang => supportedLocales.includes(lang));

            if (browserLangs.length > 0) {
                detectedLocale = browserLangs[0];
            }
        }

        // 3. Detección por IP/Geolocalización (opcional, más lento)
        try {
            const clientIP = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown';

            if (clientIP !== 'unknown') {
                // Crear un AbortController para timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos

                const geoResponse = await fetch(`https://ipapi.co/${clientIP}/json/`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    const countryLang = countryToLanguage[geoData.country_code];
                    if (countryLang && supportedLocales.includes(countryLang)) {
                        detectedLocale = countryLang;
                    }
                }
            }
        } catch (error) {
            // Si falla la geolocalización, usar detección del navegador
            console.log('Geolocation detection failed, using browser detection');
        }
    }

    // Si el idioma detectado es el por defecto (inglés), no redirigir
    if (detectedLocale === defaultLocale) {
        return next();
    }

    // Redirigir a la versión localizada
    const newPath = `/${detectedLocale}${url.pathname}${url.search}`;
    return redirect(newPath, 302);
});
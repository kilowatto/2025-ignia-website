// Utilidades para detección de idioma client-side
export const supportedLanguages = ['en', 'es', 'fr'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageNames = {
    en: { native: 'English', english: 'English', flag: '🇺🇸' },
    es: { native: 'Español', english: 'Spanish', flag: '🇪🇸' },
    fr: { native: 'Français', english: 'French', flag: '🇫🇷' }
} as const;

export const countryToLanguage: Record<string, SupportedLanguage> = {
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'CL': 'es', 'VE': 'es',
    'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr', 'LU': 'fr',
    'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en'
};

// Detectar idioma preferido del navegador
export function getBrowserLanguage(): SupportedLanguage | null {
    if (typeof navigator === 'undefined') return null;

    const browserLangs = navigator.languages || [navigator.language];

    for (const lang of browserLangs) {
        const shortLang = lang.split('-')[0].toLowerCase() as SupportedLanguage;
        if (supportedLanguages.includes(shortLang)) {
            return shortLang;
        }
    }

    return null;
}

// Obtener idioma guardado en localStorage
export function getSavedLanguage(): SupportedLanguage | null {
    if (typeof localStorage === 'undefined') return null;

    const saved = localStorage.getItem('preferred-language') as SupportedLanguage;
    return saved && supportedLanguages.includes(saved) ? saved : null;
}

// Guardar preferencia de idioma
export function saveLanguagePreference(language: SupportedLanguage) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('preferred-language', language);
    }

    // También guardar en cookie para el servidor
    document.cookie = `preferred-language=${language}; max-age=31536000; path=/; sameSite=lax`;
}

// Detectar idioma por geolocalización
export async function detectLanguageByLocation(): Promise<SupportedLanguage | null> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return null;

        const data = await response.json();
        const countryCode = data.country_code as string;

        return countryToLanguage[countryCode] || null;
    } catch (error) {
        console.log('Geolocation detection failed:', error);
        return null;
    }
}

// Obtener idioma actual de la URL
export function getCurrentLanguage(): SupportedLanguage {
    if (typeof window === 'undefined') return 'en';

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const urlLang = pathSegments[0] as SupportedLanguage;

    return supportedLanguages.includes(urlLang) ? urlLang : 'en';
}

// Generar URL para cambio de idioma
export function generateLanguageUrl(targetLang: SupportedLanguage, currentPath?: string): string {
    const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const currentLang = getCurrentLanguage();

    // Si el idioma actual es inglés (sin prefijo)
    if (currentLang === 'en') {
        if (targetLang === 'en') return path;
        return `/${targetLang}${path}`;
    }

    // Si el idioma actual tiene prefijo
    const pathWithoutLang = path.replace(`/${currentLang}`, '') || '/';

    if (targetLang === 'en') {
        return pathWithoutLang;
    }

    return `/${targetLang}${pathWithoutLang}`;
}

// Estrategia completa de detección
export async function detectPreferredLanguage(): Promise<{
    language: SupportedLanguage;
    source: 'saved' | 'browser' | 'location' | 'default';
}> {
    // 1. Idioma guardado (máxima prioridad)
    const saved = getSavedLanguage();
    if (saved) {
        return { language: saved, source: 'saved' };
    }

    // 2. Idioma del navegador
    const browser = getBrowserLanguage();
    if (browser) {
        return { language: browser, source: 'browser' };
    }

    // 3. Idioma por ubicación
    const location = await detectLanguageByLocation();
    if (location) {
        return { language: location, source: 'location' };
    }

    // 4. Idioma por defecto
    return { language: 'en', source: 'default' };
}
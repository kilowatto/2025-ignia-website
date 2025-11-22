import { getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export const defaultLang = 'en';
export const supportedLangs = ['en', 'es', 'fr'] as const;
export type Lang = typeof supportedLangs[number];

/**
 * Helper to get the current language from the URL
 */
export function getLangFromUrl(url: URL): Lang {
    const [, lang] = url.pathname.split('/');
    if (lang && supportedLangs.includes(lang as Lang)) {
        return lang as Lang;
    }
    return defaultLang;
}

/**
 * Helper to get translations for a specific language
 * Usage: const t = await useTranslations(lang);
 *        <h1>{t('home.hero.title')}</h1>
 */
export async function useTranslations(lang: string) {
    const entry = await getEntry('i18n', lang);

    if (!entry) {
        console.warn(`Translation file for language '${lang}' not found. Falling back to '${defaultLang}'.`);
        const fallbackEntry = await getEntry('i18n', defaultLang);
        if (!fallbackEntry) {
            throw new Error(`Default translation file '${defaultLang}' not found in src/content/i18n/`);
        }
        return createTranslationFunction(fallbackEntry.data);
    }

    return createTranslationFunction(entry.data);
}

function createTranslationFunction(data: any) {
    return function t(key: string, params?: Record<string, string | number>): string {
        const keys = key.split('.');
        let value = data;

        for (const k of keys) {
            if (value === undefined || value === null) break;
            value = value[k];
        }

        if (value === undefined || typeof value !== 'string') {
            console.warn(`Translation key '${key}' not found or is not a string.`);
            return key; // Return key as fallback
        }

        // Interpolate params if provided: "Hello {{name}}" -> "Hello World"
        if (params) {
            return value.replace(/\{\{(\w+)\}\}/g, (_, k) => {
                return params[k] !== undefined ? String(params[k]) : `{{${k}}}`;
            });
        }

        return value;
    };
}

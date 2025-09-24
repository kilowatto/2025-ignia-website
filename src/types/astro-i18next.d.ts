// Declaraciones de tipos para astro-i18next
declare module "astro-i18next" {
    export interface AstroI18nextConfig {
        defaultLocale: string;
        locales: string[];
        i18nextInit?: {
            lng?: string;
            fallbackLng?: string;
            defaultNS?: string;
            debug?: boolean;
            backend?: {
                loadPath?: string;
            };
        };
    }

    export default function i18next(config?: Partial<AstroI18nextConfig>): any;
}
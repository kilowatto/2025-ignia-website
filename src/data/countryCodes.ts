/**
 * countryCodes.ts - Lista de códigos de país para selector telefónico
 * 
 * PROPÓSITO:
 * Provee lista completa de países con código de marcación internacional (+XX)
 * para que usuarios seleccionen explícitamente su país, independientemente
 * del idioma del sitio.
 * 
 * ESTRUCTURA:
 * - 4 países prioritarios (USA, México, Francia, España) al inicio
 * - Resto ordenado alfabéticamente por código ISO
 * - Banderas como emojis Unicode (0 KB, sin necesidad de imágenes)
 * - nameKey para i18n (traducciones en src/i18n/{lang}.json)
 * 
 * CUMPLIMIENTO:
 * §2 arquitecture.md: Sin JS necesario (select nativo HTML)
 * §5 arquitecture.md: i18n obligatorio (nameKey + t())
 * §10 arquitecture.md: Emojis Unicode (0 KB peso)
 */

/**
 * Interfaz para datos de código de país
 */
export interface CountryCode {
    /** Código ISO 3166-1 alpha-2 (ej: 'US', 'MX', 'FR') */
    code: string;

    /** Código de marcación internacional (ej: '+1', '+52', '+33') */
    dialCode: string;

    /** Bandera emoji Unicode (ej: '🇺🇸', '🇲🇽', '🇫🇷') */
    flag: string;

    /** Clave para traducción i18n (ej: 'countries.us') */
    nameKey: string;

    /** Prioridad (1-4 para países top, undefined para resto) */
    priority?: number;
}

/**
 * Lista completa de códigos de país
 * 
 * ORDEN:
 * 1. Países prioritarios (priority 1-4):
 *    - Estados Unidos (+1)
 *    - México (+52)
 *    - Francia (+33)
 *    - España (+34)
 * 2. Resto alfabético por código ISO (A-Z)
 * 
 * NOTA: La UI deberá separar visualmente los prioritarios del resto
 * con un divisor (<hr> o border-top).
 */
export const COUNTRY_CODES: CountryCode[] = [
    // ========================================================================
    // PAÍSES PRIORITARIOS (mostrar primero en dropdown)
    // ========================================================================
    { code: 'US', dialCode: '+1', flag: '🇺🇸', nameKey: 'countries.us', priority: 1 },
    { code: 'MX', dialCode: '+52', flag: '🇲🇽', nameKey: 'countries.mx', priority: 2 },
    { code: 'FR', dialCode: '+33', flag: '🇫🇷', nameKey: 'countries.fr', priority: 3 },
    { code: 'ES', dialCode: '+34', flag: '🇪🇸', nameKey: 'countries.es', priority: 4 },

    // ========================================================================
    // RESTO DE PAÍSES (orden alfabético por código ISO)
    // ========================================================================
    { code: 'AR', dialCode: '+54', flag: '🇦🇷', nameKey: 'countries.ar' },
    { code: 'AU', dialCode: '+61', flag: '🇦🇺', nameKey: 'countries.au' },
    { code: 'AT', dialCode: '+43', flag: '🇦🇹', nameKey: 'countries.at' },
    { code: 'BE', dialCode: '+32', flag: '🇧🇪', nameKey: 'countries.be' },
    { code: 'BR', dialCode: '+55', flag: '🇧🇷', nameKey: 'countries.br' },
    { code: 'CA', dialCode: '+1', flag: '🇨🇦', nameKey: 'countries.ca' },
    { code: 'CL', dialCode: '+56', flag: '🇨🇱', nameKey: 'countries.cl' },
    { code: 'CN', dialCode: '+86', flag: '🇨🇳', nameKey: 'countries.cn' },
    { code: 'CO', dialCode: '+57', flag: '🇨🇴', nameKey: 'countries.co' },
    { code: 'CR', dialCode: '+506', flag: '🇨🇷', nameKey: 'countries.cr' },
    { code: 'CZ', dialCode: '+420', flag: '🇨🇿', nameKey: 'countries.cz' },
    { code: 'DE', dialCode: '+49', flag: '🇩🇪', nameKey: 'countries.de' },
    { code: 'DK', dialCode: '+45', flag: '🇩🇰', nameKey: 'countries.dk' },
    { code: 'EC', dialCode: '+593', flag: '🇪🇨', nameKey: 'countries.ec' },
    { code: 'EG', dialCode: '+20', flag: '🇪🇬', nameKey: 'countries.eg' },
    { code: 'FI', dialCode: '+358', flag: '🇫🇮', nameKey: 'countries.fi' },
    { code: 'GB', dialCode: '+44', flag: '🇬🇧', nameKey: 'countries.gb' },
    { code: 'GR', dialCode: '+30', flag: '🇬🇷', nameKey: 'countries.gr' },
    { code: 'GT', dialCode: '+502', flag: '🇬🇹', nameKey: 'countries.gt' },
    { code: 'HK', dialCode: '+852', flag: '🇭🇰', nameKey: 'countries.hk' },
    { code: 'HU', dialCode: '+36', flag: '🇭🇺', nameKey: 'countries.hu' },
    { code: 'ID', dialCode: '+62', flag: '🇮🇩', nameKey: 'countries.id' },
    { code: 'IE', dialCode: '+353', flag: '🇮🇪', nameKey: 'countries.ie' },
    { code: 'IL', dialCode: '+972', flag: '🇮🇱', nameKey: 'countries.il' },
    { code: 'IN', dialCode: '+91', flag: '🇮🇳', nameKey: 'countries.in' },
    { code: 'IT', dialCode: '+39', flag: '🇮🇹', nameKey: 'countries.it' },
    { code: 'JP', dialCode: '+81', flag: '🇯🇵', nameKey: 'countries.jp' },
    { code: 'KR', dialCode: '+82', flag: '🇰🇷', nameKey: 'countries.kr' },
    { code: 'MY', dialCode: '+60', flag: '🇲🇾', nameKey: 'countries.my' },
    { code: 'NL', dialCode: '+31', flag: '🇳🇱', nameKey: 'countries.nl' },
    { code: 'NO', dialCode: '+47', flag: '🇳🇴', nameKey: 'countries.no' },
    { code: 'NZ', dialCode: '+64', flag: '🇳🇿', nameKey: 'countries.nz' },
    { code: 'PA', dialCode: '+507', flag: '🇵🇦', nameKey: 'countries.pa' },
    { code: 'PE', dialCode: '+51', flag: '🇵🇪', nameKey: 'countries.pe' },
    { code: 'PH', dialCode: '+63', flag: '🇵🇭', nameKey: 'countries.ph' },
    { code: 'PL', dialCode: '+48', flag: '🇵🇱', nameKey: 'countries.pl' },
    { code: 'PT', dialCode: '+351', flag: '🇵🇹', nameKey: 'countries.pt' },
    { code: 'RO', dialCode: '+40', flag: '🇷🇴', nameKey: 'countries.ro' },
    { code: 'RU', dialCode: '+7', flag: '🇷🇺', nameKey: 'countries.ru' },
    { code: 'SA', dialCode: '+966', flag: '🇸🇦', nameKey: 'countries.sa' },
    { code: 'SE', dialCode: '+46', flag: '🇸🇪', nameKey: 'countries.se' },
    { code: 'SG', dialCode: '+65', flag: '🇸🇬', nameKey: 'countries.sg' },
    { code: 'TH', dialCode: '+66', flag: '🇹🇭', nameKey: 'countries.th' },
    { code: 'TR', dialCode: '+90', flag: '🇹🇷', nameKey: 'countries.tr' },
    { code: 'TW', dialCode: '+886', flag: '🇹🇼', nameKey: 'countries.tw' },
    { code: 'UA', dialCode: '+380', flag: '🇺🇦', nameKey: 'countries.ua' },
    { code: 'UY', dialCode: '+598', flag: '🇺🇾', nameKey: 'countries.uy' },
    { code: 'VE', dialCode: '+58', flag: '🇻🇪', nameKey: 'countries.ve' },
    { code: 'VN', dialCode: '+84', flag: '🇻🇳', nameKey: 'countries.vn' },
    { code: 'ZA', dialCode: '+27', flag: '🇿🇦', nameKey: 'countries.za' },
];

/**
 * Obtiene país por código ISO
 * 
 * @param code - Código ISO 3166-1 alpha-2 (ej: 'US', 'MX')
 * @returns CountryCode o undefined si no existe
 */
export function getCountryByCode(code: string): CountryCode | undefined {
    return COUNTRY_CODES.find(c => c.code === code);
}

/**
 * Obtiene país por código de marcación
 * 
 * @param dialCode - Código internacional (ej: '+1', '+52')
 * @returns CountryCode o undefined si no existe
 */
export function getCountryByDialCode(dialCode: string): CountryCode | undefined {
    return COUNTRY_CODES.find(c => c.dialCode === dialCode);
}

/**
 * Obtiene países prioritarios (top 4)
 * 
 * @returns Array de 4 CountryCode con priority definido
 */
export function getPriorityCountries(): CountryCode[] {
    return COUNTRY_CODES.filter(c => c.priority !== undefined)
        .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

/**
 * Obtiene resto de países (sin priority)
 * 
 * @returns Array de CountryCode ordenados alfabéticamente
 */
export function getRegularCountries(): CountryCode[] {
    return COUNTRY_CODES.filter(c => c.priority === undefined);
}

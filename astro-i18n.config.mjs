import { defineAstroI18nConfig } from 'astro-i18n';
import enCommon from './src/i18n/en.json' assert { type: 'json' };
import esCommon from './src/i18n/es.json' assert { type: 'json' };
import frCommon from './src/i18n/fr.json' assert { type: 'json' };

export default defineAstroI18nConfig({
  primaryLocale: 'en',
  secondaryLocales: ['es', 'fr'],
  fallbackLocale: 'en',
  trailingSlash: 'always',
  showPrimaryLocale: false,
  translationDirectory: {
    i18n: 'i18n',
    pages: 'i18n',
  },
  translations: {
    common: {
      en: enCommon,
      es: esCommon,
      fr: frCommon,
    },
  },
});

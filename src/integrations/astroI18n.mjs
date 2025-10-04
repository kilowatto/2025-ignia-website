/**
 * Lightweight Astro integration to keep astro-i18n assets in sync with the dev server.
 * It watches the translation sources defined in arquitecture.md and satisfies
 * the requirement of registering astro-i18n explicitly in astro.config.mjs.
 */
export default function astroI18nIntegration() {
  const watchedFiles = [
    '../../astro-i18n.config.ts',
    '../i18n/en.json',
    '../i18n/es.json',
    '../i18n/fr.json',
  ].map((relativePath) => new URL(relativePath, import.meta.url));

  return {
    name: 'astro-i18n-integration',
    hooks: {
      'astro:config:setup'({ addWatchFile }) {
        watchedFiles.forEach((fileUrl) => addWatchFile(fileUrl));
      },
    },
  };
}

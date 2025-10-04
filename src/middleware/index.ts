// src/middleware/index.ts
// Middleware para astro-i18n según arquitecture.md
import { sequence } from 'astro/middleware';
import { useAstroI18n } from 'astro-i18n';
import config from '../../astro-i18n.config.mjs';

const astroI18n = useAstroI18n(config);

export const onRequest = sequence(astroI18n);

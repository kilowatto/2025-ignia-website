import { defineCollection, z } from 'astro:content';

const i18nCollection = defineCollection({
    type: 'data',
    schema: z.record(z.string(), z.any()), // Allow nested objects for i18n structure
});

export const collections = {
    'i18n': i18nCollection,
};

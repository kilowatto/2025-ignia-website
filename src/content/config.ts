import { defineCollection, z } from 'astro:content';

const i18nCollection = defineCollection({
    type: 'data',
    schema: z.record(z.string(), z.any()), // Allow nested objects for i18n structure
});

const productsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        heroImage: z.string(),
        features: z.array(z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional(),
        })),
        specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
        useCases: z.array(z.object({
            title: z.string(),
            description: z.string(),
        })),
        relatedSolutions: z.array(z.string()).optional(),
        seo: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.array(z.string()),
        }),
    }),
});

const solutionsCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        heroImage: z.string(),
        features: z.array(z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional(),
        })),
        benefits: z.array(z.object({
            title: z.string(),
            description: z.string(),
        })),
        relatedProducts: z.array(z.string()).optional(),
        seo: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.array(z.string()),
        }),
    }),
});

export const collections = {
    'i18n': i18nCollection,
    'products': productsCollection,
    'solutions': solutionsCollection,
};

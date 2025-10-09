/**
 * Content Collections Schema para Ignia Cloud
 * Define y valida la estructura de contenido desde Markdown (Decap CMS)
 * 
 * Siguiendo arquitecture.md:
 * - §5: Multi-idioma (EN/ES/FR) con astro-i18n
 * - §9: SEO (title, description, keywords obligatorios)
 * - §10: Imágenes (validación de rutas)
 */

import { defineCollection, z } from 'astro:content';

/**
 * Colección: Pages (Index/Home)
 * Estructura completa del frontmatter YAML
 */
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ===== METADATOS SEO (arquitecture.md §9) =====
    slug: z.string().optional(),
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).optional(),
    
    // ===== SECCIÓN: HERO =====
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
      cta_text: z.string(),
      cta_url: z.string(),
      background_image: z.string().optional(),
    }),
    
    // ===== SECCIÓN: TRUST BAR =====
    trustbar: z.object({
      title: z.string(),
      logos: z.array(z.object({
        name: z.string(),
        logo: z.string(), // Ruta SVG
        url: z.string().optional(),
      })),
    }),
    
    // ===== SECCIÓN: FEATURES =====
    features: z.object({
      section_title: z.string(),
      section_subtitle: z.string().optional(),
      items: z.array(z.object({
        icon: z.string(), // Nombre del ícono
        title: z.string(),
        description: z.string(),
      })),
    }),
    
    // ===== SECCIÓN: CLOUD SOLUTIONS =====
    cloud_solutions: z.object({
      section_title: z.string(),
      description: z.string(),
      solutions: z.array(z.object({
        name: z.string(),
        short_description: z.string(),
        url: z.string(),
        image: z.string().optional(),
      })),
    }),
    
    // ===== SECCIÓN: AI & LLMs =====
    ai_section: z.object({
      title: z.string(),
      description: z.string(),
      cta_text: z.string(),
      cta_url: z.string(),
    }),
    
    // ===== SECCIÓN: SECURITY =====
    security: z.object({
      title: z.string(),
      certifications: z.array(z.object({
        name: z.string(),
        logo: z.string(), // Ruta a logo
      })),
    }),
    
    // ===== SECCIÓN: PRICING =====
    pricing: z.object({
      title: z.string(),
      description: z.string(),
      plans: z.array(z.object({
        name: z.string(),
        price: z.string(),
        period: z.string(),
        description: z.string(),
        features: z.array(z.string()),
        featured: z.boolean().default(false),
      })),
    }),
    
    // ===== SECCIÓN: TESTIMONIALS =====
    testimonials: z.object({
      title: z.string(),
      items: z.array(z.object({
        name: z.string(),
        role: z.string(),
        company: z.string(),
        quote: z.string(),
        avatar: z.string().optional(),
      })),
    }),
    
    // ===== SECCIÓN: FINAL CTA =====
    final_cta: z.object({
      title: z.string(),
      description: z.string(),
      button_text: z.string(),
      button_url: z.string(),
      secondary_button_text: z.string().optional(),
      secondary_button_url: z.string().optional(),
    }),
  }),
});

/**
 * Exportar colecciones
 * Por ahora solo 'pages' (Index)
 * En futuro: 'sections' (Solutions, Products), 'items' (VMs, NOCaaS)
 */
export const collections = {
  pages: pagesCollection,
};

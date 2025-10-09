/**
 * API endpoint para servir config.yml de Decap CMS
 * Necesario porque en SSR mode, los archivos en public/ no son accesibles directamente
 */

export const prerender = false;

export async function GET() {
  const config = `# Configuración de Decap CMS para Ignia Cloud
backend:
  name: github
  repo: kilowatto/2025-ignia-website
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth

media_folder: "public/images/cms"
public_folder: "/images/cms"

locale: "en"

i18n:
  structure: multiple_folders
  locales: [en, es, fr]
  default_locale: en

collections:
  - name: "pages"
    label: "📄 Páginas"
    label_singular: "Página"
    folder: "src/content/pages"
    create: false
    delete: false
    format: "frontmatter"
    extension: "md"
    i18n: true
    identifier_field: "slug"
    
    fields:
      - label: "Slug"
        name: "slug"
        widget: "string"
        hint: "Identificador único (ej: home, about)"
        i18n: false
        
      - label: "Título SEO"
        name: "title"
        widget: "string"
        hint: "Título para motores de búsqueda (50-60 caracteres)"
        i18n: true
        
      - label: "Descripción SEO"
        name: "description"
        widget: "text"
        hint: "Descripción para motores de búsqueda (150-160 caracteres)"
        i18n: true
        
      - label: "Imagen OG"
        name: "ogImage"
        widget: "string"
        required: false
        i18n: true
        
      # ===== HERO SECTION =====
      - label: "🎯 Hero Section"
        name: "hero"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título Principal", name: "title", widget: "string", i18n: true}
          - {label: "Subtítulo", name: "subtitle", widget: "text", i18n: true}
          - {label: "Texto Botón CTA", name: "ctaText", widget: "string", i18n: true}
          - {label: "URL Botón CTA", name: "ctaUrl", widget: "string", i18n: true}
          - {label: "Texto Botón Secundario", name: "secondaryCtaText", widget: "string", required: false, i18n: true}
          - {label: "URL Botón Secundario", name: "secondaryCtaUrl", widget: "string", required: false, i18n: true}
          
      # ===== TRUST BAR =====
      - label: "🏆 Barra de Confianza"
        name: "trustBar"
        widget: "object"
        i18n: true
        fields:
          - {label: "Texto", name: "text", widget: "string", i18n: true}
          - label: "Logos de Clientes"
            name: "logos"
            widget: "list"
            i18n: true
            fields:
              - {label: "Nombre", name: "name", widget: "string"}
              - {label: "URL Logo", name: "url", widget: "string"}
              
      # ===== FEATURES SECTION =====
      - label: "✨ Features Section"
        name: "features"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título de Sección", name: "sectionTitle", widget: "string", i18n: true}
          - {label: "Descripción", name: "description", widget: "text", i18n: true}
          - label: "Lista de Features"
            name: "items"
            widget: "list"
            i18n: true
            fields:
              - {label: "Icono", name: "icon", widget: "string", hint: "Emoji o nombre de icono"}
              - {label: "Título", name: "title", widget: "string"}
              - {label: "Descripción", name: "description", widget: "text"}
              
      # ===== CLOUD SOLUTIONS =====
      - label: "☁️ Soluciones Cloud"
        name: "cloudSolutions"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título de Sección", name: "sectionTitle", widget: "string", i18n: true}
          - label: "Soluciones"
            name: "solutions"
            widget: "list"
            i18n: true
            fields:
              - {label: "Título", name: "title", widget: "string"}
              - {label: "Descripción", name: "description", widget: "text"}
              - {label: "Icono", name: "icon", widget: "string"}
              - {label: "URL", name: "url", widget: "string", required: false}
              
      # ===== AI SECTION =====
      - label: "🤖 Sección IA"
        name: "aiSection"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título", name: "title", widget: "string", i18n: true}
          - {label: "Descripción", name: "description", widget: "text", i18n: true}
          - {label: "Texto CTA", name: "ctaText", widget: "string", i18n: true}
          - {label: "URL CTA", name: "ctaUrl", widget: "string", i18n: true}
          
      # ===== SECURITY SECTION =====
      - label: "🔒 Sección Seguridad"
        name: "security"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título", name: "title", widget: "string", i18n: true}
          - {label: "Descripción", name: "description", widget: "text", i18n: true}
          - label: "Certificaciones"
            name: "certifications"
            widget: "list"
            i18n: true
            fields:
              - {label: "Nombre", name: "name", widget: "string"}
              - {label: "Logo URL", name: "logoUrl", widget: "string"}
              
      # ===== PRICING =====
      - label: "💰 Precios"
        name: "pricing"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título de Sección", name: "sectionTitle", widget: "string", i18n: true}
          - label: "Planes"
            name: "plans"
            widget: "list"
            i18n: true
            fields:
              - {label: "Nombre", name: "name", widget: "string"}
              - {label: "Precio", name: "price", widget: "string"}
              - {label: "Descripción", name: "description", widget: "text"}
              - label: "Features"
                name: "features"
                widget: "list"
                field: {label: "Feature", name: "feature", widget: "string"}
              - {label: "Texto CTA", name: "ctaText", widget: "string"}
              - {label: "URL CTA", name: "ctaUrl", widget: "string"}
              - {label: "Destacado", name: "featured", widget: "boolean", default: false}
              
      # ===== TESTIMONIALS =====
      - label: "💬 Testimonios"
        name: "testimonials"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título de Sección", name: "sectionTitle", widget: "string", i18n: true}
          - label: "Testimonios"
            name: "items"
            widget: "list"
            i18n: true
            fields:
              - {label: "Texto", name: "text", widget: "text"}
              - {label: "Autor", name: "author", widget: "string"}
              - {label: "Cargo", name: "role", widget: "string"}
              - {label: "Empresa", name: "company", widget: "string"}
              - {label: "Avatar URL", name: "avatarUrl", widget: "string", required: false}
              
      # ===== FINAL CTA =====
      - label: "🚀 CTA Final"
        name: "finalCta"
        widget: "object"
        i18n: true
        fields:
          - {label: "Título", name: "title", widget: "string", i18n: true}
          - {label: "Descripción", name: "description", widget: "text", i18n: true}
          - {label: "Texto Botón", name: "ctaText", widget: "string", i18n: true}
          - {label: "URL Botón", name: "ctaUrl", widget: "string", i18n: true}`;

  return new Response(config, {
    status: 200,
    headers: {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

# Guía de Instalación: Decap CMS para Ignia Cloud

## 📋 Resumen

Esta guía documenta la integración de **Decap CMS** para gestionar el contenido de la página **Index/Home** de Ignia Cloud. La arquitectura sigue estrictamente `arquitecture.md` (§2, §5, §9, §10).

## 🏗️ Arquitectura Implementada

```
Decap CMS UI (/admin)
    ↓
GitHub Backend (Markdown en src/content/pages/)
    ↓
Astro Content Collections (validación TypeScript)
    ↓
index.astro (renderización SSG)
    ↓
Producción (Cloudflare Pages)
```

## 📦 Archivos Creados

### 1. Admin UI y Configuración

- **`public/admin/index.html`**: Interfaz de Decap CMS
- **`public/admin/config.yml`**: Configuración del CMS (collections, fields, i18n)

### 2. Content Collections

- **`src/content/config.ts`**: Schema TypeScript (validación con Zod)
- **`src/content/pages/en/home.md`**: Contenido English
- **`src/content/pages/es/home.md`**: Contenido Español  
- **`src/content/pages/fr/home.md`**: Contenido Français

### 3. Páginas Astro (ejemplo)

- **`src/pages/index-cms.astro`**: Versión CMS-powered (ejemplo de implementación)

## 🔧 Instalación Completada

```bash
# Dependencia ya instalada
pnpm add decap-cms-app
```

## 🔐 Configuración de Autenticación (PENDIENTE)

Tienes **2 opciones** para habilitar GitHub OAuth:

### Opción A: Netlify Identity (Gratuito, Recomendado)

1. **Crear cuenta en Netlify** (si no tienes):
   - https://app.netlify.com/signup

2. **Habilitar Identity en Netlify**:
   - Ve a tu proyecto en Netlify
   - Settings → Identity → Enable Identity
   - Registration preferences: **Invite only** (seguridad)

3. **Configurar GitHub OAuth en Netlify**:
   - Settings → Identity → External providers
   - Enable GitHub provider
   - Netlify creará automáticamente las credenciales

4. **Actualizar `config.yml`**:
   ```yaml
   backend:
     name: github
     repo: kilowatto/2025-ignia-website
     branch: main
     base_url: https://api.netlify.com  # ✅ Ya configurado
     auth_endpoint: auth
   ```

5. **Desplegar en Netlify**:
   - Conectar repo GitHub
   - Build command: `pnpm run build`
   - Publish directory: `dist`
   - El CMS estará en: `https://tu-sitio.netlify.app/admin`

### Opción B: GitHub Personal Access Token (Desarrollo Local)

⚠️ **Solo para testing local, NO para producción**

1. **Crear PAT en GitHub**:
   - GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Scopes: `repo` (acceso completo)

2. **Instalar Netlify CMS Proxy** (local):
   ```bash
   pnpm add -D netlify-cms-proxy-server
   ```

3. **Agregar script en `package.json`**:
   ```json
   {
     "scripts": {
       "cms-proxy": "netlify-cms-proxy-server"
     }
   }
   ```

4. **Actualizar `config.yml`** (solo para local):
   ```yaml
   backend:
     name: git-gateway  # Cambiar temporalmente
   
   local_backend: true  # Habilitar modo local
   ```

5. **Ejecutar en terminales separadas**:
   ```bash
   # Terminal 1
   pnpm run dev
   
   # Terminal 2
   pnpm run cms-proxy
   ```

6. **Acceder al CMS**:
   - http://localhost:4322/admin
   - Login con GitHub PAT

## 📂 Estructura de Contenido

Cada archivo Markdown (`home.md`) tiene este frontmatter:

```yaml
---
slug: "home"
title: "Título SEO (50-60 caracteres)"
description: "Meta description (150-160 caracteres)"
keywords: [lista, de, palabras, clave]

hero:
  title: "..."
  subtitle: "..."
  cta_text: "..."
  cta_url: "..."

trustbar:
  title: "..."
  logos: [...]

features:
  section_title: "..."
  items: [...]

cloud_solutions: [...]
ai_section: [...]
security: [...]
pricing: [...]
testimonials: [...]
final_cta: [...]
---
```

## 🎨 Uso del CMS

### Flujo de Trabajo

1. **Login**: `https://tu-sitio.com/admin` → Autenticar con GitHub
2. **Editar**: Seleccionar "📄 Páginas" → "home" → Idioma (EN/ES/FR)
3. **Modificar**: Editar campos (Hero, Features, Pricing, etc.)
4. **Guardar**: Click en "Save" → Commit a GitHub
5. **Deploy**: Cloudflare Pages detecta cambios → Rebuild automático

### Multi-idioma

El CMS presenta **3 versiones** del mismo contenido:
- 🇬🇧 **English** (`en/home.md`)
- 🇪🇸 **Español** (`es/home.md`)
- 🇫🇷 **Français** (`fr/home.md`)

**Campos duplicados vs traducibles**:
- `i18n: true`: Traducir en cada idioma (textos)
- `i18n: duplicate`: Mismo valor en todos (URLs, imágenes)

## 🔄 Migración de index.astro Actual

### Paso 1: Respaldar index.astro actual

```bash
cp src/pages/index.astro src/pages/index.astro.backup
cp src/pages/es/index.astro src/pages/es/index.astro.backup
cp src/pages/fr/index.astro src/pages/fr/index.astro.backup
```

### Paso 2: Actualizar a Content Collections

Ver archivo de ejemplo: `src/pages/index-cms.astro`

Cambios principales:
```typescript
// Importar getCollection
import { getCollection } from 'astro:content';

// Obtener contenido desde Markdown
const pages = await getCollection('pages');
const homePage = pages.find((page) => 
  page.data.slug === 'home' && page.id.startsWith('en/')
);

const { data: content } = homePage;

// Renderizar con {content.hero.title}, {content.features.items}, etc.
```

### Paso 3: Componentes Reutilizables

Puedes seguir usando tus componentes actuales:

```astro
<HeroSection
  title={content.hero.title}
  subtitle={content.hero.subtitle}
  ctaText={content.hero.cta_text}
  ctaUrl={content.hero.cta_url}
/>
```

## ✅ Validación TypeScript

El schema en `src/content/config.ts` valida automáticamente:

- ✅ Títulos SEO ≤60 caracteres
- ✅ Descriptions ≤160 caracteres
- ✅ URLs válidas (formato URL)
- ✅ Campos obligatorios presentes
- ✅ Tipos correctos (string, array, object)

Si el frontmatter es inválido, **el build fallará** con mensaje de error claro.

## 🧪 Testing

### Verificar Content Collections

```bash
pnpm run build
```

Debe compilar sin errores. Si hay problemas con el schema, verás:
```
[ERROR] Invalid frontmatter in src/content/pages/en/home.md
```

### Acceder al CMS (después de autenticación)

1. Abrir: `http://localhost:4322/admin` (dev) o `https://ignia.cloud/admin` (prod)
2. Login con GitHub
3. Ver "📄 Páginas" → debe mostrar "home" con 3 idiomas

## 📸 Imágenes y Medios

### Configuración Actual

```yaml
media_folder: "public/images/cms"
public_folder: "/images/cms"
```

### Uso en CMS

Cuando subes imágenes en el CMS:
- Se guardan en: `public/images/cms/`
- Se referencian como: `/images/cms/nombre-imagen.webp`

### Optimización (arquitecture.md §10)

⚠️ **Recordar comprimir manualmente**:
- Hero images: ≤90KB
- Card images: ≤40KB
- Logos/icons: ≤10KB

Formatos prioritarios: **AVIF > WebP > PNG/JPG**

## 🚀 Deployment

### Cloudflare Pages (Actual)

1. Push a GitHub → Cloudflare detecta cambios
2. Build automático: `pnpm run build`
3. Deploy a producción

### Netlify (Para CMS con GitHub OAuth)

1. Conectar repo en Netlify
2. Build settings:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
3. Enable Identity (Settings → Identity)
4. CMS funciona en: `https://tu-sitio.netlify.app/admin`

**Nota**: Puedes mantener Cloudflare para producción y usar Netlify solo para `/admin`.

## 📚 Documentación Adicional

- **Decap CMS**: https://decapcms.org/docs/
- **Astro Content Collections**: https://docs.astro.build/en/guides/content-collections/
- **Zod Schema**: https://zod.dev/

## 🐛 Troubleshooting

### Error: "Config.yml not found"

✅ Verificar que `public/admin/config.yml` existe y es YAML válido

### Error: "Not Found" en /admin

✅ Verificar que `public/admin/index.html` existe
✅ Rebuild: `pnpm run build`

### Error: "GitHub authentication failed"

✅ Verificar configuración de OAuth (Netlify Identity o PAT)
✅ Verificar permisos del repo en GitHub

### Error: "Invalid frontmatter"

✅ Verificar schema en `src/content/config.ts`
✅ Validar YAML en archivos `.md` (sintaxis correcta)

### CMS muestra pantalla blanca

✅ Abrir DevTools Console → Ver errores JavaScript
✅ Verificar `backend.repo` en config.yml (debe coincidir con tu repo)

## 🎯 Próximos Pasos

1. ✅ **Configurar autenticación** (Opción A o B)
2. ⏭️ **Probar CMS** (crear/editar contenido)
3. ⏭️ **Migrar index.astro** (usar Content Collections)
4. ⏭️ **Actualizar searchData.ts** (keywords desde Markdown)
5. ⏭️ **Documentar en README.md** (uso del CMS)

## 📝 Notas Importantes

- **Solo Index por ahora**: Los templates para Sections (Solutions, Products) e Items (VMs, NOCaaS) se harán después
- **Arquitecture.md compliance**: Todo respeta §2 (TypeScript), §5 (i18n), §9 (SEO), §10 (imágenes)
- **No breaking changes**: El sitio actual sigue funcionando mientras migras gradualmente
- **Git workflow**: Todo cambio del CMS es un commit visible en GitHub (auditable)

---

**Autor**: GitHub Copilot  
**Fecha**: 9 de octubre de 2025  
**Versión**: 1.0.0

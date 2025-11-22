# Ignia Cloud - Sitio Web Corporativo

> Sitio web corporativo de Ignia Cloud construido con Astro, optimizado para performance, SEO y accesibilidad.

**Versión:** v1.3  
**Stack:** Astro + Tailwind CSS + astro-i18n + Node adapter  
**Idiomas:** 🇬🇧 English (default) · 🇪🇸 Español · 🇫🇷 Français

---

## 📋 Tabla de Contenidos

- [Arquitectura General](#-arquitectura-general)
- [Stack Técnico](#-stack-técnico)
- [Sistema de Internacionalización](#-sistema-de-internacionalización)
- [Integración Odoo](#-integración-odoo)
- [Estructura de Directorios](#-estructura-de-directorios)
- [Instalación y Desarrollo](#-instalación-y-desarrollo)
- [Comandos Disponibles](#-comandos-disponibles)
- [Dependencias](#-dependencias)
- [Performance y Optimización](#-performance-y-optimización)
- [Principios Arquitectónicos](#-principios-arquitectónicos)
- [Documentación Adicional](#-documentación-adicional)

---

## 🏗️ Arquitectura General

Este proyecto sigue una arquitectura **utility-first, semántica, mobile-first** con énfasis en **performance y SEO-first**. La filosofía central es **JS mínimo o nulo** - todo lo que puede implementarse con CSS/HTML se hace así.

### Características Principales

- ✅ **SSG + SSR selectivo** con Astro
- ✅ **CSS-only navigation** (sin JavaScript bloqueante)
- ✅ **Progressive enhancement** (JavaScript defer para mejoras no esenciales)
- ✅ **i18n híbrido** (astro-i18n + Astro nativo)
- ✅ **TypeScript** en todo el scripting
- ✅ **WCAG 2.2 AA compliant**
- ✅ **Core Web Vitals optimizados**: LCP < 2.5s, CLS < 0.1, INP < 200ms
- ✅ **Presupuesto móvil**: ≤300KB

**Documentación arquitectónica completa:** Ver [`arquitecture.md`](./arquitecture.md) para detalles de todos los principios, decisiones técnicas y guías de implementación.

---

## 🛠️ Stack Técnico

### Core Framework
- **[Astro](https://astro.build)** v5.13+ - Framework principal (SSG/SSR)
- **[@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)** - Adapter SSR para Cloudflare Pages/Workers

### Estilos
- **[@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/)** - Integración oficial Tailwind CSS
- **[Tailwind CSS](https://tailwindcss.com)** v3.4+ - Framework CSS utility-first
- **[PostCSS](https://postcss.org)** + **[Autoprefixer](https://github.com/postcss/autoprefixer)** - Procesamiento CSS

### Internacionalización
- **[astro-i18n](https://github.com/alexanderniebuhr/astro-i18n)** v2.2+ - Gestión de traducciones (función `t()`, archivos JSON)
- **Astro i18n nativo** - Routing automático por idioma (`/en`, `/es`, `/fr`)

### SEO y Optimización
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** - Generación automática de sitemaps
- **[astro-seo](https://github.com/jonasmerlin/astro-seo)** - Meta tags y datos estructurados
- **[astro-og-canvas](https://github.com/delucis/astro-og-canvas)** - Generación de Open Graph images
- **[astro-compress](https://github.com/astro-community/astro-compress)** - Compresión de assets (HTML, CSS, JS)

### Búsqueda
- **[minisearch](https://github.com/lucaong/minisearch)** v7.2+ - Motor de búsqueda client-side (solo en `/search`)
- **Documentación completa:** Ver [`SEARCH.md`](./SEARCH.md) para guía detallada de cómo agregar contenido al índice de búsqueda

### Integración CRM
- **Odoo SaaS 18** - API XML-RPC para gestión de contactos (`res.partner` model)

### Fuentes
- **Raleway** (Light/Medium/Regular) - WOFF2 con subset Latin, `font-display: swap`

---

## 🔗 Integración Odoo

Este proyecto integra **Odoo SaaS 18** para capturar y gestionar contactos desde el formulario web del footer.

### Arquitectura de Integración

```
Browser (contact-form.ts)
    ↓ POST /api/contact/submit
Edge Worker (Cloudflare)
    ↓ OdooService → OdooClient (XML-RPC)
Odoo SaaS (res.partner model)
```

### Campos Capturados

El formulario de contacto captura y envía a Odoo:

#### Campos Básicos (del formulario)
- ✅ **name** - Nombre completo del contacto
- ✅ **email** - Email (usado para detectar duplicados)
- ✅ **phone** - Teléfono principal

#### Metadata Automática (contexto del navegador)
- ✅ **locale** (`en`/`es`/`fr`) → Se mapea a `lang` de Odoo (`en_US`/`es_MX`/`fr_FR`)
- ✅ **source** - Origen del contacto (hardcoded: `'website_footer'`)
- ✅ **page** - Ruta de la página (`/`, `/es/`, `/fr/solutions/`, etc.)

#### Parámetros UTM (campañas de marketing)
Si la URL contiene query parameters UTM, se capturan automáticamente:
- ✅ **utm_source** - Origen de campaña (ej: `google`, `facebook`, `linkedin`)
- ✅ **utm_medium** - Medio (ej: `cpc`, `email`, `social`, `organic`)
- ✅ **utm_campaign** - Nombre de campaña (ej: `winter_2024`, `product_launch`)
- ✅ **utm_content** - Variante de contenido (ej: `footer_form`, `hero_cta`)
- ✅ **utm_term** - Término de búsqueda SEM (ej: `cloud+backup`)

### Cómo se Guardan los Datos en Odoo

Los datos se almacenan en el modelo `res.partner` de Odoo:

| Campo Odoo | Tipo | Valor de Ejemplo | Descripción |
|------------|------|------------------|-------------|
| `name` | Char | `"Juan Pérez"` | Nombre completo (campo nativo) |
| `email` | Char | `"juan@example.com"` | Email (campo nativo) |
| `phone` | Char | `"+52 555 1234 5678"` | Teléfono (campo nativo) |
| `lang` | Selection | `"es_MX"` | Idioma para comunicaciones (campo nativo) |
| `type` | Selection | `"contact"` | Tipo de contacto (campo nativo) |
| `is_company` | Boolean | `false` | Es empresa? (campo nativo) |
| `comment` | Text | *(ver JSON abajo)* | Metadata estructurada (campo nativo) |

#### Estructura del Campo `comment` (JSON)

Toda la metadata adicional (source, page, UTMs) se guarda como JSON en el campo `comment`:

```json
{
  "source": "website_footer",
  "page": "/es/",
  "locale": "es",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "winter_2024",
  "utm_content": "footer_form",
  "utm_term": "cloud+backup",
  "submitted_at": "2025-10-05T15:30:00.000Z"
}
```

**Ventajas de este enfoque:**
- ✅ No requiere modificar Odoo (sin módulos personalizados)
- ✅ Implementación rápida (6-8 horas)
- ✅ Flexible para agregar nuevos campos sin cambios en Odoo
- ⚠️ Desventaja: No filtrable directamente en UI de Odoo (requiere export/parsing manual)

### Manejo de Duplicados

El sistema detecta duplicados por email:
- **Si email NO existe** → Se crea un nuevo partner (`action: 'created'`)
- **Si email YA existe** → Se actualiza el partner existente (`action: 'updated'`)

En actualizaciones, el JSON del campo `comment` se extiende con un array `updates[]` para mantener historial:

```json
{
  "source": "website_footer",
  "page": "/es/",
  "submitted_at": "2025-10-05T15:30:00.000Z",
  "updates": [
    {
      "source": "contact_page",
      "page": "/en/contact/",
      "submitted_at": "2025-10-06T10:15:00.000Z"
    }
  ]
}
```

### Configuración de Variables de Entorno

Para que la integración funcione, debes configurar 4 variables de entorno:

#### Desarrollo Local (archivo `.env`)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Odoo SaaS Configuration
ODOO_URL=https://ignia-cloud.odoo.com
ODOO_DB=ignia-cloud
ODOO_USERNAME=api@ignia.cloud
ODOO_PASSWORD=tu_password_seguro_aqui
```

**Importante:**
- ✅ Asegúrate que `.env` está en `.gitignore` (NUNCA commitear credenciales)
- ✅ Reinicia el servidor de desarrollo después de crear/modificar `.env`

#### Producción (Cloudflare Pages)

1. Ve a **Cloudflare Dashboard** → tu sitio → **Settings**
2. Navega a **Environment Variables**
3. Agrega las 4 variables (Production y/o Preview):
   - `ODOO_URL` = `https://ignia-cloud.odoo.com`
   - `ODOO_DB` = `ignia-cloud`
   - `ODOO_USERNAME` = `api@ignia.cloud`
   - `ODOO_PASSWORD` = `tu_password` (marcarlo como secreto)
4. Guarda y redeploy el sitio

### Archivos Relacionados

```
src/
├── lib/odoo/                           # SDK centralizado de Odoo
│   ├── types.ts                        # Interfaces TypeScript
│   ├── config.ts                       # Validación de env vars
│   ├── OdooClient.ts                   # Cliente XML-RPC (bajo nivel)
│   └── OdooService.ts                  # Capa de servicio (alto nivel)
├── pages/api/contact/
│   └── submit.ts                       # API endpoint SSR
└── scripts/
    └── contact-form.ts                 # Script cliente (captura UTMs, envía POST)
```

### Testing de la Integración

#### 1. Health Check del Endpoint

```bash
curl https://ignia.cloud/api/contact/submit
```

**Response esperada:**
```json
{
  "status": "ok",
  "odoo": "configured",
  "url": "https://ignia-cloud.odoo.com"
}
```

#### 2. Test de Envío Completo

```bash
curl -X POST https://ignia.cloud/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1 555 0123",
    "locale": "en",
    "source": "api_test",
    "page": "/test/"
  }'
```

**Response esperada (success):**
```json
{
  "success": true,
  "message": "Gracias por tu mensaje. Te contactaremos pronto.",
  "partnerId": 123,
  "action": "created"
}
```

#### 3. Verificar en Odoo UI

1. Login a tu instancia Odoo: `https://ignia-cloud.odoo.com`
2. Ve a **Contacts** (módulo)
3. Busca el email de prueba (`test@example.com`)
4. Abre el contacto y verifica:
   - Nombre, email, teléfono
   - Campo `Language` = `English (US)`
   - Campo `Notes` debe contener el JSON con metadata

### Troubleshooting

#### Error: "Faltan variables de entorno de Odoo"

**Causa:** No se configuraron las env vars.
**Solución:** Ver sección [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)

#### Error: "Autenticación fallida"

**Causa:** Usuario/password incorrectos o sin permisos.
**Solución:** 
1. Verifica que el usuario tenga acceso API en Odoo
2. Verifica que el password sea correcto
3. Revisa que `ODOO_DB` coincida con el nombre de tu base de datos

#### Error: "Request timeout después de 30000ms"

**Causa:** Odoo no responde o hay problemas de red.
**Solución:**
1. Verifica que `ODOO_URL` sea correcta (sin trailing slash)
2. Verifica conectividad desde tu servidor a Odoo
3. Considera aumentar el timeout en `OdooClient` constructor

#### Formulario no envía datos

**Causa:** JavaScript del formulario tiene errores.
**Solución:**
1. Abre DevTools → Console y busca errores `[ContactForm]`
2. Verifica que el endpoint `/api/contact/submit` esté accesible
3. Revisa Network tab para ver el request/response completo

### Mejoras Futuras (Roadmap)

- [ ] **Campos personalizados en Odoo** - Crear módulo custom con campos UTM dedicados
- [ ] **Rate limiting avanzado** - Usar Cloudflare KV para rate limiting por IP
- [ ] **Webhooks** - Notificaciones a Slack/Teams cuando llega un nuevo lead
- [ ] **Analytics** - Dashboard con métricas de conversión por source/campaign
- [ ] **A/B Testing** - Diferentes versiones del formulario con tracking

---

## 🌐 Sistema de Internacionalización

Este proyecto usa una **arquitectura híbrida i18n** que combina dos sistemas complementarios:

### 1. **astro-i18n** (Librería - Traducciones)
- 📝 Gestiona **cadenas de texto** via función `t()`
- 📁 Archivos JSON en `src/i18n/` (`en.json`, `es.json`, `fr.json`)
- 🔧 Configuración en `astro-i18n.config.mjs`
- 💡 Ejemplo: `t('header.home')` → "Home" | "Inicio" | "Accueil"

### 2. **Astro i18n Nativo** (Framework - Routing)
- 🌍 Gestiona **routing automático** por idioma
- 🔗 URLs: `/` (EN), `/es/`, `/fr/`
- ⚙️ Configuración en `astro.config.mjs`
- 📍 Proporciona `Astro.currentLocale`

### ¿Por qué esta arquitectura?

Esta combinación nos dio **los mejores resultados** en términos de:
- ✅ **Mantenibilidad** - Separación clara de responsabilidades
- ✅ **Performance** - Sin duplicación de lógica
- ✅ **Developer Experience** - APIs idiomáticas de cada herramienta
- ✅ **SEO** - Routing nativo optimizado + traducciones centralizadas

**Más detalles:** Ver §5 en [`arquitecture.md`](./arquitecture.md)

### 🌍 Detección Automática de Idioma

El sitio incluye un sistema de **detección automática del idioma preferido del usuario** que mejora la experiencia multi-idioma.

#### Funcionamiento

1. **Detección por Navegador (Primaria)**
   - Lee `navigator.languages` del navegador del usuario
   - Compara con idiomas soportados (en, es, fr)
   - Si detecta diferencia con el idioma actual → muestra banner

2. **Detección por Geolocalización (Fallback)**
   - Si el navegador no tiene preferencia clara, consulta API de geolocalización (ipapi.co)
   - Mapea código de país a idioma:
     - 🇪🇸 ES/MX/AR/CO/PE/CL/VE → Español
     - 🇫🇷 FR/BE/CH/CA/LU → Francés
     - 🇺🇸 US/GB/AU/NZ/IE/ZA → Inglés
   - Si detecta diferencia → muestra banner

3. **Banner de Sugerencia**
   - Aparece después de 1.5 segundos (no bloquea carga inicial)
   - Ofrece cambiar al idioma detectado con un click
   - Se puede descartar (no vuelve a aparecer)
   - Respeta decisión del usuario vía `localStorage`

#### Ejemplo Visual

```
┌──────────────────────────────────────────────────────────┐
│ 🇪🇸 ¿Prefieres ver el sitio en español?                 │
│ Detectamos que tu navegador está configurado en español  │
│                                                           │
│ [Cambiar idioma]  [✕ Descartar]                         │
└──────────────────────────────────────────────────────────┘
```

#### Estados en localStorage

| Key | Valor | Significado |
|-----|-------|-------------|
| `language-suggestion-dismissed` | `"true"` | Usuario rechazó sugerencia |
| `language-suggestion-accepted` | `"true"` | Usuario aceptó y cambió idioma |

**Nota:** Si cualquiera de estas keys existe, el banner no vuelve a mostrarse.

#### Implementación Técnica

**Ubicación:** `src/components/LanguageDetection.astro`

```astro
<!-- BaseLayout.astro -->
<body>
  <Header />
  <main><slot /></main>
  <Footer />
  <SearchModal />
  <LanguageDetection />  <!-- ← Detección automática -->
</body>
```

**Características:**
- ✅ **JavaScript diferido** (no bloquea Critical Path)
- ✅ **Progressive enhancement** (sitio funciona sin JS)
- ✅ **WCAG 2.2 AA compliant** (ARIA labels, navegación por teclado)
- ✅ **Respeta preferencias** (localStorage, no invasivo)
- ✅ **Multi-idioma** (mensajes en ES/EN/FR)

#### Cómo Probar

1. **Configurar navegador en español:**
   - Chrome: `Settings → Languages → Español` (mover arriba)
   - Firefox: `Preferences → Language → Choose → Español`

2. **Visitar página en francés:**
   ```bash
   http://localhost:4321/fr/
   ```

3. **Esperar 1.5 segundos** → Debería aparecer banner sugiriendo español

4. **Opciones:**
   - **Cambiar idioma**: Te redirige a `/es/` (español)
   - **Descartar**: Banner desaparece (no vuelve a mostrarse)

#### Desactivar Temporalmente

Para desarrollo, si el banner molesta:

```javascript
// En DevTools Console
localStorage.setItem('language-suggestion-dismissed', 'true');
```

Para reactivar:

```javascript
localStorage.removeItem('language-suggestion-dismissed');
localStorage.removeItem('language-suggestion-accepted');
```

#### Cumplimiento Arquitectónico

| Requisito (arquitecture.md) | Estado | Implementación |
|------------------------------|--------|----------------|
| **§2: JS mínimo o nulo** | ✅ | Script diferido, solo detección (no bloquea render) |
| **§5: i18n híbrido** | ✅ | Usa `Astro.currentLocale` + traducciones centralizadas |
| **§6: Detección de Idioma** | ✅ | Accept-Language + geolocalización + localStorage |
| **§12: WCAG 2.2 AA** | ✅ | Banner con ARIA, teclado, contraste WCAG |
| **§14: Performance** | ✅ | Script < 2KB gzip, carga diferida, no bloquea LCP |

#### Banner de Sugerencia Minimalista

**Rediseño v1.3 → v1.3.2 - 100% cumplimiento arquitectónico:**

El `LanguageSuggestionBanner.astro` fue completamente rediseñado para cumplir con los lineamientos de `arquitecture.md`:

**Antes (v1.2):**
- ❌ Gradientes animados coloridos
- ❌ 100+ líneas de CSS personalizado
- ❌ 3 animaciones @keyframes complejas
- ❌ Texto hardcodeado (ternarios)
- ❌ ~5KB de tamaño

**Ahora (v1.3.2):**
- ✅ Fondo blanco con borde superior accent2 (§1: minimalista)
- ✅ 0 líneas de CSS custom, 100% Tailwind (§2: estilos Tailwind)
- ✅ Traducciones por props (not t()) - fix locale correcto (§5: i18n híbrido)
- ✅ Contraste WCAG AA (gris-800 sobre blanco) (§12: accesibilidad)
- ✅ ~2KB de tamaño (-60% mejora) (§14: performance)

**Claves i18n:** `language_banner.*` en `src/i18n/{en,es,fr}.json`

**Correcciones v1.3.1 - v1.3.2 (i18n + visibilidad):**

**Problema v1.3.1:** El banner mostraba claves i18n en lugar de texto traducido
- **Causa:** `t()` de astro-i18n usa `Astro.currentLocale`, no el idioma sugerido
- **Ejemplo:** Página `/fr/` sugiriendo ES mostraba texto francés (incorrecto)
- **Solución:** `LanguageDetection` carga JSON directamente y pasa traducciones como props

**Problema v1.3.2:** El banner no era visible a pesar de detección correcta
- **Causa:** Conflicto de animaciones entre `LanguageDetection` y `LanguageSuggestionBanner`
- **Diagnóstico:** Console logs mostraban `hidden` removido pero banner off-screen (`-translate-y-full`)
- **Solución:** Consolidar control de animación en `LanguageDetection.astro`:
  1. Detecta idioma preferido
  2. Remueve clase `hidden` del wrapper
  3. Espera 1.5s (setTimeout)
  4. Anima banner interno (remove `-translate-y-full`, add `translate-y-0`)

**Arquitectura final:**
- **LanguageDetection:** Control único de detección + animación (single source of truth)
- **LanguageSuggestionBanner:** Solo UI + funciones accept/dismiss (presentación pura)
- **i18n:** Props-based (predictible) en lugar de context-based t() (inconsistente)

**Troubleshooting (console logs):**

Console logs exitosos (banner funcional):
```
[LanguageDetection] 🚀 Starting detection...
[LanguageDetection] 🌍 Current page language: fr
[LanguageDetection] 🌐 Browser languages: ["es-419"]
[LanguageDetection] ✅ Browser language detected: es
[LanguageDetection] ⏱️ Banner will animate in 1.5 seconds...
[LanguageDetection] 🎬 Starting banner animation...
[LanguageDetection] 🎉 Banner animated and now visible!
```

Si el banner NO aparece:
1. ✅ Verificar: `✅ Browser language detected: XX` (detección funcionando)
2. ✅ Verificar: `🎬 Starting banner animation...` aparece después de 1.5s
3. ❌ Si falta `🎬`: Problema con setTimeout o selector querySelector
4. ❌ Si aparece pero banner invisible: Verificar clases CSS (`-translate-y-full` debería ser removida)

Si el banner muestra claves i18n (`language_banner.message`):
- ❌ Problema: Props no están siendo pasados correctamente
- ✅ Verificar: `LanguageDetection` importa JSON (`import en from '@/i18n/en.json'`)
- ✅ Verificar: Render loop pasa `translations={{...t}}` como props
- ✅ Verificar: `LanguageSuggestionBanner` usa `props.translations.message` (not `t('message')`)


#### Archivos Relacionados

- **`src/components/LanguageDetection.astro`** - Lógica principal de detección
- **`src/components/LanguageSuggestionBanner.astro`** - Banner minimalista (redesign v1.3)
- **`src/layouts/BaseLayout.astro`** - Integración del componente
- **`src/utils/languageDetection.ts`** - Utilidades compartidas
- **`src/i18n/{en,es,fr}.json`** - Traducciones `language_banner.*`
- **`arquitecture.md`** - §1, §2, §5, §6, §12, §14 (cumplimiento completo)

---

### 🚀 Scripts de Terceros con Partytown

**Status:** ✅ **Implementado** (cumple §3 de arquitecture.md)

**Propósito:**  
Partytown mueve scripts pesados de terceros (Google Tag Manager, Google Analytics 4, chatbots, etc.) al **Web Worker**, evitando que bloqueen el main thread del navegador.

**Beneficios de Performance:**
- 🚀 **LCP < 2.5s**: Scripts no impactan Largest Contentful Paint
- ⚡ **TBT -40%**: Total Blocking Time reducido significativamente
- 🎯 **INP mejorado**: Interactividad más rápida (< 200ms)
- ✅ **Core Web Vitals**: Mantiene scores óptimos incluso con múltiples scripts

**Arquitectura:**

```
Usuario solicita página
        ↓
Astro SSR/SSG genera HTML
        ↓
Browser descarga página (rápido, sin scripts pesados)
        ↓
Partytown Worker inicia en background
        ↓
Scripts de terceros (GTM, GA4) se ejecutan en Worker
        ↓
Main thread permanece libre para interacción usuario
```

**Configuración Actual:**

```javascript
// astro.config.mjs
partytown({
  config: {
    forward: ['dataLayer.push', 'gtag'], // GTM + GA4 support
    debug: import.meta.env.DEV,          // Debugging en desarrollo
  },
})
```

**Uso: Google Tag Manager (GTM)**

1. **Obtener GTM ID:**
   - Crear cuenta en [https://tagmanager.google.com/](https://tagmanager.google.com/)
   - Obtener ID: `GTM-XXXXXXX`

2. **Configurar en Cloudflare Pages:**
   ```
   Dashboard → Settings → Environment Variables
   
   Production:
   PUBLIC_GTM_ID = GTM-XXXXXXX
   
   Preview/Staging:
   PUBLIC_GTM_ID = GTM-YYYYYYY (opcional: ID separado para testing)
   ```

3. **Scripts automáticamente cargados:**
   - `src/components/Analytics.astro` detecta `PUBLIC_GTM_ID`
   - Solo se carga en producción (`import.meta.env.PROD`)
   - Ejecuta en Web Worker (no bloquea main thread)

**Uso: Google Analytics 4 (GA4)**

1. **Obtener GA4 ID:**
   - Crear propiedad en [https://analytics.google.com/](https://analytics.google.com/)
   - Obtener ID: `G-XXXXXXXXXX`

2. **Configurar en Cloudflare Pages:**
   ```
   PUBLIC_GA4_ID = G-XXXXXXXXXX
   ```

3. **Configuración Privacy-First:**
   - ✅ `anonymize_ip: true` (GDPR compliance)
   - ✅ `SameSite=None;Secure` (cookies seguras)
   - ✅ Solo producción (no tracking en dev)

**Uso: Zift Solutions Analytics**

1. **Obtener configuración de Zift:**
   - El script de Zift Solutions ya está integrado con el ID único
   - URL: `https://static.ziftsolutions.com/analytics/8a998a38993855680199393c736b2daf.js`

2. **Activar en Cloudflare Pages:**
   ```
   Dashboard → Settings → Environment Variables
   
   Production:
   PUBLIC_ZIFT_ENABLED = true
   
   Para desactivar (útil en testing):
   PUBLIC_ZIFT_ENABLED = false
   ```

3. **Características:**
   - ✅ Se ejecuta en Web Worker vía Partytown (sin impacto en performance)
   - ✅ `async = true` optimizado para Worker
   - ✅ Solo se carga si `PUBLIC_ZIFT_ENABLED=true`
   - ✅ Solo en producción (`import.meta.env.PROD`)
   - ✅ CSP configurada automáticamente (`public/_headers`)

---

## 🗓️ Sistema de Booking (Agendamiento de Reuniones)

**ESTADO ACTUAL: Phase 1 - EXTRAER (Read Slots) - EN PROGRESO**

El sistema de booking permite agendar reuniones con Ignia directamente desde el sitio web, integrándose con Odoo SaaS 18 (`calendar.event` model).

### Arquitectura

**Two-Phase Approach:**
1. **Phase 1: EXTRAER** (lectura) - Obtener slots disponibles de Odoo
2. **Phase 2: ENVIAR** (escritura) - Crear bookings en Odoo

**Stack Técnico:**
- **Backend:** Odoo SaaS 18 - `calendar.event` model
- **Communication:** XML-RPC (via `OdooClient.ts`)
- **Service Layer:** `OdooBookingService.ts` (business logic)
- **API Routes:** Astro API endpoints (`/api/booking/*`)
- **Frontend:** React Islands (próximamente)
- **Types:** TypeScript strict mode

### Configuración

**1. Variables de Entorno (.env.local):**

```bash
# Credenciales Odoo (REQUERIDAS)
ODOO_URL=https://ignia-cloud.odoo.com
ODOO_DB=ignia-cloud
ODOO_API_USER=api@ignia.cloud
ODOO_API_PASSWORD=your_password_here

# Configuración Booking (OPCIONAL - usa defaults si no se define)
BOOKING_DURATION=30                    # minutos por reunión
BOOKING_BUFFER=15                      # buffer entre reuniones
BOOKING_DAYS_ADVANCE=60                # días en futuro para agendar
BOOKING_MIN_NOTICE_HOURS=4             # horas mínimas de anticipación
BOOKING_TIMEZONE=America/Mexico_City   # zona horaria

# Horarios laborales (OPCIONAL - default: Lun-Vie 09:00-18:00)
BOOKING_HOURS_MONDAY=09:00-18:00
BOOKING_HOURS_TUESDAY=09:00-18:00
BOOKING_HOURS_WEDNESDAY=09:00-18:00
BOOKING_HOURS_THURSDAY=09:00-18:00
BOOKING_HOURS_FRIDAY=09:00-18:00
BOOKING_HOURS_SATURDAY=closed
BOOKING_HOURS_SUNDAY=closed
```

**2. Permisos Odoo:**

El usuario API necesita permisos para:
- `calendar.event` - read, create (Phase 2: write, unlink)
- `res.partner` - read, create (para asociar contactos)

### Archivos del Sistema

```
src/lib/odoo/
├── types.ts                      # Tipos TypeScript (extended con booking)
├── booking-config.ts             # Configuración: horarios, reglas negocio
├── OdooClient.ts                 # Cliente XML-RPC (existente)
├── OdooBookingService.ts         # Lógica de booking (NEW)
└── OdooService.ts                # Servicios contacto (existente)

src/pages/api/booking/
├── slots.ts                      # GET /api/booking/slots (Phase 1) ✅
└── create.ts                     # POST /api/booking/create (Phase 2) ⏳

src/components/
└── BookingCalendar.tsx           # React Island UI (Phase 1.3) ⏳
```

### API Endpoints

#### `GET /api/booking/slots` (✅ Implementado)

Obtener slots disponibles para una fecha.

**Request:**
```http
GET /api/booking/slots?date=2025-10-15&duration=30
```

**Query Parameters:**
- `date` (requerido): Fecha en formato `YYYY-MM-DD`
- `duration` (opcional): Duración en minutos (default: 30, min: 15, max: 120)
- `locale` (opcional): Idioma para mensajes (`en`/`es`/`fr`, default: `en`)

**Response 200 OK:**
```json
{
  "success": true,
  "date": "2025-10-15",
  "slots": [
    {
      "start": "09:00",
      "end": "09:30",
      "available": true,
      "date": "2025-10-15"
    },
    {
      "start": "09:30",
      "end": "10:00",
      "available": false,
      "date": "2025-10-15",
      "reason": "occupied"
    }
  ],
  "metadata": {
    "timezone": "America/Mexico_City",
    "businessHours": { "start": "09:00", "end": "18:00" },
    "totalSlots": 16,
    "availableSlots": 12,
    "occupiedSlots": 4,
    "duration": 30,
    "date": "2025-10-15"
  },
  "responseTime": "245ms"
}
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "error": "INVALID_DATE",
  "message": "Date must be in format YYYY-MM-DD",
  "responseTime": "12ms"
}
```

**Error Codes:**
- `MISSING_PARAMETER` - Falta parámetro `date`
- `INVALID_DATE_FORMAT` - Formato de fecha incorrecto
- `INVALID_DURATION` - Duración fuera de rango (15-120 min)
- `INVALID_DATE` - Fecha inválida (ej: 32 de enero)
- `PAST_DATE` - No se puede agendar en el pasado
- `TOO_FAR_ADVANCE` - Fecha muy lejana (>60 días)
- `INSUFFICIENT_NOTICE` - Muy poca anticipación (<4 horas)
- `ODOO_UNAVAILABLE` - Error de conexión con Odoo
- `SERVER_ERROR` - Error interno del servidor

#### `POST /api/booking/create` (⏳ Phase 2)

Crear booking en Odoo (próximamente).

**Request:**
```http
POST /api/booking/create
Content-Type: application/json

{
  "date": "2025-10-15",
  "time": "09:00",
  "duration": 30,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+525512345678",
  "notes": "Interesado en servicios cloud",
  "locale": "es"
}
```

### Logging y Debugging

**Console Logging Extensivo:**

Todas las operaciones tienen logging estructurado en consola:

```
[OdooBooking] [INFO] [GET_SLOTS] Fetching available slots for date: 2025-10-15
[OdooBooking] [DEBUG] [VALIDATE_DATE] Validating date: 2025-10-15
[OdooBooking] [DEBUG] [GENERATE_SLOTS] Generating theoretical slots
[OdooBooking] [INFO] [GET_OCCUPIED] Found 3 occupied events in Odoo
[OdooBooking] [INFO] [FILTER_SLOTS] Filtering complete { available: 12, unavailable: 4 }
```

**Formato del Log:**
```typescript
[OdooBooking] [NIVEL] [OPERACIÓN] Mensaje { datos JSON }
```

**Niveles:**
- `DEBUG` - Información detallada (Cyan)
- `INFO` - Eventos importantes (Green)
- `WARN` - Situaciones anómalas (Yellow)
- `ERROR` - Errores críticos (Red)

**Ver Logs:**
```bash
# Development
pnpm run dev
# Los logs aparecen en consola del servidor

# Production (Cloudflare Pages)
# Ver en Dashboard → Functions → Logs
```

### Testing

**Testing Local (API):**

```bash
# 1. Iniciar servidor dev
pnpm run dev

# 2. Test GET slots (curl)
curl "http://localhost:4321/api/booking/slots?date=2025-10-15"

# 3. Test con duración custom
curl "http://localhost:4321/api/booking/slots?date=2025-10-15&duration=60"

# 4. Test fecha inválida (debe retornar 400)
curl "http://localhost:4321/api/booking/slots?date=2025-13-40"

# 5. Test fecha pasada (debe retornar 400)
curl "http://localhost:4321/api/booking/slots?date=2020-01-01"

# 6. Verificar logs en consola del servidor
# Debe mostrar todos los pasos del proceso
```

**Testing con Browser:**

```
http://localhost:4321/api/booking/slots?date=2025-10-15
```

**Validar Respuestas:**
- ✅ JSON válido
- ✅ `success: true` para fechas válidas
- ✅ `slots` array con TimeSlots
- ✅ `metadata` con información del sistema
- ✅ `responseTime` presente
- ✅ Error codes apropiados para fallos

### Roadmap

**Phase 1: EXTRAER (Read-only) - EN PROGRESO**
- ✅ 1.1: Setup - Tipos, configuración, servicio (completado)
- ✅ 1.2: API endpoint GET /api/booking/slots (completado)
- ⏳ 1.3: React Island - BookingCalendar.tsx UI
- ⏳ 1.4: Testing completo de lectura

**Phase 2: ENVIAR (Write operations) - PRÓXIMAMENTE**
- ⏳ 2.1: API endpoint POST /api/booking/create
- ⏳ 2.2: Formulario de booking (nombre, email, phone, notas)
- ⏳ 2.3: Confirmaciones + Email

**Phase 3: Integration - PRÓXIMAMENTE**
- ⏳ 3.1: Integrar en ContactPage.astro (modal o sección)
- ⏳ 3.2: i18n completo (EN/ES/FR)
- ⏳ 3.3: Testing end-to-end
- ⏳ 3.4: Deploy staging para UAT

### Referencias

- **Odoo Docs:** https://www.odoo.com/documentation/18.0/developer/reference/external_api.html
- **calendar.event Model:** https://www.odoo.com/documentation/18.0/developer/reference/backend/orm.html#calendar-event
- **Arquitectura:** `arquitecture.md` §3 (Odoo Integration)
- **Código Fuente:** `src/lib/odoo/OdooBookingService.ts`

---

## 🏛️ Arquitectura de Contenido - Segundo Nivel

Para mejorar la mantenibilidad y escalar el contenido del sitio, se introduce una arquitectura de segundo nivel para las secciones principales: **Soluciones, Producto, AI y Servicios**.

Esta arquitectura resuelve el problema de los archivos de traducción monolíticos (`en.json`, `es.json`) que se han vuelto demasiado grandes y difíciles de gestionar, a la vez que asegura una presentación consistente.

### Principios Clave

1.  **Plantilla Única:** Se utiliza una única plantilla de Astro para renderizar las 4 páginas de segundo nivel, asegurando consistencia visual y estructural mediante una ruta dinámica.
2.  **Traducciones Modulares:** Cada sección tiene su propio archivo de traducción, facilitando la edición y gestión del contenido específico de esa sección.
3.  **Contenido Desacoplado:** El contenido de estas páginas se gestiona a través de los nuevos archivos JSON de traducción, separando el contenido de la presentación.

### Nueva Estructura de Archivos Propuesta

#### 1. Plantilla de Página Dinámica

Se creará una ruta dinámica en Astro que servirá como plantilla para todas las páginas de sección.

```
src/
└── pages/
    └── [lang]/
        └── [section].astro   # PLANTILLA DINÁMICA para /solutions, /product, /ai, /services
```

-   **`[lang]`**: `en`, `es`, `fr` (gestionado por Astro i18n).
-   **`[section]`**: El slug de la sección (`solutions`, `product`, `ai`, `services`).

El archivo `[section].astro` será responsable de:
-   Validar que el `section` slug sea uno de los permitidos.
-   Cargar dinámicamente el archivo de traducción correspondiente.
-   Renderizar el contenido usando un layout común, `SectionLayout.astro`.

#### 2. Layout para Páginas de Sección

Un nuevo layout para mantener la consistencia de estas páginas.

```
src/
└── layouts/
    ├── BaseLayout.astro
    └── SectionLayout.astro      # NUEVO: Layout para páginas de segundo nivel
```

#### 3. Estructura de Traducciones Modulares

Las traducciones se moverán a un nuevo subdirectorio, organizado por sección.

```
src/
└── i18n/
    ├── en.json                     # Traducciones globales/comunes (header, footer, etc.)
    ├── es.json
    ├── fr.json
    └── sections/                   # NUEVO: Directorio para traducciones de sección
        ├── solutions.json
        ├── product.json
        ├── ai.json
        └── services.json
```

Cada archivo JSON de sección contendrá las traducciones para todos los idiomas soportados, estructurando el contenido de la página.

**Ejemplo: `src/i18n/sections/solutions.json`**
```json
{
  "en": {
    "title": "Our Cloud Solutions",
    "subtitle": "Scalable, secure, and efficient.",
    "hero_image": "/images/sections/solutions_hero.webp",
    "features": [
      { "title": "Feature 1", "description": "Description for feature 1." },
      { "title": "Feature 2", "description": "Description for feature 2." }
    ]
  },
  "es": {
    "title": "Nuestras Soluciones Cloud",
    "subtitle": "Escalables, seguras y eficientes.",
    "hero_image": "/images/sections/solutions_hero.webp",
    "features": [
      { "title": "Característica 1", "description": "Descripción para característica 1." },
      { "title": "Característica 2", "description": "Descripción para característica 2." }
    ]
  }
}
```

### Flujo de Implementación Sugerido

1.  **Crear nuevos archivos de traducción** en `src/i18n/sections/` para `solutions`, `product`, `ai`, y `services`.
2.  **Mover el contenido relevante** de los archivos `en.json`, `es.json`, `fr.json` a los nuevos archivos modulares, dejando solo las traducciones globales en los archivos raíz.
3.  **Crear el nuevo layout** `src/layouts/SectionLayout.astro`.
4.  **Crear la plantilla de página dinámica** `src/pages/[lang]/[section].astro`.
5.  **Implementar la lógica** en `[section].astro` para:
    a. Definir las secciones permitidas (`const allowedSections = ['solutions', 'product', 'ai', 'services']`).
    b. Usar `getStaticPaths` para generar las páginas en tiempo de build.
    c. En el render, importar el JSON correcto (`await import(../../i18n/sections/${section}.json)`) y pasar los datos al layout.
6.  **Actualizar la navegación** en `src/components/Header.astro` para apuntar a las nuevas rutas (ej. `/es/solutions`).
7.  **Verificar Sitemaps**: Asegurarse de que las nuevas páginas (`/es/solutions`, `/en/product`, etc.) se incluyan automáticamente en los sitemaps generados por `sitemap-[lang].xml.ts`. La integración `@astrojs/sitemap` debería detectar las rutas de `getStaticPaths` sin configuración adicional.

---

## 📁 Estructura de Directorios

```
/
├── src/
│   ├── pages/                      # Páginas del sitio
│   │   ├── index.astro             # Home (EN)
│   │   ├── search.astro            # Búsqueda (EN)
│   │   ├── 404.astro               # Página de error personalizada (multi-idioma)
│   │   ├── robots.txt.ts           # Robots.txt dinámico
│   │   ├── sitemap-index.xml.ts    # Sitemap index
│   │   ├── sitemap-[lang].xml.ts   # Sitemaps por idioma
│   │   ├── es/                     # Páginas en Español
│   │   │   ├── index.astro
│   │   │   └── search.astro
│   │   └── fr/                     # Páginas en Francés
│   │       ├── index.astro
│   │       └── search.astro
│   │
│   ├── layouts/                    # Layouts base
│   │   └── BaseLayout.astro        # Layout único (evita encadenamiento)
│   │
│   ├── components/                 # Componentes Astro
│   │   ├── Header.astro            # Navegación principal
│   │   ├── Footer.astro            # Pie de página
│   │   ├── SitemapFooter.astro     # Mini-sitemap dinámico (SEO boost)
│   │   ├── SearchBox.astro         # Trigger modal búsqueda
│   │   ├── SearchModal.astro       # Modal de búsqueda
│   │   ├── SearchPage.astro        # Página búsqueda reutilizable
│   │   ├── langSelect.astro        # Selector de idioma
│   │   └── LanguageSuggestionBanner.astro
│   │
│   ├── data/                       # Datos estructurados
│   │   └── searchData.ts           # Índice para minisearch
│   │
│   ├── i18n/                       # Traducciones
│   │   ├── en.json                 # Inglés (default)
│   │   ├── es.json                 # Español
│   │   └── fr.json                 # Francés
│   │
│   ├── integrations/               # Integraciones personalizadas
│   │   └── astroI18n.mjs           # Plugin astro-i18n
│   │
│   ├── styles/                     # Estilos globales
│   │   └── global.css              # Tailwind + Header + componentes (CSS-only)
│   │
│   ├── scripts/                    # Scripts TypeScript
│   │   └── header-progressive.ts   # Progressive enhancement (defer)
│   │
│   ├── utils/                      # Utilidades
│   │   ├── languageDetection.ts    # Detección de idioma
│   │   └── searchConfig.ts         # Config búsqueda
│   │
│   ├── types/                      # Tipos TypeScript
│   │
│   └── middleware/                 # Middleware Astro
│       └── index.ts                # Redirects e i18n
│
├── public/                         # Assets estáticos
│   ├── favicon.svg
│   ├── logo.svg
│   ├── Ignia-blanco.png
│   ├── icons/                      # Favicons multi-resolución
│   └── scripts/                    # Scripts compilados
│       └── header-progressive.js   # Output TypeScript (defer)
│
├── astro.config.mjs                # Configuración Astro
├── astro-i18n.config.mjs           # Configuración astro-i18n
├── tailwind.config.mjs             # Configuración Tailwind
├── tsconfig.json                   # Configuración TypeScript
├── package.json                    # Dependencias y scripts
└── arquitecture.md                 # Documentación arquitectónica completa
```

---

## 🚀 Instalación y Desarrollo

### Prerequisitos

- **Node.js** 18+ o 20+
- **pnpm** 8+ (gestor de paquetes recomendado)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/kilowatto/2025-ignia-website.git
cd 2025-ignia-website

# Instalar dependencias con pnpm
pnpm install
```

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
pnpm run dev

# El sitio estará disponible en:
# http://localhost:4321       (Inglés)
# http://localhost:4321/es    (Español)
# http://localhost:4321/fr    (Francés)
```

---

## 🧞 Comandos Disponibles

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando              | Acción                                              |
| :------------------- | :-------------------------------------------------- |
| `pnpm install`       | Instala dependencias                                |
| `pnpm run dev`       | Inicia servidor de desarrollo en `localhost:4321`   |
| `pnpm run build`     | Construye el sitio para producción en `./dist/`     |
| `pnpm run preview`   | Previsualiza el build de producción localmente      |
| `pnpm run astro ...` | Ejecuta comandos CLI de Astro                       |

### Ejemplos de Comandos Útiles

```bash
# Verificar TypeScript
pnpm run astro check

# Ver ayuda de Astro CLI
pnpm run astro -- --help

# Agregar una integración
pnpm run astro add <integration>
```

---

## 📦 Dependencias

### Dependencias de Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `astro` | ^5.13.10 | Framework principal SSG/SSR |
| `@astrojs/cloudflare` | ^12.6.9 | Adapter Cloudflare Pages/Workers para SSR |
| `@astrojs/tailwind` | ^5.1.0 | Integración oficial Tailwind |
| `@astrojs/sitemap` | ^3.6.0 | Generación automática de sitemaps |
| `astro-i18n` | ^2.2.4 | Gestión de traducciones multi-idioma |
| `astro-compress` | ^2.3.6 | Compresión de HTML/CSS/JS |
| `astro-og-canvas` | ^0.7.0 | Generación de Open Graph images |
| `astro-seo` | ^0.8.4 | Meta tags y datos estructurados |
| `minisearch` | ^7.2.0 | Motor de búsqueda client-side |
| `postcss` | ^8.5.6 | Procesamiento de CSS |
| `autoprefixer` | ^10.4.21 | Prefijos CSS automáticos |

### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `tailwindcss` | ^3.4.13 | Framework CSS utility-first |

---

## 🔧 Control de Versiones con Git/GitHub

Esta sección te guiará por todos los comandos esenciales y avanzados de Git para trabajar en este proyecto.

### 📚 Conceptos Fundamentales

| Concepto | Descripción |
|----------|-------------|
| **Repository (Repo)** | Contenedor del proyecto con todo su historial de cambios |
| **Commit** | Snapshot de los cambios guardados en el historial |
| **Branch (Rama)** | Línea independiente de desarrollo |
| **Remote** | Versión del repositorio alojada en servidor (GitHub) |
| **Origin** | Nombre por defecto del remote principal |
| **Upstream** | Remote del repositorio original (si es un fork) |
| **HEAD** | Puntero al commit actual en el que estás trabajando |
| **Stage (Index)** | Área temporal donde preparas cambios antes de commit |
| **Working Directory** | Archivos actuales en tu disco (no comiteados) |

---

### 🚀 Comandos Básicos Esenciales

#### Configuración Inicial

```bash
# Configurar tu identidad (OBLIGATORIO antes del primer commit)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# Ver configuración actual
git config --list

# Configurar editor por defecto (opcional)
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "vim"          # Vim
```

#### Clonar y Estado

```bash
# Clonar este repositorio
git clone https://github.com/kilowatto/2025-ignia-website.git
cd 2025-ignia-website

# Ver estado actual (archivos modificados, staged, untracked)
git status

# Ver estado de forma compacta
git status -s

# Ver qué archivos están siendo trackeados
git ls-files
```

#### Añadir y Commitear Cambios

```bash
# Añadir archivo específico al stage
git add archivo.txt

# Añadir múltiples archivos
git add archivo1.txt archivo2.txt

# Añadir todos los archivos modificados
git add .

# Añadir solo archivos de cierta extensión
git add *.astro

# Añadir interactivamente (te pregunta por cada cambio)
git add -i

# Ver qué cambios están staged
git diff --staged

# Commit con mensaje
git commit -m "feat: agregar nueva funcionalidad de búsqueda"

# Commit con mensaje detallado (abre editor)
git commit

# Commit añadiendo automáticamente archivos modificados
git commit -am "fix: corregir bug en navegación"

# Modificar el último commit (agregar archivos olvidados)
git commit --amend

# Modificar mensaje del último commit
git commit --amend -m "Nuevo mensaje mejorado"
```

---

### 🔄 Push y Pull: Sincronización con GitHub

#### Tabla Comparativa: Push vs Pull

| Comando | Dirección | Propósito | Cuándo Usarlo |
|---------|-----------|-----------|---------------|
| **`git push`** | Local → Remote | Enviar tus commits al servidor | Después de hacer commits locales |
| **`git pull`** | Remote → Local | Traer cambios del servidor y fusionarlos | Antes de empezar a trabajar |
| **`git fetch`** | Remote → Local | Traer cambios sin fusionar | Para revisar cambios antes de integrar |

#### Push (Enviar Cambios)

```bash
# Push básico (primera vez en nueva rama)
git push -u origin nombre-rama

# Push después de configurar upstream
git push

# Push forzado (⚠️ PELIGROSO - solo en ramas propias)
git push --force

# Push forzado seguro (no sobrescribe si alguien más hizo push)
git push --force-with-lease

# Push de una rama específica
git push origin main

# Push de todas las ramas
git push --all

# Push de tags
git push --tags

# Ver qué se enviará sin hacer push real
git push --dry-run
```

#### Pull (Traer Cambios)

```bash
# Pull básico (fetch + merge)
git pull

# Pull de una rama específica
git pull origin main

# Pull con rebase en lugar de merge
git pull --rebase

# Pull y crear merge commit siempre
git pull --no-rebase

# Pull descartando cambios locales no comiteados (⚠️ PELIGROSO)
git pull --force
```

#### Fetch (Descargar sin Fusionar)

```bash
# Fetch de todos los remotes
git fetch

# Fetch de remote específico
git fetch origin

# Fetch de rama específica
git fetch origin main

# Fetch y eliminar referencias a ramas remotas borradas
git fetch --prune

# Ver qué se descargará sin hacer fetch real
git fetch --dry-run
```

---

### 🌿 Trabajo con Ramas (Branching)

#### Tabla Comparativa: Comandos de Ramas

| Comando | Acción | Ejemplo |
|---------|--------|---------|
| `git branch` | Listar ramas locales | `git branch` |
| `git branch -a` | Listar todas las ramas (locales + remotas) | `git branch -a` |
| `git branch nombre` | Crear rama nueva | `git branch feature/nueva-seccion` |
| `git checkout nombre` | Cambiar a rama | `git checkout main` |
| `git checkout -b nombre` | Crear y cambiar a rama | `git checkout -b feature/header` |
| `git switch nombre` | Cambiar a rama (nuevo) | `git switch main` |
| `git switch -c nombre` | Crear y cambiar a rama (nuevo) | `git switch -c fix/bug-123` |
| `git branch -d nombre` | Borrar rama (solo si está mergeada) | `git branch -d feature/vieja` |
| `git branch -D nombre` | Borrar rama forzadamente | `git branch -D feature/experimental` |

#### Comandos de Ramas

```bash
# Ver todas las ramas (locales y remotas)
git branch -a

# Ver ramas con último commit
git branch -v

# Ver ramas ya mergeadas a la actual
git branch --merged

# Ver ramas NO mergeadas a la actual
git branch --no-merged

# Crear rama desde commit específico
git branch nueva-rama abc123

# Renombrar rama actual
git branch -m nuevo-nombre

# Renombrar rama específica
git branch -m nombre-viejo nombre-nuevo

# Ver rama actual
git branch --show-current

# Cambiar a la rama anterior
git checkout -

# Crear rama desde remoto
git checkout -b local-branch origin/remote-branch
```

---

### 🔀 Merge: Fusionar Ramas

#### Tabla Comparativa: Merge vs Rebase

| Característica | `git merge` | `git rebase` |
|----------------|-------------|--------------|
| **Historial** | Crea commit de merge (no lineal) | Historial lineal y limpio |
| **Conflictos** | Resuelves una vez | Puedes resolver múltiples veces |
| **Seguridad** | ✅ Más seguro (no reescribe historia) | ⚠️ No usar en ramas públicas |
| **Legibilidad** | ❌ Historial más complejo | ✅ Historial más claro |
| **Cuándo Usar** | Ramas públicas, preservar historia | Limpiar antes de PR, ramas locales |
| **Reversión** | ✅ Fácil de revertir | ❌ Más difícil de revertir |

#### Merge (Fusionar)

```bash
# Merge básico (fusionar otra rama a la actual)
git merge feature/nueva-funcionalidad

# Merge sin fast-forward (crea commit de merge siempre)
git merge --no-ff feature/footer

# Merge con estrategia específica
git merge -X theirs feature/conflictiva  # En conflictos, preferir "theirs"
git merge -X ours feature/conflictiva    # En conflictos, preferir "ours"

# Ver qué se mergeará sin hacer merge real
git merge --no-commit --no-ff feature/test

# Abortar merge en progreso
git merge --abort

# Continuar merge después de resolver conflictos
git merge --continue
```

#### Rebase (Reorganizar Historia)

```bash
# Rebase básico (mover tus commits sobre otra rama)
git rebase main

# Rebase interactivo (editar/reordenar/squash commits)
git rebase -i HEAD~3  # últimos 3 commits
git rebase -i main    # todos los commits desde main

# Rebase continuando después de conflictos
git rebase --continue

# Saltar commit actual en rebase
git rebase --skip

# Abortar rebase
git rebase --abort

# Rebase preservando merges
git rebase --preserve-merges main
```

---

### 🔍 Inspección e Historial

#### Ver Historial

```bash
# Log completo
git log

# Log compacto (una línea por commit)
git log --oneline

# Log con gráfico de ramas
git log --oneline --graph --all

# Log de los últimos N commits
git log -n 5

# Log con diferencias
git log -p

# Log de un archivo específico
git log -- archivo.astro

# Log con estadísticas
git log --stat

# Log con búsqueda de autor
git log --author="Esteban"

# Log por rango de fechas
git log --since="2025-01-01" --until="2025-12-31"

# Log de commits que tocan cierto string
git log -S "fetchpriority"

# Ver quién modificó cada línea de un archivo
git blame archivo.astro

# Ver quién modificó líneas específicas
git blame -L 10,20 archivo.astro
```

#### Ver Diferencias

```bash
# Diferencias en working directory (no staged)
git diff

# Diferencias staged (preparadas para commit)
git diff --staged

# Diferencias entre ramas
git diff main feature/nueva

# Diferencias entre commits
git diff abc123 def456

# Diferencias de un archivo específico
git diff archivo.astro

# Ver solo nombres de archivos cambiados
git diff --name-only

# Ver estadísticas de cambios
git diff --stat

# Diferencias palabra por palabra (no línea por línea)
git diff --word-diff
```

---

### 🗑️ Deshacer Cambios

#### Tabla Comparativa: Reset vs Revert vs Checkout

| Comando | Acción | Reescribe Historia | Cuándo Usar |
|---------|--------|-------------------|-------------|
| `git reset --soft` | Mueve HEAD, mantiene cambios staged | ❌ | Rehacer commit manteniendo cambios |
| `git reset --mixed` | Mueve HEAD, unstage cambios | ❌ | Deshacer commit y staging |
| `git reset --hard` | Mueve HEAD, BORRA cambios | ⚠️ Sí | Descartar todo (PELIGROSO) |
| `git revert` | Crea commit que revierte otro | ✅ No | Deshacer commit en rama pública |
| `git checkout` | Restaura archivos | ❌ | Descartar cambios de archivos |
| `git restore` | Restaura archivos (nuevo) | ❌ | Descartar cambios de archivos |

#### Reset (Mover HEAD)

```bash
# Deshacer último commit, mantener cambios staged
git reset --soft HEAD~1

# Deshacer último commit, unstage cambios
git reset HEAD~1
# o equivalente:
git reset --mixed HEAD~1

# ⚠️ PELIGROSO: Deshacer commit y BORRAR cambios
git reset --hard HEAD~1

# Reset a commit específico
git reset abc123

# Unstage archivo (sacarlo del stage)
git reset HEAD archivo.astro

# Reset a estado del remote
git reset --hard origin/main
```

#### Revert (Crear Commit Inverso)

```bash
# Revertir último commit (crea nuevo commit)
git revert HEAD

# Revertir commit específico
git revert abc123

# Revertir múltiples commits
git revert HEAD~3..HEAD

# Revertir sin crear commit automático
git revert --no-commit HEAD~3..HEAD
```

#### Restore (Restaurar Archivos)

```bash
# Descartar cambios en archivo
git restore archivo.astro

# Descartar cambios en todos los archivos
git restore .

# Unstage archivo
git restore --staged archivo.astro

# Restaurar archivo desde commit específico
git restore --source=abc123 archivo.astro

# Restaurar archivo desde otra rama
git restore --source=main archivo.astro
```

#### Checkout (Versión Antigua)

```bash
# Descartar cambios en archivo (old syntax)
git checkout -- archivo.astro

# Descartar todos los cambios (old syntax)
git checkout -- .

# Obtener archivo de otra rama
git checkout main -- archivo.astro
```

---

### 💾 Stash: Guardar Trabajo Temporal

```bash
# Guardar cambios actuales temporalmente
git stash

# Guardar con mensaje descriptivo
git stash save "WIP: trabajando en header"

# Guardar incluyendo archivos untracked
git stash -u

# Guardar incluyendo archivos untracked e ignored
git stash -a

# Listar todos los stashes
git stash list

# Ver contenido de un stash
git stash show stash@{0}
git stash show -p stash@{0}  # con diferencias

# Aplicar último stash (mantiene stash)
git stash apply

# Aplicar stash específico
git stash apply stash@{2}

# Aplicar y eliminar último stash
git stash pop

# Eliminar último stash
git stash drop

# Eliminar stash específico
git stash drop stash@{1}

# Eliminar todos los stashes
git stash clear

# Crear rama desde stash
git stash branch nueva-rama stash@{0}
```

---

### 🏷️ Tags: Versiones y Releases

```bash
# Listar todos los tags
git tag

# Crear tag ligero
git tag v1.0.0

# Crear tag anotado (recomendado)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Crear tag en commit específico
git tag -a v0.9.0 abc123 -m "Beta release"

# Ver información de tag
git show v1.0.0

# Push de tag específico
git push origin v1.0.0

# Push de todos los tags
git push --tags

# Eliminar tag local
git tag -d v1.0.0

# Eliminar tag remoto
git push origin --delete v1.0.0

# Checkout a tag específico
git checkout v1.0.0
```

---

### 🔧 Comandos Avanzados

#### Cherry-Pick (Aplicar Commits Específicos)

```bash
# Aplicar commit de otra rama
git cherry-pick abc123

# Aplicar múltiples commits
git cherry-pick abc123 def456

# Cherry-pick sin crear commit automático
git cherry-pick --no-commit abc123

# Continuar después de resolver conflictos
git cherry-pick --continue

# Abortar cherry-pick
git cherry-pick --abort
```

#### Reflog (Historial de Referencias)

```bash
# Ver todos los movimientos de HEAD
git reflog

# Ver reflog de rama específica
git reflog show main

# Recuperar commit "perdido"
git reflog
git checkout abc123  # del reflog

# Recuperar rama eliminada
git reflog
git checkout -b rama-recuperada abc123
```

#### Clean (Limpiar Archivos Untracked)

```bash
# Ver qué se eliminará (dry-run)
git clean -n

# Eliminar archivos untracked
git clean -f

# Eliminar archivos y directorios untracked
git clean -fd

# Eliminar incluyendo archivos ignored
git clean -fdx

# Limpiar interactivamente
git clean -i
```

#### Bisect (Búsqueda Binaria de Bugs)

```bash
# Iniciar bisect
git bisect start

# Marcar commit actual como malo
git bisect bad

# Marcar último commit bueno conocido
git bisect good abc123

# Git checkoutea commit medio, tú pruebas y marcas:
git bisect good  # si funciona
git bisect bad   # si falla

# Git continúa buscando hasta encontrar el commit culpable

# Finalizar bisect
git bisect reset
```

---

### 🌐 Trabajo con Remotes

#### Gestión de Remotes

```bash
# Ver remotes configurados
git remote -v

# Añadir nuevo remote
git remote add upstream https://github.com/original/repo.git

# Cambiar URL de remote
git remote set-url origin https://github.com/nuevo/url.git

# Renombrar remote
git remote rename origin nuevo-nombre

# Eliminar remote
git remote remove upstream

# Ver información detallada de remote
git remote show origin

# Actualizar referencias de remotes
git remote update

# Eliminar ramas remotas que ya no existen
git remote prune origin
```

#### Sincronizar Fork con Upstream

```bash
# 1. Añadir upstream (solo primera vez)
git remote add upstream https://github.com/kilowatto/2025-ignia-website.git

# 2. Fetch de upstream
git fetch upstream

# 3. Cambiar a main
git checkout main

# 4. Merge de upstream/main
git merge upstream/main

# 5. Push a tu fork
git push origin main

# Atajo: Pull de upstream directamente
git pull upstream main
```

---

### 🚦 Flujo de Trabajo Recomendado

#### Workflow GitHub Flow

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Crear rama feature
git checkout -b feature/nueva-seccion

# 3. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva sección"

# 4. Push de rama feature
git push -u origin feature/nueva-seccion

# 5. Crear Pull Request en GitHub (interfaz web)

# 6. Después de merge en GitHub, actualizar local
git checkout main
git pull origin main

# 7. Eliminar rama feature local
git branch -d feature/nueva-seccion

# 8. Eliminar rama remota (si no se hizo en PR)
git push origin --delete feature/nueva-seccion
```

#### Flujo para Resolución de Conflictos

```bash
# 1. Intentar merge/pull
git pull origin main
# Si hay conflictos, Git pausará el proceso

# 2. Ver archivos con conflictos
git status

# 3. Abrir archivos y buscar marcadores de conflicto:
#    <<<<<<< HEAD
#    tu código
#    =======
#    código del remote
#    >>>>>>> origin/main

# 4. Editar manualmente y decidir qué mantener

# 5. Marcar como resuelto
git add archivo-conflictivo.astro

# 6. Completar merge
git commit -m "Merge: resolver conflictos con main"

# Si quieres abortar:
git merge --abort
```

---

### 📊 Comandos de Información

```bash
# Ver tamaño del repositorio
git count-objects -vH

# Ver configuración completa
git config --list --show-origin

# Ver archivos ignorados efectivos
git status --ignored

# Ver ramas remotas disponibles
git ls-remote origin

# Ver cuántos commits por autor
git shortlog -sn

# Ver estadísticas del repositorio
git log --stat --oneline

# Ver último commit de cada rama
git branch -v

# Ver todas las ramas que contienen cierto commit
git branch --contains abc123

# Buscar en contenido de commits
git log -S "search-term" --all
```

---

### 🛡️ Mejores Prácticas

#### Mensajes de Commit (Conventional Commits)

```bash
# Formato recomendado
tipo(scope): descripción corta

# Tipos comunes:
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Formato (sin cambios de código)
refactor: # Refactorización
test:     # Añadir/modificar tests
chore:    # Tareas de mantenimiento

# Ejemplos:
git commit -m "feat(header): agregar menú responsive"
git commit -m "fix(search): corregir búsqueda en francés"
git commit -m "docs(readme): actualizar comandos git"
git commit -m "style(footer): mejorar espaciado"
git commit -m "refactor(i18n): simplificar detección de idioma"
```

#### Estrategia de Branching

| Rama | Propósito | Ejemplo |
|------|-----------|---------|
| `main` | Código de producción | - |
| `develop` | Desarrollo activo | - |
| `feature/*` | Nuevas funcionalidades | `feature/search-modal` |
| `fix/*` | Correcciones de bugs | `fix/navigation-mobile` |
| `hotfix/*` | Fixes urgentes en producción | `hotfix/security-patch` |
| `release/*` | Preparación de releases | `release/v1.3.0` |

#### Comandos Peligrosos (⚠️ Usar con Precaución)

```bash
# ⚠️ PELIGROSO: Borra cambios permanentemente
git reset --hard HEAD~1

# ⚠️ PELIGROSO: Reescribe historia pública
git push --force

# ⚠️ PELIGROSO: Borra archivos untracked
git clean -fd

# ⚠️ PELIGROSO: Reescribe historia
git rebase -i main

# ⚠️ PELIGROSO: Modifica commit público
git commit --amend

# Alternativas más seguras:
git push --force-with-lease  # Más seguro que --force
git stash                    # Más seguro que reset --hard
git revert                   # Más seguro que reset en rama pública
```

---

### 🆘 Solución de Problemas Comunes

#### "Your branch is behind origin/main"

```bash
# Solución: Pull para actualizar
git pull origin main
```

#### "Your branch is ahead of origin/main"

```bash
# Solución: Push para enviar cambios
git push origin main
```

#### "Your branch has diverged"

```bash
# Opción 1: Merge (preserva historia)
git pull origin main

# Opción 2: Rebase (historia lineal)
git pull --rebase origin main
```

#### "fatal: refusing to merge unrelated histories"

```bash
# Solución: Forzar merge de historias no relacionadas
git pull origin main --allow-unrelated-histories
```

#### "Please commit your changes or stash them before you merge"

```bash
# Opción 1: Commit cambios
git add .
git commit -m "WIP: trabajo en progreso"

# Opción 2: Stash cambios
git stash
git pull
git stash pop
```

#### Recuperar Trabajo Perdido

```bash
# Ver historial completo de movimientos
git reflog

# Recuperar commit "perdido"
git checkout abc123  # del reflog
git checkout -b rama-recuperada
```

---

### 📖 Recursos Adicionales

- 📘 [Git Official Documentation](https://git-scm.com/doc)
- 📙 [GitHub Guides](https://guides.github.com/)
- 📕 [Pro Git Book](https://git-scm.com/book/en/v2) (gratuito)
- 🎓 [Learn Git Branching](https://learngitbranching.js.org/) (interactivo)
- 🔧 [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

## ⚡ Performance y Optimización

### Estrategias Implementadas

#### 1. **CSS-Only Navigation** 
- 🚫 **0 líneas de JavaScript bloqueante** en navegación
- ✅ Estilos CSS-only en `global.css` usando `:hover`, `:focus-within`
- ✅ Progressive enhancement con `header-progressive.js` (defer, 1.2KB gzip)
- 📉 Reducción del 88% en JavaScript bloqueante

#### 2. **Lazy Loading Estratégico**
- 🖼️ **Above-the-fold**: `fetchpriority="high"` + `decoding="async"` (logo, hero)
- 🖼️ **Below-the-fold**: `loading="lazy"` (requieren scroll)
- 🎯 Optimiza LCP (Largest Contentful Paint)

#### 3. **Image Optimization**
- 📦 Formatos modernos (WebP, AVIF) con fallbacks
- 🔧 Compresión automática via astro-compress
- 📐 Dimensiones explícitas (width/height) para evitar CLS

#### 4. **Script Management**
- ⏳ **Defer** en todos los scripts no críticos
- 📍 **Aislamiento** por página (minisearch solo en `/search`)
- 🎯 **Progressive enhancement** (funcionalidad básica sin JS)

#### 5. **Build Optimization**
- 🗜️ Compresión automática (HTML/CSS/JS) via astro-compress
- 🌳 Tree-shaking de dependencias no usadas
- 📊 Presupuesto de bundle monitoreado (≤300KB móvil)

#### 6. **Critical Path Optimization**
- 🔗 **Preconnect** al dominio principal (reduce latencia DNS/TLS ~50-100ms)
- 🔗 **DNS-prefetch** como fallback para navegadores antiguos
- 📦 **Resource Hints** minimizan waterfall de CSS
- ⚡ **Resultado**: Critical Path < 350ms (HTML + CSS)

### Métricas Objetivo

| Métrica | Objetivo | Estrategia |
|---------|----------|------------|
| **LCP** | < 2.5s | fetchpriority="high" en logo, CSS-only nav |
| **CLS** | < 0.1 | Dimensiones explícitas, fuentes con font-display |
| **INP** | < 200ms | JS mínimo, event handlers optimizados |
| **Bundle Size** | ≤ 300KB | Compresión, code splitting, defer |

**Más detalles:** Ver §3 y §10 en [`arquitecture.md`](./arquitecture.md)

---

## 🗺️ SitemapFooter: Mini-Sitemap Dinámico para SEO

### 📋 Descripción General

**`SitemapFooter.astro`** es un componente de mini-sitemap visual integrado en el footer que genera automáticamente un mapa navegable de todas las rutas del sitio, organizado por secciones (Solutions, Products, AI & LLMs, Services).

**Ubicación:** `src/components/SitemapFooter.astro`  
**Integración:** Renderizado en `Footer.astro` antes de la sección de newsletter

### ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **🔄 Actualización Automática** | Se alimenta dinámicamente de `routes.*` en i18n JSON. Agregar nueva ruta → aparece automáticamente |
| **🌐 Multi-idioma** | Detecta `Astro.currentLocale` y usa traducciones correspondientes (EN/ES/FR) |
| **📱 Responsive Design** | 1 columna (móvil) → 2 columnas (tablet) → 4 columnas (desktop) |
| **🚀 Zero JavaScript** | Funcionalidad 100% HTML + CSS (cumple arquitecture.md §2) |
| **♿ Accesible** | HTML5 semántico, ARIA labels, navegación por teclado |
| **🎨 CSS-only Interactions** | Hover states, transiciones suaves sin JS |

### 🏗️ Arquitectura

#### Flujo de Obtención de Datos

```
1. getSectionItems(sectionId) obtiene las claves de items
   ↓
2. Para cada item obtiene:
   - Título: translate('header.sections.{section}.items.{key}.title')
   - Ruta:   translate('routes.{section}.{key}')
   ↓
3. Aplica prefijo de idioma: ensureLocalePath(ruta)
   ↓
4. Renderiza enlace con título y href traducidos
```

#### Estructura JSON Requerida

```json
{
  "routes": {
    "solutions": {
      "base": "/solutions/",
      "nocaas": "/solutions/nocaas/",
      ...
    },
    "products": { ... },
    "ai": { ... },
    "services": { ... }
  },
  "header": {
    "sections": {
      "solutions": {
        "label": "Solutions",
        "items": {
          "nocaas": {
            "title": "NOCaaS",
            "description": "24/7 monitoring..."
          },
          ...
        }
      }
    }
  },
  "footer": {
    "sitemap": {
      "title": "Site Map",
      "aria_label": "Site navigation map"
    }
  }
}
```

### 📐 Responsive Breakpoints

| Breakpoint | Columnas | Gap | Uso |
|------------|----------|-----|-----|
| **< 640px** (móvil) | 1 | 1.5rem | Stack vertical |
| **≥ 640px** (tablet) | 2 | 2rem | Grid equilibrado |
| **≥ 1024px** (desktop) | 4 | 2rem | Una columna por sección |

### 🎯 Beneficios SEO

1. **✅ Enlaces internos estructurados** → Facilita crawling de Google
2. **✅ Keywords repetidas en contexto** → Refuerza relevancia temática
3. **✅ Jerarquía visual clara** → Mejora comprensión de estructura del sitio
4. **✅ User signals mejorados** → Reduce bounce rate (navegación fácil)
5. **✅ Mobile-friendly** → Google prioriza sitios responsive
6. **✅ HTML5 semántico** → `<nav>`, `<section>`, ARIA labels para accesibilidad

### 🔧 Mantenimiento

#### ✅ Zero Mantenimiento

El componente se actualiza automáticamente:

```bash
# 1. Agregar nueva ruta en i18n JSON
# src/i18n/en.json
"routes": {
  "products": {
    "newProduct": "/products/new-product/"  # ← Nueva ruta
  }
}

# 2. Agregar traducción del título
"header": {
  "sections": {
    "products": {
      "items": {
        "newProduct": {
          "title": "New Product",
          "description": "..."
        }
      }
    }
  }
}

# 3. Agregar key en getSectionItems() (SitemapFooter.astro línea ~95)
products: [
  'virtualMachines',
  'kubernetesService',
  'newProduct',  # ← Agregar aquí
  ...
]

# ✅ El sitemap se actualiza automáticamente en build
```

### 📊 Cumplimiento Arquitectónico

| Requisito (arquitecture.md) | Estado | Implementación |
|------------------------------|--------|----------------|
| **§2: JS mínimo o nulo** | ✅ | 0 líneas de JS, solo HTML + Tailwind CSS |
| **§5: i18n centralizado** | ✅ | Todo desde `translate('routes.*')` y `translate('header.*')` |
| **§8: Tailwind utilities** | ✅ | Grid responsive, hover states, spacing |
| **§9: SEO semántico** | ✅ | `<nav>`, `<section>`, `<h2>`, ARIA labels |
| **§14: Performance** | ✅ | Sin overhead de runtime, render estático SSG |

### 🎨 Estilo Visual

- **Fondo:** Gris claro (`bg-gray-50`) para distinguir del contenido principal
- **Iconos:** SVG inline optimizados de Heroicons v2 (MIT License)
- **Colores:**
  - Texto: Gris oscuro (`text-gray-900`) → Naranja (`text-orange-600`) en hover
  - Iconos: Naranja (`text-orange-500`) por defecto
- **Transiciones:** CSS-only, suaves (`transition-colors`)
- **Tipografía:** Raleway (hereda de fuente global)

### 📝 Código Documentado

El componente incluye **documentación inline exhaustiva en español** que explica:

- 🎯 Propósito del componente
- 🏗️ Arquitectura y flujo de datos
- 📊 Beneficios SEO detallados
- 🔧 Cómo agregar nuevas rutas
- 🎨 Decisiones de diseño
- ♿ Consideraciones de accesibilidad
- 📱 Estrategia responsive

**Total de líneas de documentación:** ~250 (60% del archivo)

### 🔗 Archivos Relacionados

- **`src/components/SitemapFooter.astro`** - Componente principal
- **`src/components/Footer.astro`** - Integra el sitemap
- **`src/components/Header.astro`** - Usa misma estructura de rutas
- **`src/i18n/en.json`** - Rutas (routes.*) y traducciones (EN)
- **`src/i18n/es.json`** - Rutas y traducciones (ES)
- **`src/i18n/fr.json`** - Rutas y traducciones (FR)
- **`arquitecture.md`** - §5 (i18n), §9 (SEO), §2 (JS mínimo)

---

## 📧 Formulario de Contacto: Mini-Form Integrado en Footer

### 📋 Descripción General

El **formulario de contacto** es una miniforma discreta integrada directamente en `SitemapFooter.astro` como la **6ª columna del grid**. No existe como componente separado para preservar el contexto de traducción y mantener cohesión visual.

**Ubicación:** `src/components/SitemapFooter.astro` (líneas 434-599)  
**Script:** `src/scripts/contact-form.ts` (557 líneas)  
**Integración:** 6ª columna del grid responsive (después de las 5 secciones del sitemap)

### ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **🎭 Estados Interactivos** | `idle`, `validating`, `success`, `already_submitted` |
| **✅ Validación HTML5 + JS** | Validación nativa del navegador + mensajes personalizados en JavaScript |
| **😄 Mensajes con Humor** | Validaciones cómicas (50% humor) con emojis: "¡Ups! No mordemos 😊" |
| **🛡️ Anti-Bot Completo** | Honeypot + timestamp (min 2s) + Cloudflare Turnstile (opcional) |
| **💾 Persistencia Local** | `localStorage` con duración de 30 días, email hasheado (SHA-256) |
| **🌐 Multi-idioma** | Mensajes de validación traducidos en ES/EN/FR |
| **📱 Responsive** | Se adapta al grid: 1 col (móvil) → 2 cols (tablet) → 6 cols (desktop) |
| **♿ Accesible** | `aria-describedby`, campos semánticos, mensajes de error visibles |

### 🏗️ Arquitectura de Integración

#### ¿Por qué integrado en SitemapFooter?

**Decisión arquitectónica:** El formulario NO es un componente separado (`ContactForm.astro` fue eliminado) porque:

1. **✅ Contexto de traducción:** La función `translate()` de astro-i18n requiere el mismo contexto de ejecución
2. **✅ Cohesión visual:** Al ser la 6ª columna del grid, mantiene consistencia con las otras 5 secciones del sitemap
3. **✅ Zero overhead:** No hay sobrecarga de renderizado por componente adicional (HTML estático integrado)
4. **✅ Mantenibilidad:** Single source of truth (una sola ubicación para editar el formulario)

**Estructura del grid:**

```astro
<!-- SitemapFooter.astro -->
<nav class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8">
  <!-- Columnas 1-5: Secciones del sitemap (Solutions, Products, AI, Services, Company) -->
  <div>...</div>
  <div>...</div>
  <div>...</div>
  <div>...</div>
  <div>...</div>
  
  <!-- COLUMNA 6: FORMULARIO DE CONTACTO -->
  <div class="space-y-3 sm:space-y-4">
    <!-- Título con icono envelope -->
    <div class="flex items-center gap-2">
      <svg class="h-5 w-5">...</svg>
      <h3>{translate('footer.contact_form.title')}</h3>
    </div>
    
    <!-- Texto descriptivo motivacional -->
    <p>{translate('footer.contact_form.description')}</p>
    
    <!-- Formulario completo -->
    <form id="contact-form">...</form>
  </div>
</nav>
```

### 🎯 Estados del Formulario

```typescript
// Máquina de estados: contact-form.ts
type FormState = 'idle' | 'validating' | 'success' | 'already_submitted';

// Flujo de estados
idle → validating → success
  ↓         ↓
  → already_submitted (si email hasheado existe en localStorage)
```

#### Estados Visuales

| Estado | Color Fondo | Icono | Mensaje | Acción Usuario |
|--------|-------------|-------|---------|----------------|
| **idle** | Naranja | ✉️ | "Enviar" | Click → validación |
| **validating** | Naranja (spinner) | ⏳ | "Validando..." | Deshabilitado |
| **success** | Verde | ✅ | "¡Mensaje enviado!" | None (auto-oculta) |
| **already_submitted** | Gris | ℹ️ | "Ya enviaste un mensaje" | None (30 días) |

### 😄 Validación con Humor (50% Cómico)

El formulario incluye **mensajes de error cómicos con emojis** para hacer la experiencia menos frustrante:

#### Mensajes en Español (ES)

```json
{
  "footer": {
    "contact_form": {
      "fields": {
        "name": {
          "error": "¡Ups! Necesitamos saber cómo llamarte (no mordemos 😊)"
        },
        "phone": {
          "error": "Este teléfono parece de otra dimensión 🌌 ¿Tienes uno terrestre?"
        },
        "email": {
          "error": "Mmm... este email se ve sospechoso 🕵️ ¿Seguro tiene @ y .com?"
        }
      }
    }
  }
}
```

#### Mensajes en Inglés (EN)

```json
{
  "footer": {
    "contact_form": {
      "fields": {
        "name": {
          "error": "Oops! We need to know what to call you (we don't bite 😊)"
        },
        "phone": {
          "error": "This phone seems from another dimension 🌌 Got an earthly one?"
        },
        "email": {
          "error": "Hmm... this email looks suspicious 🕵️ Sure it has @ and .com?"
        }
      }
    }
  }
}
```

#### Mensajes en Francés (FR)

```json
{
  "footer": {
    "contact_form": {
      "fields": {
        "name": {
          "error": "Oups! Nous devons savoir comment vous appeler (on ne mord pas 😊)"
        },
        "phone": {
          "error": "Ce téléphone semble d'une autre dimension 🌌 Vous en avez un terrestre?"
        },
        "email": {
          "error": "Hmm... cet email semble suspect 🕵️ Sûr qu'il a @ et .com?"
        }
      }
    }
  }
}
```

### 🛡️ Protección Anti-Bot (3 Capas)

#### 1. Honeypot Field (Invisible)

```html
<!-- Campo oculto que solo los bots llenan -->
<input 
  type="text" 
  name="website" 
  style="position:absolute;left:-9999px" 
  tabindex="-1"
  autocomplete="off"
/>
```

**Lógica:** Si `formData.get('website')` tiene valor → rechazar (bot detectado)

#### 2. Timestamp Validation (Tiempo Mínimo)

```typescript
// contact-form.ts
const minSubmitTime = 2000; // 2 segundos mínimo
const formLoadTime = Date.now();

// En submit:
if (Date.now() - formLoadTime < minSubmitTime) {
  return; // Bot detectado (envío demasiado rápido)
}
```

#### 3. Cloudflare Turnstile (Opcional)

```html
<!-- Turnstile widget carga al final -->
<script 
  src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
  async 
  defer
></script>

<div 
  class="cf-turnstile" 
  data-sitekey="YOUR_SITE_KEY"
></div>
```

**Nota:** Requiere configuración en Cloudflare Dashboard (sitekey y endpoint).

### 💾 Persistencia con localStorage

#### Almacenamiento de Envíos (30 días)

```typescript
// contact-form.ts (líneas ~180-200)
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Guardar después de envío exitoso
const emailHash = await hashEmail(email);
const submissionData = {
  hash: emailHash,
  timestamp: Date.now(),
  expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 días
};
localStorage.setItem('ignia_contact_submitted', JSON.stringify(submissionData));
```

#### Validación en Load

```typescript
// Al cargar la página, verificar si ya envió
const stored = localStorage.getItem('ignia_contact_submitted');
if (stored) {
  const data = JSON.parse(stored);
  if (Date.now() < data.expiresAt) {
    // Mostrar estado "already_submitted"
    showAlreadySubmitted();
  } else {
    // Expiró, limpiar localStorage
    localStorage.removeItem('ignia_contact_submitted');
  }
}
```

**Beneficios:**
- ✅ Privacy-first (email hasheado, no texto plano)
- ✅ Reduce spam (1 envío por email cada 30 días)
- ✅ UX mejorada (no frustrar usuarios que recargan página)

### 🔧 Mantenimiento y Extensión

#### ✅ Cómo Agregar un Nuevo Campo

**Ejemplo:** Agregar campo "Empresa" (Company)

```astro
<!-- 1. Agregar HTML en SitemapFooter.astro (después de línea ~570) -->
<div>
  <label for="company" class="block text-sm font-medium text-white/90 mb-1.5">
    {translate('footer.contact_form.fields.company.label')}
  </label>
  <input
    id="company"
    name="company"
    type="text"
    required
    placeholder={translate('footer.contact_form.fields.company.placeholder')}
    class="w-full px-3 py-2 bg-white/10 border border-white/20..."
    aria-describedby="company-error"
  />
  <p id="company-error" class="hidden text-xs text-red-300 mt-1"></p>
</div>
```

```typescript
// 2. Agregar validación en contact-form.ts (línea ~390)
function getFormData(): FormData | null {
  // ...código existente...
  
  const company = form.elements.namedItem('company') as HTMLInputElement;
  if (!company || !company.value.trim()) {
    showFieldError('company', getErrorMessages().company);
    return null;
  }
  
  // ...continuar con validación...
}
```

```json
// 3. Agregar traducciones en src/i18n/es.json (y en.json, fr.json)
{
  "footer": {
    "contact_form": {
      "fields": {
        "company": {
          "label": "Empresa",
          "placeholder": "Nombre de tu empresa",
          "error": "¿En qué empresa trabajas? ¡Queremos conocerla! 🏢"
        }
      }
    }
  }
}
```

#### ✅ Cómo Cambiar los Mensajes de Error

**Opción 1: Editar i18n JSON (Recomendado)**

```json
// src/i18n/es.json
{
  "footer": {
    "contact_form": {
      "fields": {
        "name": {
          "error": "Tu nuevo mensaje cómico aquí 😄"
        }
      }
    }
  }
}
```

**Opción 2: Editar contact-form.ts (Hardcoded)**

```typescript
// src/scripts/contact-form.ts (línea ~310)
function getErrorMessages() {
  const locale = document.documentElement.lang || 'en';
  const baseLocale = locale.split('-')[0];
  
  const messages = {
    es: {
      name: '¡Tu nuevo mensaje cómico aquí! 😄',
      // ...
    },
    // ...
  };
  
  return messages[baseLocale] || messages.en;
}
```

**Recomendación:** Usar Opción 1 (i18n JSON) para mantener consistencia con el resto del sitio.

#### ✅ Cómo Cambiar el Endpoint de Envío

```typescript
// src/scripts/contact-form.ts (línea ~440)
async function submitForm(data: FormData): Promise<boolean> {
  try {
    const response = await fetch('https://tu-nuevo-endpoint.com/api/contact', {
      method: 'POST',
      body: data
    });
    return response.ok;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
```

### 📊 Cumplimiento Arquitectónico

| Requisito (arquitecture.md) | Estado | Implementación |
|------------------------------|--------|----------------|
| **§2: JS mínimo o nulo** | ⚠️ Excepción | JavaScript necesario para validación + envío (progresive enhancement) |
| **§5: i18n centralizado** | ✅ | Traducciones en `src/i18n/*.json` (footer.contact_form.*) |
| **§8: Tailwind utilities** | ✅ | Estados visuales, hover, focus, invalid states con Tailwind |
| **§9: SEO semántico** | ✅ | `<form>`, `<label>`, `<input>`, `aria-describedby` |
| **§12: Accessibility** | ✅ | ARIA labels, `required`, validación nativa del navegador |
| **§14: Performance** | ✅ | Script con `defer`, sin bloqueo del render inicial |

**Nota sobre §2:** El formulario requiere JavaScript para funcionalidad completa (validación personalizada, anti-bot, localStorage). Sin embargo, usa **progressive enhancement** - el HTML nativo con `required` funciona sin JS, y el JavaScript mejora la experiencia.

### 🎨 Estilo Visual

- **Icono:** Envelope (Heroicons v2) en `text-white/70`, matching otros títulos de columnas
- **Texto descriptivo:** "Únete a la comunidad Ignia y descubre cómo podemos ayudarte"
- **Campos:**
  - Fondo: `bg-white/10` (semi-transparente)
  - Borde: `border-white/20` → `focus:border-orange-400`
  - Invalid: `invalid:border-red-400` (CSS validation state)
- **Botón:**
  - idle: `bg-orange-500 hover:bg-orange-600`
  - validating: `bg-orange-400` con spinner animado
  - success: `bg-green-500` con checkmark
  - already_submitted: `bg-gray-400` deshabilitado
- **Errores:** Texto `text-red-300` (contraste WCAG AA) debajo de cada campo

### 📝 Código Documentado

**`src/scripts/contact-form.ts`** incluye:
- 📖 Header con descripción completa del flujo (líneas 1-31)
- 🔍 JSDoc comments en funciones críticas
- 💡 Inline comments explicando decisiones arquitectónicas
- ⚠️ Warnings sobre edge cases (regional locales, honeypot)

**`src/components/SitemapFooter.astro`** incluye:
- 📦 Comentario de sección: "COLUMNA 6: MINI-FORMULARIO DE CONTACTO"
- 🎯 Explicación del propósito dentro del grid
- 🔗 Referencia a contact-form.ts para lógica completa

### ⚠️ Eliminación de ContactForm.astro (Historial)

**Contexto histórico:** En versiones anteriores existía `src/components/ContactForm.astro` (162 líneas) que duplicaba el formulario. Fue **eliminado** porque:

1. ❌ **No estaba importado en ningún archivo** (componente "huérfano")
2. ❌ **Versión desactualizada** (no incluía elementos `<p id="*-error">` para mostrar validaciones)
3. ❌ **Duplicación de código** (~95% idéntico a la versión en SitemapFooter)
4. ❌ **Confusión de mantenimiento** (dos fuentes de verdad para el mismo formulario)

**Decisión:** Mantener **única versión integrada en SitemapFooter** por las razones arquitectónicas explicadas arriba.

**Commit de eliminación:** `chore: remove duplicate ContactForm component and update docs`

### 🔗 Archivos Relacionados

- **`src/components/SitemapFooter.astro`** - Contiene el formulario (líneas 434-599)
- **`src/scripts/contact-form.ts`** - Lógica completa (557 líneas)
- **`src/components/Footer.astro`** - Renderiza SitemapFooter (que incluye el formulario)
- **`src/i18n/es.json`** - Traducciones ES (footer.contact_form.*)
- **`src/i18n/en.json`** - Traducciones EN (footer.contact_form.*)
- **`src/i18n/fr.json`** - Traducciones FR (footer.contact_form.*)
- **`arquitecture.md`** - §2 (JS mínimo), §5 (i18n), §12 (accesibilidad)

---

## 🎯 Principios Arquitectónicos

Este proyecto sigue principios estrictos definidos en `arquitecture.md` §2:

### Core Principles

1. ✅ **Semántica estricta HTML5** (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
2. ✅ **Tailwind CSS exclusivo** (vía @astrojs/tailwind)
3. ✅ **i18n híbrido** (astro-i18n + Astro nativo)
4. ✅ **TypeScript como base** (todo scripting en TS)
5. ✅ **Mobile-first responsive** (13", 24", 32" + tablet/móvil)
6. ✅ **JS mínimo o nulo** (CSS/HTML first)
7. ✅ **SEO/GEO-first** (datos estructurados, hreflang, canónicos)
8. ✅ **WCAG 2.2 AA** (contraste, foco visible, navegación por teclado)
9. ✅ **Performance targets** (LCP < 2.5s, CLS < 0.1, INP < 200ms)

### Non-Negotiable Rules

- 🚫 **No JavaScript bloqueante** en navegación
- 🚫 **No frameworks CSS adicionales** (solo Tailwind oficial)
- 🚫 **No enlaces sin texto descriptivo**
- 🚫 **No lazy loading en imágenes above-the-fold**
- � **No modificaciones a arquitecture.md** (es la fuente de verdad)

**Documentación completa:** [`arquitecture.md`](./arquitecture.md)

---

## � Deploy en Cloudflare Pages

Este proyecto está configurado para deploy automático en **Cloudflare Pages** con SSR (Server-Side Rendering) en edge computing.

### 📋 Requisitos Previos

- ✅ Cuenta de Cloudflare (gratis)
- ✅ Repositorio GitHub con el proyecto
- ✅ Node.js 20.18.0+ (especificado en `.node-version`)
- ✅ `@astrojs/cloudflare` adapter instalado

### 🔧 Configuración del Proyecto

El proyecto ya incluye todos los archivos necesarios:

| Archivo | Propósito |
|---------|-----------|
| `astro.config.mjs` | Adapter de Cloudflare configurado con `mode: 'directory'` |
| `.node-version` | Especifica Node.js 20.18.0 para Cloudflare Pages |
| `wrangler.toml` | Configuración opcional de Workers (compatibilidad 2024-10-04) |

**IMPORTANTE:** El adapter `@astrojs/cloudflare` es para **Cloudflare Workers runtime**, NO Node.js. No uses APIs de Node.js como `fs`, `path`, `child_process`.

### 🌐 Setup en Cloudflare Dashboard

1. **Conectar Repositorio:**
   ```
   Dashboard → Workers & Pages → Create Application → Pages → Connect to Git
   ```

2. **Configuración de Build:**
   ```
   Framework preset:        Astro
   Build command:           pnpm run build
   Build output directory:  dist
   Root directory:          / (raíz del proyecto)
   ```

3. **Variables de Entorno:**
   
   **IMPORTANTE - Configuración de Dominio Dinámico:**
   
   El sitio detecta automáticamente el dominio según el ambiente. Configura:
   
   ```
   Settings → Environment Variables
   
   # Variables obligatorias:
   - NODE_VERSION = 20.18.0
   - PNPM_VERSION = 10
   
   # Variable de dominio (opcional pero recomendada):
   Production Environment:
     - PUBLIC_SITE_URL = https://ignia.cloud
   
   Preview Environment:
     - PUBLIC_SITE_URL = https://ignia.kilowatto.com
   ```
   
   **¿Por qué PUBLIC_SITE_URL?**
   - ✅ **Sitemaps** usan el dominio correcto en staging/production
   - ✅ **Canonical URLs** apuntan al dominio correcto
   - ✅ **Open Graph URLs** en meta tags son correctas
   - ✅ **Structured Data** (schema.org) tiene URLs válidas
   
   **Si no configuras PUBLIC_SITE_URL:**
   - El sistema detectará automáticamente el dominio del request
   - Funciona en la mayoría de casos, pero sitemaps pueden ser inconsistentes

4. **Deploy:**
   - Cloudflare detectará automáticamente cambios en `main` branch
   - Deploy automático con cada push
   - Preview deployments para cada Pull Request

### 🔍 Verificación Local Antes de Deploy

```bash
# 1. Build local con adapter de Cloudflare
pnpm run build

# 2. Preview local (simula Cloudflare Pages)
pnpm run preview

# 3. Verificar que el build generó dist/ correctamente
ls -la dist/

# Expected output:
# dist/
#   ├── _worker.js/     # Cloudflare Worker
#   ├── client/         # Assets estáticos
#   └── ...
```

### 🎯 Primera Vez: Push a GitHub

```bash
# 1. Verificar cambios
git status

# 2. Agregar archivos al stage
git add .

# 3. Commit con mensaje descriptivo
git commit -m "feat: configurar deploy para Cloudflare Pages con @astrojs/cloudflare adapter"

# 4. Push a GitHub (rama main)
git push origin main
```

### 📊 Después del Push

1. **Cloudflare Dashboard:** Automáticamente detectará el push
2. **Build Log:** Verás el proceso de build en tiempo real
3. **Deploy URL:** Cloudflare asignará una URL tipo `https://your-project.pages.dev`
4. **Custom Domain:** Configura tu dominio en Settings → Custom domains

### 🛠️ Troubleshooting

#### Error: "Node.js vX.X.X is not supported by Astro"
**Causa:** `.node-version` especifica una versión obsoleta de Node.js
**Solución:**
```bash
# Actualizar .node-version a Node.js 20.18.0+
echo "20.18.0" > .node-version
git add .node-version
git commit -m "chore: actualizar Node.js a v20.18.0 para Astro v5+"
git push origin main
```

#### Error: "Could not resolve @astrojs/node"
**Solución:** Este error ocurre si tienes referencias antiguas al adapter Node.js
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Error: "Build command failed"
**Causas comunes:**
- ❌ Node.js version mismatch → Verifica `.node-version`
- ❌ Missing dependencies → Ejecuta `pnpm install` localmente
- ❌ TypeScript errors → Ejecuta `pnpm run astro check`

**Solución:**
```bash
# Build local para detectar errores
pnpm run build

# Si hay errores TypeScript
pnpm run astro check
```

#### Error: "Worker exceeded CPU limit"
**Causa:** El Worker está haciendo demasiadas operaciones síncronas
**Solución:** Revisa que no estés usando APIs bloqueantes de Node.js

#### Páginas se cargan lentas en producción
**Diagnóstico:**
1. Verifica que `astro-compress` esté activo (logs de build)
2. Verifica que el CSS esté minificado (inspecciona `dist/client/_astro/*.css`)
3. Usa Cloudflare Page Speed Insights

**Optimización adicional:**
```javascript
// astro.config.mjs - habilitar Image Resizing de Cloudflare
adapter: cloudflare({ 
  mode: 'directory',
  imageService: 'cloudflare', // ✅ Activa optimización de imágenes
}),
```

#### Sitemaps o canonical URLs usan dominio incorrecto
**Problema:** Sitemap muestra `https://ignia.cloud` pero estás en staging `https://ignia.kilowatto.com`

**Causa:** Variable de entorno `PUBLIC_SITE_URL` no configurada en Cloudflare Pages

**Solución:**
```bash
# En Cloudflare Dashboard → Settings → Environment Variables

# Production Environment:
PUBLIC_SITE_URL = https://ignia.cloud

# Preview Environment:
PUBLIC_SITE_URL = https://ignia.kilowatto.com
```

**Verificación:**
```bash
# Después del deploy, verifica el sitemap:
curl https://tu-dominio.com/sitemap-index.xml

# Debe mostrar URLs con el dominio correcto:
<loc>https://tu-dominio.com/...</loc>
```

**Alternativa sin variable de entorno:**
El sistema detecta automáticamente el dominio del request, pero puede ser inconsistente en sitemaps generados en build-time. La variable de entorno garantiza consistencia.
adapter: cloudflare({ 
  mode: 'directory',
  imageService: 'cloudflare', // ✅ Activa optimización de imágenes
}),
```

### 📚 Recursos Cloudflare

- 📖 [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- 🔧 [Astro Cloudflare Integration](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- ⚡ [Cloudflare Workers Runtime](https://developers.cloudflare.com/workers/runtime-apis/)
- 🌐 [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

---



## 🚦 Página de Status: Monitoreo de Servicios

### 📋 Descripción General

La **página de status** (`/status`) es un dashboard de monitoreo en tiempo real que verifica la salud de los servicios críticos del sitio en cada carga de página (SSR).

**URL:** `/status`  
**Ubicación:** `src/pages/status.astro`  
**Método:** SSR (Server-Side Rendering) - Checks en cada request  
**Idioma:** Inglés (página técnica, no traducida)

### ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **🚦 Sistema de Semáforos** | 🟢 Operational · 🟡 Degraded · 🔴 Down |
| **⏱️ Response Time Tracking** | Mide latencia de cada servicio en milisegundos |
| **🔒 Logs Protegidos** | Diagnóstico completo solo con `?token=SECRET` |
| **📊 Overall Status** | Calcula estado general (todos operativos vs alguno caído) |
| **🔄 Auto-Refresh** | Meta refresh cada 30s (opcional, deshabilitado por defecto) |
| **📋 Export JSON** | Botón para exportar diagnóstico completo |
| **📑 Copy Logs** | Copiar logs al portapapeles con un click |
| **📱 Responsive Design** | Tailwind CSS, mobile-first |

### 🏗️ Arquitectura

#### Servicios Monitoreados

| Servicio | Check | Timeout | Criterio de Éxito |
|----------|-------|---------|-------------------|
| **Website** | Self-check (Astro SSR responde) | N/A | Siempre `operational` (si carga página) |
| **Odoo API** | XML-RPC authentication test | 5000ms | `authenticate()` retorna `uid` válido |

#### Flujo de Verificación

```
Usuario visita /status
    ↓
SSR ejecuta checks (paralelo)
    ├─ Website Check (instant)
    └─ Odoo API Check (5s timeout)
          ├─ validateOdooConfig()
          ├─ getOdooConfig()
          ├─ new OdooClient(5s timeout)
          └─ client.authenticate()
    ↓
Calcula overall status:
    ├─ All operational → 🟢 operational
    ├─ Some down → 🔴 down
    └─ Some degraded → 🟡 degraded
    ↓
Renderiza HTML con resultados
    ↓
Usuario ve status en tiempo real
```

#### Estados de Servicio

```typescript
type ServiceStatus = 'operational' | 'degraded' | 'down';

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseTime: number;        // En milisegundos
  message: string;
  lastChecked: string;         // ISO 8601 timestamp
  icon: '🟢' | '🟡' | '🔴';   // Visual indicator
  error?: {                    // Solo si status = 'down'
    message: string;
    code: string;
    stack?: string;            // Solo con token
  };
  details?: Record<string, any>; // Solo con token
}
```

### 🔒 Sistema de Protección de Logs

La página tiene **dos modos de visualización**:

#### Modo Público (Sin Token)

```
URL: /status
```

**Información visible:**
- ✅ Status de cada servicio (🟢🟡🔴)
- ✅ Response time (milisegundos)
- ✅ Overall status
- ❌ Detalles técnicos ocultos
- ❌ Stack traces no visibles
- ❌ Información de configuración oculta

**Uso:** Monitoreo público para usuarios finales

#### Modo Protegido (Con Token)

```
URL: /status?token=YOUR_SECRET_TOKEN
```

**Información adicional visible:**
- ✅ Logs detallados con timestamps
- ✅ Stack traces completos de errores
- ✅ Configuración de servicios (URLs, database names, etc.)
- ✅ Raw error objects
- ✅ Diagnostic information completa
- ✅ Botones Export JSON y Copy Logs

**Uso:** Debugging por desarrolladores/sysadmins

### 🔧 Configuración

#### Variables de Entorno

```bash
# .env.local (desarrollo)
STATUS_PAGE_TOKEN=secret123

# .env.example (template público)
STATUS_PAGE_TOKEN=generate_random_token_here
```

**Generar token seguro:**

```bash
# Opción 1: Node.js (recomendado)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 32

# Opción 3: PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

#### Cloudflare Pages

```bash
# Dashboard → Settings → Environment Variables

Production:
  STATUS_PAGE_TOKEN = [token generado arriba]
  # Tipo: Secret (text field)
  
Preview/Staging (opcional):
  STATUS_PAGE_TOKEN = [otro token para staging]
```

### 📊 Interpretación de Estados

| Icono | Estado | Condición | Acción Recomendada |
|-------|--------|-----------|-------------------|
| 🟢 | `operational` | Todos los checks pasaron | ✅ Ninguna (todo OK) |
| 🟡 | `degraded` | Algunos warnings, ningún down | ⚠️ Investigar logs |
| 🔴 | `down` | Al menos un servicio caído | 🚨 Investigar urgente |

#### Códigos de Error Comunes (Odoo API)

| Code | Descripción | Causa Común | Solución |
|------|-------------|-------------|----------|
| `CONNECTION_ERROR` | No puede conectar a Odoo | Red, firewall, URL incorrecta | Verificar `ODOO_URL` |
| `TIMEOUT` | Timeout después de 5s | Odoo lento o no responde | Aumentar timeout o revisar Odoo |
| `AUTH_FAILED` | Autenticación rechazada | Credenciales incorrectas | Verificar `ODOO_USERNAME` y `ODOO_PASSWORD` |
| `MISSING_CONFIG` | Env vars no configuradas | Variables de entorno faltantes | Configurar en `.env.local` o Cloudflare |

### 🎨 UI y Diseño

**Paleta de Colores:**

```css
/* Semáforos */
🟢 operational: bg-green-100, text-green-800, border-green-500
🟡 degraded:    bg-yellow-100, text-yellow-800, border-yellow-500
🔴 down:        bg-red-100, text-red-800, border-red-500

/* Cards */
Fondo: bg-white
Borde: border-2 (color según status)
Sombra: shadow-lg
Esquinas: rounded-lg
```

**Layout:**

```
┌─────────────────────────────────────────┐
│ 🔵 System Status                       │ ← Header con overall status
│ Overall: 🟢 All Systems Operational    │
│ Last Check: 2025-10-06 15:30:00 UTC   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🟢 Website                             │ ← Service Card
│ ├─ Status: Operational                 │
│ ├─ Response Time: 5ms                  │
│ └─ Message: Astro SSR responding       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🟢 Odoo API                            │
│ ├─ Status: Operational                 │
│ ├─ Response Time: 847ms                │
│ ├─ UID: 2                              │ ← Solo con token
│ ├─ URL: https://ignia-cloud.odoo.com  │ ← Solo con token
│ └─ Database: ignia-cloud               │ ← Solo con token
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📋 Diagnostic Logs (Protected)         │ ← Solo con token
│ [10:30:01] [info] Website check passed │
│ [10:30:02] [info] Odoo authenticated   │
│                                         │
│ [Export JSON] [Copy Logs] [Refresh]   │ ← Botones de acción
└─────────────────────────────────────────┘
```

### 🧪 Testing

#### Test Manual en Desarrollo

```bash
# 1. Configurar token en .env.local
echo "STATUS_PAGE_TOKEN=test123" >> .env.local

# 2. Iniciar servidor
pnpm run dev

# 3. Test público (sin logs)
open http://localhost:4321/status

# 4. Test protegido (con logs)
open http://localhost:4321/status?token=test123

# 5. Test con token incorrecto (sin logs)
open http://localhost:4321/status?token=wrong
```

#### Test de Errores (Odoo API)

```bash
# Test 1: Sin credenciales (MISSING_CONFIG)
# Comentar variables de Odoo en .env.local
# ODOO_URL=...
# ODOO_DB=...
# ...

# Restart server
pnpm run dev

# Resultado esperado: 🔴 Odoo API - Down
#                     Error: Missing env vars

# Test 2: Credenciales incorrectas (AUTH_FAILED)
# Configurar password incorrecto
ODOO_PASSWORD=wrong_password

# Restart server
# Resultado esperado: 🔴 Odoo API - Down
#                     Error: Authentication failed

# Test 3: Timeout (TIMEOUT)
# Configurar URL inexistente
ODOO_URL=https://nonexistent-odoo-instance.odoo.com

# Restart server
# Resultado esperado: 🔴 Odoo API - Down
#                     Error: Timeout after 5000ms
```

#### Test en Producción

```bash
# Test público
curl https://ignia.cloud/status

# Test protegido (usar token real de Cloudflare)
curl "https://ignia.cloud/status?token=REAL_TOKEN_HERE"

# Verificar JSON export
curl -H "Accept: application/json" "https://ignia.cloud/status?token=REAL_TOKEN_HERE"
```

### 📝 Cumplimiento Arquitectónico

| Requisito (arquitecture.md) | Estado | Implementación |
|------------------------------|--------|----------------|
| **§2: JS mínimo o nulo** | ✅ | SSR, sin JS client-side (solo HTML) |
| **§3: Astro SSR** | ✅ | Página dinámica con checks server-side |
| **§8: Tailwind CSS** | ✅ | 100% utilities, responsive design |
| **§14: Performance** | ✅ | Checks paralelos, timeout 5s, no bloquea |

### 🔗 Archivos Relacionados

- **`src/pages/status.astro`** - Página principal (645 líneas)
- **`src/lib/odoo/config.ts`** - Validación y obtención de config
- **`src/lib/odoo/OdooClient.ts`** - Cliente XML-RPC para testing
- **`.env.local`** - Token local (no commitear)
- **`.env.example`** - Template público con documentación

### 🆘 Troubleshooting

#### Página muestra "403 Forbidden"

**Causa:** Cloudflare bloqueando página por firewall rules.  
**Solución:** Whitelist `/status` en Cloudflare Firewall Rules.

#### Logs no aparecen con token correcto

**Causa 1:** Token no configurado en Cloudflare.  
**Solución:** Verificar env var `STATUS_PAGE_TOKEN` en Cloudflare Dashboard.

**Causa 2:** Token con espacios o caracteres especiales.  
**Solución:** Regenerar token sin caracteres problemáticos.

#### Odoo API siempre muestra "Down"

**Causa 1:** Variables de entorno no configuradas.  
**Solución:** Verificar 4 variables Odoo (URL, DB, USERNAME, PASSWORD).

**Causa 2:** Firewall bloqueando conexión de Cloudflare Workers a Odoo.  
**Solución:** Whitelist IPs de Cloudflare en firewall de Odoo.

**Causa 3:** Timeout muy corto (5s insuficiente).  
**Solución:** Aumentar timeout en `OdooClient` constructor (línea 148 de status.astro):

```typescript
const client = new OdooClient(config, 10000); // 10 segundos
```

#### "Request timeout" en Odoo check

**Causa:** Odoo tarda más de 5s en responder.  
**Solución:** Revisar performance de instancia Odoo o aumentar timeout.

### 📚 Recursos

- 🔧 [Cloudflare Workers KV](https://developers.cloudflare.com/kv/) - Para rate limiting futuro
- 📊 [Uptime Monitoring Best Practices](https://www.datadoghq.com/knowledge-center/uptime-monitoring/)
- 🚦 [Status Page Examples](https://www.atlassian.com/software/statuspage/examples)

---
## �📚 Documentación Adicional

### Archivos Clave

- **[`arquitecture.md`](./arquitecture.md)** - Arquitectura completa del proyecto (principios, stack, estructura, guías)
- **[`PIPELINE_NEW_PAGE.md`](./PIPELINE_NEW_PAGE.md)** - ⚠️ Checklist obligatorio al crear nuevas páginas (SEO, i18n, sitemap)
- **[`astro.config.mjs`](./astro.config.mjs)** - Configuración Astro (i18n nativo, integraciones, adapter)
- **[`astro-i18n.config.mjs`](./astro-i18n.config.mjs)** - Configuración astro-i18n (traducciones)
- **[`tailwind.config.mjs`](./tailwind.config.mjs)** - Configuración Tailwind (colores, breakpoints)
- **[`tsconfig.json`](./tsconfig.json)** - Configuración TypeScript

### Recursos Externos

- 📖 [Astro Documentation](https://docs.astro.build)
- 🎨 [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- 🌐 [astro-i18n Documentation](https://github.com/alexanderniebuhr/astro-i18n)
- 🔍 [MiniSearch Documentation](https://lucaong.github.io/minisearch/)

---

## 🤝 Contribución

Este proyecto sigue lineamientos arquitectónicos estrictos definidos en `arquitecture.md`. Antes de contribuir:

1. 📖 Lee `arquitecture.md` completamente
2. ✅ Verifica que tus cambios cumplan los principios §2
3. 🧪 Ejecuta `pnpm run build` para validar
4. 📝 Documenta inline en español con detalle

---

## 📊 Analytics Setup (GA4)

El sitio utiliza Google Analytics 4 vía Partytown para no impactar el rendimiento.

**Configuración en Cloudflare Pages:**
1.  Ir a **Settings** > **Environment Variables**.
2.  Añadir `PUBLIC_GA4_ID` con el ID de medición (ej: `G-XXXXXXXXXX`).
3.  Redeployar.

**Verificación:**
- Verificar que `gtag/js` carga desde `~partytown` en la pestaña Network.
- Verificar eventos en Real-Time de GA4.

## 🤝 Content Management

### **TrustBar Client Logos**
Los logos de clientes se encuentran en `public/images/trust/clients/`.

**Especificaciones:**
- **Formato**: WebP (.webp)
- **Dimensiones**: 200x80px
- **Peso**: <15KB
- **Estilo**: Preferiblemente versión monocromática/negra para el estado inactivo (el CSS aplica opacidad).

**Para añadir un logo:**
1.  Procesar la imagen: `cwebp -q 85 input.png -o client-name.webp`
2.  Subir a `public/images/trust/clients/`.
3.  Actualizar el array `clientLogos` en `src/components/home/TrustBar.astro`.

---

## 📄 Licencia

Propiedad de **Ignia Cloud**. Todos los derechos reservados.

---

## 📞 Contacto

**Ignia Cloud**  
🌐 Website: [https://ignia.cloud](https://ignia.cloud)  
📧 Email: hi@ignia.cloud

---

**Built with ❤️ using Astro + Tailwind CSS + TypeScript**

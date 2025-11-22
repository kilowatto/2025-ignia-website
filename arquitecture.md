# **Arquitectura del Sitio Web de Ignia Cloud (Astro)**

**Versión:** v1.3 · **Enfoque:** Utility-first, semántico, mobile‑first, fondo blanco, SEO/GEO-first, JS mínimo o nulo. **Stack:** Astro \+ Tailwind CSS \+ astro-i18n.

---
**[Actualización 2025-10-21]**
Se actualizó este documento para detallar y reforzar los temas relacionados con el layout:
- Se enfatizó el uso obligatorio de `src/layouts/BaseLayout.astro` en todas las páginas internas, eliminando layouts redundantes y asegurando coherencia visual y funcional.
- Se documentó la política de evitar encadenamiento de layouts y la importancia de la estructura única para el layout base.
- Se añadió referencia explícita a la sección de layouts en la estructura de directorios y en los principios arquitectónicos.
- Se reforzó la relación entre layout, accesibilidad y consistencia cross-idioma.

Esta actualización cumple con la política de documentación en línea y mantiene la trazabilidad de cambios arquitectónicos.
---

## **1\) Visión General**

Ignia Cloud tendrá un sitio estático/SSR con **Astro** que prioriza performance, accesibilidad y SEO. La arquitectura favorece **HTML5 \+ Tailwind CSS** y reduce al mínimo el uso de JavaScript; cuando sea indispensable, se carga de forma **aislada, diferida y sólo en la página que lo requiera** (p. ej., /search).

Audiencias primarias: CTOs y emprendedores.  
Objetivos por página: Home (leads y credibilidad), Solutions/Products (agenda y respuestas a objeciones), AI & Larry (contacto técnico y demos de agente).  
Idiomas: EN (default), ES, FR.

## **2\) Principios Arquitectónicos (No Negociables)**

* **Semántica estricta** (HTML5: header, nav, main, section, article, aside, footer).  
* **Estilos con Tailwind CSS**: Se utilizará **exclusivamente la integración oficial @astrojs/tailwind** como único framework de estilos. Otras implementaciones no son aceptables. Esto garantiza consistencia, mantenibilidad y un enfoque *utility-first*.  
* **Internacionalización Híbrida (astro-i18n + i18n nativo)**: Toda la gestión de contenido multi-idioma se centralizará a través de la librería **astro-i18n** (traducciones) y el **i18n nativo de Astro** (routing). Esta arquitectura híbrida separa responsabilidades: astro-i18n gestiona las cadenas de texto vía t() y archivos JSON en src/i18n/, mientras que el i18n nativo de Astro maneja el ruteo automático (/en, /es, /fr). Este enfoque nos dio los mejores resultados en términos de mantenibilidad, performance y experiencia de desarrollo.  
* **TypeScript como base**: Todo el scripting se escribirá en TypeScript, excepto donde una dependencia externa indispensable lo impida.  
* **Mobile‑first** y responsive (13", 24", 32" \+ tablet/móvil).  
* **JS mínimo o nulo**; si algo se puede con CSS/HTML, se implementa así.  
* **SEO/GEO-first** con datos estructurados, hreflang y canónicos.  
* **Accesibilidad WCAG 2.2 AA**: contraste, foco visible, teclado, lang por página, alt significativo.  
* **Performance**: LCP \< 2.5s (4G), CLS \< 0.1, INP \< 200ms; presupuesto inicial móvil ≤ **300KB**.
* **Localizacion** Todo documento siempre debe estar en Ingles, Español y Francés. Siguiendo las directrices del punto 5\) Gestión de Contenido e Internacionalización (i18n).
* **Confirmacion Obligatoria** Todas las Inteligencias artifical antes de hacer cualquier camnbio deberan confirmar los cambios con el usuario.
* **Ligas** <a> u otro tipo deben tener siempre text descriptivo
* **robot.txt** sede existir y actualiado para que siempre sea legible por los principales motores de busqueda usando las mejores tecnicas. 
* **Evitar Encadenamiento** de archvivos que detienen o perjudican el rendimiento o perfomance del sitio, siempre pensando tener un LCP pequeño o rapido.
* **404**.html debe existir siempre usando una version light o ligeras del template diciendo que la pagina no exista usando mucho humor, debe cumplir el idioma y debe tener una liga a la pagina principal segun el idioma y accesos al buscado de minisearch.
* **MiniSearch Actualizado** cada vez que se cree una pagina, contenido o similar se debera actualizar la "base de datos" o archivo de datos de minisearch para que tenga la informacion actualizada sin olvidar usar correctamente los idiomas.
*  **Documentacio en linea** debe estar en linea en los archivos co mucho detalle en Español de que hace y porque lo hace asi.
*  **Documentacion en readme.md** se debe documentar todo el sitie en README.md con detalle de las referencias, librerias usadas, como pueden copiar el sitio, etc.
* **Actualizacion de Sitemap** Cada vez que agregues una nueva página, debes actualizar el array pages en sitemap-[lang].xml.ts con la nueva ruta, changefreq y priority.
* **Checkliast** se revisa el documento Pipeline_new_page cada vez que se genera una nueva pagina y se debe cumplir con todo lo que ahi se dice.
* **Layout**: Todas las páginas internas deben incorporar o importar el layout único `src/layouts/BaseLayout.astro`. Esto elimina layouts redundantes, evita encadenamiento y asegura coherencia visual, accesibilidad y consistencia cross-idioma. Cualquier excepción debe ser documentada y validada por el equipo de arquitectura.




## **3\) Stack Técnico**

* **Astro**: SSG \+ SSR selectivo. Island architecture sólo si es imprescindible.  
* **Framework CSS**: **Tailwind CSS** (vía @astrojs/tailwind).  
* **Internacionalización**: **Astro Content Collections** (Nativo). Eliminamos dependencias externas (`astro-i18n`). Las traducciones viven en `src/content/i18n/{lang}.json` y se consumen con seguridad de tipos.
* **Lenguajes base**: HTML5, **TypeScript**.  
* **Fuentes**: Raleway (Light/Medium/Regular) en WOFF2 con subset Latin; font-display: swap.  
* **Búsqueda**: /search server‑side; **minisearch** con índice generado automáticamente en build-time (defer, ≤100KB índice gz).  
* **Analítica**: server‑side (rutas de salida /out/\*), opcional beacon propio (≤2KB) defer.  
* **Integración Email**: API **Odoo SaaS** para newsletter/CRM (alta/baja, doble opt‑in, confirmaciones).
* **Partytown** ✅ **IMPLEMENTADO** - Scripts de terceros en Web Worker (Google Tag Manager, Google Analytics 4, chatbots, etc.). Mueve ejecución de scripts pesados fuera del main thread, mejorando LCP y TBT. Configuración: `forward: ['dataLayer.push', 'gtag']` para soporte GTM/GA4. Ver `src/components/Analytics.astro` para implementación y `README.md` para guía de uso completa.
* **Lazy Loading Estratégico**: `loading="lazy"` SOLO en imágenes below-the-fold (requieren scroll). Imágenes above-the-fold (logo, hero) usan `fetchpriority="high"` sin lazy loading para optimizar LCP. Ver §10 para detalles completos.

## **4\) Estructura de Directorios (Astro)**

```
/  
├─ src/  
│  ├─ content/             # [NUEVO] Content Collections
│  │  └─ i18n/             # Colección de traducciones (Type-safe)
│  │     ├─ en.json        # Source of truth
│  │     ├─ es.json
│  │     └─ fr.json
│  ├─ pages/  
│  │  ├─ index.astro           # Página principal (EN)
│  │  ├─ search.astro          # Búsqueda (EN)
│  │  ├─ robots.txt.ts         # Robots.txt generado dinámicamente
│  │  ├─ sitemap-index.xml.ts  # Sitemap index
│  │  ├─ sitemap-[lang].xml.ts # Sitemap por idioma
│  │  ├─ es/ ...               # Estructura espejo (Español)
│  │  │  ├─ index.astro
│  │  │  └─ search.astro
│  │  └─ fr/ ...               # Estructura espejo (Francés)
│  │     ├─ index.astro
│  │     └─ search.astro
│  ├─ layouts/  
│  │  └─ BaseLayout.astro      # Layout base único (elimina encadenamiento)
│  ├─ components/  
│  │  ├─ Header.astro          # Navegación principal
│  │  ├─ Footer.astro          # Pie de página
│  │  ├─ SearchBox.astro       # Botón búsqueda (trigger modal)
│  │  ├─ SearchModal.astro     # Modal búsqueda
│  │  ├─ SearchPage.astro      # Componente búsqueda reutilizable
│  │  ├─ SmartImage.astro      # [NUEVO] Wrapper de imagen con performance automática
│  │  ├─ langSelect.astro      # Selector de idioma
│  │  └─ LanguageSuggestionBanner.astro  # Banner sugerencia idioma
│  ├─ styles/  
│  │  ├─ global.css            # Estilos base de Tailwind (@tailwind)
│  │  └─ header.css            # Estilos CSS-only para Header (sin JS bloqueante)
│  ├─ scripts/  
│  │  ├─ header-progressive.ts # Progressive enhancement mínimo (defer)
│  │  └─ ...                   # Scripts diferidos por página (si requeridos)
│  ├─ utils/  
│  │  ├─ i18n.ts               # [NUEVO] Helper useTranslations (reemplaza t())
│  │  ├─ routes.ts             # [NUEVO] Definición de rutas tipadas
│  │  ├─ languageDetection.ts  # Utilidades detección de idioma
│  │  └─ searchConfig.ts       # Configuración de búsqueda
│  ├─ types/  
│  │  └─ ...                   # Tipos TypeScript compartidos
│  └─ middleware/  
│     └─ index.ts              # Middleware de Astro (redirects, i18n)
├─ public/  
│  ├─ favicon.svg  
│  ├─ logo.svg  
│  ├─ Ignia-blanco.png  
│  ├─ site.webmanifest  
│  ├─ icons/  
│  │  └─ ... 
│  └─ scripts/  
│     └─ header-progressive.js # Script compilado
├─ astro.config.mjs            # Configuración principal de Astro
├─ tailwind.config.mjs         # Configuración Tailwind CSS
├─ tsconfig.json               # Configuración TypeScript
└─ package.json                # Dependencias y scripts
```

**Notas sobre la Estructura (v2.0):**

1. **src/content/i18n/**: Reemplaza a `src/i18n/`. Usamos Content Collections de tipo `data` para validar el esquema de traducción y generar tipos automáticamente.

2. **src/utils/routes.ts**: Centraliza todas las rutas del sitio en un objeto tipado para evitar "magic strings" en los hrefs.

3. **Eliminado**: `astro-i18n.config.mjs` y la carpeta `src/integrations/` (ya no son necesarios).

4. **src/components/SmartImage.astro**: Nuevo componente estándar para imágenes.

## **5\) Gestión de Contenido e Internacionalización (i18n)**

Esta sección define las reglas no negociables para manejar el contenido multi-idioma en la arquitectura v2.0.

### **Astro Content Collections (Nativo)**

Abandonamos las librerías externas para usar la potencia nativa de Astro:

1.  **Content Collections (`src/content/i18n/`)**:
    *   Usamos colecciones de tipo `data` para almacenar los JSONs de traducción.
    *   Astro valida el esquema automáticamente (Zod).
    *   Genera tipos de TypeScript para todas las claves.

2.  **Helper `useTranslations`**:
    *   Una función utilitaria simple en `src/utils/i18n.ts` carga la colección correcta según el idioma actual.

**Patrón de Uso:**

```astro
---
// En cualquier componente .astro
import { useTranslations } from '@/utils/i18n';

const t = await useTranslations(Astro.currentLocale);
---

<h1>{t('home.hero.title')}</h1>
```

**Integridad Arquitectónica:**

1.  **Type-Safety**: Si intentas usar una clave que no existe (`t('home.wrong')`), el editor mostrará un error y el build fallará.
2.  **Source of Truth**: `src/content/i18n/en.json` define el esquema.
3.  **Sincronización**: Los archivos `es.json` y `fr.json` deben cumplir con el mismo esquema que `en.json`.

### **Reglas de Implementación**

*   **Centralización Obligatoria**: Todo texto visible vive en `src/content/i18n/`. Prohibido hardcodear.
*   **Estructura de Claves**: `seccion.componente.campo` (ej: `header.nav.solutions`).
*   **Flujo de Trabajo**:
    1.  Agregar clave en `en.json`.
    2.  Agregar clave en `es.json` y `fr.json` (aunque sea con placeholder).
    3.  Usar `t('clave')` en el componente.


## **6\) Ruteo y SEO Técnico (i18n)**

## **6\) Ruteo y SEO Técnico (i18n)**

* **Idiomas**: /en (default), /es, /fr. x-default apuntará a /en.  
* **Rutas Seguras (Type-Safe Routing)**:
  * Prohibido usar strings manuales (`href="/solutions/..."`).
  * Usar objeto `ROUTES` centralizado en `src/utils/routes.ts`.
  * Ejemplo: `<a href={ROUTES.solutions.detail(slug, lang)}>`
* **hreflang**: Generado automáticamente por Astro.  
* **Detección de Idioma**: Middleware ligero basado en Accept-Language y Cookie.
* **Internal Linking**: Todas las páginas interiores deben implementar referencias cruzadas (ver §17). Objetivo: mejorar SEO interno y user journey.

## **7\) Layouts y Componentes (sin JS)**

* **Header**: logo, nav principal, buscador, selector de idioma, iconos, botón Login.  
* **Menú**: listas anidadas y submenús con \<details\>/\<summary\> para accesibilidad.  
  
* **Footer (sticky)**: menú, newsletter (doble opt‑in), teléfonos, direcciones y enlaces legales.

## **8\) Sistema de Diseño (Tailwind CSS)**

Los tokens de diseño (colores, tipografía, espaciado) se centralizan en tailwind.config.mjs.

**Configuración (tailwind.config.mjs)**

import type { Config } from 'tailwindcss';  
import defaultTheme from 'tailwindcss/defaultTheme';

export default {  
  content: \['./src/\*\*/\*.{astro,html,ts,tsx}'\],  
  theme: {  
    extend: {  
      colors: { /\* ... \*/ },  
      fontFamily: {  
        sans: \['Raleway', ...defaultTheme.fontFamily.sans\],  
      },  
      /\* ... \*/  
    },  
  },  
  plugins: \[\],  
} satisfies Config;

## **9\) SEO/GEO & Datos Estructurados**

* **Headings**: 1×H1 por página; H2/H3 en orden lógico.  
* **Metadatos**: \<title\> y description se gestionarán vía astro-i18n.  
* **JSON‑LD**: Organization, Service, Product, FAQPage, BreadcrumbList.

## **10\) Imágenes y Medios**

* **Formatos**: **AVIF/WebP** (con fallback a PNG/JPG para compatibilidad).  
* **Pesos**: Hero ≤ **90KB**; tarjetas ≤ **40KB**; iconos/logos ≤ **10KB**.  
* **Atributos obligatorios**:
  * `width` y `height`: Prevenir CLS (Cumulative Layout Shift)
  * `alt` descriptivo: Gestionado con astro-i18n (multi-idioma)
  * `decoding="async"`: No bloquear rendering durante decode
  
* **Loading strategy (por ubicación)**:
  * **Above-the-fold (visible sin scroll)**:
    * Logo, hero image, contenido principal inmediato
    * **NO usar** `loading="lazy"`
    * **SÍ usar** `fetchpriority="high"` en LCP candidates (logo, hero)
    * Ejemplo: `<img src="/logo.svg" fetchpriority="high" decoding="async" alt="...">`
  
  * **Below-the-fold (requiere scroll)**:
    * Imágenes de contenido secundario, tarjetas, galería
    * **SÍ usar** `loading="lazy"`
    * **NO usar** `fetchpriority="high"`
    * Ejemplo: `<img src="/image.webp" loading="lazy" decoding="async" alt="...">`

* **Optimización**:
  * Comprimir con `astro-compress` (automático en build)
  * Usar `<picture>` para responsive images cuando sea necesario
  * SVG optimizados con SVGO (eliminar metadata innecesaria)

* **Componente `<SmartImage />`**:
  * Se introduce `src/components/SmartImage.astro` para estandarizar la carga.
  * Prop `priority={true}`: Aplica `fetchpriority="high"`, `loading="eager"`, `decoding="async"` (Para Hero/Logo).
  * Prop `priority={false}` (default): Aplica `loading="lazy"`, `decoding="async"` (Para el resto).
  * **Regla**: Usar este componente en lugar de `<img>` o `<Image />` directo para garantizar cumplimiento de métricas.

* **Optimización**:
  * Comprimir con `astro-compress` (automático en build)
  * Formatos AVIF/WebP automáticos.
  * Objetivo: LCP < 2.5s (arquitecture.md §14)

## **11\) Formularios & Flujos (Server‑Side)**

*   **Validación** en servidor; devolver estados accesibles.  
*   **Anti‑spam**: honeypot \+ tiempo mínimo.  
*   **Integración Odoo SaaS**.

## **12\) Búsqueda (/search) con Minisearch**

*   **Generación Automática**: El índice de búsqueda se genera **automáticamente en build-time**.
*   **Script**: Un script de integración lee las Content Collections y genera el JSON de MiniSearch.
*   **Beneficio**: Garantiza que no existan enlaces rotos en los resultados de búsqueda y que el índice siempre esté sincronizado con el contenido real.
*   **Cliente**: Carga diferida del script de búsqueda (JS) solo cuando el usuario interactúa con el buscador.

## **13\) Analítica & Consentimiento (Ligero)**

*   **Tracking server‑side** mediante rutas de salida.  
*   **Consentimiento**: banner sin JS.

## **14\) Performance (Presupuesto y Métricas)**

* **Presupuesto inicial móvil ≤ 300KB**.  
* **Métricas**: LCP \< 2.5s; CLS \< 0.1; INP \< 200ms.

## **15\) Seguridad y Cumplimiento**

* **Headers**: CSP estricta, HSTS, etc.  
* **Formularios**: CSRF token.

## **16\) Build & Deploy (Astro)**

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

export default defineConfig({
  site: 'https://ignia.cloud',
  output: 'server', // Modo servidor para SSR selectivo
  adapter: cloudflare({
    mode: 'directory'
  }),
  
  // Configuración i18n nativa de Astro (routing)
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
    routing: {
      prefixDefaultLocale: false, // / sin prefijo, /es/ y /fr/ con prefijo
    }
  },

  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
          fr: 'fr',
        },
      },
    }),
    compress(),
  ],
});
```

**Configuración astro-i18n (astro-i18n.config.mjs)**

```javascript
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
```

## **17) Nomenclatura y Branding**

Esta sección define la terminología oficial y reglas de nomenclatura para productos y servicios de Ignia Cloud.

### **Productos Renombrados**

#### **SecureOps 365 (Formerly NOCaaS)**

El servicio anteriormente conocido como "NOCaaS" ha sido renombrado oficialmente a **SecureOps 365**.

**Reglas de Uso:**

* **En Títulos y Menús**: Usar **exclusivamente** "SecureOps 365"
  * Ejemplos: Menú de navegación, encabezados H1/H2, meta titles, breadcrumbs
  * ❌ Incorrecto: "NOCaaS"
  * ✅ Correcto: "SecureOps 365"

* **En Contenido del Cuerpo**: Primera mención debe incluir referencia al nombre anterior
  * ✅ Primera mención: "SecureOps 365 (Formerly NOCaaS)"
  * ✅ Menciones subsecuentes: "SecureOps 365"
  * Esto aplica a: Descripciones de productos, casos de uso, documentación técnica

* **Archivos i18n**: Esta regla aplica en **todos los idiomas** (EN, ES, FR)
  * EN: "SecureOps 365 (Formerly NOCaaS)"
  * ES: "SecureOps 365 (Anteriormente NOCaaS)"
  * FR: "SecureOps 365 (Anciennement NOCaaS)"

#### **AI & Larry (Formerly AI & LLM)**

La sección de inteligenciaartificial ha sido renombrada a **AI & Larry**.

**Contexto:** Larry es el agente de IA de Ignia Cloud. Esta sección ahora abarca nuestra oferta completa de Inteligencia Artificial y Agentes de AI.

**Reglas de Uso:**

* **En Menús de Navegación**: Usar "AI & Larry"
  * ❌ Incorrecto: "AI & LLM", "AI/LLM", "Artificial Intelligence"
  * ✅ Correcto: "AI & Larry"

* **En Títulos de Página**: "AI & Larry"
  * Ejemplo H1: "AI & Larry Solutions"

* **En URLs y Rutas**: Mantener `/ai` para SEO continuity
  * La ruta sigue siendo `/ai/`, `/es/ai/`, `/fr/ai/`
  * El contenido visible usa "AI & Larry"

* **Archivos i18n**: Esta regla aplica en **todos los idiomas**
  * EN: "AI & Larry"
  * ES: "AI & Larry" (el nombre del agente no se traduce)
  * FR: "AI & Larry" (el nombre del agente no se traduce)

### **Referencias Cruzadas entre Páginas**

Todas las páginas interiores (productos, soluciones, servicios, AI) **deben** incluir referencias cruzadas a contenido relacionado.

**Implementación Obligatoria:**

* **Sección "Related Solutions"**: En páginas de productos, enlazar a soluciones relevantes
* **Sección "Related Products"**: En páginas de soluciones, enlazar a productos relacionados  
* **Sección "See Also"**: Enlaces contextuales a servicios, casos de uso, o contenido de AI

**Estructura**:
```astro
<!-- Ejemplo: En página de Virtual Machines (producto) -->
<section class="related-solutions">
  <h2>{t('products.related_solutions')}</h2>
  <ul>
    <li><a href="/solutions/private-cloud-service/">{t('solutions.privateCloudService.title')}</a></li>
    <li><a href="/solutions/kubernetes-devops/">{t('solutions.kubernetesDevops.title')}</a></li>
  </ul>
</section>
```

**Objetivos:**
- Mejorar SEO interno (internal linking)
- Aumentar tiempo en sitio y páginas por sesión
- Guiar al usuario a través del journey de descubrimiento
- Reducir bounce rate

**Gestión de Contenido:**
- Las referencias cruzadas se gestionan vía archivos i18n (`en.json`, `es.json`, `fr.json`)
- Cada producto/solución define su array de `related_items` en JSON
- Los componentes de página renderizan dinámicamente estos links

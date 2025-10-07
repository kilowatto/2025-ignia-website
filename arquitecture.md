# **Arquitectura del Sitio Web de Ignia Cloud (Astro)**

**Versión:** v1.3 · **Enfoque:** Utility-first, semántico, mobile‑first, fondo blanco, SEO/GEO-first, JS mínimo o nulo. **Stack:** Astro \+ Tailwind CSS \+ astro-i18n.

## **1\) Visión General**

Ignia Cloud tendrá un sitio estático/SSR con **Astro** que prioriza performance, accesibilidad y SEO. La arquitectura favorece **HTML5 \+ Tailwind CSS** y reduce al mínimo el uso de JavaScript; cuando sea indispensable, se carga de forma **aislada, diferida y sólo en la página que lo requiera** (p. ej., /search).

Audiencias primarias: CTOs y emprendedores.  
Objetivos por página: Home (leads y credibilidad), Solutions/Products (agenda y respuestas a objeciones), AI & LLMs (contacto técnico).  
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




## **3\) Stack Técnico**

* **Astro**: SSG \+ SSR selectivo. Island architecture sólo si es imprescindible.  
* **Framework CSS**: **Tailwind CSS** (vía @astrojs/tailwind).  
* **Internacionalización**: **astro-i18n** (librería para traducciones) + **i18n nativo de Astro** (routing). Esta arquitectura híbrida nos dio los mejores resultados: astro-i18n maneja las traducciones centralizadas vía función t() y archivos JSON, mientras que el i18n nativo de Astro gestiona el routing automático por idioma.  
* **Lenguajes base**: HTML5, **TypeScript**.  
* **Fuentes**: Raleway (Light/Medium/Regular) en WOFF2 con subset Latin; font-display: swap.  
* **Búsqueda**: /search server‑side; **minisearch** opcional y exclusivo de esa ruta (defer, ≤100KB índice gz).  
* **Analítica**: server‑side (rutas de salida /out/\*), opcional beacon propio (≤2KB) defer.  
* **Integración Email**: API **Odoo SaaS** para newsletter/CRM (alta/baja, doble opt‑in, confirmaciones).
* **Partytown** ✅ **IMPLEMENTADO** - Scripts de terceros en Web Worker (Google Tag Manager, Google Analytics 4, chatbots, etc.). Mueve ejecución de scripts pesados fuera del main thread, mejorando LCP y TBT. Configuración: `forward: ['dataLayer.push', 'gtag']` para soporte GTM/GA4. Ver `src/components/Analytics.astro` para implementación y `README.md` para guía de uso completa.
* **Lazy Loading Estratégico**: `loading="lazy"` SOLO en imágenes below-the-fold (requieren scroll). Imágenes above-the-fold (logo, hero) usan `fetchpriority="high"` sin lazy loading para optimizar LCP. Ver §10 para detalles completos.

## **4\) Estructura de Directorios (Astro)**

```
/  
├─ src/  
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
│  │  ├─ langSelect.astro      # Selector de idioma
│  │  └─ LanguageSuggestionBanner.astro  # Banner sugerencia idioma
│  ├─ data/  
│  │  └─ searchData.ts         # Datos para minisearch (indexación)
│  ├─ i18n/  
│  │  ├─ en.json               # Cadenas en Inglés (default)
│  │  ├─ es.json               # Cadenas en Español
│  │  └─ fr.json               # Cadenas en Francés
│  ├─ integrations/  
│  │  └─ astroI18n.mjs         # Integración personalizada astro-i18n
│  ├─ styles/  
│  │  ├─ global.css            # Estilos base de Tailwind (@tailwind)
│  │  └─ header.css            # Estilos CSS-only para Header (sin JS bloqueante)
│  ├─ scripts/  
│  │  ├─ header-progressive.ts # Progressive enhancement mínimo (defer)
│  │  └─ ...                   # Scripts diferidos por página (si requeridos)
│  ├─ utils/  
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
│  │  ├─ android-chrome-192x192.png  
│  │  ├─ android-chrome-512x512.png  
│  │  ├─ apple-touch-icon.png  
│  │  ├─ favicon-16x16.png  
│  │  ├─ favicon-32x32.png  
│  │  ├─ favicon.ico  
│  │  └─ flags/  
│  │     ├─ en.svg  
│  │     ├─ es.svg  
│  │     └─ fr.svg  
│  └─ scripts/  
│     └─ header-progressive.js # Script compilado (generado desde src/scripts/)
├─ astro.config.mjs            # Configuración principal de Astro
├─ astro-i18n.config.mjs       # Configuración astro-i18n (traducciones)
├─ tailwind.config.mjs         # Configuración Tailwind CSS
├─ tsconfig.json               # Configuración TypeScript
└─ package.json                # Dependencias y scripts
```

**Notas sobre la Estructura:**

1. **src/pages/**: Usa routing file-based de Astro. La estructura espejo (`/`, `/es/`, `/fr/`) refleja las URLs finales.

2. **src/layouts/**: Solo `BaseLayout.astro` (§2: Evitar Encadenamiento). Eliminados layouts redundantes.

3. **src/components/**: Componentes reutilizables. `SearchPage.astro` es usado por los 3 wrappers de búsqueda.

4. **src/data/**: Contiene datos estáticos/generados para features específicas (ej: índice de búsqueda).

5. **src/i18n/**: Traducciones centralizadas. Un archivo JSON por idioma, siguiendo convención de astro-i18n.

6. **src/integrations/**: Integraciones personalizadas de Astro (actualmente solo astro-i18n custom).

7. **src/styles/**: 
   - `global.css`: Estilos globales (Tailwind + Header/Navegación + componentes compartidos)

8. **src/scripts/**: Scripts TypeScript que se compilan a JavaScript diferido:
   - `header-progressive.ts`: Progressive enhancement mínimo (~30 líneas)
   - Otros scripts se agregan aquí SOLO si son absolutamente necesarios (§2: JS mínimo)

9. **src/utils/**: Funciones de utilidad compartidas (detección idioma, configuración búsqueda).

10. **src/types/**: Tipos TypeScript compartidos entre componentes y páginas.

11. **src/middleware/**: `index.ts` es el único archivo de middleware de Astro (maneja redirects, i18n routing).

12. **public/**: Assets estáticos servidos directamente (imágenes, iconos, scripts compilados).

## **5\) Gestión de Contenido e Internacionalización (i18n)**

Esta sección define las reglas no negociables para manejar el contenido multi-idioma.

### **Arquitectura Híbrida i18n (astro-i18n + i18n nativo de Astro)**

Este proyecto utiliza una arquitectura híbrida que combina dos sistemas complementarios:

1. **astro-i18n (librería)**: Gestiona las traducciones de contenido
   - Función `t()` para renderizar texto traducido
   - Archivos JSON centralizados en `src/i18n/{locale}.json`
   - Configuración en `astro-i18n.config.mjs`
   - Detecta automáticamente el idioma actual vía `Astro.currentLocale`

2. **i18n nativo de Astro**: Gestiona el routing multi-idioma
   - Configuración en `astro.config.mjs` → `i18n: { defaultLocale, locales, routing }`
   - Routing automático: `/` (EN), `/es/`, `/fr/`
   - `Astro.currentLocale` disponible en todos los componentes
   - Generación automática de `alternate` links para SEO

**¿Por qué esta arquitectura híbrida?**

Probamos varias soluciones y esta combinación nos dio los mejores resultados:
- **Separación de responsabilidades**: Routing (Astro nativo) vs Traducciones (astro-i18n)
- **Type-safety**: astro-i18n ofrece mejor tipado para las traducciones
- **Performance**: Sin overhead de runtime, todo se resuelve en build-time
- **DX (Developer Experience)**: Función `t()` intuitiva + routing automático
- **Mantenibilidad**: Archivos JSON centralizados + estructura de carpetas espejo

**Patrón de Uso:**

```astro
---
// En cualquier componente .astro
import { t } from 'astro-i18n';

// Astro.currentLocale viene del i18n nativo (routing)
const currentLocale = Astro.currentLocale || 'en';
---

<h1>{t('home.hero.title')}</h1>
<p>{t('home.hero.description', { city: 'Montreal' })}</p>
```

**Integridad Arquitectónica:**

Para mantener la integridad de esta arquitectura, se debe cumplir:
1. **Nunca hardcodear texto** en componentes (.astro, .tsx)
2. **Usar `t()` exclusivamente** para todo texto visible
3. **Mantener sincronizados** los 3 archivos JSON (en.json, es.json, fr.json)
4. **Respetar la estructura espejo** de páginas (/pages/search.astro, /pages/es/search.astro, /pages/fr/search.astro)
5. **Usar componentes reutilizables** con prop `locale` para evitar duplicación (ej: SearchPage.astro)
6. **Configurar ambos sistemas** correctamente en astro.config.mjs y astro-i18n.config.mjs

### **Reglas de Implementación**

* **Centralización Obligatoria**: Todo el texto visible para el usuario (botones, títulos, párrafos, metadatos, etc.) **debe** gestionarse a través de archivos de traducción JSON en src/i18n/. Queda estrictamente prohibido escribir texto directamente en los componentes (.astro, .tsx, etc.).  
* **Estructura de Claves (Keys)**:  
  * Las claves deben estar en inglés y usar dot.notation para agrupar contenido relacionado (p. ej., header.nav.solutions, home.hero.cta).  
  * Esta estructura jerárquica es obligatoria para mantener el orden y la legibilidad.  
  * **Ejemplo (en.json)**:  
    {  
      "header": { "nav": { "solutions": "Solutions", "products": "Products" } },  
      "home": { "hero": { "title": "Your Cloud, Your Rules", "cta": "Schedule a Demo" } }  
    }

* **Uso en Componentes**: Se utilizará la función t() proporcionada por i18n nativo para renderizar todo el texto.  
  \---  
  import { t } from "i18n nativo";  
  \---  
  \<a href="/en/solutions/"\>{t('header.nav.solutions')}\</a\>  
  \<h1\>{t('home.hero.title')}\</h1\>

* **Flujo de Trabajo (No Negociable)**:  
  1. Al añadir nuevo texto, la clave **primero** se debe agregar al archivo del idioma por defecto (en.json).  
  2. Inmediatamente después, la misma clave debe ser añadida a los demás archivos de idioma (es.json, fr.json), incluso si es con una traducción temporal o un placeholder (p. ej., "\[TRANSLATE\] Soluciones").
* **Generación y Mantenimiento de archivos JSON (No negociable)**:  
  * Ubicación única: todos los diccionarios viven en `src/i18n/<locale>.json`. Queda prohibido crear carpetas paralelas (`public/locales`, `content/i18n`, etc.) o distribuir claves en múltiples archivos por idioma.  
  * Convención de nombres: el nombre del archivo SIEMPRE coincide con el código de idioma soportado por astro-i18n (en.json, es.json, fr.json). Cada nuevo idioma requiere un archivo homónimo.  
  * Formato y estilo: JSON válido, codificado en UTF-8, con sangría de dos espacios, claves ordenadas alfabéticamente y sin comentarios. Todas las cadenas usan comillas dobles y terminan sin espacios sobrantes ni comas finales innecesarias.  
  * Claves e interpolaciones: las claves siguen la notación punto descrita arriba y la última sección SIEMPRE es un sustantivo/acción (ej. `home.hero.title`). Para interpolar valores dinámicos se definen marcadores en snake_case entre llaves dobles (`"cta": "Reserva tu demo en {{city}}"`) y se resuelven exclusivamente con `t(key, properties)`. No se permite concatenar strings ni incrustar HTML dentro de los JSON.  
  * Flujo de sincronización:  
    1. Agrega/actualiza la clave en `en.json`.  
    2. Duplica la entrada en `es.json` y `fr.json` con la traducción oficial. Si la traducción no está lista, usa `"[PENDING] ..."` y abre el ticket correspondiente; nunca dejes claves ausentes.  
    3. Ejecuta la validación (ej. `npm run lint` + `npm test` cuando existan) y revisa que ninguna clave quede por resolver en los otros idiomas.  
  * QA manual obligatorio: antes de mergear, navega por los idiomas afectados (`/en`, `/es`, `/fr`) y confirma que el contenido renderiza desde `t()` sin hardcodes ni cadenas vacías.  
  * Debt register: todo placeholder `[PENDING]` debe registrarse en el tablero de traducciones y eliminarse en la siguiente iteración; mantenerlos en master por más de un release infringe esta política.

## **6\) Ruteo y SEO Técnico (i18n)**

* **Idiomas**: /en (default), /es, /fr. x-default apuntará a /en.  
* **Rutas limpias** y predecibles: /en/solutions/private-cloud-as-a-service/.  
* **hreflang**: astro-i18n gestionará automáticamente la generación de etiquetas link para hreflang.  
* **Detección de Idioma**: La detección inicial se basará en la cabecera Accept-Language del navegador para una redirección en el servidor. Opcionalmente, se podrá usar un script de JS ligero y no bloqueante para guardar la preferencia explícita del usuario en localStorage y agilizar futuras visitas.  
* **Selector EN/ES/FR**: bandera \+ texto, accesible por teclado.  
* **Canonical & Sitemap**: Canónico por idioma. Sitemap(s) por idioma generados en build.

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

* **Cumplimiento Performance**:
  * LCP candidate images: `fetchpriority="high"` + sin lazy loading
  * Secondary images: `loading="lazy"` para reducir carga inicial
  * Objetivo: LCP < 2.5s (arquitecture.md §14)

## **11\) Formularios & Flujos (Server‑Side)**

* **Validación** en servidor; devolver estados accesibles.  
* **Anti‑spam**: honeypot \+ tiempo mínimo.  
* **Integración Odoo SaaS**.

## **12\) Búsqueda (/search) con Minisearch (opcional)**

* Render server‑side; cargar script de minisearch **sólo** en /search vía defer.

## **13\) Analítica & Consentimiento (Ligero)**

* **Tracking server‑side** mediante rutas de salida.  
* **Consentimiento**: banner sin JS.

## **14\) Performance (Presupuesto y Métricas)**

* **Presupuesto inicial móvil ≤ 300KB**.  
* **Métricas**: LCP \< 2.5s; CLS \< 0.1; INP \< 200ms.

## **15\) Seguridad y Cumplimiento**

* **Headers**: CSP estricta, HSTS, etc.  
* **Formularios**: CSRF token.

## **16\) Build & Deploy (Astro)**

* **CI/CD**: lint, tests de links rotos, validación JSON‑LD, Lighthouse, Pa11y.  
* **CDN**: cache agresivo para assets.

**Snippet base (astro.config.mjs)**

```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

export default defineConfig({
  site: 'https://ignia.cloud',
  output: 'server', // Modo servidor para SSR selectivo
  adapter: node({ mode: 'standalone' }),
  
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

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
* **Internacionalización con astro-i18n**: Toda la gestión de contenido multi-idioma se centralizará a través de la librería astro-i18n para asegurar un sistema unificado, escalable y sin cadenas de texto hardcodeadas.  
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
*


## **3\) Stack Técnico**

* **Astro**: SSG \+ SSR selectivo. Island architecture sólo si es imprescindible.  
* **Framework CSS**: **Tailwind CSS** (vía @astrojs/tailwind).  
* **Internacionalización**: **astro-i18n**.  
* **Lenguajes base**: HTML5, **TypeScript**.  
* **Fuentes**: Raleway (Light/Medium/Regular) en WOFF2 con subset Latin; font-display: swap.  
* **Búsqueda**: /search server‑side; **minisearch** opcional y exclusivo de esa ruta (defer, ≤100KB índice gz).  
* **Analítica**: server‑side (rutas de salida /out/\*), opcional beacon propio (≤2KB) defer.  
* **Integración Email**: API **Odoo SaaS** para newsletter/CRM (alta/baja, doble opt‑in, confirmaciones).

## **4\) Estructura de Directorios (Astro)**

/  
├─ src/  
│  ├─ pages/  
│  │  ├─ en/ ...  
│  │  ├─ es/ ... (estructura espejo)  
│  │  └─ fr/ ... (estructura espejo)  
│  ├─ layouts/  
│  │  ├─ BaseLayout.astro  
│  │  ├─ ...  
│  ├─ components/  
│  │  ├─ Header.astro  
│  │  ├─ ...  
│  ├─ content/  
│  │  ├─ en/\*.md  
│  │  ├─ es/\*.md  
│  │  └─ fr/\*.md  
│  ├─ i18n/  
│  │  ├─ en.json        \# Cadenas en Inglés (default)  
│  │  ├─ es.json        \# Cadenas en Español  
│  │  └─ fr.json        \# Cadenas en Francés  
│  ├─ styles/  
│  │  └─ globals.css    \# Estilos base de Tailwind (@tailwind)  
│  ├─ lib/  
│  │  ├─ analytics.ts  
│  │  ├─ minisearch.ts  
│  │  └─ schema.ts  
│  └─ middleware/  
│     └─ redirects.ts  
├─ public/  
│  ├─ ...  
├─ astro.config.mjs  
├─ tailwind.config.mjs  
├─ tsconfig.json  
└─ package.json

## **5\) Gestión de Contenido e Internacionalización (i18n)**

Esta sección define las reglas no negociables para manejar el contenido multi-idioma.

* **Centralización Obligatoria**: Todo el texto visible para el usuario (botones, títulos, párrafos, metadatos, etc.) **debe** gestionarse a través de archivos de traducción JSON en src/i18n/. Queda estrictamente prohibido escribir texto directamente en los componentes (.astro, .tsx, etc.).  
* **Estructura de Claves (Keys)**:  
  * Las claves deben estar en inglés y usar dot.notation para agrupar contenido relacionado (p. ej., header.nav.solutions, home.hero.cta).  
  * Esta estructura jerárquica es obligatoria para mantener el orden y la legibilidad.  
  * **Ejemplo (en.json)**:  
    {  
      "header": { "nav": { "solutions": "Solutions", "products": "Products" } },  
      "home": { "hero": { "title": "Your Cloud, Your Rules", "cta": "Schedule a Demo" } }  
    }

* **Uso en Componentes**: Se utilizará la función t() proporcionada por astro-i18n para renderizar todo el texto.  
  \---  
  import { t } from "astro-i18n";  
  \---  
  \<a href="/en/solutions/"\>{t('header.nav.solutions')}\</a\>  
  \<h1\>{t('home.hero.title')}\</h1\>

* **Flujo de Trabajo (No Negociable)**:  
  1. Al añadir nuevo texto, la clave **primero** se debe agregar al archivo del idioma por defecto (en.json).  
  2. Inmediatamente después, la misma clave debe ser añadida a los demás archivos de idioma (es.json, fr.json), incluso si es con una traducción temporal o un placeholder (p. ej., "\[TRANSLATE\] Soluciones").
* **Generación y Mantenimiento de archivos JSON (No negociable)**:  
  * Ubicación única: todos los diccionarios viven en `src/i18n/<locale>.json`. Queda prohibido crear carpetas paralelas (`public/locales`, `content/i18n`, etc.) o distribuir claves en múltiples archivos por idioma.  
  * Convención de nombres: el nombre del archivo SIEMPRE coincide con el código de idioma soportado por astro-i18n (en.json, es.json, fr.json). Cada nuevo idioma requiere un archivo homónimo y su registro en `astro-i18n.config.ts`.  
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
* **FAQ**: \<details\> por pregunta; summary claro; contenido con links internos.  
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

## **10\) Imágenes (AI) y Medios**

* **Formatos**: **AVIF/WebP**.  
* **Pesos**: Hero ≤ **90KB**; tarjetas ≤ **40KB**.  
* **Atributos**: width/height, loading="lazy", decoding="async", alt descriptivo (gestionado con astro-i18n).

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

import { defineConfig } from 'astro/config';  
import tailwind from '@astrojs/tailwind';  
import sitemap from '@astrojs/sitemap';  
import compress from 'astro-compress';  
import i18n from 'astro-i18n';

export default defineConfig({  
  site: '\[https://www.igniacloud.example\](https://www.igniacloud.example)',  
  output: 'static',  
  integrations: \[  
    i18n(),  
    tailwind(),   
    sitemap(),   
    compress()  
  \],  
  vite: { build: { target: 'es2019' } }  
});  

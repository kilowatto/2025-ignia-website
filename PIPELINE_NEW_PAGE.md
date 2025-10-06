# 📋 Pipeline Obligatorio: Crear Nueva Página

**Autor**: Pipeline documentado el 6 de octubre de 2025  
**Propósito**: Checklist para asegurar que cada nueva página cumple arquitectura.md y es descubrible por buscadores

---

## ✅ Checklist Pre-Commit

### 1️⃣ **Estructura de Archivos** (arquitectura.md §4)
- [ ] Crear `/src/pages/nueva-pagina.astro` (EN - default)
- [ ] Crear `/src/pages/es/nueva-pagina.astro` (ES)
- [ ] Crear `/src/pages/fr/nueva-pagina.astro` (FR)
- [ ] Verificar que los 3 archivos usan el mismo componente (DRY pattern)

### 2️⃣ **Internacionalización** (arquitectura.md §5)
- [ ] Agregar traducciones en `/src/i18n/en.json`
- [ ] Agregar traducciones en `/src/i18n/es.json`
- [ ] Agregar traducciones en `/src/i18n/fr.json`
- [ ] Verificar que todas las claves usan dot.notation (ej: `nuevaPagina.title`)
- [ ] Testear función `t()` en los 3 idiomas

### 3️⃣ **SEO & Metadatos** (arquitectura.md §6, §9)
- [ ] Definir `pageTitle` con `t('nuevaPagina.meta.title')`
- [ ] Definir `pageDescription` con `t('nuevaPagina.meta.description')`
- [ ] Agregar JSON-LD structured data si aplica
- [ ] Configurar `inLanguage` correcto en structuredData

### 4️⃣ **Sitemap XML** ⚠️ CRÍTICO (arquitectura.md §2)
- [ ] Agregar ruta en `/src/pages/sitemap-[lang].xml.ts`:
  ```typescript
  { path: '/nueva-pagina', changefreq: 'weekly', priority: 0.7 }
  ```
- [ ] Elegir `changefreq` apropiado:
  - `always`: Datos en tiempo real (status)
  - `hourly`: Contenido muy dinámico
  - `daily`: Home, noticias
  - `weekly`: Páginas de contenido estándar
  - `monthly`: Páginas estáticas (about, legal)
  - `yearly`: Archivo histórico
- [ ] Elegir `priority` apropiado (0.0 - 1.0):
  - `1.0`: Home
  - `0.8-0.9`: Páginas principales (status, productos)
  - `0.5-0.7`: Páginas secundarias (search, contact)
  - `0.3-0.5`: Páginas terciarias (legal, archive)

### 5️⃣ **Navegación & Enlaces** (arquitectura.md §7)
- [ ] Agregar link en Header.astro si es página principal
- [ ] Agregar link en Footer.astro si aplica
- [ ] Verificar que todos los `<a>` tienen texto descriptivo (no "click aquí")
- [ ] Testear navegación por teclado (Tab, Enter)

### 6️⃣ **Accesibilidad** (arquitectura.md §7 - WCAG 2.2 AA)
- [ ] Usar HTML semántico (`<main>`, `<section>`, `<article>`)
- [ ] Un solo `<h1>` por página
- [ ] Jerarquía lógica de headings (H1 → H2 → H3)
- [ ] `alt` descriptivo en imágenes
- [ ] `aria-label` en iconos decorativos
- [ ] Contraste de color ≥ 4.5:1 (texto normal) o ≥ 3:1 (texto grande)
- [ ] Focus visible en todos los elementos interactivos

### 7️⃣ **Performance** (arquitectura.md §14)
- [ ] Imágenes optimizadas (AVIF/WebP)
- [ ] `loading="lazy"` en imágenes below-the-fold
- [ ] `fetchpriority="high"` en LCP candidates (hero, logo)
- [ ] Sin JS bloqueante (usar `defer` si es necesario)
- [ ] Budget: Verificar que la página pesa <300KB

### 8️⃣ **Testing Local**
- [ ] Abrir `http://localhost:4321/nueva-pagina` (EN)
- [ ] Abrir `http://localhost:4321/es/nueva-pagina` (ES)
- [ ] Abrir `http://localhost:4321/fr/nueva-pagina` (FR)
- [ ] Verificar sitemap XML:
  ```bash
  curl http://localhost:4321/sitemap-en.xml | grep "nueva-pagina"
  curl http://localhost:4321/sitemap-es.xml | grep "nueva-pagina"
  curl http://localhost:4321/sitemap-fr.xml | grep "nueva-pagina"
  ```
- [ ] Verificar robots.txt apunta a sitemaps:
  ```bash
  curl http://localhost:4321/robots.txt | grep "Sitemap:"
  ```
- [ ] Lighthouse (Performance, SEO, Accessibility, Best Practices):
  ```bash
  # Chrome DevTools → Lighthouse → Run audit
  # Objetivo: >90 en todas las métricas
  ```

### 9️⃣ **TypeScript & Errors**
- [ ] `npm run build` sin errores ✅
- [ ] VS Code: 0 errores TypeScript ✅
- [ ] Astro language server: 0 warnings ✅

### 🔟 **Git Commit**
- [ ] Commit con mensaje descriptivo:
  ```bash
  git add src/pages/nueva-pagina.astro \
          src/pages/es/nueva-pagina.astro \
          src/pages/fr/nueva-pagina.astro \
          src/i18n/*.json \
          src/pages/sitemap-[lang].xml.ts
  
  git commit -m "feat(pages): add /nueva-pagina with i18n and sitemap
  
  - Created EN/ES/FR versions
  - Added translations to i18n/*.json
  - Registered in sitemap-[lang].xml.ts (changefreq: weekly, priority: 0.7)
  - SEO metadata with JSON-LD
  - WCAG 2.2 AA compliant
  - Performance: <300KB, LCP <2.5s
  
  Closes #123"
  ```

---

## 📊 Métricas de Éxito

**Pre-Deploy**:
- ✅ TypeScript: 0 errores
- ✅ Lighthouse: >90 en todas las métricas
- ✅ WCAG: AA compliant
- ✅ Sitemap: Incluye los 3 idiomas

**Post-Deploy (24-48h después)**:
- ✅ Google Search Console: Página indexada
- ✅ Bing Webmaster Tools: Página indexada
- ✅ Cloudflare Analytics: Tráfico registrado
- ✅ Core Web Vitals: LCP <2.5s, CLS <0.1, INP <200ms

---

## 🚨 Errores Comunes a Evitar

| Error | Impacto | Solución |
|-------|---------|----------|
| ❌ Olvidar sitemap XML | SEO -50% | Usar este checklist |
| ❌ Texto hardcoded (no i18n) | Mantenibilidad | Usar función `t()` |
| ❌ Sin versión ES/FR | Alcance limitado | Crear espejo de archivos |
| ❌ JS bloqueante | LCP >5s | Usar `defer` o SSR |
| ❌ Imágenes sin optimizar | Budget excedido | AVIF/WebP + lazy loading |
| ❌ Sin alt en imágenes | Accesibilidad F | Agregar alt descriptivo |
| ❌ Links con "click aquí" | SEO + A11y | Texto descriptivo |
| ❌ Priority 1.0 en todas | Dilución SEO | Usar jerarquía 0.3-1.0 |

---

## 📚 Referencias

- **arquitectura.md**: Documento maestro de arquitectura
- **README.md**: Setup y comandos de desarrollo
- **sitemap-[lang].xml.ts**: Generador de sitemaps multiidioma
- **robots.txt.ts**: Configuración de crawling
- **Google Search Central**: https://developers.google.com/search
- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/

---

## 🔄 Mantenimiento del Pipeline

Este checklist debe actualizarse cuando:
1. arquitectura.md cambie requisitos
2. Se agreguen nuevos idiomas (PT, DE, etc.)
3. Se implementen nuevas herramientas de validación
4. Google/Bing actualicen guidelines de SEO

**Última actualización**: 6 de octubre de 2025  
**Próxima revisión**: Trimestral (enero 2026)

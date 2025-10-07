# 🔍 Sistema de Búsqueda - Ignia Cloud

> Documentación completa del sistema de búsqueda con **MiniSearch** implementado en el sitio web de Ignia Cloud.

**Última actualización:** Octubre 2025  
**Stack:** MiniSearch + Astro + TypeScript  
**Idiomas soportados:** 🇬🇧 English · 🇪🇸 Español · 🇫🇷 Français

---

## 📋 Tabla de Contenidos

- [Arquitectura General](#-arquitectura-general)
- [Cómo Funciona](#-cómo-funciona)
- [Agregar Contenido al Índice](#-agregar-contenido-al-índice)
- [Tipos de Contenido](#-tipos-de-contenido)
- [Campos y Propiedades](#-campos-y-propiedades)
- [Quick Searches (Búsquedas Rápidas)](#-quick-searches-búsquedas-rápidas)
- [Ejemplos Prácticos](#-ejemplos-prácticos)
- [Optimización SEO](#-optimización-seo)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Arquitectura General

El sistema de búsqueda sigue un patrón **client-side search con índice estático pre-construido**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DATOS (searchData.ts)                                    │
│    ├─ searchDataEN[] - Contenido en inglés                  │
│    ├─ searchDataES[] - Contenido en español                 │
│    └─ searchDataFR[] - Contenido en francés                 │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. INDEXACIÓN (searchConfig.ts)                             │
│    createSearchIndex() crea índice MiniSearch por idioma    │
│    - Tokenización                                            │
│    - Stemming                                                │
│    - Fuzzy matching                                          │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. UI (SearchModal.astro + SearchPage.astro)                │
│    ├─ SearchModal: Input + Quick Searches                   │
│    └─ SearchPage: Resultados + Filtros + Paginación         │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BÚSQUEDA (performSearch)                                 │
│    - Query al índice MiniSearch                              │
│    - Ranking por relevancia                                  │
│    - Filtrado por category/type                              │
│    - Resultados ordenados                                    │
└─────────────────────────────────────────────────────────────┘
```

### Características Clave

- ✅ **100% client-side** - Sin backend, sin API calls
- ✅ **Performance** - Búsqueda en < 50ms
- ✅ **Multi-idioma** - Índices separados por locale
- ✅ **Fuzzy matching** - Tolera typos y errores
- ✅ **SEO-friendly** - URLs con query params (`/search?q=cloud`)
- ✅ **TypeScript** - Type-safe en toda la cadena

---

## 🔧 Cómo Funciona

### Flujo de Búsqueda

1. **Usuario abre SearchModal** (click en lupa del header)
2. **Usuario escribe query** en el input
3. **Usuario presiona Enter** o click en botón "Search"
4. **Redirect a `/search?q={query}`** con el término
5. **SearchPage carga el índice** MiniSearch del idioma actual
6. **Búsqueda ejecutada** contra el índice
7. **Resultados renderizados** con highlights y filtros

### Componentes del Sistema

| Archivo | Responsabilidad |
|---------|-----------------|
| **`src/data/searchData.ts`** | Datos fuente (array de items) |
| **`src/utils/searchConfig.ts`** | Lógica de indexación y búsqueda |
| **`src/components/SearchModal.astro`** | Modal con input + quick searches |
| **`src/components/SearchPage.astro`** | Página de resultados completa |
| **`src/components/SearchBox.astro`** | Botón trigger del modal |
| **`src/pages/search.astro`** | Wrapper inglés |
| **`src/pages/es/search.astro`** | Wrapper español |
| **`src/pages/fr/search.astro`** | Wrapper francés |
| **`src/i18n/{en,es,fr}.json`** | Traducciones UI + quick_searches |

---

## ➕ Agregar Contenido al Índice

### Paso 1: Identificar el Tipo de Contenido

Antes de agregar, define qué estás indexando:

| Tipo | Cuándo Usar | Ejemplos |
|------|-------------|----------|
| **`service`** | Servicios que ofreces | "Cloud Solutions", "AI Consulting" |
| **`product`** | Productos/plataformas | "Ignia Cloud Platform", "Backup Tool" |
| **`article`** | Blog posts, guías, docs | "How to migrate to cloud", "Guide to Kubernetes" |
| **`page`** | Páginas informativas | "Status", "Contact", "About Us", "Pricing" |

### Paso 2: Abrir `searchData.ts`

```bash
# Ubicación del archivo
src/data/searchData.ts
```

### Paso 3: Agregar Item en el Array Correspondiente

Debes agregar el item en **los 3 arrays de idiomas** (`searchDataEN`, `searchDataES`, `searchDataFR`).

#### Ejemplo: Agregar Página "Status"

**Inglés (`searchDataEN`):**

```typescript
export const searchDataEN: SearchItem[] = [
    // ... items existentes ...
    
    // ✨ NUEVO ITEM
    {
        id: 'page-system-status',
        title: 'System Status',
        description: 'Real-time monitoring of Ignia Cloud services',
        content: 'Check the current operational status of all Ignia Cloud services. Monitor website availability, Odoo API health, and infrastructure uptime in real-time. This page refreshes automatically every 5 minutes to provide the latest service status.',
        url: '/status',
        type: 'page',
        category: 'Infrastructure',
        tags: ['status', 'monitoring', 'uptime', 'health', 'availability', 'system status', 'service status', 'infrastructure status'],
        locale: 'en',
        priority: 7
    },
];
```

**Español (`searchDataES`):**

```typescript
export const searchDataES: SearchItem[] = [
    // ... items existentes ...
    
    // ✨ NUEVO ITEM
    {
        id: 'page-system-status-es',
        title: 'Estado del Sistema',
        description: 'Monitoreo en tiempo real de los servicios de Ignia Cloud',
        content: 'Consulta el estado operacional actual de todos los servicios de Ignia Cloud. Monitorea la disponibilidad del sitio web, la salud de la API de Odoo y el tiempo de actividad de la infraestructura en tiempo real. Esta página se actualiza automáticamente cada 5 minutos para proporcionar el estado más reciente.',
        url: '/es/status',
        type: 'page',
        category: 'Infraestructura',
        tags: ['estado', 'monitoreo', 'disponibilidad', 'salud', 'uptime', 'estado del sistema', 'estado de servicios', 'estado de infraestructura'],
        locale: 'es',
        priority: 7
    },
];
```

**Francés (`searchDataFR`):**

```typescript
export const searchDataFR: SearchItem[] = [
    // ... items existentes ...
    
    // ✨ NUEVO ITEM
    {
        id: 'page-system-status-fr',
        title: 'État du Système',
        description: 'Surveillance en temps réel des services Ignia Cloud',
        content: 'Consultez l\'état opérationnel actuel de tous les services Ignia Cloud. Surveillez la disponibilité du site web, la santé de l\'API Odoo et le temps de fonctionnement de l\'infrastructure en temps réel. Cette page se rafraîchit automatiquement toutes les 5 minutes.',
        url: '/fr/status',
        type: 'page',
        category: 'Infrastructure',
        tags: ['état', 'surveillance', 'disponibilité', 'santé', 'uptime', 'état du système', 'état des services'],
        locale: 'fr',
        priority: 7
    },
];
```

### Paso 4: Guardar y Probar

```bash
# El sistema usa hot reload, el cambio es inmediato
# Solo recarga el navegador en /search
```

---

## 📦 Tipos de Contenido

### `service` - Servicios

**Cuándo usar:** Para servicios profesionales que ofreces.

**Ejemplo:**

```typescript
{
    id: 'service-cybersecurity',
    title: 'Cybersecurity Services',
    description: 'Comprehensive security audits and protection',
    content: 'Protect your infrastructure with our cybersecurity services. Penetration testing, vulnerability assessments, incident response, and 24/7 SOC monitoring.',
    url: '/services/cybersecurity',
    type: 'service',
    category: 'Security',
    tags: ['security', 'cybersecurity', 'penetration testing', 'vulnerability', 'SOC'],
    locale: 'en',
    priority: 9
}
```

### `product` - Productos

**Cuándo usar:** Para productos, software, o plataformas vendibles.

**Ejemplo:**

```typescript
{
    id: 'product-backup-manager',
    title: 'Cloud Backup Manager',
    description: 'Automated backup solution for multi-cloud',
    content: 'Never lose data again with our Cloud Backup Manager. Automated backups across AWS, Azure, and Google Cloud with instant recovery. Incremental backups, encryption at rest, and geo-redundancy.',
    url: '/products/backup-manager',
    type: 'product',
    category: 'Data Protection',
    tags: ['backup', 'recovery', 'data protection', 'disaster recovery', 'BCP'],
    locale: 'en',
    priority: 8
}
```

### `article` - Artículos y Documentación

**Cuándo usar:** Para blog posts, guías, tutoriales, o documentación técnica.

**Ejemplo:**

```typescript
{
    id: 'article-kubernetes-guide',
    title: 'Complete Guide to Kubernetes Deployment',
    description: 'Learn how to deploy applications on Kubernetes',
    content: 'This comprehensive guide covers everything you need to know about Kubernetes: pods, services, deployments, ingress, persistent volumes, and best practices for production environments.',
    url: '/blog/kubernetes-deployment-guide',
    type: 'article',
    category: 'DevOps',
    tags: ['kubernetes', 'k8s', 'containers', 'docker', 'deployment', 'devops', 'tutorial'],
    locale: 'en',
    priority: 6,
    dateCreated: '2024-10-05'
}
```

### `page` - Páginas Institucionales

**Cuándo usar:** Para páginas informativas (About, Contact, Pricing, etc.)

**Ejemplo:**

```typescript
{
    id: 'page-pricing',
    title: 'Pricing Plans',
    description: 'Flexible pricing for businesses of all sizes',
    content: 'Choose the perfect plan for your business. Starter plan for small teams, Professional for growing companies, and Enterprise with custom solutions. All plans include 24/7 support and 99.9% SLA.',
    url: '/pricing',
    type: 'page',
    category: 'Commercial',
    tags: ['pricing', 'plans', 'cost', 'subscription', 'enterprise'],
    locale: 'en',
    priority: 7
}
```

---

## 🔑 Campos y Propiedades

### Interface `SearchItem`

```typescript
export interface SearchItem {
    id: string;           // ID único (nunca duplicar)
    title: string;        // Título principal (peso alto en búsqueda)
    description: string;  // Descripción corta (peso medio)
    content: string;      // Contenido completo (peso bajo pero indexado)
    url: string;          // URL relativa al sitio
    type: 'service' | 'product' | 'article' | 'page';
    category: string;     // Categoría de agrupación
    tags: string[];       // Tags para búsqueda avanzada
    locale: 'en' | 'es' | 'fr';
    dateCreated?: string; // Opcional (ISO 8601: "2024-10-05")
    priority: number;     // 1-10 (mayor = más relevante)
}
```

### Guía de Campos

| Campo | Descripción | Peso en Búsqueda | Ejemplos | Recomendaciones |
|-------|-------------|------------------|----------|-----------------|
| **`id`** | Identificador único | N/A | `service-cloud-solutions` | Usa prefijo del tipo + slug en kebab-case. Agrega `-es` o `-fr` para traducciones. |
| **`title`** | Título corto y preciso | 🟢 Alto (boost 3x) | "Cloud Solutions", "Estado del Sistema" | Max 60 caracteres. Usa palabras clave importantes. |
| **`description`** | Resumen de 1 línea | 🟡 Medio (boost 2x) | "Complete cloud infrastructure solutions" | 120-160 caracteres. Usa verbos de acción. |
| **`content`** | Texto completo del contenido | 🟠 Bajo (boost 1x) | Ver ejemplos arriba | 200-500 palabras. Incluye sinónimos y variaciones. |
| **`url`** | Ruta relativa al sitio | N/A | `/status`, `/es/servicios/cloud` | Incluye locale en URLs traducidas. |
| **`type`** | Tipo de contenido | Filtrable | `service`, `product`, `article`, `page` | Elige el más apropiado (ver tabla arriba). |
| **`category`** | Categoría de agrupación | Filtrable | "Infrastructure", "Security" | Max 2 palabras. Usa consistencia. |
| **`tags`** | Array de palabras clave | 🟢 Alto (boost 2.5x) | `['status', 'monitoring', 'uptime']` | 5-10 tags. Incluye sinónimos, acrónimos, variaciones. |
| **`locale`** | Idioma del contenido | N/A | `en`, `es`, `fr` | Siempre coincide con el array donde está. |
| **`dateCreated`** | Fecha de creación (opcional) | Ordenable | `"2024-10-05"` | Solo para `article`. Formato ISO 8601. |
| **`priority`** | Relevancia relativa | Ordenable | `7` | 1-10. Usa 10 para servicios core, 5-6 para docs. |

### Sistema de Priority (1-10)

| Priority | Cuándo Usar | Ejemplos |
|----------|-------------|----------|
| **10** | Servicios/productos principales | "Cloud Solutions", "AI Platform" |
| **9** | Servicios premium | "Cybersecurity", "Managed IT" |
| **8** | Productos secundarios | "Backup Manager", "Monitoring Dashboard" |
| **7** | Páginas importantes | "Status", "Pricing", "Contact" |
| **6** | Artículos destacados | Guías técnicas, whitepapers |
| **5** | Documentación técnica | API docs, FAQs |
| **4** | Blog posts estándar | Noticias, actualizaciones |
| **3** | Páginas secundarias | "Team", "History" |
| **1-2** | Contenido legacy | Artículos antiguos, páginas deprecadas |

---

## ⚡ Quick Searches (Búsquedas Rápidas)

Las **Quick Searches** son sugerencias clickeables que aparecen en el `SearchModal` para ayudar a los usuarios a iniciar búsquedas comunes.

### Ubicación

Están definidas en los archivos JSON de i18n:

```
src/i18n/
├── en.json → search.quick_searches
├── es.json → search.quick_searches
└── fr.json → search.quick_searches
```

### Estructura

```json
{
  "search": {
    "quick_searches": [
      {
        "label": "Cloud Solutions",
        "query": "cloud private public hybrid"
      },
      {
        "label": "Kubernetes & DevOps",
        "query": "kubernetes devops containers"
      }
    ]
  }
}
```

### Cómo Agregar una Nueva Quick Search

#### 1. Editar `src/i18n/en.json`

```json
{
  "search": {
    "quick_searches": [
      // ... existentes ...
      {
        "label": "System Status",
        "query": "status monitoring uptime health availability"
      }
    ]
  }
}
```

#### 2. Editar `src/i18n/es.json`

```json
{
  "search": {
    "quick_searches": [
      // ... existentes ...
      {
        "label": "Estado del Sistema",
        "query": "estado monitoreo disponibilidad salud uptime"
      }
    ]
  }
}
```

#### 3. Editar `src/i18n/fr.json`

```json
{
  "search": {
    "quick_searches": [
      // ... existentes ...
      {
        "label": "État du Système",
        "query": "état surveillance disponibilité santé uptime"
      }
    ]
  }
}
```

### Best Practices para Quick Searches

| Aspecto | Recomendación | ❌ Evitar | ✅ Bueno |
|---------|---------------|----------|---------|
| **Label** | Corto y descriptivo (2-4 palabras) | "Buscar información sobre cloud" | "Cloud Solutions" |
| **Query** | 3-6 keywords relevantes | "cloud" | "cloud private public hybrid" |
| **Keywords** | Incluir sinónimos y variaciones | "ia" | "ai llm machine learning rag" |
| **Order** | Más buscados primero | N/A | Cloud (1), Kubernetes (2), Backup (3) |
| **Cantidad** | 5-7 quick searches | 15+ | 5-7 |

### Optimización SEO de Queries

Las queries deben optimizarse para **maximizar resultados relevantes**:

```json
// ❌ MAL - Query demasiado genérica
{
  "label": "Cloud",
  "query": "cloud"
}

// ✅ BIEN - Query específica con variaciones
{
  "label": "Cloud Solutions",
  "query": "cloud private public hybrid aws azure gcp"
}
```

**Por qué es mejor:**
- ✅ "cloud private" → encuentra "Private Cloud Hosting"
- ✅ "cloud azure" → encuentra servicios Azure
- ✅ "cloud hybrid" → encuentra soluciones híbridas

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Agregar Página de Contacto

```typescript
// Inglés
{
    id: 'page-contact',
    title: 'Contact Us',
    description: 'Get in touch with our team',
    content: 'Contact Ignia Cloud for inquiries, support, or partnership opportunities. Fill out our contact form and our team will respond within 24 hours. You can also reach us via email at contact@ignia.cloud or call +1-800-IGNIA.',
    url: '/#contact',
    type: 'page',
    category: 'Support',
    tags: ['contact', 'support', 'help', 'email', 'phone', 'inquiry', 'sales'],
    locale: 'en',
    priority: 6
}

// Español
{
    id: 'page-contact-es',
    title: 'Contáctanos',
    description: 'Ponte en contacto con nuestro equipo',
    content: 'Contacta a Ignia Cloud para consultas, soporte u oportunidades de asociación. Completa nuestro formulario de contacto y nuestro equipo te responderá en 24 horas. También puedes contactarnos por email a contacto@ignia.cloud.',
    url: '/es/#contact',
    type: 'page',
    category: 'Soporte',
    tags: ['contacto', 'soporte', 'ayuda', 'email', 'teléfono', 'consulta', 'ventas'],
    locale: 'es',
    priority: 6
}
```

### Ejemplo 2: Agregar Servicio de Backup

```typescript
// Inglés
{
    id: 'service-backup-recovery',
    title: 'Backup & Disaster Recovery',
    description: 'Enterprise-grade backup solutions with 99.99% reliability',
    content: 'Protect your critical business data with our comprehensive backup and disaster recovery services. Automated daily backups, instant recovery, geo-redundant storage across 3 datacenters, and guaranteed RPO < 1 hour. Supports databases, applications, virtual machines, and cloud workloads.',
    url: '/services/backup-recovery',
    type: 'service',
    category: 'Data Protection',
    tags: ['backup', 'disaster recovery', 'BCP', 'business continuity', 'DRaaS', 'data protection', 'RPO', 'RTO'],
    locale: 'en',
    priority: 9
}
```

### Ejemplo 3: Agregar Artículo de Blog

```typescript
// Inglés
{
    id: 'article-cloud-migration-2024',
    title: '10 Steps for a Successful Cloud Migration in 2024',
    description: 'Complete guide to migrate your infrastructure to the cloud',
    content: 'Cloud migration can seem daunting, but with proper planning it becomes manageable. This guide covers assessment, planning, pilot testing, data migration, application refactoring, security hardening, performance testing, cutover, and post-migration optimization. Real case studies included.',
    url: '/blog/cloud-migration-guide-2024',
    type: 'article',
    category: 'Cloud',
    tags: ['cloud migration', 'AWS', 'Azure', 'Google Cloud', 'lift and shift', 'refactoring', 'modernization'],
    locale: 'en',
    dateCreated: '2024-10-05',
    priority: 7
}
```

---

## 🎯 Optimización SEO

### Tags Estratégicos

Los **tags** son críticos para la relevancia de búsqueda. Sigue estas estrategias:

#### 1. Incluir Sinónimos

```typescript
tags: [
    'backup',           // término principal
    'respaldo',         // sinónimo español
    'copia de seguridad', // variación larga
    'data backup'       // variación con data
]
```

#### 2. Incluir Acrónimos

```typescript
tags: [
    'business continuity',
    'BCP',              // acrónimo común
    'disaster recovery',
    'DR',               // acrónimo común
    'DRaaS'             // acrónimo de servicio
]
```

#### 3. Incluir Variaciones de Casing

```typescript
tags: [
    'kubernetes',
    'Kubernetes',
    'K8s',             // acrónimo popular
    'k8s'
]
```

#### 4. Incluir Términos Relacionados

```typescript
// Servicio de Cloud
tags: [
    'cloud',
    'AWS',
    'Amazon Web Services',
    'Azure',
    'Microsoft Azure',
    'GCP',
    'Google Cloud Platform',
    'multi-cloud',
    'hybrid cloud'
]
```

### Content Optimization

El campo `content` debe ser rico en palabras clave **naturales**:

```typescript
// ❌ MAL - Keyword stuffing
content: 'Cloud cloud cloud solutions cloud services cloud migration cloud backup cloud'

// ✅ BIEN - Natural y completo
content: 'Transform your business with our comprehensive cloud solutions. We offer AWS, Azure, and Google Cloud implementations, migrations, and optimization services. Our expert team ensures security, scalability, and cost-effectiveness throughout your cloud journey.'
```

---

## 🧪 Testing

### Test 1: Búsqueda Básica

```bash
# 1. Abrir navegador en http://localhost:4321
# 2. Click en ícono de lupa (header)
# 3. Escribir "status"
# 4. Presionar Enter
# 5. Verificar que aparece "System Status" en resultados
```

### Test 2: Filtros

```bash
# 1. Ir a /search?q=cloud
# 2. Seleccionar filtro "Category: Infrastructure"
# 3. Verificar que solo aparecen items de esa categoría
```

### Test 3: Multi-idioma

```bash
# 1. Ir a /es/search?q=estado
# 2. Verificar que aparece "Estado del Sistema"
# 3. Cambiar a /fr/search?q=état
# 4. Verificar que aparece "État du Système"
```

### Test 4: Quick Searches

```bash
# 1. Abrir SearchModal
# 2. Click en tag "Cloud Solutions"
# 3. Verificar que el query "cloud private public hybrid" se ejecuta
# 4. Verificar que aparecen resultados relevantes de cloud
```

### Test 5: Fuzzy Matching

```bash
# 1. Buscar "kubernetis" (typo intencional)
# 2. Verificar que aparecen resultados de "Kubernetes"
# 3. Buscar "bakcup" (typo intencional)
# 4. Verificar que aparecen resultados de "Backup"
```

---

## 🐛 Troubleshooting

### Problema: "No aparecen resultados"

**Posibles causas:**

1. **Item no agregado en el locale correcto**
   - Verifica que agregaste el item en `searchDataEN/ES/FR` según el idioma
   - Ejemplo: Si buscas en `/es/search`, debe estar en `searchDataES`

2. **Tags incorrectos o faltantes**
   - Agrega más tags con variaciones y sinónimos
   - Ejemplo: `['status', 'estado', 'monitoring', 'uptime', 'health']`

3. **Priority demasiado bajo**
   - Aumenta el `priority` a 7-9 para mejor ranking
   - Items con priority < 5 aparecen más abajo

**Solución:**

```typescript
// Verifica el item
{
    id: 'page-status-es',
    title: 'Estado del Sistema',
    // ... otros campos ...
    tags: ['estado', 'monitoreo', 'disponibilidad', 'uptime', 'health'], // ✅ tags ricos
    locale: 'es', // ✅ locale correcto
    priority: 7   // ✅ priority alta
}
```

### Problema: "Resultados en idioma incorrecto"

**Causa:** Estás buscando en `/search` (inglés) pero el item está en `searchDataES`.

**Solución:**

- Asegúrate de agregar el item en **los 3 arrays de idiomas**
- Cada array debe tener su propia versión traducida

### Problema: "Quick Search no funciona"

**Causa:** No agregaste la quick search en `src/i18n/{locale}.json`

**Solución:**

1. Abre `src/i18n/en.json` (o es/fr)
2. Busca `"search": { "quick_searches": [`
3. Agrega tu nuevo objeto `{ "label": "...", "query": "..." }`
4. Guarda y recarga el navegador

### Problema: "SearchModal muestra claves i18n"

**Causa:** Las traducciones no están cargando correctamente.

**Solución:**

Verifica que `SearchModal.astro` importa los JSON correctamente:

```typescript
import enTranslations from "../i18n/en.json";
import esTranslations from "../i18n/es.json";
import frTranslations from "../i18n/fr.json";

const translations = { en: enTranslations, es: esTranslations, fr: frTranslations };
const quickSearches = translations[locale].search.quick_searches;
```

---

## 📚 Recursos Adicionales

### Documentación Técnica

- **MiniSearch Docs:** https://lucaong.github.io/minisearch/
- **Astro i18n:** https://docs.astro.build/en/guides/internationalization/
- **arquitecture.md:** Ver §8 (User-Friendly Search)

### Archivos Clave

```
src/
├── data/
│   └── searchData.ts           ← AGREGAR CONTENIDO AQUÍ
├── utils/
│   └── searchConfig.ts         ← Lógica de indexación
├── components/
│   ├── SearchModal.astro       ← UI del modal
│   └── SearchPage.astro        ← UI de resultados
└── i18n/
    ├── en.json                 ← AGREGAR QUICK SEARCHES AQUÍ
    ├── es.json
    └── fr.json
```

### Comandos Útiles

```bash
# Ver estructura del índice en consola
# (Agregar console.log en searchConfig.ts)

# Verificar TypeScript
pnpm run astro check

# Build y preview
pnpm run build
pnpm run preview
```

---

## 🎓 Mejores Prácticas

### ✅ DO (Hacer)

- ✅ Agregar items en **los 3 idiomas** (en/es/fr)
- ✅ Usar IDs descriptivos con sufijo de idioma (`-es`, `-fr`)
- ✅ Incluir 5-10 tags con sinónimos y variaciones
- ✅ Escribir content natural y completo (200-500 palabras)
- ✅ Usar priority 7-10 para contenido importante
- ✅ Incluir acrónimos en tags (BCP, DR, K8s, etc.)
- ✅ Probar búsquedas con typos (fuzzy matching)

### ❌ DON'T (Evitar)

- ❌ Duplicar IDs entre items
- ❌ Olvidar agregar traducciones en ES/FR
- ❌ Usar solo 1-2 tags (mínimo 5)
- ❌ Hacer keyword stuffing en content
- ❌ Usar priority < 3 (muy baja relevancia)
- ❌ Hardcodear texto en componentes (usar i18n)
- ❌ Agregar items sin probar búsqueda

---

## 📝 Changelog

### Versión 1.3.2 (Octubre 2025)
- ✨ Agregado sistema de Quick Searches
- ✨ Import directo de JSON para quick_searches
- 🐛 Fix: quick_searches ahora usa import en vez de t()
- 📚 Documentación completa en SEARCH.md

### Versión 1.3.1 (Octubre 2025)
- ✨ Centralización completa de strings en i18n
- ✨ SearchPage con traducciones dinámicas
- 🎨 Filtros, stats y paginación traducidos

### Versión 1.3.0 (Septiembre 2025)
- 🚀 Primera versión del sistema de búsqueda
- ✨ MiniSearch con fuzzy matching
- ✨ Multi-idioma con índices separados
- ✨ SearchModal + SearchPage completos

---

## 🤝 Contribuir

Si encuentras un bug o tienes sugerencias:

1. Abre un issue en GitHub
2. Describe el problema o mejora
3. Incluye ejemplos de búsquedas que no funcionan
4. Proporciona queries de prueba

---

**Mantenido por:** Equipo Ignia Cloud  
**Última actualización:** Octubre 2025

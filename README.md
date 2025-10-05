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

### Fuentes
- **Raleway** (Light/Medium/Regular) - WOFF2 con subset Latin, `font-display: swap`

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

## �📚 Documentación Adicional

### Archivos Clave

- **[`arquitecture.md`](./arquitecture.md)** - Arquitectura completa del proyecto (principios, stack, estructura, guías)
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

## 📄 Licencia

Copyright © 2025 Ignia Cloud. Todos los derechos reservados.

---

## 📞 Contacto

**Ignia Cloud**  
🌐 Website: [https://ignia.cloud](https://ignia.cloud)  
📧 Email: hi@ignia.cloud

---

**Built with ❤️ using Astro + Tailwind CSS + TypeScript**

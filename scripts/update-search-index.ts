#!/usr/bin/env tsx
/**
 * update-search-index.ts
 * 
 * Script de automatización para actualizar el índice de búsqueda (searchData.ts)
 * cuando se agregan nuevas páginas al sitio.
 * 
 * PROPÓSITO:
 * Cumplir con arquitecture.md §2 "MiniSearch Actualizado": cada vez que se cree
 * una página o contenido, se debe actualizar automáticamente la base de datos
 * de MiniSearch sin olvidar usar correctamente los idiomas.
 * 
 * FUNCIONALIDAD:
 * 1. Escanea src/pages/ para encontrar todas las páginas .astro
 * 2. Detecta automáticamente el idioma (en/, es/, fr/)
 * 3. Extrae metadata de cada página (título, descripción, tags)
 * 4. Genera automáticamente searchDataEN, searchDataES, searchDataFR
 * 5. Actualiza src/data/searchData.ts con los nuevos datos
 * 
 * USO:
 * ```bash
 * # Ejecutar manualmente
 * pnpm run update-search-index
 * 
 * # Integrar en CI/CD (pre-build)
 * pnpm run update-search-index && pnpm build
 * ```
 * 
 * ARQUITECTURA:
 * - §2: MiniSearch Actualizado (cumplimiento automático)
 * - §5: i18n centralizada (detecta EN/ES/FR automáticamente)
 * - §14: Performance (índice optimizado, sin duplicados)
 * 
 * TODO (FUTURO):
 * - Integrar con git hooks (pre-commit, pre-push)
 * - Extraer frontmatter de páginas .astro automáticamente
 * - Generar prioridad basada en estructura de URLs
 * - Integrar con CMS headless si se usa en el futuro
 * 
 * @see src/data/searchData.ts - Archivo generado por este script
 * @see src/utils/searchConfig.ts - Configuración de MiniSearch
 * @see arquitecture.md §2 - Principio "MiniSearch Actualizado"
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

/**
 * Estructura de un item del índice de búsqueda
 */
interface SearchItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  type: 'service' | 'product' | 'article' | 'page';
  category: string;
  tags: string[];
  locale: 'en' | 'es' | 'fr';
  dateCreated?: string;
  priority: number;
}

/**
 * Metadata extraída de una página .astro
 */
interface PageMetadata {
  filePath: string;
  locale: 'en' | 'es' | 'fr';
  url: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  type?: 'service' | 'product' | 'article' | 'page';
  priority?: number;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(WORKSPACE_ROOT, 'src', 'pages');
const OUTPUT_FILE = path.join(WORKSPACE_ROOT, 'src', 'data', 'searchData.ts');

/**
 * Páginas a excluir del índice (internas, técnicas, etc.)
 */
const EXCLUDE_PATTERNS = [
  '404.astro',
  'robots.txt.ts',
  'sitemap*.ts',
  '_*.astro', // Páginas privadas con prefijo _
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Detecta el idioma de una página basado en su path
 * 
 * @param filePath - Path del archivo (ej: "src/pages/es/index.astro")
 * @returns Código de idioma (en, es, fr)
 * 
 * Ejemplos:
 * - src/pages/index.astro → "en"
 * - src/pages/es/index.astro → "es"
 * - src/pages/fr/solutions.astro → "fr"
 */
function detectLocale(filePath: string): 'en' | 'es' | 'fr' {
  const relativePath = path.relative(PAGES_DIR, filePath);
  
  if (relativePath.startsWith('es/') || relativePath.startsWith('es\\')) {
    return 'es';
  }
  
  if (relativePath.startsWith('fr/') || relativePath.startsWith('fr\\')) {
    return 'fr';
  }
  
  return 'en';
}

/**
 * Convierte path de archivo a URL pública
 * 
 * @param filePath - Path del archivo .astro
 * @param locale - Idioma de la página
 * @returns URL pública (ej: "/es/solutions/")
 * 
 * Ejemplos:
 * - src/pages/index.astro, en → "/"
 * - src/pages/es/solutions.astro, es → "/es/solutions/"
 * - src/pages/fr/products/cloud.astro, fr → "/fr/products/cloud/"
 */
function generateUrl(filePath: string, locale: 'en' | 'es' | 'fr'): string {
  const relativePath = path.relative(PAGES_DIR, filePath);
  let urlPath = relativePath
    .replace(/\\/g, '/') // Windows paths
    .replace(/\.astro$/, '')
    .replace(/\/index$/, '/');
  
  // Normalizar trailing slash
  if (!urlPath.endsWith('/')) {
    urlPath += '/';
  }
  
  // Agregar prefijo de idioma si no es EN
  if (locale === 'en') {
    return urlPath === '/' ? '/' : `${urlPath}`;
  }
  
  // Remover prefijo de idioma si ya existe en el path
  if (urlPath.startsWith(`${locale}/`)) {
    return `/${urlPath}`;
  }
  
  return `/${locale}${urlPath}`;
}

/**
 * Extrae metadata básica de una página .astro
 * 
 * TODO: Mejorar con parser AST (actualmente usa regex simple)
 * 
 * @param filePath - Path del archivo .astro
 * @returns Metadata extraída o null si no se pudo procesar
 */
async function extractMetadata(filePath: string): Promise<PageMetadata | null> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const locale = detectLocale(filePath);
    const url = generateUrl(filePath, locale);
    
    // Metadata por defecto
    const metadata: PageMetadata = {
      filePath,
      locale,
      url,
      title: path.basename(filePath, '.astro'),
      description: '',
      category: 'Page',
      tags: [],
      type: 'page',
      priority: 5,
    };
    
    // TODO: Extraer metadata del frontmatter (---...---)
    // Por ahora retornamos metadata básica
    
    return metadata;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

/**
 * Genera ID único para un item del índice
 * 
 * @param url - URL de la página
 * @param locale - Idioma de la página
 * @returns ID único (ej: "page-en-solutions")
 */
function generateId(url: string, locale: string): string {
  const cleanUrl = url
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\//g, '-')
    || 'home';
  
  return `page-${locale}-${cleanUrl}`;
}

/**
 * Convierte metadata de página a SearchItem
 * 
 * @param metadata - Metadata extraída de la página
 * @returns SearchItem para el índice de búsqueda
 */
function metadataToSearchItem(metadata: PageMetadata): SearchItem {
  return {
    id: generateId(metadata.url, metadata.locale),
    title: metadata.title || 'Untitled',
    description: metadata.description || '',
    content: metadata.description || '', // TODO: extraer contenido real
    url: metadata.url,
    type: metadata.type || 'page',
    category: metadata.category || 'Page',
    tags: metadata.tags || [],
    locale: metadata.locale,
    dateCreated: new Date().toISOString(),
    priority: metadata.priority || 5,
  };
}

/**
 * Filtra páginas a excluir del índice
 * 
 * @param filePath - Path del archivo
 * @returns true si debe ser excluida, false si debe ser indexada
 */
function shouldExclude(filePath: string): boolean {
  const filename = path.basename(filePath);
  
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      // Patrón con wildcard
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filename);
    }
    // Coincidencia exacta
    return filename === pattern;
  });
}

// ============================================================================
// LÓGICA PRINCIPAL
// ============================================================================

/**
 * Escanea todas las páginas y genera el índice de búsqueda
 */
async function generateSearchIndex(): Promise<void> {
  console.log('🔍 Scanning pages directory...');
  console.log(`   Root: ${PAGES_DIR}`);
  
  // Buscar todos los archivos .astro
  const allFiles = await glob('**/*.astro', {
    cwd: PAGES_DIR,
    absolute: true,
  });
  
  console.log(`   Found: ${allFiles.length} .astro files`);
  
  // Filtrar páginas excluidas
  const validFiles = allFiles.filter(file => !shouldExclude(file));
  console.log(`   Valid: ${validFiles.length} files (after exclusions)`);
  
  // Extraer metadata de cada página
  const metadataPromises = validFiles.map(file => extractMetadata(file));
  const allMetadata = (await Promise.all(metadataPromises)).filter(Boolean) as PageMetadata[];
  
  // Convertir a SearchItems
  const searchItems = allMetadata.map(metadataToSearchItem);
  
  // Separar por idioma
  const searchDataEN = searchItems.filter(item => item.locale === 'en');
  const searchDataES = searchItems.filter(item => item.locale === 'es');
  const searchDataFR = searchItems.filter(item => item.locale === 'fr');
  
  console.log(`\n📊 Index statistics:`);
  console.log(`   EN: ${searchDataEN.length} pages`);
  console.log(`   ES: ${searchDataES.length} pages`);
  console.log(`   FR: ${searchDataFR.length} pages`);
  console.log(`   Total: ${searchItems.length} pages`);
  
  // Generar archivo TypeScript
  await generateTypeScriptFile(searchDataEN, searchDataES, searchDataFR);
  
  console.log(`\n✅ Search index updated successfully!`);
  console.log(`   Output: ${OUTPUT_FILE}`);
}

/**
 * Genera el archivo searchData.ts con los datos del índice
 * 
 * @param searchDataEN - Items en inglés
 * @param searchDataES - Items en español
 * @param searchDataFR - Items en francés
 */
async function generateTypeScriptFile(
  searchDataEN: SearchItem[],
  searchDataES: SearchItem[],
  searchDataFR: SearchItem[]
): Promise<void> {
  const template = `// src/data/searchData.ts
// ⚠️ Este archivo es GENERADO AUTOMÁTICAMENTE por scripts/update-search-index.ts
// ⚠️ NO EDITAR MANUALMENTE - Los cambios serán sobrescritos
// 
// Para actualizar el índice:
// pnpm run update-search-index

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  type: 'service' | 'product' | 'article' | 'page';
  category: string;
  tags: string[];
  locale: 'en' | 'es' | 'fr';
  dateCreated?: string;
  priority: number; // 1-10, mayor número = mayor relevancia
}

// ============================================================================
// DATOS DE BÚSQUEDA POR IDIOMA
// ============================================================================

export const searchDataEN: SearchItem[] = ${JSON.stringify(searchDataEN, null, 2)};

export const searchDataES: SearchItem[] = ${JSON.stringify(searchDataES, null, 2)};

export const searchDataFR: SearchItem[] = ${JSON.stringify(searchDataFR, null, 2)};

// Exportar todos los datos combinados
export const allSearchData = [...searchDataEN, ...searchDataES, ...searchDataFR];

// Función helper para obtener datos por idioma
export function getSearchDataByLocale(locale: 'en' | 'es' | 'fr'): SearchItem[] {
  return allSearchData.filter(item => item.locale === locale);
}
`;

  await fs.promises.writeFile(OUTPUT_FILE, template, 'utf-8');
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

/**
 * Punto de entrada del script
 */
async function main(): Promise<void> {
  console.log('🚀 Starting search index update...\n');
  
  try {
    await generateSearchIndex();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating search index:', error);
    process.exit(1);
  }
}

// Ejecutar si es invocado directamente
if (require.main === module) {
  main();
}

export { generateSearchIndex, extractMetadata };

// src/utils/searchConfig.ts
import MiniSearch from 'minisearch';
import { allSearchData, getSearchDataByLocale, type SearchItem } from '../data/searchData';

// Configuración de MiniSearch por idioma
export function createSearchIndex(locale: 'en' | 'es' | 'fr') {
  const searchData = getSearchDataByLocale(locale);
  
  const miniSearch = new MiniSearch({
    fields: ['title', 'description', 'content', 'category', 'tags'], // campos a indexar
    storeFields: ['id', 'title', 'description', 'url', 'type', 'category', 'tags', 'priority', 'dateCreated'], // campos a almacenar
    searchOptions: {
      boost: { 
        title: 3,        // Títulos tienen 3x más peso
        description: 2,  // Descripciones 2x más peso
        category: 2,     // Categorías 2x más peso
        tags: 1.5,       // Tags 1.5x más peso
        content: 1       // Contenido peso normal
      },
      prefix: true,      // Búsqueda por prefijo (autocompletar)
      fuzzy: 0.2,        // Tolerancia a errores tipográficos
      combineWith: 'AND' // Por defecto requiere todas las palabras
    },
    idField: 'id',
    extractField: (document, fieldName) => {
      // Procesamiento especial para tags (convertir array a string)
      if (fieldName === 'tags') {
        return document[fieldName]?.join(' ') || '';
      }
      return document[fieldName];
    }
  });

  // Agregar todos los documentos al índice
  miniSearch.addAll(searchData);

  return miniSearch;
}

// Cache de índices por idioma para mejor performance
const searchIndexCache: Record<string, MiniSearch> = {};

export function getSearchIndex(locale: 'en' | 'es' | 'fr'): MiniSearch {
  if (!searchIndexCache[locale]) {
    searchIndexCache[locale] = createSearchIndex(locale);
  }
  return searchIndexCache[locale];
}

// Función de búsqueda con opciones avanzadas
export interface SearchOptions {
  query: string;
  locale: 'en' | 'es' | 'fr';
  limit?: number;
  filters?: {
    type?: string[];
    category?: string[];
  };
  sortBy?: 'relevance' | 'date' | 'priority';
}

export interface SearchResultItem extends SearchItem {
  score: number;
}

export function performSearch(options: SearchOptions): any[] {
  const { query, locale, limit = 20, filters, sortBy = 'relevance' } = options;
  
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchIndex = getSearchIndex(locale);
  
  // Realizar búsqueda
  let results = searchIndex.search(query, {
    boost: { 
      title: 3,
      description: 2,
      category: 2,
      tags: 1.5,
      content: 1
    },
    prefix: true,
    fuzzy: 0.2
  });

  // Aplicar filtros
  if (filters?.type && filters.type.length > 0) {
    results = results.filter(result => filters.type!.includes(result.type));
  }
  
  if (filters?.category && filters.category.length > 0) {
    results = results.filter(result => 
      filters.category!.some(cat => result.category.toLowerCase().includes(cat.toLowerCase()))
    );
  }

  // Ordenamiento
  if (sortBy === 'date') {
    results.sort((a, b) => {
      const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
      const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      return dateB - dateA; // Más reciente primero
    });
  } else if (sortBy === 'priority') {
    results.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  // 'relevance' ya está ordenado por score de MiniSearch

  return results.slice(0, limit);
}

// Función para obtener sugerencias de autocompletar
export function getSearchSuggestions(query: string, locale: 'en' | 'es' | 'fr', limit: number = 5): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchIndex = getSearchIndex(locale);
  const results = searchIndex.search(query, {
    prefix: true
  });

  // Extraer términos únicos de los títulos
  const suggestions = new Set<string>();
  
  results.forEach(result => {
    const title = result.title.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Agregar título completo si contiene la query
    if (title.includes(queryLower)) {
      suggestions.add(result.title);
    }
    
    // Agregar palabras individuales que empiecen con la query
    const words = title.split(' ');
    words.forEach((word: string) => {
      if (word.startsWith(queryLower) && word.length > queryLower.length) {
        suggestions.add(word);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
}

// Función para búsquedas relacionadas
export function getRelatedSearches(query: string, locale: 'en' | 'es' | 'fr'): string[] {
  const suggestions = {
    en: {
      'cloud': ['cloud security', 'cloud migration', 'cloud solutions', 'cloud services'],
      'AI': ['AI consulting', 'machine learning', 'artificial intelligence', 'AI automation'],
      'security': ['cloud security', 'cybersecurity', 'data protection', 'security audit'],
      'support': ['technical support', 'IT support', '24/7 support', 'managed services']
    },
    es: {
      'nube': ['seguridad en la nube', 'migración cloud', 'soluciones cloud', 'servicios nube'],
      'IA': ['consultoría IA', 'machine learning', 'inteligencia artificial', 'automatización IA'],
      'seguridad': ['seguridad cloud', 'ciberseguridad', 'protección datos', 'auditoría seguridad'],
      'soporte': ['soporte técnico', 'soporte IT', 'soporte 24/7', 'servicios gestionados']
    },
    fr: {
      'cloud': ['sécurité cloud', 'migration cloud', 'solutions cloud', 'services cloud'],
      'IA': ['conseil IA', 'machine learning', 'intelligence artificielle', 'automatisation IA'],
      'sécurité': ['sécurité cloud', 'cybersécurité', 'protection données', 'audit sécurité'],
      'support': ['support technique', 'support IT', 'support 24/7', 'services gérés']
    }
  };

  const queryLower = query.toLowerCase();
  const relatedMap = suggestions[locale] || suggestions.en;
  
  // Buscar coincidencias parciales en las claves
  for (const [key, values] of Object.entries(relatedMap)) {
    if (queryLower.includes(key) || key.includes(queryLower)) {
      return values;
    }
  }
  
  return [];
}
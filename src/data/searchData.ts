// src/data/searchData.ts
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

// Datos de ejemplo multiidioma
export const searchDataEN: SearchItem[] = [
    // Servicios principales
    {
        id: 'service-cloud-solutions',
        title: 'Cloud Solutions',
        description: 'Complete cloud infrastructure solutions for modern enterprises',
        content: 'Transform your business with our comprehensive cloud solutions. We offer AWS, Azure, and Google Cloud implementations, migrations, and optimization services. Our expert team ensures security, scalability, and cost-effectiveness.',
        url: '/soluciones/',
        type: 'service',
        category: 'Cloud Solutions',
        tags: ['cloud', 'AWS', 'Azure', 'Google Cloud', 'migration', 'infrastructure'],
        locale: 'en',
        priority: 10
    },
    {
        id: 'service-ai-consulting',
        title: 'Artificial Intelligence Consulting',
        description: 'AI strategy and implementation services to revolutionize your business',
        content: 'Leverage the power of artificial intelligence with our consulting services. Machine learning, natural language processing, computer vision, and automation solutions tailored to your industry needs.',
        url: '/IA/',
        type: 'service',
        category: 'Artificial Intelligence',
        tags: ['AI', 'machine learning', 'automation', 'consulting', 'ML', 'artificial intelligence'],
        locale: 'en',
        priority: 9
    },
    {
        id: 'service-managed-it',
        title: 'Managed IT Services',
        description: '24/7 IT support and infrastructure management',
        content: 'Focus on your business while we handle your IT. Complete managed services including monitoring, maintenance, security, backup, and technical support with guaranteed SLAs.',
        url: '/Managed-IT/',
        type: 'service',
        category: 'IT Support',
        tags: ['managed IT', 'support', '24/7', 'monitoring', 'maintenance', 'SLA'],
        locale: 'en',
        priority: 8
    },
    // Productos
    {
        id: 'product-cloud-platform',
        title: 'Ignia Cloud Platform',
        description: 'Integrated cloud management platform',
        content: 'Our proprietary platform for managing multi-cloud environments. Dashboard, monitoring, cost optimization, and automation tools in one unified interface.',
        url: '/productos/',
        type: 'product',
        category: 'Platform',
        tags: ['platform', 'multi-cloud', 'dashboard', 'monitoring', 'automation'],
        locale: 'en',
        priority: 8
    },
    // Artículos/Blog
    {
        id: 'article-ai-trends-2024',
        title: 'AI Trends Transforming Businesses in 2024',
        description: 'Discover how artificial intelligence is revolutionizing enterprise operations',
        content: 'Artificial intelligence continues to reshape business landscapes. From predictive analytics to automated customer service, explore the key AI trends driving digital transformation in 2024.',
        url: '/blog/ai-trends-2024/',
        type: 'article',
        category: 'AI Insights',
        tags: ['AI trends', '2024', 'digital transformation', 'predictive analytics', 'automation'],
        locale: 'en',
        dateCreated: '2024-01-15',
        priority: 7
    },
    {
        id: 'article-cloud-security',
        title: 'Essential Cloud Security Best Practices',
        description: 'Comprehensive guide to securing your cloud infrastructure',
        content: 'Cloud security is paramount for modern businesses. Learn essential practices including identity management, encryption, network security, and compliance frameworks.',
        url: '/blog/cloud-security-guide/',
        type: 'article',
        category: 'Security',
        tags: ['cloud security', 'best practices', 'encryption', 'compliance', 'identity management'],
        locale: 'en',
        dateCreated: '2024-02-01',
        priority: 8
    }
];

export const searchDataES: SearchItem[] = [
    // Servicios principales
    {
        id: 'service-cloud-solutions-es',
        title: 'Soluciones en la Nube',
        description: 'Soluciones completas de infraestructura cloud para empresas modernas',
        content: 'Transforma tu negocio con nuestras soluciones integrales en la nube. Ofrecemos implementaciones, migraciones y servicios de optimización en AWS, Azure y Google Cloud. Nuestro equipo experto garantiza seguridad, escalabilidad y eficiencia de costos.',
        url: '/es/soluciones/',
        type: 'service',
        category: 'Soluciones Cloud',
        tags: ['nube', 'AWS', 'Azure', 'Google Cloud', 'migración', 'infraestructura'],
        locale: 'es',
        priority: 10
    },
    {
        id: 'service-ai-consulting-es',
        title: 'Consultoría en Inteligencia Artificial',
        description: 'Servicios de estrategia e implementación de IA para revolucionar tu negocio',
        content: 'Aprovecha el poder de la inteligencia artificial con nuestros servicios de consultoría. Machine learning, procesamiento de lenguaje natural, visión por computadora y soluciones de automatización adaptadas a tu industria.',
        url: '/es/IA/',
        type: 'service',
        category: 'Inteligencia Artificial',
        tags: ['IA', 'machine learning', 'automatización', 'consultoría', 'inteligencia artificial'],
        locale: 'es',
        priority: 9
    },
    {
        id: 'service-managed-it-es',
        title: 'Servicios de IT Gestionado',
        description: 'Soporte IT 24/7 y gestión de infraestructura',
        content: 'Enfócate en tu negocio mientras nosotros nos encargamos de tu IT. Servicios completamente gestionados incluyendo monitoreo, mantenimiento, seguridad, respaldo y soporte técnico con SLAs garantizados.',
        url: '/es/Managed-IT/',
        type: 'service',
        category: 'Soporte IT',
        tags: ['IT gestionado', 'soporte', '24/7', 'monitoreo', 'mantenimiento', 'SLA'],
        locale: 'es',
        priority: 8
    },
    // Artículos
    {
        id: 'article-ai-trends-2024-es',
        title: 'Tendencias de IA que Transforman Empresas en 2024',
        description: 'Descubre cómo la inteligencia artificial está revolucionando las operaciones empresariales',
        content: 'La inteligencia artificial continúa transformando el panorama empresarial. Desde analítica predictiva hasta atención al cliente automatizada, explora las tendencias clave de IA que impulsan la transformación digital en 2024.',
        url: '/es/blog/tendencias-ia-2024/',
        type: 'article',
        category: 'Perspectivas IA',
        tags: ['tendencias IA', '2024', 'transformación digital', 'analítica predictiva', 'automatización'],
        locale: 'es',
        dateCreated: '2024-01-15',
        priority: 7
    }
];


export const searchDataFR: SearchItem[] = [
    // Servicios principales
    {
        id: 'service-cloud-solutions-fr',
        title: 'Solutions Cloud',
        description: 'Solutions complètes d\'infrastructure cloud pour les entreprises modernes',
        content: 'Transformez votre entreprise avec nos solutions cloud complètes. Nous offrons des implémentations AWS, Azure et Google Cloud, des migrations et des services d\'optimisation. Notre équipe experte assure sécurité, évolutivité et efficacité des coûts.',
        url: '/fr/soluciones/',
        type: 'service',
        category: 'Solutions Cloud',
        tags: ['cloud', 'AWS', 'Azure', 'Google Cloud', 'migration', 'infrastructure'],
        locale: 'fr',
        priority: 10
    },
    {
        id: 'service-ai-consulting-fr',
        title: 'Conseil en Intelligence Artificielle',
        description: 'Services de stratégie et implémentation IA pour révolutionner votre entreprise',
        content: 'Exploitez la puissance de l\'intelligence artificielle avec nos services de conseil. Machine learning, traitement du langage naturel, vision par ordinateur et solutions d\'automatisation adaptées à votre secteur.',
        url: '/fr/IA/',
        type: 'service',
        category: 'Intelligence Artificielle',
        tags: ['IA', 'machine learning', 'automatisation', 'conseil', 'intelligence artificielle'],
        locale: 'fr',
        priority: 9
    }
];

// Exportar todos los datos combinados
export const allSearchData = [...searchDataEN, ...searchDataES, ...searchDataFR];

// Función helper para obtener datos por idioma
export function getSearchDataByLocale(locale: 'en' | 'es' | 'fr'): SearchItem[] {
    return allSearchData.filter(item => item.locale === locale);
}
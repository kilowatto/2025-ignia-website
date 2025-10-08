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
    // Página principal (Home)
    {
        id: 'page-home',
        title: 'Home | Ignia Cloud',
        description: 'Enterprise cloud with transparent pricing and 24/7 human support',
        content: 'Transform your business with Ignia Cloud. Enterprise performance, built-in anti-DDoS security, frictionless multicloud operation. Virtual Machines, Kubernetes, Object Storage, Load Balancers, Cloud Firewall, Backup as a Service. AI and LLMs ready for production with GPUs and private model hosting. BCP/DRaaS with RTO <15 minutes, Kubernetes DevOps with CI/CD pipelines, Compliance Fintech with WORM logging, Regulatory Backup with 7-10 year retention. Connect Azure, Google Cloud, and on-premise infrastructure. ISO 27001, SOC 2, PCI DSS, GDPR compliance. 99.99% uptime SLA with 24/7 human support in Spanish.',
        url: '/',
        type: 'page',
        category: 'Main',
        tags: [
            'home', 'inicio', 'main page', 'landing',
            'cloud', 'enterprise cloud', 'cloud computing',
            'pricing', 'transparent pricing', 'cost calculator',
            'kubernetes', 'k8s', 'containers', 'docker',
            'VM', 'virtual machines', 'compute',
            'storage', 'object storage', 'S3', 'block storage',
            'AI', 'artificial intelligence', 'LLM', 'machine learning', 'ML', 'GPU',
            'multicloud', 'multi-cloud', 'hybrid cloud', 'Azure', 'GCP', 'AWS',
            'backup', 'disaster recovery', 'DR', 'BCP', 'DRaaS',
            'compliance', 'ISO 27001', 'SOC 2', 'PCI DSS', 'GDPR', 'CNBV',
            'support', '24/7', 'human support', 'soporte humano',
            'SLA', 'uptime', '99.99%', 'availability',
            'security', 'firewall', 'DDoS', 'anti-DDoS', 'WAF',
            'DevOps', 'CI/CD', 'GitOps', 'observability',
            'fintech', 'retail', 'media', 'use cases'
        ],
        locale: 'en',
        priority: 10
    },
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
    // Páginas informativas
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
    {
        id: 'page-contact',
        title: 'Contact Us',
        description: 'Get in touch with our team',
        content: 'Contact Ignia Cloud for inquiries, support, or partnership opportunities. Fill out our contact form and our team will respond within 24 hours.',
        url: '/#contact',
        type: 'page',
        category: 'Support',
        tags: ['contact', 'support', 'help', 'inquiry', 'sales'],
        locale: 'en',
        priority: 6
    },

];

export const searchDataES: SearchItem[] = [
    // Página principal (Home)
    {
        id: 'page-home-es',
        title: 'Inicio | Ignia Cloud',
        description: 'Nube empresarial con precios transparentes y soporte humano 24/7',
        content: 'Transforma tu negocio con Ignia Cloud. Rendimiento empresarial, seguridad anti-DDoS incluida, operación multinube sin fricciones. Máquinas Virtuales, Kubernetes, Almacenamiento de Objetos, Balanceadores de Carga, Firewall en la Nube, Backup como Servicio. IA y LLMs listos para producción con GPUs y hosting de modelos privados. BCP/DRaaS con RTO <15 minutos, Kubernetes DevOps con pipelines CI/CD, Compliance Fintech con logging WORM, Backup Regulatorio con retención 7-10 años. Conecta Azure, Google Cloud e infraestructura on-premise. Cumplimiento ISO 27001, SOC 2, PCI DSS, GDPR. SLA 99.99% de disponibilidad con soporte humano 24/7 en español.',
        url: '/es/',
        type: 'page',
        category: 'Principal',
        tags: [
            'inicio', 'home', 'página principal', 'landing',
            'nube', 'nube empresarial', 'computación en la nube',
            'precios', 'precios transparentes', 'calculadora de costos',
            'kubernetes', 'k8s', 'contenedores', 'docker',
            'VM', 'máquinas virtuales', 'cómputo',
            'almacenamiento', 'almacenamiento de objetos', 'S3', 'almacenamiento de bloques',
            'IA', 'inteligencia artificial', 'LLM', 'machine learning', 'ML', 'GPU',
            'multinube', 'multi-nube', 'nube híbrida', 'Azure', 'GCP', 'AWS',
            'backup', 'recuperación de desastres', 'DR', 'BCP', 'DRaaS',
            'cumplimiento', 'ISO 27001', 'SOC 2', 'PCI DSS', 'GDPR', 'CNBV',
            'soporte', '24/7', 'soporte humano', 'atención al cliente',
            'SLA', 'disponibilidad', '99.99%', 'uptime',
            'seguridad', 'firewall', 'DDoS', 'anti-DDoS', 'WAF',
            'DevOps', 'CI/CD', 'GitOps', 'observabilidad',
            'fintech', 'retail', 'medios', 'casos de uso'
        ],
        locale: 'es',
        priority: 10
    },
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
    // Páginas informativas
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
    {
        id: 'page-contact-es',
        title: 'Contáctanos',
        description: 'Ponte en contacto con nuestro equipo',
        content: 'Contacta a Ignia Cloud para consultas, soporte u oportunidades de asociación. Completa nuestro formulario de contacto y nuestro equipo te responderá en 24 horas.',
        url: '/es/#contact',
        type: 'page',
        category: 'Soporte',
        tags: ['contacto', 'soporte', 'ayuda', 'consulta', 'ventas'],
        locale: 'es',
        priority: 6
    },

];


export const searchDataFR: SearchItem[] = [
    // Página principal (Home)
    {
        id: 'page-home-fr',
        title: 'Accueil | Ignia Cloud',
        description: 'Cloud d\'entreprise avec tarification transparente et support humain 24/7',
        content: 'Transformez votre entreprise avec Ignia Cloud. Performance d\'entreprise, sécurité anti-DDoS intégrée, opération multicloud sans friction. Machines Virtuelles, Kubernetes, Stockage d\'Objets, Équilibreurs de Charge, Pare-feu Cloud, Sauvegarde en tant que Service. IA et LLMs prêts pour la production avec GPUs et hébergement de modèles privés. BCP/DRaaS avec RTO <15 minutes, Kubernetes DevOps avec pipelines CI/CD, Conformité Fintech avec journalisation WORM, Sauvegarde Réglementaire avec rétention 7-10 ans. Connectez Azure, Google Cloud et infrastructure sur site. Conformité ISO 27001, SOC 2, PCI DSS, RGPD. SLA 99,99% de disponibilité avec support humain 24/7.',
        url: '/fr/',
        type: 'page',
        category: 'Principal',
        tags: [
            'accueil', 'home', 'page principale', 'landing',
            'cloud', 'cloud d\'entreprise', 'informatique en nuage',
            'tarification', 'tarification transparente', 'calculateur de coûts',
            'kubernetes', 'k8s', 'conteneurs', 'docker',
            'VM', 'machines virtuelles', 'calcul',
            'stockage', 'stockage d\'objets', 'S3', 'stockage de blocs',
            'IA', 'intelligence artificielle', 'LLM', 'machine learning', 'ML', 'GPU',
            'multicloud', 'multi-cloud', 'cloud hybride', 'Azure', 'GCP', 'AWS',
            'sauvegarde', 'reprise après sinistre', 'DR', 'BCP', 'DRaaS',
            'conformité', 'ISO 27001', 'SOC 2', 'PCI DSS', 'RGPD', 'CNBV',
            'support', '24/7', 'support humain', 'service client',
            'SLA', 'disponibilité', '99,99%', 'uptime',
            'sécurité', 'pare-feu', 'DDoS', 'anti-DDoS', 'WAF',
            'DevOps', 'CI/CD', 'GitOps', 'observabilité',
            'fintech', 'retail', 'médias', 'cas d\'usage'
        ],
        locale: 'fr',
        priority: 10
    },
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
    },
    // Páginas informativas
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
    {
        id: 'page-contact-fr',
        title: 'Contactez-nous',
        description: 'Contactez notre équipe',
        content: 'Contactez Ignia Cloud pour des demandes de renseignements, du support ou des opportunités de partenariat. Remplissez notre formulaire de contact et notre équipe répondra dans les 24 heures.',
        url: '/fr/#contact',
        type: 'page',
        category: 'Support',
        tags: ['contact', 'support', 'aide', 'demande', 'ventes'],
        locale: 'fr',
        priority: 6
    }
];

// Exportar todos los datos combinados
export const allSearchData = [...searchDataEN, ...searchDataES, ...searchDataFR];

// Función helper para obtener datos por idioma
export function getSearchDataByLocale(locale: 'en' | 'es' | 'fr'): SearchItem[] {
    return allSearchData.filter(item => item.locale === locale);
}
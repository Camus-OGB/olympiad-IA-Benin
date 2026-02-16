/**
 * API Content — mappée sur les endpoints backend /api/v1/content/*
 * Gère: News, FAQ, Editions, Éditions passées, Partenaires, Pages
 * La conversion snake_case ↔ camelCase est automatique via les intercepteurs du client
 */
import apiClient from './client'

// ==================== NEWS / ACTUALITÉS ====================

export interface NewsItem {
    id: string
    title: string
    content: string
    excerpt?: string
    imageUrl?: string
    author?: string
    category?: string
    isPublished: boolean
    publishedAt?: string
    createdAt: string
    updatedAt: string
}

export interface NewsCreate {
    title: string
    content: string
    excerpt?: string
    imageUrl?: string
    category?: string
    isPublished?: boolean
}

export interface NewsUpdate {
    title?: string
    content?: string
    excerpt?: string
    imageUrl?: string
    category?: string
    isPublished?: boolean
}

// ==================== FAQ ====================

export interface FAQItem {
    id: string
    question: string
    answer: string
    category?: string
    order: number
    isPublished: boolean
    createdAt: string
}

export interface FAQCreate {
    question: string
    answer: string
    category?: string
    order?: number
    isPublished?: boolean
}

export interface FAQUpdate {
    question?: string
    answer?: string
    category?: string
    order?: number
    isPublished?: boolean
}

// ==================== EDITIONS ====================

export interface TimelinePhase {
    id: string
    phaseOrder: number
    title: string
    description?: string
    startDate?: string
    endDate?: string
    isCurrent: boolean
}

export interface CalendarEvent {
    id: string
    title: string
    description?: string
    eventDate: string
    eventType?: string
}

export interface SelectionCriterion {
    id: string
    stage: string
    stageOrder: number
    criterion: string
    minScore?: number
}

export interface EditionPartner {
    id: string
    partnerId: string
    role?: string
    contribution?: string
}

export interface Edition {
    id: string
    year: number
    isActive: boolean
    title: string
    description?: string
    timelinePhases: TimelinePhase[]
    calendarEvents: CalendarEvent[]
    selectionCriteria: SelectionCriterion[]
    editionPartners: EditionPartner[]
    createdAt: string
}

export interface EditionCreate {
    year: number
    isActive?: boolean
    title: string
    description?: string
}

export interface EditionUpdate {
    year?: number
    isActive?: boolean
    title?: string
    description?: string
}

// ==================== ÉDITIONS PASSÉES ====================

export interface PastTimelinePhase {
    id: string
    phaseOrder: number
    title: string
    description?: string
    date?: string
}

export interface GalleryImage {
    id: string
    imageUrl: string
    caption?: string
    order: number
}

export interface Testimonial {
    id: string
    authorName: string
    authorRole?: string
    content: string
    videoUrl?: string
    photoUrl?: string
}

export interface Achievement {
    id: string
    title: string
    description?: string
    category?: string
    rank?: number
}

export interface PressRelease {
    id: string
    title: string
    source?: string
    url?: string
    publishedAt?: string
}

export interface EditionStat {
    id: string
    metricName: string
    metricValue: number
    metricUnit?: string
}

export interface PastEdition {
    id: string
    year: number
    hostCountry?: string
    numStudents?: number
    pastTimelinePhases: PastTimelinePhase[]
    galleryImages: GalleryImage[]
    testimonials: Testimonial[]
    achievements: Achievement[]
    pressReleases: PressRelease[]
    editionStats: EditionStat[]
    createdAt: string
}

export interface PastEditionCreate {
    year: number
    hostCountry?: string
    numStudents?: number
}

export interface PastEditionUpdate {
    year?: number
    hostCountry?: string
    numStudents?: number
}

// ==================== PARTENAIRES ====================

export interface Partner {
    id: string
    name: string
    logoUrl?: string
    description?: string
    websiteUrl?: string
    order: number
    isActive: boolean
}

export interface PartnerCreate {
    name: string
    logoUrl?: string
    description?: string
    websiteUrl?: string
    order?: number
    isActive?: boolean
}

export interface PartnerUpdate {
    name?: string
    logoUrl?: string
    description?: string
    websiteUrl?: string
    order?: number
    isActive?: boolean
}

// ==================== PAGES ====================

export interface Page {
    id: string
    slug: string
    title: string
    content?: string
    metaData?: Record<string, any>
    isPublished: boolean
    createdAt: string
}

export interface PageCreate {
    slug: string
    title: string
    content?: string
    metaData?: Record<string, any>
    isPublished?: boolean
}

export interface PageUpdate {
    slug?: string
    title?: string
    content?: string
    metaData?: Record<string, any>
    isPublished?: boolean
}

// ==================== API CALLS ====================

export const contentApi = {
    // ==================== NEWS ====================

    /**
     * Liste des actualités
     * GET /content/news
     */
    getNews: async (params?: {
        skip?: number
        limit?: number
        publishedOnly?: boolean
    }): Promise<NewsItem[]> => {
        const { data } = await apiClient.get('/content/news', { params })
        return data
    },

    /**
     * Détails d'une actualité
     * GET /content/news/:newsId
     */
    getNewsItem: async (newsId: string): Promise<NewsItem> => {
        const { data } = await apiClient.get(`/content/news/${newsId}`)
        return data
    },

    /**
     * Créer une actualité (Admin)
     * POST /content/news
     */
    createNews: async (newsData: NewsCreate): Promise<NewsItem> => {
        const { data } = await apiClient.post('/content/news', newsData)
        return data
    },

    /**
     * Mettre à jour une actualité (Admin)
     * PUT /content/news/:newsId
     */
    updateNews: async (newsId: string, newsData: NewsUpdate): Promise<NewsItem> => {
        const { data } = await apiClient.put(`/content/news/${newsId}`, newsData)
        return data
    },

    /**
     * Supprimer une actualité (Admin)
     * DELETE /content/news/:newsId
     */
    deleteNews: async (newsId: string): Promise<void> => {
        await apiClient.delete(`/content/news/${newsId}`)
    },

    // ==================== FAQ ====================

    /**
     * Liste des FAQ
     * GET /content/faq
     */
    getFAQ: async (params?: {
        category?: string
        publishedOnly?: boolean
    }): Promise<FAQItem[]> => {
        const { data } = await apiClient.get('/content/faq', { params })
        return data
    },

    /**
     * Créer une FAQ (Admin)
     * POST /content/faq
     */
    createFAQ: async (faqData: FAQCreate): Promise<FAQItem> => {
        const { data } = await apiClient.post('/content/faq', faqData)
        return data
    },

    /**
     * Mettre à jour une FAQ (Admin)
     * PUT /content/faq/:faqId
     */
    updateFAQ: async (faqId: string, faqData: FAQUpdate): Promise<FAQItem> => {
        const { data } = await apiClient.put(`/content/faq/${faqId}`, faqData)
        return data
    },

    /**
     * Supprimer une FAQ (Admin)
     * DELETE /content/faq/:faqId
     */
    deleteFAQ: async (faqId: string): Promise<void> => {
        await apiClient.delete(`/content/faq/${faqId}`)
    },

    // ==================== EDITIONS ====================

    /**
     * Récupérer l'édition active
     * GET /content/editions/active
     */
    getActiveEdition: async (): Promise<Edition | null> => {
        const { data } = await apiClient.get('/content/editions/active')
        return data
    },

    /**
     * Liste de toutes les éditions
     * GET /content/editions
     */
    getEditions: async (params?: {
        skip?: number
        limit?: number
    }): Promise<Edition[]> => {
        const { data } = await apiClient.get('/content/editions', { params })
        return data
    },

    /**
     * Détails d'une édition
     * GET /content/editions/:editionId
     */
    getEdition: async (editionId: string): Promise<Edition> => {
        const { data } = await apiClient.get(`/content/editions/${editionId}`)
        return data
    },

    /**
     * Créer une édition (Admin)
     * POST /content/editions
     */
    createEdition: async (editionData: EditionCreate): Promise<Edition> => {
        const { data } = await apiClient.post('/content/editions', editionData)
        return data
    },

    /**
     * Mettre à jour une édition (Admin)
     * PUT /content/editions/:editionId
     */
    updateEdition: async (editionId: string, editionData: EditionUpdate): Promise<Edition> => {
        const { data } = await apiClient.put(`/content/editions/${editionId}`, editionData)
        return data
    },

    // ==================== ÉDITIONS PASSÉES ====================

    /**
     * Liste des éditions passées
     * GET /content/past-editions
     */
    getPastEditions: async (): Promise<PastEdition[]> => {
        const { data } = await apiClient.get('/content/past-editions')
        return data
    },

    /**
     * Détails d'une édition passée
     * GET /content/past-editions/:editionId
     */
    getPastEdition: async (editionId: string): Promise<PastEdition> => {
        const { data } = await apiClient.get(`/content/past-editions/${editionId}`)
        return data
    },

    /**
     * Créer une édition passée (Admin)
     * POST /content/past-editions
     */
    createPastEdition: async (editionData: PastEditionCreate): Promise<PastEdition> => {
        const { data } = await apiClient.post('/content/past-editions', editionData)
        return data
    },

    /**
     * Mettre à jour une édition passée (Admin)
     * PUT /content/past-editions/:editionId
     */
    updatePastEdition: async (editionId: string, editionData: PastEditionUpdate): Promise<PastEdition> => {
        const { data } = await apiClient.put(`/content/past-editions/${editionId}`, editionData)
        return data
    },

    // ==================== PARTENAIRES ====================

    /**
     * Liste des partenaires
     * GET /content/partners
     */
    getPartners: async (params?: {
        activeOnly?: boolean
    }): Promise<Partner[]> => {
        const { data } = await apiClient.get('/content/partners', { params })
        return data
    },

    /**
     * Créer un partenaire (Admin)
     * POST /content/partners
     */
    createPartner: async (partnerData: PartnerCreate): Promise<Partner> => {
        const { data } = await apiClient.post('/content/partners', partnerData)
        return data
    },

    /**
     * Mettre à jour un partenaire (Admin)
     * PUT /content/partners/:partnerId
     */
    updatePartner: async (partnerId: string, partnerData: PartnerUpdate): Promise<Partner> => {
        const { data } = await apiClient.put(`/content/partners/${partnerId}`, partnerData)
        return data
    },

    /**
     * Supprimer un partenaire (Admin)
     * DELETE /content/partners/:partnerId
     */
    deletePartner: async (partnerId: string): Promise<void> => {
        await apiClient.delete(`/content/partners/${partnerId}`)
    },

    // ==================== PAGES ====================

    /**
     * Récupérer une page par slug
     * GET /content/pages/:slug
     */
    getPageBySlug: async (slug: string): Promise<Page> => {
        const { data } = await apiClient.get(`/content/pages/${slug}`)
        return data
    },

    /**
     * Liste de toutes les pages
     * GET /content/pages
     */
    getPages: async (params?: {
        publishedOnly?: boolean
    }): Promise<Page[]> => {
        const { data } = await apiClient.get('/content/pages', { params })
        return data
    },

    /**
     * Créer une page (Admin)
     * POST /content/pages
     */
    createPage: async (pageData: PageCreate): Promise<Page> => {
        const { data } = await apiClient.post('/content/pages', pageData)
        return data
    },

    /**
     * Mettre à jour une page (Admin)
     * PUT /content/pages/:pageId
     */
    updatePage: async (pageId: string, pageData: PageUpdate): Promise<Page> => {
        const { data } = await apiClient.put(`/content/pages/${pageId}`, pageData)
        return data
    },

    /**
     * Supprimer une page (Admin)
     * DELETE /content/pages/:pageId
     */
    deletePage: async (pageId: string): Promise<void> => {
        await apiClient.delete(`/content/pages/${pageId}`)
    },
}

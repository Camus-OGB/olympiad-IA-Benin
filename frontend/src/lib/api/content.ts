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
    externalUrl?: string  // Lien vers l'article original
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
    externalUrl?: string  // Lien vers l'article original
}

export interface NewsUpdate {
    title?: string
    content?: string
    excerpt?: string
    imageUrl?: string
    category?: string
    isPublished?: boolean
    externalUrl?: string  // Lien vers l'article original
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

export interface TimelinePhaseCreate {
    phaseOrder: number
    title: string
    description?: string
    startDate?: string
    endDate?: string
    isCurrent?: boolean
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
    studentName: string
    school?: string
    role?: string
    quote: string
    imageUrl?: string
    pastEditionId?: string
}

// ==================== GENERAL TESTIMONIALS ====================

export interface GeneralTestimonial {
    id: string
    authorName: string
    authorRole?: string
    authorType?: string  // "mentor", "parent", "sponsor", "partner"
    content: string
    photoUrl?: string
    videoUrl?: string
    organization?: string
    displayOrder?: number
    isPublished: boolean
}

export interface GeneralTestimonialCreate {
    authorName: string
    authorRole?: string
    authorType?: string
    content: string
    photoUrl?: string
    videoUrl?: string
    organization?: string
    displayOrder?: number
    isPublished?: boolean
}

export interface GeneralTestimonialUpdate {
    authorName?: string
    authorRole?: string
    authorType?: string
    content?: string
    photoUrl?: string
    videoUrl?: string
    organization?: string
    displayOrder?: number
    isPublished?: boolean
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

// ==================== NEXT DEADLINE ====================

export interface NextDeadline {
    phaseTitle: string
    phaseDescription?: string
    targetDate: string
    targetType: 'start' | 'end'
    currentPhase?: {
        title: string
        isActive: boolean
        startDate?: string
        endDate?: string
    }
    editionYear: number
}

// ==================== PUBLIC STATS ====================

export interface PublicStats {
    totalCandidates: number
    verifiedCandidates: number
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
     * Récupérer la prochaine deadline pour le compte à rebours
     * GET /content/editions/active/next-deadline
     */
    getNextDeadline: async (): Promise<NextDeadline | null> => {
        const { data } = await apiClient.get('/content/editions/active/next-deadline')
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

    // ==================== PHASES D'ÉDITION ====================

    /**
     * Créer une phase pour une édition (Admin)
     * POST /content/editions/:editionId/phases
     */
    createEditionPhase: async (editionId: string, phaseData: TimelinePhaseCreate): Promise<TimelinePhase> => {
        const { data } = await apiClient.post(`/content/editions/${editionId}/phases`, phaseData)
        return data
    },

    /**
     * Mettre à jour une phase (Admin)
     * PUT /content/editions/:editionId/phases/:phaseId
     */
    updateEditionPhase: async (editionId: string, phaseId: string, phaseData: TimelinePhaseCreate): Promise<TimelinePhase> => {
        const { data } = await apiClient.put(`/content/editions/${editionId}/phases/${phaseId}`, phaseData)
        return data
    },

    /**
     * Supprimer une phase (Admin)
     * DELETE /content/editions/:editionId/phases/:phaseId
     */
    deleteEditionPhase: async (editionId: string, phaseId: string): Promise<void> => {
        await apiClient.delete(`/content/editions/${editionId}/phases/${phaseId}`)
    },

    // ==================== CRITÈRES DE SÉLECTION ====================

    /**
     * Ajouter un critère de sélection (Admin)
     * POST /content/editions/:editionId/criteria
     */
    createEditionCriterion: async (editionId: string, criterionData: {
        stage: string
        stageOrder: number
        criterion: string
        minScore?: number
    }): Promise<SelectionCriterion> => {
        const { data } = await apiClient.post(`/content/editions/${editionId}/criteria`, criterionData)
        return data
    },

    /**
     * Mettre à jour un critère (Admin)
     * PUT /content/editions/:editionId/criteria/:criterionId
     */
    updateEditionCriterion: async (editionId: string, criterionId: string, criterionData: {
        stage: string
        stageOrder: number
        criterion: string
        minScore?: number
    }): Promise<SelectionCriterion> => {
        const { data } = await apiClient.put(`/content/editions/${editionId}/criteria/${criterionId}`, criterionData)
        return data
    },

    /**
     * Supprimer un critère (Admin)
     * DELETE /content/editions/:editionId/criteria/:criterionId
     */
    deleteEditionCriterion: async (editionId: string, criterionId: string): Promise<void> => {
        await apiClient.delete(`/content/editions/${editionId}/criteria/${criterionId}`)
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

    /**
     * Récupérer les témoignages de l'édition la plus récente
     * Affiche automatiquement les témoignages de la dernière édition sur la page d'accueil
     */
    /**
     * Récupérer tous les témoignages généraux pour la page d'accueil
     * Utilise les témoignages généraux (mentors, parents, sponsors, etc.)
     */
    getAllTestimonials: async (): Promise<GeneralTestimonial[]> => {
        return contentApi.getGeneralTestimonials(true)
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

    // ==================== STATS PUBLIQUES ====================

    /**
     * Récupérer les statistiques publiques pour le site vitrine
     * GET /content/public-stats
     */
    getPublicStats: async (): Promise<PublicStats> => {
        const { data } = await apiClient.get('/content/public-stats')
        return data
    },

    // ==================== PAST EDITION TIMELINE PHASES ====================

    /**
     * Créer une phase de timeline pour une édition passée (Admin)
     * POST /content/past-editions/:editionId/timeline
     */
    createTimelinePhase: async (editionId: string, phaseData: {
        phaseOrder: number;
        title: string;
        description?: string;
        date?: string;
    }): Promise<PastTimelinePhase> => {
        const { data } = await apiClient.post(`/content/past-editions/${editionId}/timeline`, phaseData)
        return data
    },

    /**
     * Mettre à jour une phase de timeline (Admin)
     * PUT /content/past-editions/:editionId/timeline/:phaseId
     */
    updateTimelinePhase: async (editionId: string, phaseId: string, phaseData: {
        phaseOrder: number;
        title: string;
        description?: string;
        date?: string;
    }): Promise<PastTimelinePhase> => {
        const { data } = await apiClient.put(`/content/past-editions/${editionId}/timeline/${phaseId}`, phaseData)
        return data
    },

    /**
     * Supprimer une phase de timeline (Admin)
     * DELETE /content/past-editions/:editionId/timeline/:phaseId
     */
    deleteTimelinePhase: async (editionId: string, phaseId: string): Promise<void> => {
        await apiClient.delete(`/content/past-editions/${editionId}/timeline/${phaseId}`)
    },

    // ==================== PAST EDITION GALLERY IMAGES ====================

    /**
     * Créer une image de galerie pour une édition passée (Admin)
     * POST /content/past-editions/:editionId/gallery
     */
    createGalleryImage: async (editionId: string, imageData: {
        imageUrl: string;
        caption?: string;
        order: number;
    }): Promise<GalleryImage> => {
        const { data } = await apiClient.post(`/content/past-editions/${editionId}/gallery`, imageData)
        return data
    },

    /**
     * Mettre à jour une image de galerie (Admin)
     * PUT /content/past-editions/:editionId/gallery/:imageId
     */
    updateGalleryImage: async (editionId: string, imageId: string, imageData: {
        imageUrl: string;
        caption?: string;
        order: number;
    }): Promise<GalleryImage> => {
        const { data } = await apiClient.put(`/content/past-editions/${editionId}/gallery/${imageId}`, imageData)
        return data
    },

    /**
     * Supprimer une image de galerie (Admin)
     * DELETE /content/past-editions/:editionId/gallery/:imageId
     */
    deleteGalleryImage: async (editionId: string, imageId: string): Promise<void> => {
        await apiClient.delete(`/content/past-editions/${editionId}/gallery/${imageId}`)
    },

    // ==================== PAST EDITION TESTIMONIALS ====================

    /**
     * Créer un témoignage pour une édition passée (Admin)
     * POST /content/past-editions/:editionId/testimonials
     */
    createTestimonial: async (editionId: string, testimonialData: {
        studentName: string;
        school?: string;
        role?: string;
        quote: string;
        imageUrl?: string;
    }): Promise<Testimonial> => {
        const { data } = await apiClient.post(`/content/past-editions/${editionId}/testimonials`, testimonialData)
        return data
    },

    /**
     * Mettre à jour un témoignage (Admin)
     * PUT /content/past-editions/:editionId/testimonials/:testimonialId
     */
    updateTestimonial: async (editionId: string, testimonialId: string, testimonialData: {
        studentName: string;
        school?: string;
        role?: string;
        quote: string;
        imageUrl?: string;
    }): Promise<Testimonial> => {
        const { data } = await apiClient.put(`/content/past-editions/${editionId}/testimonials/${testimonialId}`, testimonialData)
        return data
    },

    /**
     * Supprimer un témoignage (Admin)
     * DELETE /content/past-editions/:editionId/testimonials/:testimonialId
     */
    deleteTestimonial: async (editionId: string, testimonialId: string): Promise<void> => {
        await apiClient.delete(`/content/past-editions/${editionId}/testimonials/${testimonialId}`)
    },

    // ==================== GENERAL TESTIMONIALS ====================

    /**
     * Récupérer tous les témoignages généraux (Public/Admin)
     * GET /content/general-testimonials
     */
    getGeneralTestimonials: async (publishedOnly: boolean = true): Promise<GeneralTestimonial[]> => {
        const { data } = await apiClient.get('/content/general-testimonials', {
            params: { published_only: publishedOnly }
        })
        return data
    },

    /**
     * Créer un témoignage général (Admin)
     * POST /content/general-testimonials
     */
    createGeneralTestimonial: async (testimonialData: GeneralTestimonialCreate): Promise<GeneralTestimonial> => {
        const { data } = await apiClient.post('/content/general-testimonials', testimonialData)
        return data
    },

    /**
     * Mettre à jour un témoignage général (Admin)
     * PUT /content/general-testimonials/:testimonialId
     */
    updateGeneralTestimonial: async (testimonialId: string, testimonialData: GeneralTestimonialUpdate): Promise<GeneralTestimonial> => {
        const { data } = await apiClient.put(`/content/general-testimonials/${testimonialId}`, testimonialData)
        return data
    },

    /**
     * Supprimer un témoignage général (Admin)
     * DELETE /content/general-testimonials/:testimonialId
     */
    deleteGeneralTestimonial: async (testimonialId: string): Promise<void> => {
        await apiClient.delete(`/content/general-testimonials/${testimonialId}`)
    },
}

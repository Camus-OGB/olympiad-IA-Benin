/**
 * API Candidat — mappée sur les endpoints backend /api/v1/candidates/*
 * La conversion snake_case ↔ camelCase est automatique via les intercepteurs du client
 */
import apiClient from './client'

// ==================== TYPES ====================

export interface ParentContact {
    id?: string
    name: string
    phone?: string
    email?: string
}

export interface AcademicRecord {
    id?: string
    trimester: number
    average: number
}

export interface SubjectScore {
    id?: string
    subject: string
    score: number
}

export interface QCMResult {
    id?: string
    score: number
    timeSpent?: number
    completedAt?: string
}

export interface Bulletin {
    id: string
    fileUrl: string
    trimester?: number
    label?: string
}

export interface SchoolInfo {
    id: string
    name: string
    city?: string
    region?: string
}

export type CandidateStatus =
    | 'registered'
    | 'qcm_pending'
    | 'qcm_completed'
    | 'regional_selected'
    | 'bootcamp_selected'
    | 'national_finalist'
    | 'rejected'

export type Gender = 'male' | 'female'

export interface CandidateProfile {
    id: string
    userId: string

    // Informations personnelles
    dateOfBirth?: string
    gender?: Gender
    phone?: string
    address?: string
    photoUrl?: string

    // Informations scolaires
    schoolId?: string
    schoolRef?: SchoolInfo
    grade?: string

    // Sous-entités normalisées
    parentContact?: ParentContact
    academicRecords: AcademicRecord[]
    subjectScores: SubjectScore[]
    qcmResult?: QCMResult
    bulletins: Bulletin[]

    // Statut et progression
    status: CandidateStatus

    createdAt: string
    updatedAt: string
}

export interface CandidateProfileUpdate {
    dateOfBirth?: string
    gender?: Gender
    phone?: string
    address?: string
    schoolId?: string
    grade?: string
    parentContact?: ParentContact
    academicRecords?: AcademicRecord[]
    subjectScores?: SubjectScore[]
}

export interface CandidateDashboard {
    user: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: string
        isVerified: boolean
        isActive: boolean
        createdAt: string
        profileId?: string
    }
    profile: CandidateProfile
    progressPercentage: number
    nextSteps: string[]
    notifications: string[]
    profileCompletion: number
}

export interface UploadResponse {
    fileUrl: string
    bulletinId?: string
}

// ==================== API CALLS ====================

export const candidateApi = {
    /**
     * Récupérer le profil du candidat connecté
     * GET /candidates/me/profile
     */
    getMyProfile: async (): Promise<CandidateProfile> => {
        const { data } = await apiClient.get('/candidates/me/profile')
        return data
    },

    /**
     * Mettre à jour le profil du candidat connecté
     * PUT /candidates/me/profile
     */
    updateMyProfile: async (profileData: CandidateProfileUpdate): Promise<CandidateProfile> => {
        const { data } = await apiClient.put('/candidates/me/profile', profileData)
        return data
    },

    /**
     * Récupérer le tableau de bord du candidat
     * GET /candidates/me/dashboard
     */
    getMyDashboard: async (): Promise<CandidateDashboard> => {
        const { data } = await apiClient.get('/candidates/me/dashboard')
        return data
    },

    /**
     * Upload de la photo d'identité
     * POST /candidates/me/photo
     * Formats: JPEG, PNG — Max: 5 MB
     */
    uploadPhoto: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await apiClient.post('/candidates/me/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    /**
     * Upload d'un bulletin scolaire
     * POST /candidates/me/bulletins
     * Format: PDF — Max: 10 MB — Max 3 bulletins
     */
    uploadBulletin: async (
        file: File,
        trimester?: number,
        label?: string
    ): Promise<UploadResponse> => {
        const formData = new FormData()
        formData.append('file', file)
        const params: Record<string, string> = {}
        if (trimester !== undefined) params.trimester = String(trimester)
        if (label) params.label = label

        const { data } = await apiClient.post('/candidates/me/bulletins', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            params,
        })
        return data
    },

    /**
     * Supprimer un bulletin
     * DELETE /candidates/me/bulletins/:bulletinId
     */
    deleteBulletin: async (bulletinId: string): Promise<void> => {
        await apiClient.delete(`/candidates/me/bulletins/${bulletinId}`)
    },

    /**
     * Créer ou récupérer une école
     * POST /candidates/schools
     */
    createOrGetSchool: async (name: string, region: string): Promise<SchoolInfo> => {
        const { data } = await apiClient.post('/candidates/schools', {
            name,
            city: null,
            region,
        })
        return data
    },
}

/**
 * API Admin — mappée sur les endpoints backend /api/v1/admin/*
 * La conversion snake_case ↔ camelCase est automatique via les intercepteurs du client
 */
import apiClient from './client'
import type { CandidateProfile } from './candidate'

// ==================== TYPES ====================

export type CandidateStatus =
  | 'registered'
  | 'qcm_pending'
  | 'qcm_completed'
  | 'regional_selected'
  | 'bootcamp_selected'
  | 'national_finalist'
  | 'rejected'

export interface DashboardStats {
  totalCandidates: number
  verifiedCandidates: number
  qcmCompleted: number
  candidatesByRegion: Record<string, number>
  candidatesByStatus: Record<string, number>
  candidatesByGender: Record<string, number>
  qcmAverageScore: number | null
  recentRegistrations: number
}

export interface CandidateListItem {
  id: string
  userId: string
  fullName: string
  email: string
  schoolName?: string
  schoolRegion?: string
  grade?: string
  gender?: 'male' | 'female'
  status: CandidateStatus
  qcmScore?: number | null
  createdAt: string
  isVerified: boolean
  profileCompletion: number  // Pourcentage de complétion 0-100
}

export interface CandidateDetail {
  id: string
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
}

export interface CandidateExport {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    isVerified: boolean
    createdAt: string
    updatedAt: string
  }
  profile: Record<string, any>
  parentContact?: Record<string, any>
  academicRecords: Record<string, any>[]
  subjectScores: Record<string, any>[]
  qcmResult?: Record<string, any>
  bulletins: Record<string, any>[]
}

export interface AuditLogEntry {
  id: string
  adminId?: string
  adminEmail: string
  action: string
  resourceType: string
  resourceId?: string
  resourceLabel?: string
  details?: string
  ipAddress?: string
  createdAt: string
}

// ==================== API CALLS ====================

export const adminApi = {
  // ==================== DASHBOARD ====================

  /**
   * Statistiques du tableau de bord admin
   * GET /admin/dashboard/stats
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/admin/dashboard/stats')
    return data
  },

  // ==================== CANDIDATS ====================

  /**
   * Liste des candidats avec filtrage et tri
   * GET /admin/candidates
   */
  getCandidates: async (params?: {
    skip?: number
    limit?: number
    candidateStatus?: string
    search?: string
    sortBy?: string
    order?: string
  }): Promise<CandidateListItem[]> => {
    const { data } = await apiClient.get('/admin/candidates', { params })
    return data
  },

  /**
   * Détails complets d'un candidat
   * GET /admin/candidates/:candidateId
   */
  getCandidate: async (candidateId: string): Promise<CandidateDetail> => {
    const { data } = await apiClient.get(`/admin/candidates/${candidateId}`)
    return data
  },

  /**
   * Mettre à jour le statut d'un candidat
   * PUT /admin/candidates/:candidateId/status
   */
  updateCandidateStatus: async (
    candidateId: string,
    newStatus: CandidateStatus,
    note?: string,
    sendNotification: boolean = true
  ): Promise<{ message: string; oldStatus: CandidateStatus; newStatus: CandidateStatus }> => {
    const { data } = await apiClient.put(`/admin/candidates/${candidateId}/status`, {
      newStatus,
      note,
      sendNotification,
    })
    return data
  },

  /**
   * Mise à jour en masse du statut de plusieurs candidats
   * POST /admin/candidates/bulk-update-status
   */
  bulkUpdateStatus: async (
    candidateIds: string[],
    newStatus: CandidateStatus,
    sendNotification: boolean = true
  ): Promise<{ message: string; updatedCount: number }> => {
    const { data } = await apiClient.post('/admin/candidates/bulk-update-status', {
      candidateIds,
      newStatus,
      sendNotification,
    })
    return data
  },

  /**
   * Exporter les données d'un candidat au format JSON
   * GET /admin/candidates/:candidateId/export
   */
  exportCandidate: async (candidateId: string): Promise<CandidateExport> => {
    const { data } = await apiClient.get(`/admin/candidates/${candidateId}/export`)
    return data
  },

  /**
   * Générer une URL signée pour télécharger un bulletin
   * GET /admin/candidates/:candidateId/bulletins/:bulletinId/signed-url
   */
  getCandidateBulletinSignedUrl: async (
    candidateId: string,
    bulletinId: string,
    expiresIn?: number,
  ): Promise<{ signedUrl: string; expiresIn: number }> => {
    const { data } = await apiClient.get(
      `/admin/candidates/${candidateId}/bulletins/${bulletinId}/signed-url`,
      { params: { expiresIn } },
    )
    return data
  },

  /**
   * Supprimer définitivement un candidat (Super Admin uniquement)
   * DELETE /admin/candidates/:candidateId
   */
  deleteCandidate: async (candidateId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/admin/candidates/${candidateId}`)
    return data
  },

  /**
   * Récupérer le journal d'audit
   * GET /admin/audit-logs
   */
  getAuditLogs: async (params?: {
    skip?: number
    limit?: number
    action?: string
    resourceType?: string
    adminId?: string
  }): Promise<AuditLogEntry[]> => {
    const { data } = await apiClient.get('/admin/audit-logs', { params })
    return data
  },
}

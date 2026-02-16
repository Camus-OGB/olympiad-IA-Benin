/**
 * API Utilisateur — mappée sur les endpoints backend /api/v1/users/*
 * La conversion snake_case ↔ camelCase est automatique via les intercepteurs du client
 */
import apiClient from './client'

// ==================== TYPES ====================

export interface UserInfo {
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

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
}

// ==================== API CALLS ====================

export const userApi = {
  /**
   * Récupérer les informations de l'utilisateur connecté
   * GET /users/me
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    const { data } = await apiClient.get('/users/me')
    return data
  },

  /**
   * Mettre à jour les informations de l'utilisateur connecté
   * PUT /users/me
   */
  updateCurrentUser: async (updateData: UpdateUserRequest): Promise<UserInfo> => {
    const { data } = await apiClient.put('/users/me', updateData)
    return data
  },
}

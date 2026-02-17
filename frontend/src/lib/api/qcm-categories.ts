/**
 * API Catégories QCM
 * Gestion des catégories de questions avec création inline
 */
import apiClient from './client'

// ==================== TYPES ====================

export interface QCMCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string  // Hex color: #FF5733
  icon?: string   // Lucide icon name: Calculator, Brain, etc.
  displayOrder?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface QCMCategoryWithStats extends QCMCategory {
  questionCount: number
}

export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  slug?: string
  description?: string
  color?: string
  icon?: string
  displayOrder?: number
  isActive?: boolean
}

// ==================== API CALLS ====================

export const qcmCategoriesApi = {
  /**
   * Liste toutes les catégories avec statistiques
   * GET /qcm-categories
   */
  getCategories: async (includeInactive = false): Promise<QCMCategoryWithStats[]> => {
    const { data } = await apiClient.get('/qcm-categories', {
      params: { include_inactive: includeInactive }
    })
    return data
  },

  /**
   * Récupère une catégorie par son ID
   * GET /qcm-categories/:id
   */
  getCategory: async (categoryId: string): Promise<QCMCategory> => {
    const { data } = await apiClient.get(`/qcm-categories/${categoryId}`)
    return data
  },

  /**
   * Crée une nouvelle catégorie
   * POST /qcm-categories
   */
  createCategory: async (categoryData: CreateCategoryRequest): Promise<QCMCategory> => {
    const { data } = await apiClient.post('/qcm-categories', categoryData)
    return data
  },

  /**
   * Met à jour une catégorie
   * PUT /qcm-categories/:id
   */
  updateCategory: async (
    categoryId: string,
    categoryData: UpdateCategoryRequest
  ): Promise<QCMCategory> => {
    const { data } = await apiClient.put(`/qcm-categories/${categoryId}`, categoryData)
    return data
  },

  /**
   * Supprime une catégorie
   * DELETE /qcm-categories/:id
   */
  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/qcm-categories/${categoryId}`)
  },
}

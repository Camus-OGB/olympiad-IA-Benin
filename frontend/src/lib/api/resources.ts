import apiClient from './client'

export type ResourceType = 'pdf' | 'video' | 'link' | 'document'
export type ResourceCategory = 'guide' | 'cours' | 'exercices' | 'tutoriel' | 'autre'

export interface Resource {
  id: string
  title: string
  description?: string
  type: ResourceType
  category: ResourceCategory
  url: string
  fileSize?: string
  duration?: string
  isActive: boolean
  orderIndex: number
  createdAt: string
  updatedAt?: string
}

export const resourcesApi = {
  /**
   * Récupérer toutes les ressources actives
   */
  getAll: async (): Promise<Resource[]> => {
    const { data } = await apiClient.get('/resources/')
    return data
  },
}

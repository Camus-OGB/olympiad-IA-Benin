import apiClient from './client'

export interface QCMSession {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  passingScore: number
  status: 'locked' | 'available' | 'completed'
  score?: number
  completedAt?: string
}

// Interface pour les sessions côté candidat (GET /qcm/sessions)
export interface SessionForCandidate {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  totalQuestions: number
  timePerQuestion: number
  duration: number
  passingScore: number
  status: 'available' | 'locked' | 'completed'
  score?: number | null
  completedAt?: string | null
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer?: number
}

export interface QCMAttempt {
  id: string
  sessionId: string
  startedAt: string
  completedAt?: string
  score?: number
  answers: Record<string, number>
}

export interface QuestionWithAnswer {
  id: string
  question: string
  options: Array<{ text: string; id: number } | string>
  correctAnswers: number[]
  isMultipleAnswer: boolean
  difficulty: string
  categoryId?: string
  category?: string
  explanation?: string
  points: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface QCMSessionResponse {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string

  totalQuestions: number
  timePerQuestion: number
  duration: number               // Calculé automatiquement

  categories?: string[]
  difficulties?: string[]
  distributionByDifficulty?: {
    easy?: number
    medium?: number
    hard?: number
  }

  passingScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface QuestionOption {
  text: string
  id: number
}

export interface QuestionCreate {
  question: string
  options: QuestionOption[]       // 2 à 6 options: [{text, id}, ...]
  correctAnswers: number[]        // index des bonnes réponses: [0] ou [0, 2]
  isMultipleAnswer: boolean
  difficulty: string
  categoryId?: string
  category?: string
  explanation?: string
  points: number
}

export interface QuestionUpdate {
  question?: string
  options?: QuestionOption[]
  correctAnswers?: number[]
  isMultipleAnswer?: boolean
  difficulty?: string
  categoryId?: string
  category?: string
  explanation?: string
  points?: number
  isActive?: boolean
}

export interface SessionCreate {
  title: string
  description: string
  startDate: string
  endDate: string

  // Configuration du tirage au sort
  totalQuestions: number        // Ex: 20
  timePerQuestion: number        // Ex: 2 (minutes)

  // Filtres optionnels
  categories?: string[]          // Ex: ['Maths', 'IA', 'Logique']
  difficulties?: string[]        // Ex: ['easy', 'medium', 'hard']
  distributionByDifficulty?: {
    easy?: number
    medium?: number
    hard?: number
  }

  passingScore: number           // Ex: 60
}

export interface SessionUpdate {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
  totalQuestions?: number
  timePerQuestion?: number
  categories?: string[]
  difficulties?: string[]
  distributionByDifficulty?: {
    easy?: number
    medium?: number
    hard?: number
  }
  passingScore?: number
  isActive?: boolean
}

export interface AdminQCMStats {
  totalQuestions: number
  totalSessions: number
  totalAttempts: number
  completedAttempts: number

  averageScore: number | null
  passRate: number | null

  questionsByDifficulty: Record<string, number>
  questionsByCategory: Record<string, number>

  attemptsBySession: Record<string, number>

  topPerformers: Array<{
    candidateName: string
    sessionTitle: string
    score: number
    completedAt: string | null
  }>

  recentAttempts: Array<{
    candidateName: string
    sessionTitle: string
    score: number | null
    completed: boolean
    startedAt: string | null
  }>
}

export const qcmApi = {
  // Récupérer toutes les sessions QCM pour le candidat
  getCandidateSessions: async (): Promise<SessionForCandidate[]> => {
    const { data } = await apiClient.get('/qcm/sessions')
    return data
  },

  // Récupérer toutes les sessions QCM disponibles (legacy)
  getSessions: async (): Promise<QCMSession[]> => {
    const { data } = await apiClient.get('/qcm/sessions')
    return data
  },

  // Récupérer une session spécifique
  getSession: async (sessionId: string): Promise<QCMSession> => {
    const { data } = await apiClient.get(`/qcm/sessions/${sessionId}`)
    return data
  },

  // Démarrer une tentative de QCM
  startAttempt: async (sessionId: string): Promise<QCMAttempt> => {
    const { data } = await apiClient.post(`/qcm/sessions/${sessionId}/start`)
    return data
  },

  // Récupérer les questions d'une tentative
  getQuestions: async (attemptId: string): Promise<Question[]> => {
    const { data } = await apiClient.get(`/qcm/attempts/${attemptId}/questions`)
    return data
  },

  // Soumettre une réponse
  submitAnswer: async (
    attemptId: string,
    questionId: string,
    answer: number
  ): Promise<void> => {
    await apiClient.post(`/qcm/attempts/${attemptId}/answers`, {
      questionId,
      answer,
    })
  },

  // Terminer une tentative
  completeAttempt: async (attemptId: string): Promise<QCMAttempt> => {
    const { data } = await apiClient.post(`/qcm/attempts/${attemptId}/complete`)
    return data
  },

  // Récupérer les résultats
  getResults: async (): Promise<QCMAttempt[]> => {
    const { data } = await apiClient.get('/qcm/results')
    return data
  },

  // ==================== ADMIN ENDPOINTS ====================

  // Questions
  getAllQuestions: async (params?: {
    skip?: number
    limit?: number
    category?: string
    difficulty?: string
  }): Promise<QuestionWithAnswer[]> => {
    const { data } = await apiClient.get('/qcm/admin/questions', { params })
    return data
  },

  createQuestion: async (question: QuestionCreate): Promise<QuestionWithAnswer> => {
    const { data } = await apiClient.post('/qcm/admin/questions', question)
    return data
  },

  updateQuestion: async (questionId: string, question: QuestionUpdate): Promise<QuestionWithAnswer> => {
    const { data } = await apiClient.put(`/qcm/admin/questions/${questionId}`, question)
    return data
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/qcm/admin/questions/${questionId}`)
  },

  // Sessions
  getAllSessions: async (params?: {
    skip?: number
    limit?: number
  }): Promise<QCMSessionResponse[]> => {
    const { data } = await apiClient.get('/qcm/admin/sessions', { params })
    return data
  },

  createSession: async (session: SessionCreate): Promise<QCMSessionResponse> => {
    const { data } = await apiClient.post('/qcm/admin/sessions', session)
    return data
  },

  updateSession: async (sessionId: string, session: SessionUpdate): Promise<QCMSessionResponse> => {
    const { data } = await apiClient.put(`/qcm/admin/sessions/${sessionId}`, session)
    return data
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/qcm/admin/sessions/${sessionId}`)
  },

  // Statistics
  getAdminStats: async (): Promise<AdminQCMStats> => {
    const { data } = await apiClient.get('/qcm/admin/stats')
    return data
  },

}

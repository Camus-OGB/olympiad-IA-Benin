export interface QCMSession {
  id: string
  title: string
  description: string
  subject?: string
  duration: number  // en secondes
  totalQuestions: number
  passingScore: number

  // Disponibilité
  availableFrom?: string
  availableTo?: string
  status: QCMStatus

  // Résultats si complété
  score?: number
  completedAt?: string
  attempts?: number
  maxAttempts?: number

  createdAt?: string
  updatedAt?: string
}

export type QCMStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer?: number  // Index de la bonne réponse (seulement pour l'admin ou après soumission)
  explanation?: string
  points?: number
}

export interface QCMAttempt {
  id: string
  sessionId: string
  candidateId?: string

  startedAt: string
  completedAt?: string
  timeRemaining?: number

  answers: Record<string, number>  // questionId -> selectedOptionIndex
  score?: number
  percentage?: number

  status?: 'in_progress' | 'completed' | 'abandoned'
}

export interface QCMResult {
  attemptId: string
  sessionId: string
  sessionTitle: string
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unanswered: number
  completedAt: string
  duration: number  // Temps pris en secondes

  // Détails par question
  questionResults?: QuestionResult[]
}

export interface QuestionResult {
  questionId: string
  question: string
  selectedAnswer?: number
  correctAnswer: number
  isCorrect: boolean
  points: number
  earnedPoints: number
}

import { create } from 'zustand'
import type { QCMSession, QCMAttempt, Question } from '@/types/qcm'

interface QCMState {
  // Current session
  currentSession: QCMSession | null
  currentAttempt: QCMAttempt | null
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, string> // questionId -> answerId

  // Timer
  timeRemaining: number
  timerActive: boolean

  // Loading states
  isLoading: boolean

  // Actions
  setSession: (session: QCMSession) => void
  setAttempt: (attempt: QCMAttempt) => void
  setQuestions: (questions: Question[]) => void
  setAnswer: (questionId: string, answerId: string) => void
  removeAnswer: (questionId: string) => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  setTimeRemaining: (time: number) => void
  decrementTime: () => void
  startTimer: () => void
  stopTimer: () => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useQCMStore = create<QCMState>((set, get) => ({
  // Initial state
  currentSession: null,
  currentAttempt: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  timerActive: false,
  isLoading: false,

  // Actions
  setSession: (session) => set({ currentSession: session }),

  setAttempt: (attempt) => set({
    currentAttempt: attempt,
    timeRemaining: attempt.timeRemaining ?? 0,
  }),

  setQuestions: (questions) => set({ questions }),

  setAnswer: (questionId, answerId) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answerId },
    })),

  removeAnswer: (questionId) =>
    set((state) => {
      const newAnswers = { ...state.answers }
      delete newAnswers[questionId]
      return { answers: newAnswers }
    }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    })),

  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  goToQuestion: (index) =>
    set((state) => ({
      currentQuestionIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
    })),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),

  startTimer: () => set({ timerActive: true }),

  stopTimer: () => set({ timerActive: false }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      currentSession: null,
      currentAttempt: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 0,
      timerActive: false,
      isLoading: false,
    }),
}))

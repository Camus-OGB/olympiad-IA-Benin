'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQCMStore } from '@/store/qcmStore'
import { qcmApi } from '@/lib/api/qcm'

export const useQCM = () => {
  const router = useRouter()
  const {
    currentSession,
    currentAttempt,
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    timerActive,
    isLoading,
    setSession,
    setAttempt,
    setQuestions,
    setAnswer,
    removeAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    decrementTime,
    startTimer,
    stopTimer,
    setLoading,
    reset,
  } = useQCMStore()

  // Timer effect
  useEffect(() => {
    if (!timerActive) return

    const interval = setInterval(() => {
      decrementTime()

      // Auto-submit when time runs out
      if (timeRemaining <= 1) {
        handleSubmit()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const sessions = await qcmApi.getCandidateSessions()
      return { success: true, data: sessions }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSession = async (sessionId: string) => {
    try {
      setLoading(true)
      const session = await qcmApi.getSession(sessionId)
      setSession(session)
      return { success: true, data: session }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const startSession = async (sessionId: string) => {
    try {
      setLoading(true)

      // Start attempt
      const attempt = await qcmApi.startAttempt(sessionId)
      setAttempt(attempt)

      // Load questions
      const loadedQuestions = await qcmApi.getQuestions(attempt.id)
      setQuestions(loadedQuestions)
      startTimer()

      return { success: true, data: attempt }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (questionId: string, answerId: string) => {
    if (!currentAttempt) return { success: false, error: 'Aucune tentative en cours' }

    try {
      await qcmApi.submitAnswer(currentAttempt.id, questionId, Number(answerId))
      setAnswer(questionId, answerId)
      return { success: true }
    } catch (error: any) {
      // Still save locally even if API fails
      setAnswer(questionId, answerId)
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur réseau, réponse sauvegardée localement'
      }
    }
  }

  const handleSubmit = async () => {
    if (!currentAttempt) return { success: false, error: 'Aucune tentative en cours' }

    try {
      stopTimer()
      setLoading(true)

      const completedAttempt = await qcmApi.completeAttempt(currentAttempt.id)
      reset()
      router.push(`/candidat/qcm/resultats/${currentAttempt.id}`)
      return { success: true, data: completedAttempt }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const loadResults = async (attemptId: string) => {
    try {
      setLoading(true)
      const results = await qcmApi.getResults()
      const attempt = results.find(r => r.id === attemptId)
      if (!attempt) return { success: false, error: 'Résultat introuvable' }
      return { success: true, data: attempt }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const answeredCount = Object.keys(answers).length
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  return {
    // State
    currentSession,
    currentAttempt,
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    timeRemaining,
    isLoading,
    isLastQuestion,
    isFirstQuestion,
    answeredCount,
    progressPercentage,

    // Actions
    loadSessions,
    loadSession,
    startSession,
    submitAnswer,
    handleSubmit,
    loadResults,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    removeAnswer,
    reset,
  }
}

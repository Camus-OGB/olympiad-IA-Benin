'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseTimerOptions {
  initialTime: number // in seconds
  onComplete?: () => void
  autoStart?: boolean
}

export const useTimer = ({ initialTime, onComplete, autoStart = false }: UseTimerOptions) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isActive, setIsActive] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setTimeRemaining(initialTime)
  }, [initialTime])

  useEffect(() => {
    if (!isActive || isPaused) return

    const interval = setInterval(() => {
      setTimeRemaining((time) => {
        if (time <= 1) {
          setIsActive(false)
          onComplete?.()
          return 0
        }
        return time - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isPaused, onComplete])

  const start = useCallback(() => {
    setIsActive(true)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
  }, [])

  const reset = useCallback(() => {
    setTimeRemaining(initialTime)
    setIsActive(false)
    setIsPaused(false)
  }, [initialTime])

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}

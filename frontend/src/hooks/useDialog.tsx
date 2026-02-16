'use client'

import { useState, useCallback } from 'react'

type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AlertState {
  show: boolean
  title: string
  message: string
  type: AlertType
}

interface ConfirmState {
  show: boolean
  title: string
  message: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showAlert = useCallback((title: string, message: string, type: AlertType = 'info') => {
    setAlertState({
      show: true,
      title,
      message,
      type
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, show: false }))
  }, [])

  return {
    alertState,
    showAlert,
    hideAlert,
    showError: (title: string, message: string) => showAlert(title, message, 'error'),
    showSuccess: (title: string, message: string) => showAlert(title, message, 'success'),
    showWarning: (title: string, message: string) => showAlert(title, message, 'warning'),
    showInfo: (title: string, message: string) => showAlert(title, message, 'info'),
  }
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  })

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string
      cancelText?: string
      type?: 'info' | 'warning' | 'danger'
    }
  ) => {
    setConfirmState({
      show: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      type: options?.type || 'warning'
    })
  }, [])

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, show: false }))
  }, [])

  return {
    confirmState,
    showConfirm,
    hideConfirm
  }
}

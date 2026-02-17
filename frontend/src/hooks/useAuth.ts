'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api/auth'
import type { LoginRequest, RegisterRequest } from '@/lib/api/auth'

export const useAuth = () => {
  const router = useRouter()
  const { user, setUser, clearUser, isLoading, setLoading, hasHydrated } = useAuthStore()

  useEffect(() => {
    // Attendre que l'hydratation soit complète avant de vérifier l'auth
    if (!hasHydrated) {
      console.log('useAuth - Waiting for hydration...');
      setLoading(true);
      return;
    }

    // Vérifier si l'utilisateur est connecté en appelant /auth/me
    // Le cookie sera envoyé automatiquement
    let mounted = true
    let hasRun = false

    const checkAuth = async () => {
      // Ne vérifier qu'une seule fois au montage
      if (!mounted || hasRun) return
      hasRun = true

      // Si on a déjà un user dans le store, on ne fait rien
      // Le cookie devrait être valide
      if (user) {
        console.log('useAuth - User already in store:', user.email);
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('useAuth - Checking authentication with backend...');
        const userData = await authApi.getCurrentUser()
        console.log('useAuth - User authenticated:', userData.email);
        if (mounted) {
          setUser(userData)
        }
      } catch (error) {
        // Pas de cookie valide, utilisateur non connecté
        console.log('useAuth - Authentication failed, no valid cookie');
        if (mounted) {
          clearUser()
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      const response = await authApi.login(credentials)

      // Le cookie est automatiquement défini par le backend
      // On stocke juste les infos user dans le store
      setUser(response.user)

      // Redirect based on role
      if (response.user.role === 'admin' || response.user.role === 'super_admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/candidat/dashboard')
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true)
      await authApi.register(data)

      // Redirect to verification page
      router.push(`/auth/verification-otp?email=${encodeURIComponent(data.email)}`)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Le cookie est supprimé par le backend
      clearUser()
      router.push('/auth/connexion')
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true)
      await authApi.forgotPassword(email)

      router.push(`/auth/verification-otp?email=${encodeURIComponent(email)}&type=reset`)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    try {
      setLoading(true)
      await authApi.verifyOtp(email, otp)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      setLoading(true)
      await authApi.resetPassword(email, otp, newPassword)

      router.push('/auth/connexion')
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async (email: string) => {
    try {
      setLoading(true)
      await authApi.resendOtp(email)
      return { success: true, message: 'Un nouveau code a été envoyé' }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    resendOtp,
  }
}

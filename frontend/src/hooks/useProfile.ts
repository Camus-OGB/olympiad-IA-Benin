'use client'

import { useEffect, useCallback } from 'react'
import { useProfileStore } from '@/store/profileStore'
import { useAuthStore } from '@/store/authStore'
import { candidateApi } from '@/lib/api/candidate'
import type { CandidateProfileUpdate, CandidateDashboard } from '@/lib/api/candidate'

export const useProfile = () => {
  const { profile, setProfile, clearProfile, isLoading, setLoading, updateProfile } = useProfileStore()
  const { user } = useAuthStore()

  const loadProfile = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const profileData = await candidateApi.getMyProfile()
      setProfile(profileData as any)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }, [user, setLoading, setProfile])

  useEffect(() => {
    // Load profile when user changes and is a candidate
    if (user && user.role === 'candidate') {
      loadProfile()
    } else {
      clearProfile()
    }
  }, [user, loadProfile, clearProfile])

  const updateProfileData = async (data: CandidateProfileUpdate) => {
    try {
      setLoading(true)
      const updatedProfile = await candidateApi.updateMyProfile(data)
      setProfile(updatedProfile as any)
      return { success: true, data: updatedProfile }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Une erreur est survenue'
      }
    } finally {
      setLoading(false)
    }
  }

  const uploadPhoto = async (file: File) => {
    try {
      setLoading(true)
      const response = await candidateApi.uploadPhoto(file)
      // Mettre à jour le profil local avec la nouvelle URL de photo
      updateProfile({ photoUrl: response.fileUrl } as any)
      return { success: true, data: response }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Erreur lors de l'upload de la photo"
      }
    } finally {
      setLoading(false)
    }
  }

  const uploadBulletin = async (file: File, trimester?: number, label?: string) => {
    try {
      setLoading(true)
      const response = await candidateApi.uploadBulletin(file, trimester, label)
      // Recharger le profil pour avoir la liste à jour des bulletins
      await loadProfile()
      return { success: true, data: response }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Erreur lors de l'upload du bulletin"
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteBulletin = async (bulletinId: string) => {
    try {
      setLoading(true)
      await candidateApi.deleteBulletin(bulletinId)
      // Recharger le profil
      await loadProfile()
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erreur lors de la suppression du bulletin'
      }
    } finally {
      setLoading(false)
    }
  }

  const getDashboard = async (): Promise<CandidateDashboard | null> => {
    try {
      setLoading(true)
      const dashboard = await candidateApi.getMyDashboard()
      return dashboard
    } catch (error: any) {
      console.error('Failed to load dashboard:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    isLoading,
    hasProfile: !!profile,
    loadProfile,
    updateProfile: updateProfileData,
    uploadPhoto,
    uploadBulletin,
    deleteBulletin,
    getDashboard,
  }
}

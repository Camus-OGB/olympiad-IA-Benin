import { create } from 'zustand'
import type { CandidateProfile } from '@/lib/api/candidate'

interface ProfileState {
  profile: CandidateProfile | null
  isLoading: boolean
  setProfile: (profile: CandidateProfile) => void
  clearProfile: () => void
  setLoading: (loading: boolean) => void
  updateProfile: (updates: Partial<CandidateProfile>) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}))

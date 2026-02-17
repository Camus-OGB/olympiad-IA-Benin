import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  isLoading: boolean
  hasHydrated: boolean
  setUser: (user: User) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,  // Commencer avec true pour indiquer qu'on charge
      hasHydrated: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Vérifier si on est côté client
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // Fallback pour le SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({ user: state.user }),
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

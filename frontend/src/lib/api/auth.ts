import apiClient from './client'

// ==================== TYPES DE REQUÊTE ====================

export interface LoginCredentials {
  email: string
  password: string
}

export type LoginRequest = LoginCredentials

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  school: string
  grade: string
}

export type RegisterRequest = RegisterData

// ==================== TYPES DE RÉPONSE ====================
// Les champs sont en camelCase côté frontend,
// le client API fait la conversion auto depuis snake_case du backend

import { UserRole } from '@/types/user'

export interface UserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isVerified: boolean
  isActive: boolean
  createdAt: string
  profileId?: string | null
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: UserResponse
}

export type AuthResponse = TokenResponse

// ==================== API CALLS ====================

export const authApi = {
  /**
   * Connexion avec email et mot de passe
   * POST /auth/login
   * Le backend retourne les tokens dans des cookies HttpOnly + body
   */
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials)
    // La transformation snake_case → camelCase est faite par l'intercepteur
    return data
  },

  /**
   * Inscription d'un nouveau candidat
   * POST /auth/register
   */
  register: async (userData: RegisterData): Promise<UserResponse> => {
    const { data } = await apiClient.post('/auth/register', userData)
    return data
  },

  /**
   * Déconnexion — le backend supprime les cookies
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  /**
   * Récupérer l'utilisateur connecté (via cookie)
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  /**
   * Demande de réinitialisation de mot de passe
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  /**
   * Vérification du code OTP
   * POST /auth/verify-otp
   * Backend attend: { email, code }
   */
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await apiClient.post('/auth/verify-otp', { email, code: otp })
  },

  /**
   * Réinitialisation du mot de passe avec OTP
   * POST /auth/reset-password
   * Backend attend: { email, code, new_password }
   */
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { email, code: otp, newPassword })
  },

  /**
   * Renvoyer un code OTP
   * POST /auth/resend-otp?email=...
   */
  resendOtp: async (email: string): Promise<void> => {
    await apiClient.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`)
  },

  /**
   * Rafraîchir le token d'accès
   * POST /auth/refresh
   * Le refresh token est dans un cookie HttpOnly
   */
  refreshToken: async (): Promise<void> => {
    await apiClient.post('/auth/refresh')
  },

  /**
   * Changer le mot de passe de l'utilisateur connecté
   * PUT /auth/me/password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/auth/me/password', { currentPassword, newPassword })
  },
}

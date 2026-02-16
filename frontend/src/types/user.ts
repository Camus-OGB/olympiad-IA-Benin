/**
 * Types utilisateur — mappés sur le backend UserResponse (auto camelCase via intercepteur)
 */

export interface User {
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

export type UserRole = 'candidate' | 'admin' | 'super_admin'

export interface AuthUser extends User {
  accessToken: string
  refreshToken: string
}

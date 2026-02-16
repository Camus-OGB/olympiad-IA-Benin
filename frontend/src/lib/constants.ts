export const APP_NAME = "Olympiades IA Bénin"
export const APP_DESCRIPTION = "Plateforme officielle de sélection pour les Olympiades d'IA"

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    ABOUT: '/a-propos',
    HISTORY: '/bilan',
    EDITION_2026: '/edition-2026',
    CONTACT: '/contact',
    BLOG: '/blog',
  },
  AUTH: {
    LOGIN: '/auth/connexion',
    REGISTER: '/auth/inscription',
    FORGOT_PASSWORD: '/auth/mot-de-passe-oublie',
    VERIFY_OTP: '/auth/verification-otp',
    RESET_PASSWORD: '/auth/reinitialisation-mot-de-passe',
  },
  CANDIDATE: {
    DASHBOARD: '/candidat/dashboard',
    PROFILE: '/candidat/profil',
    QCM: '/candidat/qcm',
    QCM_RUN: '/candidat/qcm/run',
    RESULTS: '/candidat/resultats',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    CANDIDATES: '/admin/candidats',
    QCM: '/admin/qcm',
    CONTENT: '/admin/contenu',
    SETTINGS: '/admin/parametres',
  },
} as const

export const COLORS = {
  OAIB_GREEN: '#00A896',
  OAIB_BLUE: '#3366CC',
  OAIB_DARK_BLUE: '#2E4A8B',
  BENIN_YELLOW: '#FFB800',
  BENIN_RED: '#E63946',
} as const

export const QCM_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

export const USER_ROLES = {
  CANDIDATE: 'candidate',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

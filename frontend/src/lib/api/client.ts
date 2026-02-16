import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { transformKeysToCamel, transformKeysToSnake } from './transformers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Debug: Log de la baseURL au chargement (à retirer en production)
if (typeof window !== 'undefined') {
  console.log('🔧 API Client BaseURL:', API_URL)
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Envoie les cookies automatiquement
})

// ==================== INTERCEPTEURS DE TRANSFORMATION ====================

// Request interceptor: convertit les données camelCase → snake_case avant envoi
apiClient.interceptors.request.use((config) => {
  // Transformer le body (data) de camelCase vers snake_case
  if (config.data && !(config.data instanceof FormData) && !(config.data instanceof Blob)) {
    config.data = transformKeysToSnake(config.data)
  }

  // Transformer les query params de camelCase vers snake_case
  if (config.params) {
    config.params = transformKeysToSnake(config.params)
  }

  return config
})

// Response interceptor: convertit les données snake_case → camelCase en réception
apiClient.interceptors.response.use(
  (response) => {
    // Transformer la réponse de snake_case vers camelCase
    if (response.data) {
      response.data = transformKeysToCamel(response.data)
    }
    return response
  },
  async (error: AxiosError) => {
    // Transformer aussi les erreurs si elles contiennent des données
    if (error.response?.data) {
      error.response.data = transformKeysToCamel(error.response.data)
    }
    return handleAuthError(error)
  }
)

// ==================== GESTION DU REFRESH TOKEN ====================

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })
  failedQueue = []
}

async function handleAuthError(error: AxiosError) {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

  // Si l'erreur est 401 et qu'on n'a pas déjà essayé de rafraîchir
  if (error.response?.status === 401 && !originalRequest._retry) {
    // Éviter de rafraîchir sur les routes d'auth elles-mêmes
    if (originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Si un refresh est déjà en cours, mettre la requête en attente
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          return apiClient(originalRequest)
        })
        .catch(err => {
          return Promise.reject(err)
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Tenter de rafraîchir le token
      await apiClient.post('/auth/refresh')

      // Rafraîchissement réussi, traiter la file d'attente
      processQueue()
      isRefreshing = false

      // Réessayer la requête originale
      return apiClient(originalRequest)
    } catch (refreshError) {
      // Échec du rafraîchissement, traiter la file d'attente avec erreur
      processQueue(refreshError)
      isRefreshing = false

      // Rediriger vers la page de connexion unique
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/connexion'
      }

      return Promise.reject(refreshError)
    }
  }

  return Promise.reject(error)
}

export default apiClient

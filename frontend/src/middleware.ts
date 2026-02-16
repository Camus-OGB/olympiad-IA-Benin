import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = ['/candidat', '/admin']

// Routes d'authentification (déjà connecté = redirection)
const authRoutes = ['/auth/connexion', '/auth/inscription']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Récupérer le token depuis localStorage (côté client)
  // Note: Le middleware s'exécute côté serveur, donc on vérifie juste la présence
  // La vraie vérification se fait dans les composants avec useAuth
  
  // Pour le middleware, on laisse passer et on gère l'auth dans les layouts
  // Cela évite les problèmes de SSR avec localStorage
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|logos).*)',
  ],
}

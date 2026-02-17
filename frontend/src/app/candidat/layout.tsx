'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, User, BrainCircuit, Award, LogOut, Menu, X, ChevronRight, Settings, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Protection: Rediriger si non authentifié
  useEffect(() => {
    // Attendre que l'authentification soit vérifiée (isLoading = false)
    if (isLoading) {
      console.log('CandidateLayout - Still loading auth...');
      return;
    }

    // Marquer qu'on a vérifié au moins une fois
    setHasCheckedAuth(true);

    console.log('CandidateLayout - Auth check:', { isLoading, user: user?.email, pathname });
    if (!user) {
      console.log('CandidateLayout - No user found, redirecting to login');
      router.push('/auth/connexion?redirect=' + encodeURIComponent(pathname));
    }
  }, [user, isLoading, pathname, router]);

  // Close user menu when clicking outside - DOIT ÊTRE AVANT LE RETURN CONDITIONNEL
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Vérifier le statut du profil et charger la photo (une seule fois au montage)
  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const { candidateApi } = await import('@/lib/api/candidate');
          const profile = await candidateApi.getMyProfile();

          // Charger la photo de profil (camelCase après conversion par l'intercepteur)
          if (profile.photoUrl) {
            setProfilePhoto(profile.photoUrl);
          }

          // Stocker le statut
          setProfileStatus(profile.status);

          // Si le profil n'est pas approuvé et qu'on n'est pas déjà sur la page profil, rediriger
          if (pathname !== '/candidat/profil' && profile.status === 'registered') {
            router.push('/candidat/profil');
          }

          // Charger le nombre de notifications non lues depuis le dashboard
          try {
            const dashboard = await candidateApi.getMyDashboard();
            setUnreadCount(dashboard.notifications?.length ?? 0);
          } catch {
            // Non bloquant
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du profil:', error);
        }
      }
    };

    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Vérifier uniquement quand user change

  // Afficher un loader pendant la vérification initiale
  // Ne pas afficher le loader après la première vérification pour éviter les flashs
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si on arrive ici, c'est que hasCheckedAuth = true et isLoading = false
  // Si user est null, l'effet ci-dessus va rediriger
  // On affiche quand même un loader pour éviter un flash
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Tableau de bord', path: '/candidat/dashboard', icon: LayoutDashboard },
    { label: 'Mon Profil', path: '/candidat/profil', icon: User },
    { label: 'Examens & QCM', path: '/candidat/qcm', icon: BrainCircuit },
    { label: 'Résultats', path: '/candidat/resultats', icon: Award },
    { label: 'Paramètres', path: '/candidat/parametres', icon: Settings },
  ];

  const isActive = (path: string) => pathname === path || (path === '/candidat/dashboard' && pathname === '/candidat');

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-ioai-dark-blue">
               <div className="bg-ioai-green p-1.5 rounded-lg text-white">
                 <BrainCircuit size={20} />
               </div>
               <span className="font-display font-bold text-lg tracking-tight">ESPACE CANDIDAT</span>
            </div>
            <button className="ml-auto lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* User Snippet */}
          {/*{user && (
            <div className="p-6 pb-2">
              <div className="flex items-center gap-3 mb-6 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-ioai-blue text-white flex items-center justify-center font-bold text-lg">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}*/}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-ioai-dark-blue text-white shadow-md shadow-blue-900/10'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-ioai-blue'
                }`}
              >
                <item.icon size={18} className={`mr-3 ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-ioai-blue'}`} />
                {item.label}
                {isActive(item.path) && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100">
            <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={18} className="mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header (Mobile & Desktop) */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between lg:justify-end">
          <button
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Notifications Bell */}
          <Link href="/candidat/notifications" className="relative p-2.5 text-gray-400 hover:text-ioai-blue hover:bg-gray-50 rounded-xl transition-colors">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-benin-red text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ioai-blue to-ioai-dark-blue text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Award size={12} className="text-benin-yellow" />
                  Niveau 1 : Novice
                </p>
              </div>
              <ChevronDown size={16} className="hidden sm:block text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <Award size={12} />
                      Niveau 1 : Novice
                    </div>
                  </div>
                </div>

                {/* Menu Links */}
                <div className="py-2">
                  <Link 
                    href="/candidat/profil" 
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">Mon Profil</span>
                  </Link>
                  <Link 
                    href="/candidat/parametres" 
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <button 
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
           {children}
        </main>

      </div>
    </div>
  );
}

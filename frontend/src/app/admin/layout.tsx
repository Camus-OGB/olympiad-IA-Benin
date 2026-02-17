'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BrainCircuit, Settings, LogOut, Menu, X, Bell, Search, TrendingUp, UserCog, BookOpen, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Protection: Rediriger si non authentifié ou pas admin
  useEffect(() => {
    // Attendre que l'authentification soit vérifiée (isLoading = false)
    if (isLoading) {
      return;
    }

    // Marquer qu'on a vérifié au moins une fois
    setHasCheckedAuth(true);

    if (!user) {
      // Pas connecté → rediriger vers la page de connexion
      console.log('AdminLayout - No user found, redirecting to login');
      router.push('/auth/connexion');
    } else if (user.role !== 'admin' && user.role !== 'super_admin') {
      // Connecté mais pas admin → rediriger vers dashboard candidat
      console.log('AdminLayout - User is not admin, redirecting to candidate dashboard');
      router.push('/candidat/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    document.body.classList.add('admin-no-watermark');
    return () => {
      document.body.classList.remove('admin-no-watermark');
    };
  }, []);

  // Afficher un loader pendant la vérification initiale
  // Ne pas afficher le loader après la première vérification pour éviter les flashs
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si on arrive ici, c'est que hasCheckedAuth = true et isLoading = false
  // Si user est null ou pas admin, l'effet ci-dessus va rediriger
  // On affiche quand même un loader pour éviter un flash
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Candidatures', path: '/admin/candidatures', icon: Users },
    { label: 'Gestion QCM', path: '/admin/qcm', icon: BrainCircuit },
    { label: 'Statistiques', path: '/admin/statistiques', icon: TrendingUp },
  ];

  const cmsItems = [
    { label: 'Contenu', path: '/admin/contenu', icon: BookOpen },
  ];

  const settingsItems = [
    { label: 'Journal d\'audit', path: '/admin/audit', icon: ClipboardList },
    { label: 'Utilisateurs Admin', path: '/admin/utilisateurs', icon: UserCog },
    { label: 'Paramètres', path: '/admin/parametres', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && pathname === '/admin') return true;
    if (pathname?.startsWith(path)) return true;
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-white border-r border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="bg-ioai-green p-1 rounded text-white">
                <BrainCircuit size={18} />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">AOAI <span className="text-gray-400">Admin</span></span>
            </div>
            <button className="ml-auto lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-4 overflow-y-auto">
            <div>
              <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu Principal</p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                    ? 'bg-ioai-green text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <item.icon size={18} className={`mr-3 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div>
              <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contenu & CMS</p>
              {cmsItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                    ? 'bg-ioai-green text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <item.icon size={18} className={`mr-3 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div>
              <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Configuration</p>
              {settingsItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                    ? 'bg-ioai-green text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <item.icon size={18} className={`mr-3 ${isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer User Info */}
           <div className="p-4 border-t border-gray-800 bg-gray-900">
            {/*{user && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
                </div>
              </div>
            )}*/}
            <button onClick={logout} className="flex items-center w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </button>
          </div> 
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 hidden sm:block">
              {navItems.find(i => i.path === pathname)?.label || 'Administration'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Recherche globale..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-ioai-blue rounded-lg text-sm w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ioai-blue to-ioai-dark-blue text-white flex items-center justify-center font-bold text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.role === 'super_admin' ? 'Super Admin' : 'Administrateur'}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}

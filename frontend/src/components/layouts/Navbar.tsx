'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, BrainCircuit, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { contentApi, type PastEdition } from '@/lib/api/content';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastEditions, setPastEditions] = useState<PastEdition[]>([]);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    contentApi.getPastEditions()
      .then(data => setPastEditions([...data].sort((a, b) => b.year - a.year)))
      .catch(() => {});
  }, []);

  const isActive = (path: string) =>
    pathname === path
      ? 'text-ioai-blue font-bold'
      : 'text-text-secondary hover:text-ioai-blue';

  return (
    <>
      {/* Floating Navbar with Glassmorphism */}
      <nav className="fixed top-4 left-4 right-4 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto glass-nav rounded-2xl shadow-lg">
          <div className="flex justify-between items-center h-20 px-4 sm:px-6 lg:px-8">

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-ioai-blue p-2.5 rounded-xl text-white group-hover:bg-ioai-green transition-colors duration-300">
                <BrainCircuit size={24} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-base text-ioai-blue tracking-tight leading-tight">
                  OLYMPIADES IA
                </span>
                <span className="font-sans text-[10px] text-ioai-green font-bold tracking-[0.15em] uppercase">
                  Bénin 2026
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links - Centered */}
            <div className="hidden lg:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/')}`}>
                Accueil
              </Link>

              <Link href="/edition/2026" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/edition/2026') || pathname?.includes('/edition/')}`}>
                Édition 2026
              </Link>

              {/* Archives dropdown */}
              <div className="relative group"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}>
                <button className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.includes('/bilan')
                    ? 'text-ioai-blue font-bold'
                    : 'text-text-secondary hover:text-ioai-blue'
                }`}>
                  Archives <ChevronDown size={14} className={`ml-1 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute top-full left-0 pt-3 transition-all duration-200 ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-56 overflow-hidden">
                    <Link href="/bilan" className="block px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-ioai-blue transition-colors">
                      Toutes les éditions
                    </Link>
                    {pastEditions.length > 0 && <div className="h-px bg-gray-100 my-1"></div>}
                    {pastEditions.map(e => (
                      <Link key={e.id} href={`/bilan/${e.id}`} className="block px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-ioai-blue transition-colors">
                        Édition {e.year}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/actualites" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/actualites')}`}>
                Actualités
              </Link>

              <Link href="/a-propos" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/a-propos')}`}>
                À propos
              </Link>
              <Link href="/contact" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/contact')}`}>
                Contact
              </Link>
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/auth/connexion" className="text-text-secondary hover:text-ioai-blue font-semibold text-sm px-4 py-2 transition-colors">
                Connexion
              </Link>
              <Link href="/auth/inscription" className="bg-benin-red hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all">
                S&apos;inscrire
              </Link>
            </div>

            {/* Mobile menu button */}
            <button onClick={toggleMenu} className="lg:hidden text-text-secondary p-2 rounded-lg hover:bg-gray-50 transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={toggleMenu}>
          <div className="absolute top-20 left-4 right-4 bg-white rounded-xl shadow-2xl p-4 space-y-1 border border-gray-100" onClick={e => e.stopPropagation()}>
            <Link href="/" className="block px-4 py-3 rounded-lg font-medium text-text-primary hover:bg-gray-50 transition-colors">
              Accueil
            </Link>
            <Link href="/edition/2026" className="block px-4 py-3 rounded-lg font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              Édition 2026
            </Link>
            <div className="px-4 pt-3 pb-1">
              <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Archives</span>
            </div>
            <Link href="/bilan" className="block px-4 py-3 rounded-lg font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              Toutes les éditions
            </Link>
            {pastEditions.map(e => (
              <Link key={e.id} href={`/bilan/${e.id}`} className="block px-4 py-3 rounded-lg font-medium text-text-secondary hover:bg-gray-50 transition-colors">
                Édition {e.year}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2"></div>
            <Link href="/actualites" className="block px-4 py-3 rounded-lg font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              Actualités
            </Link>
            <div className="h-px bg-gray-100 my-2"></div>
            <Link href="/a-propos" className="block px-4 py-3 rounded-lg font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="block px-4 py-3 rounded-lg font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              Contact
            </Link>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/auth/connexion" className="w-full border border-gray-200 text-text-primary px-5 py-3 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors">
                Connexion
              </Link>
              <Link href="/auth/inscription" className="w-full bg-benin-red hover:bg-red-700 text-white px-5 py-3 rounded-lg font-bold text-center shadow-md transition-all">
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
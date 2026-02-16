import React from 'react';
import Link from 'next/link';
import { Facebook, Linkedin, Twitter, Mail, MapPin, BrainCircuit, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-[#0d1225] to-[#080e1a] text-white pt-20 pb-8 overflow-hidden">
      {/* Neural grid background */}
      <div className="neural-grid opacity-30"></div>
      <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-ioai-green/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-ioai-blue/5 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top section with brand */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 pb-12 border-b border-white/5">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="bg-gradient-to-br from-ioai-green to-ioai-blue p-2.5 rounded-xl text-white shadow-glow-green">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-white leading-tight">
                Olympiades IA <span className="text-gradient-ai">Bénin</span>
              </h3>
              <p className="text-gray-500 text-xs font-medium tracking-wider uppercase">
                Édition 2026 · African Olympiad in AI
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {[
              { icon: Linkedin, href: '#', label: 'LinkedIn' },
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Facebook, href: '#', label: 'Facebook' },
            ].map((social, i) => (
              <a key={i} href={social.href} aria-label={social.label}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:bg-ioai-green/10 hover:border-ioai-green/20 hover:text-ioai-green transition-all duration-300">
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Column 1: About */}
          <div className="md:col-span-2 space-y-4">
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Préparer la nouvelle génération de talents béninois pour les défis mondiaux de l&apos;Intelligence Artificielle. Une initiative portée par Sèmè City sous la tutelle des Ministères.
            </p>
            <div className="flex items-start space-x-3 text-sm text-gray-500 pt-2">
              <MapPin className="w-4 h-4 text-ioai-green shrink-0 mt-0.5" />
              <span>Sèmè City, Ouidah / Cotonou, Bénin</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <Mail className="w-4 h-4 text-ioai-green shrink-0" />
              <a href="mailto:contact@olympiades-ia.bj" className="hover:text-ioai-green transition-colors">contact@olympiades-ia.bj</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white/80 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: 'Inscription 2026', href: '/edition-2026' },
                { label: 'Résultats 2025', href: '/bilan' },
                { label: 'À propos', href: '/a-propos' },
                { label: 'Blog & Actualités', href: '/blog' },
                { label: 'FAQ', href: '#' },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-ioai-green transition-colors flex items-center group">
                    <span>{link.label}</span>
                    <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white/80 uppercase tracking-wider">Informations</h4>
            <ul className="space-y-3">
              {[
                'Mentions Légales',
                'Politique de Confidentialité',
                'Conditions Générales',
              ].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-gray-500 hover:text-white/70 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2026 Olympiades d&apos;IA du Bénin — Tous droits réservés.</p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span>Propulsé par</span>
            <span className="text-ioai-green font-semibold">Sèmè City</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
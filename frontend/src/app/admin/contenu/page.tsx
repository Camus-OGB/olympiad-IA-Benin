'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Quote, Handshake, Image, ArrowRight, Trophy, Newspaper } from 'lucide-react';

export default function ContentManager() {
  const cmsModules = [
    {
      title: 'Blog & Actualités',
      description: 'Gérez les articles de blog, annonces et actualités du site',
      icon: Newspaper,
      path: '/admin/contenu/blog',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Éditions',
      description: 'Gérez les différentes éditions des Olympiades, leurs phases et FAQs',
      icon: Calendar,
      path: '/admin/contenu/editions',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Bilans (Archives)',
      description: 'Gérez les bilans complets des éditions passées (équipes, timeline, photos)',
      icon: Trophy,
      path: '/admin/contenu/bilans',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Témoignages',
      description: 'Ajoutez et modifiez les témoignages des anciens participants',
      icon: Quote,
      path: '/admin/contenu/temoignages',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Partenaires',
      description: 'Gérez les logos et informations des partenaires institutionnels',
      icon: Handshake,
      path: '/admin/contenu/partenaires',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Hero Section',
      description: 'Personnalisez la section principale de la page d\'accueil',
      icon: Image,
      path: '/admin/contenu/hero',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-gray-900">Contenu & CMS</h1>
        <p className="text-gray-500 mt-2">Gérez le contenu dynamique du site vitrine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cmsModules.map((module) => (
          <Link
            key={module.path}
            href={module.path}
            className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-ioai-green shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg`}>
                <module.icon size={28} />
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-ioai-green group-hover:translate-x-1 transition-all" size={24} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ioai-green transition-colors">
              {module.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {module.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 À propos du CMS</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          Ce système de gestion de contenu vous permet de modifier tous les éléments dynamiques du site vitrine sans toucher au code.
          Les modifications sont stockées en base de données et s'affichent instantanément sur le site.
        </p>
      </div>
    </div>
  );
}

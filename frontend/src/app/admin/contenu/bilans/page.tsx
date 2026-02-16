'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EditionBilan {
  id: string;
  year: string;
  slug: string;
  title: string;
  location: string;
  date: string;
  participants: string;
  finalists: string;
  ranking: string;
  medals: string;
  totalCountries: string;
  heroImage: string;
  isPublished: boolean;
}

export default function BilansManager() {
  const [bilans, setBilans] = useState<EditionBilan[]>([
    {
      id: '1',
      year: '2025',
      slug: 'edition-2025',
      title: 'Édition 2025 - Beijing',
      location: 'Beijing, Chine',
      date: 'Août 2025',
      participants: '700+',
      finalists: '4',
      ranking: '30ème',
      medals: '1 Mention Honorable',
      totalCountries: '87',
      heroImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920',
      isPublished: true
    }
  ]);

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bilan ?')) {
      setBilans(bilans.filter(b => b.id !== id));
    }
  };

  const togglePublish = (id: string) => {
    setBilans(bilans.map(b => b.id === id ? { ...b, isPublished: !b.isPublished } : b));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Bilans des Éditions Passées</h1>
          <p className="text-gray-500 mt-2">Gérez les résultats et contenus des éditions précédentes</p>
        </div>
        <Link
          href="/admin/contenu/bilans/nouveau"
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouveau Bilan
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <Trophy size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{bilans.length}</p>
          <p className="text-sm opacity-90">Éditions archivées</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
          <Users size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{bilans.filter(b => b.isPublished).length}</p>
          <p className="text-sm opacity-90">Bilans publiés</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
          <Calendar size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{bilans.length > 0 ? bilans[0].year : '-'}</p>
          <p className="text-sm opacity-90">Dernière édition</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
          <MapPin size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{new Set(bilans.map(b => b.location.split(',')[1]?.trim() || '')).size}</p>
          <p className="text-sm opacity-90">Pays visités</p>
        </div>
      </div>

      {/* Liste des bilans */}
      <div className="grid grid-cols-1 gap-6">
        {bilans.map((bilan) => (
          <div
            key={bilan.id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Image Hero */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src={bilan.heroImage}
                  alt={bilan.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  {bilan.isPublished ? (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Publié
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Brouillon
                    </span>
                  )}
                </div>
              </div>

              {/* Contenu */}
              <div className="lg:col-span-2 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{bilan.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-ioai-blue" />
                        <span>{bilan.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-ioai-blue" />
                        <span>{bilan.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.participants}</p>
                    <p className="text-xs text-gray-600">Participants</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.finalists}</p>
                    <p className="text-xs text-gray-600">Finalistes</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.ranking}</p>
                    <p className="text-xs text-gray-600">Classement</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.totalCountries}</p>
                    <p className="text-xs text-gray-600">Pays</p>
                  </div>
                </div>

                {/* Médailles */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl mb-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-600" size={20} />
                    <span className="font-bold text-gray-900">{bilan.medals}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/admin/contenu/bilans/${bilan.slug}/equipe`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Users size={16} />
                    Gérer l'équipe
                  </Link>
                  <Link
                    href={`/admin/contenu/bilans/${bilan.slug}/timeline`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Calendar size={16} />
                    Timeline
                  </Link>
                  <Link
                    href={`/admin/contenu/bilans/${bilan.slug}/galerie`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    Galerie photos
                  </Link>
                  <Link
                    href={`/admin/contenu/bilans/${bilan.slug}/editer`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    Modifier
                  </Link>

                  <button
                    onClick={() => togglePublish(bilan.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      bilan.isPublished
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {bilan.isPublished ? 'Dépublier' : 'Publier'}
                  </button>

                  <button
                    onClick={() => handleDelete(bilan.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium ml-auto"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {bilans.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun bilan créé. Commencez par ajouter une édition passée.</p>
            <Link
              href="/admin/contenu/bilans/nouveau"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all"
            >
              <Plus size={20} />
              Créer un bilan
            </Link>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">📊 Structure d'un bilan</h3>
        <p className="text-blue-800 text-sm leading-relaxed mb-3">
          Chaque bilan d'édition passée contient :
        </p>
        <ul className="text-blue-800 text-sm space-y-1 ml-4">
          <li>• <strong>Informations générales</strong> : titre, lieu, date, statistiques</li>
          <li>• <strong>Équipe nationale</strong> : les 4 finalistes avec photos et témoignages</li>
          <li>• <strong>Timeline</strong> : chronologie du parcours (inscriptions → compétition)</li>
          <li>• <strong>Galerie photos</strong> : images marquantes de l'édition</li>
        </ul>
      </div>
    </div>
  );
}

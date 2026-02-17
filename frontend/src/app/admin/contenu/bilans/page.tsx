'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { contentApi, PastEdition } from '@/lib/api/content';

export default function BilansManager() {
  const [bilans, setBilans] = useState<PastEdition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilans();
  }, []);

  const loadBilans = async () => {
    try {
      setLoading(true);
      const data = await contentApi.getPastEditions();
      // Trier par année décroissante
      const sorted = data.sort((a, b) => b.year - a.year);
      setBilans(sorted);
    } catch (error) {
      console.error('Erreur lors du chargement des bilans:', error);
      setBilans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bilan ?')) {
      try {
        // Note: il n'y a pas d'endpoint DELETE pour les éditions passées dans l'API actuelle
        // Vous devrez peut-être l'ajouter au backend
        console.warn('DELETE endpoint non implémenté pour les éditions passées');
        alert('La suppression des éditions passées nécessite un endpoint backend supplémentaire.');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du bilan.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des bilans...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-3xl font-bold">{new Set(bilans.map(b => b.hostCountry || '')).size}</p>
          <p className="text-sm opacity-90">Pays visités</p>
        </div>
      </div>

      {/* Liste des bilans */}
      <div className="grid grid-cols-1 gap-6">
        {bilans.map((bilan) => {
          // Récupérer la première image de la galerie comme hero image
          const heroImage = bilan.galleryImages?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920';

          return (
          <div
            key={bilan.id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Image Hero */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src={heroImage}
                  alt={`Édition ${bilan.year}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-ioai-blue text-white text-xs font-bold rounded-full shadow-lg">
                    Édition {bilan.year}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="lg:col-span-2 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Édition {bilan.year}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {bilan.hostCountry && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-ioai-blue" />
                          <span>{bilan.hostCountry}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-ioai-blue" />
                        <span>{bilan.year}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.numStudents || 'N/A'}</p>
                    <p className="text-xs text-gray-600">Participants</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.testimonials?.length || 0}</p>
                    <p className="text-xs text-gray-600">Témoignages</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.achievements?.length || 0}</p>
                    <p className="text-xs text-gray-600">Résultats</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{bilan.galleryImages?.length || 0}</p>
                    <p className="text-xs text-gray-600">Photos</p>
                  </div>
                </div>

                {/* Résultats */}
                {bilan.achievements && bilan.achievements.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl mb-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="text-yellow-600" size={20} />
                      <span className="font-bold text-gray-900">
                        {bilan.achievements.map(a => a.title).join(', ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/admin/contenu/bilans/${bilan.id}/equipe`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Users size={16} />
                    Témoignages ({bilan.testimonials?.length || 0})
                  </Link>
                  <Link
                    href={`/admin/contenu/bilans/${bilan.id}/timeline`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Calendar size={16} />
                    Timeline ({bilan.pastTimelinePhases?.length || 0})
                  </Link>
                  <Link
                    href={`/admin/contenu/bilans/${bilan.id}/galerie`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    Galerie ({bilan.galleryImages?.length || 0})
                  </Link>
                  <Link
                    href={`/admin/contenu/bilans/${bilan.id}/editer`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    Modifier
                  </Link>

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
        );
        })}

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

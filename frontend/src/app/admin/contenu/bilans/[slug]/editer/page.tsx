'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Upload, MapPin, Calendar, Users, Trophy, Loader2 } from 'lucide-react';
import { contentApi, PastEdition, PastEditionUpdate } from '@/lib/api/content';

async function uploadImage(file: File, folder: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.url as string;
}

export default function EditerBilan() {
  const params = useParams();
  const router = useRouter();
  const editionId = params?.slug as string; // En fait, c'est l'ID de l'édition

  const [edition, setEdition] = useState<PastEdition | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    year: number;
    hostCountry: string;
    numStudents: number;
  }>({
    year: new Date().getFullYear(),
    hostCountry: '',
    numStudents: 0,
  });

  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadEdition();
  }, [editionId]);

  const loadEdition = async () => {
    try {
      setLoading(true);
      const data = await contentApi.getPastEdition(editionId);
      setEdition(data);
      setFormData({
        year: data.year,
        hostCountry: data.hostCountry || '',
        numStudents: data.numStudents || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'édition:', error);
      alert('Erreur lors du chargement de l\'édition');
      router.push('/admin/contenu/bilans');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: PastEditionUpdate = {
        year: formData.year,
        hostCountry: formData.hostCountry || undefined,
        numStudents: formData.numStudents || undefined,
      };

      await contentApi.updatePastEdition(editionId, updateData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      // Recharger les données
      await loadEdition();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleHeroFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHeroUploadError(null);
    setIsUploadingHero(true);

    try {
      const url = await uploadImage(file, 'bilan-hero');
      if (!url) {
        setHeroUploadError("Impossible d'uploader l'image. Réessayez.");
        return;
      }
      setFormData((prev) => ({ ...prev, heroImage: url }));
    } catch (error) {
      console.error(error);
      setHeroUploadError("Erreur lors de l'upload de l'image.");
    } finally {
      setIsUploadingHero(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'édition...</p>
        </div>
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Édition introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux bilans
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">
            Modifier le bilan : Édition {edition.year}
          </h1>
          <p className="text-gray-500 mt-2">Éditez les informations générales de cette édition</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 ${
            isSaved
              ? 'bg-green-600 text-white'
              : 'bg-ioai-green text-white hover:bg-green-600'
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={20} />
              {isSaved ? 'Enregistré !' : 'Enregistrer'}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informations générales</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Année *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
                  min="2000"
                  max={new Date().getFullYear()}
                  placeholder="2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Pays hôte
                </label>
                <input
                  type="text"
                  value={formData.hostCountry}
                  onChange={(e) => handleChange('hostCountry', e.target.value)}
                  placeholder="Chine"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Nombre de participants béninois
                </label>
                <input
                  type="number"
                  value={formData.numStudents || ''}
                  onChange={(e) => handleChange('numStudents', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <Trophy className="inline w-5 h-5 mr-2" />
              Contenus détaillés
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Témoignages</p>
                <p className="text-2xl font-bold text-gray-900">{edition.testimonials?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Timeline</p>
                <p className="text-2xl font-bold text-gray-900">{edition.pastTimelinePhases?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Photos</p>
                <p className="text-2xl font-bold text-gray-900">{edition.galleryImages?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Résultats</p>
                <p className="text-2xl font-bold text-gray-900">{edition.achievements?.length || 0}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Utilisez les liens dans le menu de gauche pour gérer ces contenus en détail.
            </p>
          </div>
        </div>

        {/* Aperçu */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu rapide</h3>

              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                  <p className="text-xs opacity-80 mb-1">Année</p>
                  <p className="text-2xl font-bold">{formData.year}</p>
                </div>

                {formData.hostCountry && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Pays hôte</p>
                    <p className="font-bold text-gray-900">{formData.hostCountry}</p>
                  </div>
                )}

                {formData.numStudents > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Participants</p>
                    <p className="font-bold text-gray-900">{formData.numStudents}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>💡 Conseil :</strong> Après avoir sauvegardé les informations générales, utilisez les boutons dans la liste des bilans pour gérer la timeline, les témoignages et la galerie photos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

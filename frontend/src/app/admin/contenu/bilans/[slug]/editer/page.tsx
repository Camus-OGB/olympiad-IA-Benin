'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Upload, MapPin, Calendar, Users, Trophy } from 'lucide-react';

interface BilanFormData {
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
}

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
  const slug = params?.slug as string;

  const [formData, setFormData] = useState<BilanFormData>({
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
    heroImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);

  const handleSave = () => {
    console.log('Saving bilan:', formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (field: keyof BilanFormData, value: string) => {
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
            Modifier le bilan : {formData.title}
          </h1>
          <p className="text-gray-500 mt-2">Éditez les informations générales de cette édition</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl ${
            isSaved
              ? 'bg-green-600 text-white'
              : 'bg-ioai-green text-white hover:bg-green-600'
          }`}
        >
          <Save size={20} />
          {isSaved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informations générales</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Année *</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder="2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Slug URL *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="edition-2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL : /bilan/{formData.slug}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titre complet *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Édition 2025 - Beijing"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Lieu de la compétition *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Beijing, Chine"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Date *
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    placeholder="Août 2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <Users className="inline w-5 h-5 mr-2" />
              Statistiques
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Participants</label>
                <input
                  type="text"
                  value={formData.participants}
                  onChange={(e) => handleChange('participants', e.target.value)}
                  placeholder="700+"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Finalistes</label>
                <input
                  type="text"
                  value={formData.finalists}
                  onChange={(e) => handleChange('finalists', e.target.value)}
                  placeholder="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Classement</label>
                <input
                  type="text"
                  value={formData.ranking}
                  onChange={(e) => handleChange('ranking', e.target.value)}
                  placeholder="30ème"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pays</label>
                <input
                  type="text"
                  value={formData.totalCountries}
                  onChange={(e) => handleChange('totalCountries', e.target.value)}
                  placeholder="87"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <Trophy className="inline w-5 h-5 mr-2" />
              Résultats & Médailles
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Médailles obtenues</label>
              <input
                type="text"
                value={formData.medals}
                onChange={(e) => handleChange('medals', e.target.value)}
                placeholder="1 Mention Honorable"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ex: "1 Or, 2 Argent, 1 Bronze" ou "1 Mention Honorable"
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <Upload className="inline w-5 h-5 mr-2" />
              Image Hero
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fichier image (upload)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ioai-green/10 file:text-ioai-green hover:file:bg-ioai-green/20"
                />
                {isUploadingHero && (
                  <p className="text-xs text-blue-600 mt-1">Upload en cours...</p>
                )}
                {heroUploadError && (
                  <p className="text-xs text-red-600 mt-1">{heroUploadError}</p>
                )}
              </div>

              {formData.heroImage && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Aperçu :</p>
                  <img
                    src={formData.heroImage}
                    alt="Hero preview"
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                  />
                </div>
              )}
            </div>
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

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Lieu</p>
                  <p className="font-bold text-gray-900">{formData.location}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Classement</p>
                  <p className="font-bold text-gray-900">{formData.ranking}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Médailles</p>
                  <p className="font-bold text-gray-900">{formData.medals}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>💡 Conseil :</strong> Après avoir sauvegardé les informations générales, n'oubliez pas de gérer l'équipe, la timeline et la galerie photos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

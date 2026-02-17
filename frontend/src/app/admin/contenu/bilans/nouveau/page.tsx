'use client';

import React, { useState } from 'react';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { contentApi, PastEditionCreate } from '@/lib/api/content';

export default function NewBilanPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    year: number;
    hostCountry: string;
    numStudents: number;
  }>({
    year: new Date().getFullYear(),
    hostCountry: '',
    numStudents: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.year) {
      alert('Veuillez renseigner l\'année de l\'édition');
      return;
    }

    setSaving(true);
    try {
      const createData: PastEditionCreate = {
        year: formData.year,
        hostCountry: formData.hostCountry || undefined,
        numStudents: formData.numStudents || undefined,
      };

      const newEdition = await contentApi.createPastEdition(createData);

      // Rediriger vers la page d'édition de cette édition
      router.push(`/admin/contenu/bilans/${newEdition.id}/editer`);
    } catch (error: any) {
      console.error('Erreur lors de la création du bilan:', error);
      alert(error?.response?.data?.detail || 'Erreur lors de la création du bilan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">
            Nouvelle Édition Passée
          </h1>
          <p className="text-gray-500 mt-2">
            Créez un nouveau bilan pour une édition passée des Olympiades
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Année */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Année de l'édition *
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
              min="2000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
              placeholder="2025"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              L'année de la compétition internationale
            </p>
          </div>

          {/* Pays hôte */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Pays hôte
            </label>
            <input
              type="text"
              value={formData.hostCountry}
              onChange={(e) => setFormData({ ...formData, hostCountry: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
              placeholder="Chine"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le pays où s'est déroulée la compétition
            </p>
          </div>

          {/* Nombre de participants */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre de participants béninois
            </label>
            <input
              type="number"
              value={formData.numStudents || ''}
              onChange={(e) => setFormData({ ...formData, numStudents: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
              placeholder="4"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le nombre d'étudiants béninois qui ont participé
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Note :</strong> Après avoir créé le bilan, vous pourrez ajouter :
            </p>
            <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1">
              <li>• La timeline du parcours</li>
              <li>• Les témoignages des participants</li>
              <li>• Les résultats et médailles</li>
              <li>• La galerie de photos</li>
              <li>• Les articles de presse</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Créer l'édition
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              <X size={20} className="inline mr-2" />
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

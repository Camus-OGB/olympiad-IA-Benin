'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Quote, Loader2, Video, Building } from 'lucide-react';
import { contentApi, GeneralTestimonial } from '@/lib/api/content';

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

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<GeneralTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<GeneralTestimonial | null>(null);
  const [formData, setFormData] = useState({
    authorName: '',
    authorRole: '',
    authorType: 'mentor' as string,
    content: '',
    photoUrl: '',
    videoUrl: '',
    organization: '',
    displayOrder: 0,
    isPublished: true
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await contentApi.getGeneralTestimonials(false); // Charger tous (publiés et non publiés)
      setTestimonials(data);
    } catch (error) {
      console.error('Erreur lors du chargement des témoignages:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingTestimonial(null);
    setFormData({
      authorName: '',
      authorRole: '',
      authorType: 'mentor',
      content: '',
      photoUrl: '',
      videoUrl: '',
      organization: '',
      displayOrder: testimonials.length,
      isPublished: true
    });
  };

  const handleEdit = (testimonial: GeneralTestimonial) => {
    setIsEditing(true);
    setEditingTestimonial(testimonial);
    setFormData({
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole || '',
      authorType: testimonial.authorType || 'mentor',
      content: testimonial.content,
      photoUrl: testimonial.photoUrl || '',
      videoUrl: testimonial.videoUrl || '',
      organization: testimonial.organization || '',
      displayOrder: testimonial.displayOrder || 0,
      isPublished: testimonial.isPublished
    });
  };

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const url = await uploadImage(file, 'testimonials');
      if (!url) {
        setUploadError("Impossible d'uploader l'image. Réessayez.");
        return;
      }
      setFormData((prev) => ({ ...prev, photoUrl: url }));
    } catch (error) {
      console.error(error);
      setUploadError("Erreur lors de l'upload de l'image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.authorName.trim() || !formData.content.trim()) {
      alert('Le nom et le témoignage sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      if (editingTestimonial) {
        await contentApi.updateGeneralTestimonial(editingTestimonial.id, formData);
      } else {
        await contentApi.createGeneralTestimonial(formData);
      }
      await loadTestimonials();
      setIsEditing(false);
      setEditingTestimonial(null);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      try {
        await contentApi.deleteGeneralTestimonial(id);
        await loadTestimonials();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        alert(error?.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const togglePublished = async (testimonial: GeneralTestimonial) => {
    try {
      await contentApi.updateGeneralTestimonial(testimonial.id, {
        isPublished: !testimonial.isPublished
      });
      await loadTestimonials();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut de publication');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTestimonial(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des témoignages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Témoignages Généraux</h1>
          <p className="text-gray-500 mt-2">Gérez les témoignages de mentors, parents, sponsors et partenaires</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouveau Témoignage
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <Quote size={32} className="mb-3 opacity-80" />
          <p className="text-3xl font-bold">{testimonials.length}</p>
          <p className="text-sm opacity-90">Total</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-3xl font-bold">{testimonials.filter(t => t.isPublished).length}</p>
          <p className="text-sm opacity-90">Publiés</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-3xl font-bold">{testimonials.filter(t => t.videoUrl).length}</p>
          <p className="text-sm opacity-90">Avec vidéo</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-3xl font-bold">{new Set(testimonials.map(t => t.authorType)).size}</p>
          <p className="text-sm opacity-90">Types</p>
        </div>
      </div>

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingTestimonial ? 'Modifier le témoignage' : 'Nouveau témoignage'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Marie Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.authorType}
                  onChange={(e) => setFormData({ ...formData, authorType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                >
                  <option value="mentor">Mentor</option>
                  <option value="parent">Parent</option>
                  <option value="sponsor">Sponsor</option>
                  <option value="partner">Partenaire</option>
                  <option value="alumni">Ancien participant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rôle / Titre</label>
                <input
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  placeholder="Mentor Senior"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  Organisation
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Google Bénin"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Quote className="inline w-4 h-4 mr-1" />
                Témoignage *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Votre témoignage inspirant..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Upload className="inline w-4 h-4 mr-1" />
                    Photo du participant (upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ioai-green/10 file:text-ioai-green hover:file:bg-ioai-green/20"
                  />
                  {isUploadingImage && (
                    <p className="text-xs text-blue-600 mt-1">Upload en cours...</p>
                  )}
                  {uploadError && (
                    <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                  )}
                </div>

                {formData.photoUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Video className="inline w-4 h-4 mr-1" />
                  URL Vidéo (YouTube, Vimeo, etc.)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ordre d'affichage</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-ioai-green rounded focus:ring-2 focus:ring-ioai-green"
                  />
                  <span className="text-sm font-bold text-gray-700">Publier sur la page d'accueil</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Enregistrer
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              <X size={20} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des témoignages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all ${
              testimonial.isPublished ? 'border-ioai-green' : 'border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              {testimonial.photoUrl && (
                <img
                  src={testimonial.photoUrl}
                  alt={testimonial.authorName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{testimonial.authorName}</h3>
                <p className="text-sm text-gray-600">{testimonial.authorRole}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {testimonial.authorType}
                  </span>
                  {testimonial.organization && (
                    <span className="text-xs text-gray-500">{testimonial.organization}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative mb-4">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-ioai-green/20" />
              <p className="text-gray-700 italic pl-6 line-clamp-3">&ldquo;{testimonial.content}&rdquo;</p>
            </div>

            {testimonial.videoUrl && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  <Video size={12} />
                  Avec vidéo
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => togglePublished(testimonial)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  testimonial.isPublished
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {testimonial.isPublished ? '✓ Publié' : '○ Brouillon'}
              </button>
              <button
                onClick={() => handleEdit(testimonial)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(testimonial.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && !isEditing && (
          <div className="lg:col-span-2 bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <Quote size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun témoignage créé. Cliquez sur "Nouveau Témoignage" pour commencer.</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">💬 À propos des témoignages</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          Les témoignages généraux sont affichés sur la page d'accueil. Ils permettent de montrer
          l'impact des Olympiades IA à travers les voix de mentors, parents, sponsors et partenaires.
          Pour les témoignages de participants d'éditions passées, utilisez la section "Bilans (Archives)".
        </p>
      </div>
    </div>
  );
}

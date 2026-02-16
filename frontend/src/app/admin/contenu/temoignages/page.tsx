'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Quote, Star } from 'lucide-react';

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

interface Testimonial {
  id: string;
  name: string;
  edition: string;
  role: string;
  quote: string;
  imageUrl: string;
  rating: number;
  featured: boolean;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Akoété',
      edition: '2024',
      role: 'Lauréate 2024',
      quote: 'Participer aux Olympiades a changé ma vie. Je suis maintenant étudiante à l\'EPITA Paris grâce à cette opportunité unique.',
      imageUrl: '/images/portrait1.jpg',
      rating: 5,
      featured: true
    },
    {
      id: '2',
      name: 'Koffi Mensah',
      edition: '2023',
      role: 'Finaliste 2023',
      quote: 'Une expérience incroyable qui m\'a permis de découvrir ma passion pour l\'IA et de rencontrer des mentors exceptionnels.',
      imageUrl: '/images/portrait2.jpg',
      rating: 5,
      featured: false
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    edition: '',
    role: '',
    quote: '',
    imageUrl: '',
    rating: 5,
    featured: false
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(true);
    setEditingTestimonial(null);
    setFormData({
      name: '',
      edition: '',
      role: '',
      quote: '',
      imageUrl: '',
      rating: 5,
      featured: false
    });
  };

  const handleEdit = (testimonial: Testimonial) => {
    setIsEditing(true);
    setEditingTestimonial(testimonial);
    setFormData(testimonial);
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
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error(error);
      setUploadError("Erreur lors de l'upload de l'image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = () => {
    if (editingTestimonial) {
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? { ...formData, id: t.id } as Testimonial : t));
    } else {
      const newTestimonial: Testimonial = {
        ...formData,
        id: Date.now().toString()
      } as Testimonial;
      setTestimonials([...testimonials, newTestimonial]);
    }
    setIsEditing(false);
    setEditingTestimonial(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  const toggleFeatured = (id: string) => {
    setTestimonials(testimonials.map(t => t.id === id ? { ...t, featured: !t.featured } : t));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTestimonial(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Gestion des Témoignages</h1>
          <p className="text-gray-500 mt-2">Gérez les témoignages des anciens participants</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouveau Témoignage
        </button>
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sarah Akoété"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Édition *</label>
                <input
                  type="text"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Rôle / Titre *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Lauréate 2024"
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
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Votre témoignage inspirant..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

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

              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Star className="inline w-4 h-4 mr-1" />
                  Note (1-5)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                >
                  <option value={5}>5 étoiles</option>
                  <option value={4}>4 étoiles</option>
                  <option value={3}>3 étoiles</option>
                  <option value={2}>2 étoiles</option>
                  <option value={1}>1 étoile</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-ioai-green rounded focus:ring-2 focus:ring-ioai-green"
                  />
                  <span className="text-sm font-bold text-gray-700">Témoignage vedette (page d'accueil)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all"
            >
              <Save size={20} />
              Enregistrer
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
              testimonial.featured ? 'border-ioai-green' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={testimonial.imageUrl}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Édition {testimonial.edition}</span>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mb-4">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-ioai-green/20" />
              <p className="text-gray-700 italic pl-6">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>

            {testimonial.featured && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  <Star size={12} className="fill-current" />
                  Témoignage vedette
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => toggleFeatured(testimonial.id)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  testimonial.featured
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {testimonial.featured ? '★ Vedette' : '☆ Mettre en vedette'}
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
    </div>
  );
}

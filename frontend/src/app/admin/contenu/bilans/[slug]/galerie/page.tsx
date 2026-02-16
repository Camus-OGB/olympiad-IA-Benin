'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Upload, Eye, X } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
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

export default function GererGalerie() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [images, setImages] = useState<GalleryImage[]>([
    {
      id: '1',
      url: "https://images.unsplash.com/photo-1547989453-11e67f438a31?q=80&w=800",
      caption: "Cérémonie d'ouverture"
    },
    {
      id: '2',
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400",
      caption: "Équipe du Bénin"
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newImageUrl) return;

    const newImage: GalleryImage = {
      id: Date.now().toString(),
      url: newImageUrl,
      caption: newImageCaption,
    };
    setImages([...images, newImage]);
    setNewImageUrl('');
    setNewImageCaption('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const url = await uploadImage(file, 'bilan-galerie');
      if (!url) {
        setUploadError("Impossible d'uploader l'image. Réessayez.");
        return;
      }
      setNewImageUrl(url);
    } catch (error) {
      console.error(error);
      setUploadError("Erreur lors de l'upload de l'image.");
    } finally {
      setIsUploading(false);
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
            Retour au bilan
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">Galerie Photos - {slug}</h1>
          <p className="text-gray-500 mt-2">Images marquantes de l'édition</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Ajouter une image
        </button>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
        <p className="text-sm opacity-80 mb-1">Total d'images</p>
        <p className="text-4xl font-bold">{images.length}</p>
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter une image</h2>

          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Image (upload) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ioai-green/10 file:text-ioai-green hover:file:bg-ioai-green/20"
                />
                {isUploading && (
                  <p className="text-xs text-blue-600 mt-1">Upload en cours...</p>
                )}
                {uploadError && (
                  <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Légende (optionnel)</label>
              <input
                type="text"
                value={newImageCaption}
                onChange={(e) => setNewImageCaption(e.target.value)}
                placeholder="Description de l'image..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            {newImageUrl && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Aperçu :</p>
                <img
                  src={newImageUrl}
                  alt="Preview"
                  className="w-full max-w-md h-64 object-cover rounded-xl border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all"
            >
              <Plus size={20} />
              Ajouter
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewImageUrl('');
                setNewImageCaption('');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              <X size={20} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Grille d'images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <button
                  onClick={() => setPreviewImage(image.url)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {image.caption && (
                <p className="text-sm text-gray-700 mb-3">{image.caption}</p>
              )}
              <button
                onClick={() => handleDelete(image.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {images.length === 0 && !isAdding && (
          <div className="sm:col-span-2 lg:col-span-3 bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <Upload size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucune image dans la galerie. Ajoutez-en une pour commencer.</p>
          </div>
        )}
      </div>

      {/* Modal de prévisualisation */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100"
            onClick={() => setPreviewImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">📸 Conseils pour la galerie</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          Ajoutez des photos variées : cérémonie d'ouverture, équipe en action, moments de collaboration,
          remise des prix, visites touristiques, etc. Privilégiez des images de haute qualité (min 800x600px).
        </p>
      </div>
    </div>
  );
}

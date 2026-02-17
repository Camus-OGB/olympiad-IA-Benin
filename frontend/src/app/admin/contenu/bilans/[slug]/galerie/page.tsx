'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Upload, Eye, X, Loader2, Images, Star } from 'lucide-react';
import { contentApi, PastEdition, GalleryImage } from '@/lib/api/content';

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

interface PendingFile {
  file: File;
  preview: string;
  caption: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
}

export default function GererGalerie() {
  const params = useParams();
  const router = useRouter();
  const editionId = params?.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [edition, setEdition] = useState<PastEdition | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadEdition();
  }, [editionId]);

  const loadEdition = async () => {
    try {
      setLoading(true);
      const data = await contentApi.getPastEdition(editionId);
      setEdition(data);
      setImages(data.galleryImages || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'édition:', error);
      alert('Erreur lors du chargement de l\'édition');
      router.push('/admin/contenu/bilans');
    } finally {
      setLoading(false);
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const newEntries: PendingFile[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        caption: '',
        status: 'pending' as const,
      }));
    if (newEntries.length > 0) {
      setPendingFiles(prev => [...prev, ...newEntries]);
      setIsAdding(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const updateCaption = (idx: number, caption: string) => {
    setPendingFiles(prev => prev.map((f, i) => i === idx ? { ...f, caption } : f));
  };

  const removePending = (idx: number) => {
    setPendingFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSaveAll = async () => {
    const pending = pendingFiles.filter(f => f.status === 'pending');
    if (pending.length === 0) return;

    setIsSavingAll(true);

    // Upload + save séquentiellement pour chaque image
    for (let i = 0; i < pendingFiles.length; i++) {
      const pf = pendingFiles[i];
      if (pf.status !== 'pending') continue;

      // Marquer comme uploading
      setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

      try {
        const url = await uploadImage(pf.file, 'bilan-galerie');
        if (!url) throw new Error("Upload échoué");

        await contentApi.createGalleryImage(editionId, {
          imageUrl: url,
          caption: pf.caption || undefined,
          order: images.length + i + 1,
        });

        setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', url } : f));
      } catch (err: any) {
        setPendingFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: 'Échec de l\'upload' } : f));
      }
    }

    await loadEdition();
    setIsSavingAll(false);

    // Nettoyer les fichiers terminés avec succès
    setPendingFiles(prev => {
      prev.filter(f => f.status === 'done').forEach(f => URL.revokeObjectURL(f.preview));
      return prev.filter(f => f.status === 'error');
    });

    if (pendingFiles.every(f => f.status !== 'error')) {
      setIsAdding(false);
    }
  };

  const handleSetCover = async (image: GalleryImage) => {
    if (image.order === 0) return; // Déjà couverture
    try {
      // Mettre la nouvelle couverture à order=0, pousser les autres à order+1
      const updates = images.map(img => ({
        ...img,
        order: img.id === image.id ? 0 : (img.order < image.order ? img.order + 1 : img.order),
      }));
      // Sauvegarder dans l'ordre pour éviter les conflits
      await Promise.all(
        updates.map(img =>
          contentApi.updateGalleryImage(editionId, img.id, {
            imageUrl: img.imageUrl,
            caption: img.caption,
            order: img.order,
          })
        )
      );
      await loadEdition();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      try {
        await contentApi.deleteGalleryImage(editionId, id);
        await loadEdition();
      } catch (error: any) {
        alert(error?.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const cancelAdding = () => {
    pendingFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setPendingFiles([]);
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la galerie...</p>
        </div>
      </div>
    );
  }

  if (!edition) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Édition introuvable</p>
      </div>
    );
  }

  const pendingCount = pendingFiles.filter(f => f.status === 'pending').length;
  const sortedImages = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const coverImageId = sortedImages[0]?.id;

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
          <h1 className="text-3xl font-display font-black text-gray-900">Galerie Photos — Édition {edition.year}</h1>
          <p className="text-gray-500 mt-2">{images.length} photo{images.length !== 1 ? 's' : ''} dans la galerie</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Ajouter des photos
        </button>
        {/* Input caché — multiple */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Zone de drop + aperçu des fichiers en attente */}
      {(isAdding || pendingFiles.length > 0) && (
        <div className="bg-white rounded-2xl border-2 border-ioai-green shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Images size={20} className="text-ioai-green" />
              {pendingFiles.length} photo{pendingFiles.length !== 1 ? 's' : ''} à ajouter
            </h2>
            <button onClick={cancelAdding} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          {/* Zone de drop */}
          <div
            className={`m-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-ioai-green bg-ioai-green/5' : 'border-gray-300 hover:border-ioai-green/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Glissez des photos ici ou <span className="text-ioai-green font-semibold">cliquez pour en ajouter d'autres</span>
            </p>
            <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP — plusieurs fichiers acceptés</p>
          </div>

          {/* Liste des fichiers en attente */}
          {pendingFiles.length > 0 && (
            <div className="px-6 pb-6 space-y-3">
              {pendingFiles.map((pf, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border ${
                  pf.status === 'done' ? 'border-green-200 bg-green-50' :
                  pf.status === 'error' ? 'border-red-200 bg-red-50' :
                  pf.status === 'uploading' ? 'border-blue-200 bg-blue-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  {/* Miniature */}
                  <img src={pf.preview} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />

                  {/* Légende */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1 truncate">{pf.file.name}</p>
                    <input
                      type="text"
                      value={pf.caption}
                      onChange={(e) => updateCaption(idx, e.target.value)}
                      placeholder="Légende (optionnel)..."
                      disabled={pf.status !== 'pending'}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    {pf.error && <p className="text-xs text-red-600 mt-1">{pf.error}</p>}
                  </div>

                  {/* Statut / Supprimer */}
                  <div className="flex-shrink-0">
                    {pf.status === 'uploading' && (
                      <Loader2 size={20} className="animate-spin text-blue-500" />
                    )}
                    {pf.status === 'done' && (
                      <span className="text-green-600 text-xs font-bold">✓ Ajouté</span>
                    )}
                    {pf.status === 'error' && (
                      <span className="text-red-600 text-xs font-bold">✗ Erreur</span>
                    )}
                    {pf.status === 'pending' && (
                      <button
                        onClick={() => removePending(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveAll}
                  disabled={isSavingAll || pendingCount === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isSavingAll ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Enregistrer {pendingCount} photo{pendingCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
                <button
                  onClick={cancelAdding}
                  disabled={isSavingAll}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grille d'images existantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedImages.map((image) => {
            const isCover = image.id === coverImageId;
            return (
            <div
              key={image.id}
              className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all overflow-hidden group ${
                isCover ? 'border-benin-yellow' : 'border-gray-200'
              }`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.caption || 'Image de la galerie'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badge couverture */}
                {isCover && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-benin-yellow text-white text-xs font-bold rounded-full shadow">
                    <Star size={12} fill="currentColor" />
                    Couverture
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <button
                    onClick={() => setPreviewImage(image.imageUrl)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white rounded-full text-gray-900 hover:bg-gray-100"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {image.caption && (
                  <p className="text-sm text-gray-700">{image.caption}</p>
                )}
                {!isCover && (
                  <button
                    onClick={() => handleSetCover(image)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-benin-yellow/10 text-benin-yellow rounded-lg hover:bg-benin-yellow/20 transition-colors text-sm font-medium border border-benin-yellow/30"
                  >
                    <Star size={14} />
                    Définir comme couverture
                  </button>
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
          );
        })}

        {sortedImages.length === 0 && !isAdding && (
          <div
            className="sm:col-span-2 lg:col-span-3 bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center cursor-pointer hover:border-ioai-green/50 transition-colors"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2 font-medium">Aucune photo dans la galerie</p>
            <p className="text-gray-400 text-sm">Glissez des photos ici ou cliquez pour en sélectionner</p>
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
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Upload, Quote, Medal, Loader2 } from 'lucide-react';
import { contentApi, PastEdition, Testimonial } from '@/lib/api/content';

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

export default function GererEquipe() {
  const params = useParams();
  const router = useRouter();
  const editionId = params?.slug as string;

  const [edition, setEdition] = useState<PastEdition | null>(null);
  const [members, setMembers] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<{
    studentName: string;
    school: string;
    role: string;
    quote: string;
    imageUrl: string;
  }>({
    studentName: '',
    school: '',
    role: '',
    quote: '',
    imageUrl: ''
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEdition();
  }, [editionId]);

  const loadEdition = async () => {
    try {
      setLoading(true);
      const data = await contentApi.getPastEdition(editionId);
      setEdition(data);
      setMembers(data.testimonials || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'édition:', error);
      alert('Erreur lors du chargement de l\'édition');
      router.push('/admin/contenu/bilans');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingMember(null);
    setFormData({ studentName: '', school: '', role: '', quote: '', imageUrl: '' });
  };

  const handleEdit = (member: Testimonial) => {
    setIsEditing(true);
    setEditingMember(member);
    setFormData({
      studentName: member.studentName,
      school: member.school || '',
      role: member.role || '',
      quote: member.quote,
      imageUrl: member.imageUrl || ''
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
      const url = await uploadImage(file, 'bilan-equipe');
      if (!url) {
        setUploadError("Impossible d'uploader la photo. Réessayez.");
        return;
      }
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error(error);
      setUploadError("Erreur lors de l'upload de la photo.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.studentName.trim() || !formData.quote.trim()) {
      alert('Le nom et le témoignage sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      if (editingMember) {
        await contentApi.updateTestimonial(editionId, editingMember.id, {
          studentName: formData.studentName,
          quote: formData.quote,
          school: formData.school || undefined,
          role: formData.role || undefined,
          imageUrl: formData.imageUrl || undefined
        });
      } else {
        await contentApi.createTestimonial(editionId, {
          studentName: formData.studentName,
          quote: formData.quote,
          school: formData.school || undefined,
          role: formData.role || undefined,
          imageUrl: formData.imageUrl || undefined
        });
      }
      await loadEdition();
      setIsEditing(false);
      setEditingMember(null);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      try {
        await contentApi.deleteTestimonial(editionId, id);
        await loadEdition();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        alert(error?.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingMember(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'équipe...</p>
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
            Retour au bilan
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">Équipe nationale - Édition {edition.year}</h1>
          <p className="text-gray-500 mt-2">{members.length} participant{members.length !== 1 ? 's' : ''} ajouté{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Ajouter un participant
        </button>
      </div>

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingMember ? 'Modifier le participant' : 'Nouveau participant'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Merveille Agbossaga"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Établissement *</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="Lycée Militaire de Jeunes Filles"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Medal className="inline w-4 h-4 mr-1" />
                Rôle / Distinction <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Mention Honorable, Finaliste National, Médaille d'Or..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Quote className="inline w-4 h-4 mr-1" />
                Citation / Témoignage *
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Une phrase inspirante du participant..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Photo du membre (upload) *
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

      {/* Liste des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            {member.imageUrl && (
              <div className="relative h-64">
                <img
                  src={member.imageUrl}
                  alt={member.studentName}
                  className="w-full h-full object-cover"
                />
                {member.role && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-ioai-green text-white text-xs font-bold rounded-full shadow-lg">
                      {member.role}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.studentName}</h3>
              {member.school && (
                <p className="text-sm text-gray-600 mb-4">{member.school}</p>
              )}

              <div className="relative bg-gray-50 p-4 rounded-xl mb-4">
                <Quote className="absolute top-2 left-2 w-6 h-6 text-ioai-green/20" />
                <p className="text-sm text-gray-700 italic pl-6">&ldquo;{member.quote}&rdquo;</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}

        {members.length === 0 && !isEditing && (
          <div className="md:col-span-2 bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <Medal size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun participant ajouté pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Upload, Quote, Medal } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  school: string;
  role: string;
  quote: string;
  image: string;
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

export default function GererEquipe() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: "Merveille Agbossaga",
      school: "Lycée Militaire de Jeunes Filles",
      role: "Mention Honorable",
      quote: "Représenter le Bénin à Beijing m'a prouvé que nous avons notre place.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400"
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    school: '',
    role: '',
    quote: '',
    image: ''
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(true);
    setEditingMember(null);
    setFormData({ name: '', school: '', role: '', quote: '', image: '' });
  };

  const handleEdit = (member: TeamMember) => {
    setIsEditing(true);
    setEditingMember(member);
    setFormData(member);
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
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (error) {
      console.error(error);
      setUploadError("Erreur lors de l'upload de la photo.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = () => {
    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? { ...formData, id: m.id } as TeamMember : m));
    } else {
      const newMember: TeamMember = {
        ...formData,
        id: Date.now().toString()
      } as TeamMember;
      setMembers([...members, newMember]);
    }
    setIsEditing(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingMember(null);
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
          <h1 className="text-3xl font-display font-black text-gray-900">Équipe nationale - {slug}</h1>
          <p className="text-gray-500 mt-2">Gérez les 4 finalistes qui ont représenté le Bénin</p>
        </div>
        {members.length < 4 && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Ajouter un membre
          </button>
        )}
      </div>

      {members.length >= 4 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
          <p className="text-green-800 text-sm">
            ✅ <strong>Équipe complète !</strong> Les 4 finalistes ont été ajoutés.
          </p>
        </div>
      )}

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingMember ? 'Modifier le membre' : 'Nouveau membre'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                Rôle / Distinction *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Mention Honorable / Finaliste National / Médaille d'Or..."
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

              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <img
                    src={formData.image}
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

      {/* Liste des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="relative h-64">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-ioai-green text-white text-xs font-bold rounded-full shadow-lg">
                  {member.role}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{member.school}</p>

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
            <p className="text-gray-500 mb-4">Aucun membre ajouté. Commencez par ajouter les 4 finalistes.</p>
          </div>
        )}
      </div>

      {members.length > 0 && members.length < 4 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Équipe incomplète :</strong> Il manque {4 - members.length} membre(s) pour former l'équipe de 4 finalistes.
          </p>
        </div>
      )}
    </div>
  );
}

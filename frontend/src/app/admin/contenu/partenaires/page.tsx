'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
import { contentApi, Partner, PartnerCreate, PartnerUpdate } from '@/lib/api/content';

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

export default function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    logoUrl: '',
    websiteUrl: '',
    description: '',
    isActive: true,
    order: 0
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  // Charger les partenaires depuis l'API
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await contentApi.getPartners({});
      // Trier par ordre
      const sortedData = data.sort((a, b) => a.order - b.order);
      setPartners(sortedData);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingPartner(null);
    setFormData({
      name: '',
      logoUrl: '',
      websiteUrl: '',
      description: '',
      isActive: true,
      order: partners.length + 1
    });
  };

  const handleEdit = (partner: Partner) => {
    setIsEditing(true);
    setEditingPartner(partner);
    setFormData(partner);
  };

  const handleLogoFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoUploadError(null);
    setIsUploadingLogo(true);

    try {
      const url = await uploadImage(file, 'partners');
      if (!url) {
        setLogoUploadError("Impossible d'uploader le logo. Réessayez.");
        return;
      }
      setFormData((prev) => ({ ...prev, logoUrl: url }));
    } catch (error) {
      console.error(error);
      setLogoUploadError("Erreur lors de l'upload du logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingPartner) {
        // Mise à jour d'un partenaire existant
        const updateData: PartnerUpdate = {
          name: formData.name,
          logoUrl: formData.logoUrl,
          websiteUrl: formData.websiteUrl,
          description: formData.description,
          isActive: formData.isActive,
          order: formData.order
        };
        await contentApi.updatePartner(editingPartner.id, updateData);
      } else {
        // Création d'un nouveau partenaire
        const createData: PartnerCreate = {
          name: formData.name || '',
          logoUrl: formData.logoUrl,
          websiteUrl: formData.websiteUrl,
          description: formData.description,
          isActive: formData.isActive ?? true,
          order: formData.order ?? partners.length + 1
        };
        await contentApi.createPartner(createData);
      }

      // Recharger la liste des partenaires
      await fetchPartners();
      setIsEditing(false);
      setEditingPartner(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du partenaire:', error);
      alert('Erreur lors de la sauvegarde du partenaire. Veuillez réessayer.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      try {
        await contentApi.deletePartner(id);
        await fetchPartners();
      } catch (error) {
        console.error('Erreur lors de la suppression du partenaire:', error);
        alert('Erreur lors de la suppression du partenaire.');
      }
    }
  };

  const movePartner = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= partners.length) return;

    try {
      // Échanger les ordres
      const partner1 = partners[index];
      const partner2 = partners[targetIndex];

      await contentApi.updatePartner(partner1.id, { order: partner2.order });
      await contentApi.updatePartner(partner2.id, { order: partner1.order });

      // Recharger la liste
      await fetchPartners();
    } catch (error) {
      console.error('Erreur lors du déplacement du partenaire:', error);
      alert('Erreur lors du déplacement du partenaire.');
    }
  };

  const toggleVisibility = async (id: string) => {
    try {
      const partner = partners.find(p => p.id === id);
      if (!partner) return;

      await contentApi.updatePartner(id, { isActive: !partner.isActive });
      await fetchPartners();
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
      alert('Erreur lors du changement de visibilité.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPartner(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Gestion des Partenaires</h1>
          <p className="text-gray-500 mt-2">Gérez les logos et informations des partenaires</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouveau Partenaire
        </button>
      </div>

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom du partenaire *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ministère du Numérique"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ordre d'affichage *</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min="1"
                  placeholder="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brève description du partenaire"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  Logo du partenaire (upload) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ioai-green/10 file:text-ioai-green hover:file:bg-ioai-green/20"
                />
                {isUploadingLogo && (
                  <p className="text-xs text-blue-600 mt-1">Upload en cours...</p>
                )}
                {logoUploadError && (
                  <p className="text-xs text-red-600 mt-1">{logoUploadError}</p>
                )}
              </div>

              {formData.logoUrl && (
                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-2">Aperçu du logo :</p>
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="h-20 object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <ExternalLink className="inline w-4 h-4 mr-1" />
                Site web
              </label>
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://exemple.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-ioai-green rounded focus:ring-2 focus:ring-ioai-green"
                />
                <span className="text-sm font-bold text-gray-700">Visible sur le site vitrine</span>
              </label>
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

      {/* Liste des partenaires */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des partenaires...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {partners.length === 0 && !isEditing ? (
            <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500">Aucun partenaire créé. Cliquez sur "Nouveau Partenaire" pour commencer.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tous les partenaires</h2>
                <span className="text-sm text-gray-500">({partners.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner, index) => (
                  <div
                    key={partner.id}
                    className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-xl p-4 mb-3 flex items-center justify-center h-24">
                          {partner.logoUrl ? (
                            <img
                              src={partner.logoUrl}
                              alt={partner.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">Aucun logo</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">#{partner.order}</span>
                          <h3 className="font-bold text-gray-900">{partner.name}</h3>
                        </div>
                        {partner.description && (
                          <p className="text-sm text-gray-600 mb-2">{partner.description}</p>
                        )}
                        {partner.websiteUrl && (
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-ioai-blue hover:underline flex items-center gap-1"
                          >
                            Site web <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePartner(index, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Monter"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => movePartner(index, 'down')}
                          disabled={index === partners.length - 1}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Descendre"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleVisibility(partner.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          partner.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {partner.isActive ? 'Visible' : 'Masqué'}
                      </button>

                      <button
                        onClick={() => handleEdit(partner)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

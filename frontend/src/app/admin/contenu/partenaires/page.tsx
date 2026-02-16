'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';

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

interface Partner {
  id: string;
  order: number;
  name: string;
  category: 'platinum' | 'gold' | 'silver' | 'institutional';
  logoUrl: string;
  websiteUrl: string;
  description: string;
  isVisible: boolean;
}

export default function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: '1',
      order: 1,
      name: 'Ministère du Numérique et de la Digitalisation',
      category: 'institutional',
      logoUrl: '/images/partners/mnd.png',
      websiteUrl: 'https://numerique.gouv.bj',
      description: 'Partenaire institutionnel principal',
      isVisible: true
    },
    {
      id: '2',
      order: 2,
      name: 'EPITA',
      category: 'platinum',
      logoUrl: '/images/partners/epita.png',
      websiteUrl: 'https://epita.fr',
      description: 'École d\'ingénieurs en informatique',
      isVisible: true
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    category: 'silver',
    logoUrl: '',
    websiteUrl: '',
    description: '',
    isVisible: true
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  const categoryLabels = {
    platinum: 'Platine',
    gold: 'Or',
    silver: 'Argent',
    institutional: 'Institutionnel'
  };

  const categoryColors = {
    platinum: 'from-slate-300 to-slate-100',
    gold: 'from-yellow-300 to-yellow-100',
    silver: 'from-gray-300 to-gray-100',
    institutional: 'from-blue-300 to-blue-100'
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingPartner(null);
    setFormData({
      name: '',
      category: 'silver',
      logoUrl: '',
      websiteUrl: '',
      description: '',
      isVisible: true
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

  const handleSave = () => {
    if (editingPartner) {
      setPartners(partners.map(p => p.id === editingPartner.id ? { ...formData, id: p.id, order: p.order } as Partner : p));
    } else {
      const newPartner: Partner = {
        ...formData,
        id: Date.now().toString(),
        order: partners.length + 1
      } as Partner;
      setPartners([...partners, newPartner]);
    }
    setIsEditing(false);
    setEditingPartner(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      setPartners(partners.filter(p => p.id !== id));
    }
  };

  const movePartner = (index: number, direction: 'up' | 'down') => {
    const newPartners = [...partners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= partners.length) return;

    [newPartners[index], newPartners[targetIndex]] = [newPartners[targetIndex], newPartners[index]];
    newPartners.forEach((partner, idx) => partner.order = idx + 1);

    setPartners(newPartners);
  };

  const toggleVisibility = (id: string) => {
    setPartners(partners.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPartner(null);
  };

  const partnersByCategory = {
    institutional: partners.filter(p => p.category === 'institutional').sort((a, b) => a.order - b.order),
    platinum: partners.filter(p => p.category === 'platinum').sort((a, b) => a.order - b.order),
    gold: partners.filter(p => p.category === 'gold').sort((a, b) => a.order - b.order),
    silver: partners.filter(p => p.category === 'silver').sort((a, b) => a.order - b.order),
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Partner['category'] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                >
                  <option value="institutional">Institutionnel</option>
                  <option value="platinum">Platine</option>
                  <option value="gold">Or</option>
                  <option value="silver">Argent</option>
                </select>
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
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
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

      {/* Liste des partenaires par catégorie */}
      <div className="space-y-8">
        {Object.entries(partnersByCategory).map(([category, categoryPartners]) => (
          categoryPartners.length > 0 && (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${categoryColors[category as Partner['category']]}`}></div>
                <h2 className="text-xl font-bold text-gray-900">{categoryLabels[category as Partner['category']]}</h2>
                <span className="text-sm text-gray-500">({categoryPartners.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPartners.map((partner, index) => (
                  <div
                    key={partner.id}
                    className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-xl p-4 mb-3 flex items-center justify-center h-24">
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{partner.name}</h3>
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
                          onClick={() => movePartner(partners.findIndex(p => p.id === partner.id), 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Monter"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => movePartner(partners.findIndex(p => p.id === partner.id), 'down')}
                          disabled={index === categoryPartners.length - 1}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Descendre"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleVisibility(partner.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          partner.isVisible
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {partner.isVisible ? 'Visible' : 'Masqué'}
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
          )
        ))}

        {partners.length === 0 && !isEditing && (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-500">Aucun partenaire créé. Cliquez sur "Nouveau Partenaire" pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}

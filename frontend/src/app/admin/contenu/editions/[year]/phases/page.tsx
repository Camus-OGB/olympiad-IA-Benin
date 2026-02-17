'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, ArrowUp, ArrowDown, Clock, Loader2, Calendar } from 'lucide-react';
import { contentApi, Edition, TimelinePhase, TimelinePhaseCreate } from '@/lib/api/content';

export default function PhasesManager() {
  const params = useParams();
  const router = useRouter();
  const year = params?.year as string;

  const [edition, setEdition] = useState<Edition | null>(null);
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TimelinePhase | null>(null);
  const [formData, setFormData] = useState<TimelinePhaseCreate>({
    phaseOrder: 1,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  useEffect(() => {
    loadEdition();
  }, [year]);

  const loadEdition = async () => {
    try {
      setLoading(true);
      const editions = await contentApi.getEditions();
      const found = editions.find(e => String(e.year) === String(year));
      if (!found) {
        alert('Édition introuvable pour l\'année ' + year);
        router.push('/admin/contenu/editions');
        return;
      }
      // Re-fetch with full details (includes timelinePhases)
      const fullEdition = await contentApi.getEdition(found.id);
      setEdition(fullEdition);
      const sorted = [...(fullEdition.timelinePhases || [])].sort((a, b) => a.phaseOrder - b.phaseOrder);
      setPhases(sorted);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement de l\'édition');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingPhase(null);
    setFormData({
      phaseOrder: phases.length + 1,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    });
  };

  const handleEdit = (phase: TimelinePhase) => {
    setIsEditing(true);
    setEditingPhase(phase);
    setFormData({
      phaseOrder: phase.phaseOrder,
      title: phase.title,
      description: phase.description || '',
      startDate: phase.startDate || '',
      endDate: phase.endDate || '',
      isCurrent: phase.isCurrent,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }
    if (!edition) return;

    setSaving(true);
    try {
      const payload: TimelinePhaseCreate = {
        phaseOrder: formData.phaseOrder,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isCurrent: formData.isCurrent,
      };

      if (editingPhase) {
        await contentApi.updateEditionPhase(edition.id, editingPhase.id, payload);
      } else {
        await contentApi.createEditionPhase(edition.id, payload);
      }
      await loadEdition();
      setIsEditing(false);
      setEditingPhase(null);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (phase: TimelinePhase) => {
    if (!edition) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette phase ?')) {
      try {
        await contentApi.deleteEditionPhase(edition.id, phase.id);
        await loadEdition();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        alert(error?.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPhase(null);
  };

  const movePhase = async (index: number, direction: 'up' | 'down') => {
    if (!edition) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= phases.length) return;

    const sorted = [...phases];
    [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];

    // Update orders locally first for immediate feedback
    const reordered = sorted.map((p, i) => ({ ...p, phaseOrder: i + 1 }));
    setPhases(reordered);

    // Persist new orders
    try {
      await Promise.all(
        reordered.map(p =>
          contentApi.updateEditionPhase(edition.id, p.id, {
            phaseOrder: p.phaseOrder,
            title: p.title,
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate,
            isCurrent: p.isCurrent,
          })
        )
      );
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error);
      await loadEdition(); // Reload to restore correct state
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des phases...</p>
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux éditions
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">Phases de l'édition {year}</h1>
          <p className="text-gray-500 mt-2">{phases.length} phase{phases.length !== 1 ? 's' : ''} configurée{phases.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouvelle Phase
        </button>
      </div>

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingPhase ? 'Modifier la phase' : 'Nouvelle phase'}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titre de la phase *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Phase 1 : Pré-sélection (QCM)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ordre</label>
                <input
                  type="number"
                  min={1}
                  value={formData.phaseOrder}
                  onChange={(e) => setFormData({ ...formData, phaseOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée de la phase..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                className="w-5 h-5 rounded accent-ioai-green"
              />
              <label htmlFor="isCurrent" className="text-sm font-bold text-gray-700">
                Phase en cours (active actuellement)
              </label>
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

      {/* Liste des phases */}
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={`bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all ${
              phase.isCurrent ? 'border-ioai-green' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-400">#{phase.phaseOrder}</span>
                  <h3 className="text-xl font-bold text-gray-900">{phase.title}</h3>
                  {phase.isCurrent && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      En cours
                    </span>
                  )}
                </div>

                {(phase.startDate || phase.endDate) && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Calendar size={16} className="text-ioai-blue" />
                    <span className="text-sm font-medium">
                      {phase.startDate && new Date(phase.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {phase.startDate && phase.endDate && ' → '}
                      {phase.endDate && new Date(phase.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {phase.description && (
                  <p className="text-gray-700">{phase.description}</p>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 ml-4">
                <div className="flex gap-1">
                  <button
                    onClick={() => movePhase(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    onClick={() => movePhase(index, 'down')}
                    disabled={index === phases.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={20} />
                  </button>
                </div>
                <button
                  onClick={() => handleEdit(phase)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(phase)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {phases.length === 0 && !isEditing && (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune phase créée pour cette édition.</p>
          </div>
        )}
      </div>
    </div>
  );
}

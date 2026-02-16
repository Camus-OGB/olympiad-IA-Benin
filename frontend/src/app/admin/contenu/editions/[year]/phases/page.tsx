'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, ArrowUp, ArrowDown, CheckCircle, Clock, Calendar } from 'lucide-react';

interface Phase {
  id: string;
  order: number;
  title: string;
  date: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  criteria: string[];
}

export default function PhasesManager() {
  const params = useParams();
  const router = useRouter();
  const year = params?.year as string;

  const [phases, setPhases] = useState<Phase[]>([
    {
      id: '1',
      order: 1,
      title: "Inscriptions & Sensibilisation",
      date: "Janvier - Février 2026",
      description: "Lancement de la plateforme, tournées dans les lycées, et enregistrement des candidats.",
      status: "current",
      criteria: ["Être élève en 2nde, 1ère ou Terminale", "Moins de 20 ans"]
    },
    {
      id: '2',
      order: 2,
      title: "Phase 1 : Pré-sélection (QCM)",
      date: "15 Mars 2026",
      description: "Test de logique, mathématiques et culture numérique chronométré.",
      status: "upcoming",
      criteria: ["Note supérieure à 14/20", "Classement national"]
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [formData, setFormData] = useState<Partial<Phase>>({
    title: '',
    date: '',
    description: '',
    status: 'upcoming',
    criteria: ['']
  });

  const handleAdd = () => {
    setIsEditing(true);
    setEditingPhase(null);
    setFormData({
      title: '',
      date: '',
      description: '',
      status: 'upcoming',
      criteria: ['']
    });
  };

  const handleEdit = (phase: Phase) => {
    setIsEditing(true);
    setEditingPhase(phase);
    setFormData(phase);
  };

  const handleSave = () => {
    if (editingPhase) {
      setPhases(phases.map(p => p.id === editingPhase.id ? { ...formData, id: p.id, order: p.order } as Phase : p));
    } else {
      const newPhase: Phase = {
        ...formData,
        id: Date.now().toString(),
        order: phases.length + 1
      } as Phase;
      setPhases([...phases, newPhase]);
    }
    setIsEditing(false);
    setEditingPhase(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette phase ?')) {
      setPhases(phases.filter(p => p.id !== id));
    }
  };

  const movePhase = (index: number, direction: 'up' | 'down') => {
    const newPhases = [...phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= phases.length) return;

    [newPhases[index], newPhases[targetIndex]] = [newPhases[targetIndex], newPhases[index]];
    newPhases.forEach((phase, idx) => phase.order = idx + 1);

    setPhases(newPhases);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPhase(null);
  };

  const addCriterion = () => {
    setFormData({
      ...formData,
      criteria: [...(formData.criteria || []), '']
    });
  };

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...(formData.criteria || [])];
    newCriteria[index] = value;
    setFormData({ ...formData, criteria: newCriteria });
  };

  const removeCriterion = (index: number) => {
    const newCriteria = (formData.criteria || []).filter((_, i) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
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
            Retour aux éditions
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">Phases de l'édition {year}</h1>
          <p className="text-gray-500 mt-2">Gérez le calendrier et les critères de chaque phase</p>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date *
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="15 Mars 2026"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée de la phase..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Statut *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Phase['status'] })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              >
                <option value="upcoming">À venir</option>
                <option value="current">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-700">Critères de sélection</label>
                <button
                  onClick={addCriterion}
                  className="text-sm text-ioai-blue hover:underline flex items-center gap-1"
                >
                  <Plus size={16} />
                  Ajouter un critère
                </button>
              </div>
              <div className="space-y-3">
                {(formData.criteria || []).map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => updateCriterion(index, e.target.value)}
                      placeholder="Ex: Note supérieure à 14/20"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                    />
                    <button
                      onClick={() => removeCriterion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
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

      {/* Liste des phases */}
      <div className="space-y-4">
        {phases.sort((a, b) => a.order - b.order).map((phase, index) => (
          <div
            key={phase.id}
            className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-400">#{phase.order}</span>
                  <h3 className="text-xl font-bold text-gray-900">{phase.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      phase.status === 'current'
                        ? 'bg-green-100 text-green-700'
                        : phase.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {phase.status === 'current' ? 'En cours' : phase.status === 'upcoming' ? 'À venir' : 'Terminée'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Calendar size={16} className="text-ioai-blue" />
                  <span className="text-sm font-medium">{phase.date}</span>
                </div>

                <p className="text-gray-700 mb-4">{phase.description}</p>

                {phase.criteria.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Critères :</p>
                    <ul className="space-y-1">
                      {phase.criteria.map((criterion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={16} className="text-ioai-green mt-0.5 flex-shrink-0" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  onClick={() => handleDelete(phase.id)}
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
